'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getBrowserClient } from '@/lib/supabaseBrowser'

interface Team {
  id: number
  name: string
  abbreviation: string
}

interface TeamsResponse {
  teams: Team[]
}

interface PredictionResult {
  mode: 'predicted' | 'historical'
  predicted_home_score?: number
  predicted_away_score?: number
  actual_home_score?: number
  actual_away_score?: number
  week?: number
  home_team: string
  away_team: string
}

export default function PredictPage() {
  const [homeTeamId, setHomeTeamId] = useState<number | null>(null)
  const [awayTeamId, setAwayTeamId] = useState<number | null>(null)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)

  const supabase = getBrowserClient()

  const { data: teamsData, isLoading: teamsLoading } = useQuery<TeamsResponse>({
    queryKey: ['teams'],
    queryFn: async () => {
      const response = await fetch('/api/teams')
      if (!response.ok) {
        throw new Error('Failed to fetch teams')
      }
      return response.json()
    },
  })

  const handlePredict = async () => {
    if (!homeTeamId || !awayTeamId) {
      setError('Please select both teams')
      return
    }

    if (homeTeamId === awayTeamId) {
      setError('Please select different teams')
      return
    }

    setLoading(true)
    setError(null)
    setPrediction(null)
    setShowUpgrade(false)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        setError('Please sign in to make predictions')
        setLoading(false)
        return
      }

      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          homeTeamId,
          awayTeamId,
          seasonYear: 2025,
          seasonType: 'REG',
        }),
      })

      if (response.status === 402) {
        setShowUpgrade(true)
        setLoading(false)
        return
      }

      if (!response.ok) {
        throw new Error('Failed to get prediction')
      }

      const result = await response.json()
      setPrediction(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getTeamName = (teamId: number) => {
    return teamsData?.teams.find(team => team.id === teamId)?.name || 'Unknown Team'
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">NFL Game Prediction</h1>
        
        {/* Team Selection */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="away-team" className="block text-sm font-medium text-gray-700 mb-2">
                Away Team
              </label>
              {teamsLoading ? (
                <div className="text-gray-500">Loading teams...</div>
              ) : (
                <select
                  id="away-team"
                  value={awayTeamId || ''}
                  onChange={(e) => setAwayTeamId(e.target.value ? Number(e.target.value) : null)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select away team</option>
                  {teamsData?.teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label htmlFor="home-team" className="block text-sm font-medium text-gray-700 mb-2">
                Home Team
              </label>
              {teamsLoading ? (
                <div className="text-gray-500">Loading teams...</div>
              ) : (
                <select
                  id="home-team"
                  value={homeTeamId || ''}
                  onChange={(e) => setHomeTeamId(e.target.value ? Number(e.target.value) : null)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select home team</option>
                  {teamsData?.teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handlePredict}
              disabled={loading || !homeTeamId || !awayTeamId || teamsLoading}
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Predicting...' : 'Predict Game'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {/* Upgrade Notice */}
        {showUpgrade && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 mb-6">
            <div className="text-yellow-800 mb-4">
              You've reached your prediction limit. Upgrade to Premium for unlimited predictions!
            </div>
            <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md font-medium">
              Upgrade to Premium
            </button>
          </div>
        )}

        {/* Prediction Result */}
        {prediction && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Prediction Result</h2>
            
            <div className="text-center">
              <div className="text-lg font-medium text-gray-900 mb-4">
                {prediction.away_team} @ {prediction.home_team}
              </div>

              {prediction.mode === 'predicted' ? (
                <div>
                  <div className="text-3xl font-bold text-indigo-600 mb-2">
                    {prediction.away_team} {prediction.predicted_away_score} - {prediction.predicted_home_score} {prediction.home_team}
                  </div>
                  <div className="text-sm text-gray-600">Predicted Score</div>
                </div>
              ) : (
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {prediction.away_team} {prediction.actual_away_score} - {prediction.actual_home_score} {prediction.home_team}
                  </div>
                  <div className="text-sm text-gray-600">
                    Historical Result - Week {prediction.week}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
