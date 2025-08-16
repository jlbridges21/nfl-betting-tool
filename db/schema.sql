-- NFL Betting Tool Database Schema
-- This file contains the complete Supabase schema for the NFL Betting Model & Prediction Tool

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    abbreviation VARCHAR(10) NOT NULL UNIQUE,
    conference VARCHAR(10) NOT NULL CHECK (conference IN ('AFC', 'NFC')),
    division VARCHAR(10) NOT NULL CHECK (division IN ('North', 'South', 'East', 'West')),
    logo_url TEXT,
    primary_color VARCHAR(7),
    secondary_color VARCHAR(7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_aliases table for external provider mappings
CREATE TABLE IF NOT EXISTS public.team_aliases (
    provider VARCHAR(50) NOT NULL,
    alias VARCHAR(50) NOT NULL,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    PRIMARY KEY (provider, alias)
);

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    full_name VARCHAR(255),
    is_premium BOOLEAN DEFAULT FALSE,
    free_predictions_used INTEGER DEFAULT 0,
    premium_activated_at TIMESTAMP WITH TIME ZONE,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_stats table for season-to-date statistics
CREATE TABLE IF NOT EXISTS public.team_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    as_of_week INTEGER NOT NULL,
    
    -- Offensive stats
    off_points_per_game DECIMAL(5,2),
    off_total_yards_per_game DECIMAL(6,2),
    off_passing_yards_per_game DECIMAL(6,2),
    off_rushing_yards_per_game DECIMAL(6,2),
    off_red_zone_efficiency DECIMAL(5,2),
    off_third_down_efficiency DECIMAL(5,2),
    off_turnovers_per_game DECIMAL(4,2),
    off_time_of_possession DECIMAL(5,2),
    
    -- Defensive stats
    def_points_allowed_per_game DECIMAL(5,2),
    def_total_yards_allowed_per_game DECIMAL(6,2),
    def_passing_yards_allowed_per_game DECIMAL(6,2),
    def_rushing_yards_allowed_per_game DECIMAL(6,2),
    def_red_zone_efficiency DECIMAL(5,2),
    def_third_down_efficiency DECIMAL(5,2),
    def_turnovers_forced_per_game DECIMAL(4,2),
    def_sacks_per_game DECIMAL(4,2),
    
    -- Additional metrics
    turnover_margin DECIMAL(4,2),
    penalty_yards_per_game DECIMAL(5,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(team_id, year, as_of_week)
);

-- Create games table for schedule and results
CREATE TABLE IF NOT EXISTS public.games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INTEGER NOT NULL,
    week INTEGER NOT NULL,
    season_type VARCHAR(20) NOT NULL DEFAULT 'REG' CHECK (season_type IN ('PRE', 'REG', 'POST')),
    home_team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    away_team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    kickoff_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'FINAL', 'IN_PROGRESS')),
    home_score INTEGER,
    away_score INTEGER,
    home_offensive_yards INTEGER,
    away_offensive_yards INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(year, week, season_type, home_team_id, away_team_id)
);

-- Create user_predictions table
CREATE TABLE IF NOT EXISTS public.user_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    home_team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    away_team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    game_id UUID REFERENCES public.games(id) ON DELETE SET NULL,
    predicted_home_score DECIMAL(5,2) NOT NULL,
    predicted_away_score DECIMAL(5,2) NOT NULL,
    actual_home_score INTEGER,
    actual_away_score INTEGER,
    was_accurate BOOLEAN,
    mode VARCHAR(20) DEFAULT 'prediction' CHECK (mode IN ('prediction', 'historical')),
    season_year INTEGER DEFAULT 2025,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create model_predictions table
CREATE TABLE IF NOT EXISTS public.model_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_prediction_id UUID NOT NULL REFERENCES public.user_predictions(id) ON DELETE CASCADE UNIQUE,
    home_team_features JSONB,
    away_team_features JSONB,
    feature_vector DECIMAL[],
    model_version VARCHAR(50) DEFAULT 'v1.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create model_coefficients table
CREATE TABLE IF NOT EXISTS public.model_coefficients (
    id INTEGER PRIMARY KEY DEFAULT 1,
    feature_names TEXT[] NOT NULL,
    home_coefs DECIMAL[] NOT NULL,
    away_coefs DECIMAL[] NOT NULL,
    home_intercept DECIMAL NOT NULL,
    away_intercept DECIMAL NOT NULL,
    model_version VARCHAR(50) DEFAULT 'v1.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT single_row_check CHECK (id = 1)
);

-- Create views
CREATE OR REPLACE VIEW public.team_stats_latest AS
SELECT DISTINCT ON (team_id, year) *
FROM public.team_stats
ORDER BY team_id, year, as_of_week DESC;

