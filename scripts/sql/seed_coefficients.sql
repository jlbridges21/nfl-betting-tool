-- Seed data for model_coefficients table
-- This inserts sample coefficients for the NFL prediction model

INSERT INTO public.model_coefficients (
    id,
    feature_names,
    home_coefs,
    away_coefs,
    home_intercept,
    away_intercept,
    model_version
) VALUES (
    1,
    ARRAY[
        'off_points_per_game',
        'off_total_yards_per_game',
        'off_passing_yards_per_game',
        'off_rushing_yards_per_game',
        'off_red_zone_efficiency',
        'off_third_down_efficiency',
        'def_points_allowed_per_game',
        'def_total_yards_allowed_per_game',
        'def_passing_yards_allowed_per_game',
        'def_rushing_yards_allowed_per_game',
        'def_red_zone_efficiency',
        'def_third_down_efficiency',
        'turnover_margin',
        'penalty_yards_per_game'
    ],
    ARRAY[
        0.85,    -- off_points_per_game
        0.012,   -- off_total_yards_per_game
        0.008,   -- off_passing_yards_per_game
        0.015,   -- off_rushing_yards_per_game
        0.18,    -- off_red_zone_efficiency
        0.22,    -- off_third_down_efficiency
        -0.75,   -- def_points_allowed_per_game
        -0.009,  -- def_total_yards_allowed_per_game
        -0.006,  -- def_passing_yards_allowed_per_game
        -0.012,  -- def_rushing_yards_allowed_per_game
        -0.15,   -- def_red_zone_efficiency
        -0.19,   -- def_third_down_efficiency
        1.2,     -- turnover_margin
        -0.025   -- penalty_yards_per_game
    ],
    ARRAY[
        0.72,    -- off_points_per_game
        0.010,   -- off_total_yards_per_game
        0.007,   -- off_passing_yards_per_game
        0.013,   -- off_rushing_yards_per_game
        0.16,    -- off_red_zone_efficiency
        0.20,    -- off_third_down_efficiency
        -0.68,   -- def_points_allowed_per_game
        -0.008,  -- def_total_yards_allowed_per_game
        -0.005,  -- def_passing_yards_allowed_per_game
        -0.011,  -- def_rushing_yards_allowed_per_game
        -0.14,   -- def_red_zone_efficiency
        -0.17,   -- def_third_down_efficiency
        1.1,     -- turnover_margin
        -0.022   -- penalty_yards_per_game
    ],
    21.5,    -- home_intercept (home field advantage)
    18.2,    -- away_intercept
    'v1.0'
) ON CONFLICT (id) DO UPDATE SET
    feature_names = EXCLUDED.feature_names,
    home_coefs = EXCLUDED.home_coefs,
    away_coefs = EXCLUDED.away_coefs,
    home_intercept = EXCLUDED.home_intercept,
    away_intercept = EXCLUDED.away_intercept,
    model_version = EXCLUDED.model_version,
    updated_at = NOW();