CREATE OR REPLACE VIEW public.v_user_metrics AS
SELECT 
    user_id,
    COUNT(*) as total_predictions,
    COUNT(CASE WHEN was_accurate = true THEN 1 END) as accurate_predictions,
    ROUND(
        COUNT(CASE WHEN was_accurate = true THEN 1 END)::DECIMAL / 
        NULLIF(COUNT(CASE WHEN was_accurate IS NOT NULL THEN 1 END), 0) * 100, 
        2
    ) as accuracy_percentage,
    ROUND(AVG(CASE WHEN actual_home_score IS NOT NULL THEN predicted_home_score - actual_home_score END), 2) as avg_home_error,
    ROUND(AVG(CASE WHEN actual_away_score IS NOT NULL THEN predicted_away_score - actual_away_score END), 2) as avg_away_error,
    ROUND(AVG(CASE WHEN actual_home_score IS NOT NULL THEN ABS(predicted_home_score - actual_home_score) END), 2) as mae_home,
    ROUND(AVG(CASE WHEN actual_away_score IS NOT NULL THEN ABS(predicted_away_score - actual_away_score) END), 2) as mae_away,
    ROUND(AVG(CASE WHEN actual_home_score IS NOT NULL AND actual_away_score IS NOT NULL 
        THEN ABS((predicted_home_score - predicted_away_score) - (actual_home_score - actual_away_score)) END), 2) as mae_spread,
    ROUND(AVG(CASE WHEN actual_home_score IS NOT NULL AND actual_away_score IS NOT NULL 
        THEN ABS((predicted_home_score + predicted_away_score) - (actual_home_score + actual_away_score)) END), 2) as mae_total
FROM public.user_predictions
GROUP BY user_id;

CREATE OR REPLACE VIEW public.v_user_team_accuracy AS
SELECT 
    user_id,
    team_id,
    team_name,
    COUNT(*) as predictions_count,
    COUNT(CASE WHEN was_accurate = true THEN 1 END) as accurate_count,
    ROUND(
        COUNT(CASE WHEN was_accurate = true THEN 1 END)::DECIMAL / 
        NULLIF(COUNT(CASE WHEN was_accurate IS NOT NULL THEN 1 END), 0) * 100, 
        2
    ) as accuracy_percentage
FROM (
    SELECT 
        up.user_id,
        up.home_team_id as team_id,
        ht.name as team_name,
        up.was_accurate
    FROM public.user_predictions up
    JOIN public.teams ht ON up.home_team_id = ht.id
    WHERE up.was_accurate IS NOT NULL
    
    UNION ALL
    
    SELECT 
        up.user_id,
        up.away_team_id as team_id,
        at.name as team_name,
        up.was_accurate
    FROM public.user_predictions up
    JOIN public.teams at ON up.away_team_id = at.id
    WHERE up.was_accurate IS NOT NULL
) team_predictions
GROUP BY user_id, team_id, team_name;

-- Database functions
CREATE OR REPLACE FUNCTION public.fn_can_consume_prediction(u_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_profile RECORD;
BEGIN
    SELECT is_premium, free_predictions_used
    INTO user_profile
    FROM public.profiles
    WHERE id = u_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    RETURN user_profile.is_premium OR user_profile.free_predictions_used < 5;
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_increment_free_predictions(u_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.profiles
    SET free_predictions_used = free_predictions_used + 1,
        updated_at = NOW()
    WHERE id = u_id AND is_premium = FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_update_prediction_accuracy()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only process when game status changes to FINAL
    IF NEW.status = 'FINAL' AND (OLD.status IS NULL OR OLD.status != 'FINAL') THEN
        UPDATE public.user_predictions
        SET 
            actual_home_score = NEW.home_score,
            actual_away_score = NEW.away_score,
            was_accurate = CASE 
                WHEN (predicted_home_score > predicted_away_score AND NEW.home_score > NEW.away_score) OR
                     (predicted_home_score < predicted_away_score AND NEW.home_score < NEW.away_score)
                THEN TRUE
                ELSE FALSE
            END,
            game_id = NEW.id
        WHERE home_team_id = NEW.home_team_id 
          AND away_team_id = NEW.away_team_id
          AND season_year = NEW.year
          AND actual_home_score IS NULL;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger
CREATE OR REPLACE TRIGGER trigger_update_prediction_accuracy
    AFTER INSERT OR UPDATE ON public.games
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_update_prediction_accuracy();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_coefficients ENABLE ROW LEVEL SECURITY;

-- Teams - publicly readable
CREATE POLICY "Teams are publicly readable" ON public.teams
    FOR SELECT USING (true);

-- Team aliases - publicly readable
CREATE POLICY "Team aliases are publicly readable" ON public.team_aliases
    FOR SELECT USING (true);

-- Profiles - users can read and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Team stats - publicly readable
CREATE POLICY "Team stats are publicly readable" ON public.team_stats
    FOR SELECT USING (true);

-- Games - publicly readable
CREATE POLICY "Games are publicly readable" ON public.games
    FOR SELECT USING (true);

-- User predictions - users can only access their own predictions
CREATE POLICY "Users can view own predictions" ON public.user_predictions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own predictions" ON public.user_predictions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own predictions" ON public.user_predictions
    FOR UPDATE USING (auth.uid() = user_id);

-- Model predictions - users can only access their own model predictions
CREATE POLICY "Users can view own model predictions" ON public.model_predictions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_predictions up 
            WHERE up.id = model_predictions.user_prediction_id 
            AND up.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own model predictions" ON public.model_predictions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_predictions up 
            WHERE up.id = model_predictions.user_prediction_id 
            AND up.user_id = auth.uid()
        )
    );

-- Model coefficients - publicly readable
CREATE POLICY "Model coefficients are publicly readable" ON public.model_coefficients
    FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_stats_team_year_week ON public.team_stats(team_id, year, as_of_week);
CREATE INDEX IF NOT EXISTS idx_games_year_week ON public.games(year, week);
CREATE INDEX IF NOT EXISTS idx_games_teams ON public.games(home_team_id, away_team_id);
CREATE INDEX IF NOT EXISTS idx_user_predictions_user_id ON public.user_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_predictions_teams ON public.user_predictions(home_team_id, away_team_id);
CREATE INDEX IF NOT EXISTS idx_team_aliases_provider ON public.team_aliases(provider);
