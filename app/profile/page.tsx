'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getBrowserClient } from '@/lib/supabaseBrowser'
import type { User } from '@supabase/supabase-js'

interface Prediction {
  id: string
  home_team: string
  away_team: string
  predicted_home_score: number
  predicted_away_score: number
  actual_home_score: number | null
  actual_away_score: number | null
  was_accurate: boolean | null
  created_at: string
}

interface PredictionsResponse {
  predictions: Prediction[]
}

interface Metrics {
  overall_accuracy_pct: number
  avg_signed_home_error: number
  avg_signed_away_error: number
  mae_home: number
  mae_away: number
  mae_spread: number
  mae_total: number
  per_team_accuracy: Array<{
    team_name: string
    accuracy_pct: number
    prediction_count: number
  }>
}

interface MetricsResponse {
  metrics: Metrics
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = getBrowserClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }
    getUser()
  }, [supabase.auth])

  const { data: predictionsData, isLoading: predictionsLoading } = useQuery<PredictionsResponse>({
    queryKey: ['profile-predictions'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Not authenticated')
      
      const response = await fetch('/api/profile/predictions', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })
      if (response.status >= 400) throw new Error(`Failed to fetch predictions: ${response.status} ${response.statusText}`)
      const result = await response.json()
      return result
    },
    enabled: !!user,
  })

  const { data: metricsData, isLoading: metricsLoading } = useQuery<MetricsResponse>({
    queryKey: ['profile-metrics'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Not authenticated')
      
      const response = await fetch('/api/profile/metrics', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })
      if (response.status >= 400) throw new Error(`Failed to fetch metrics: ${response.status} ${response.statusText}`)
      const result = await response.json()
      return result
    },
    enabled: !!user,
  })

  // Safely extract arrays with fallbacks
  const predictions = Array.isArray(predictionsData?.predictions) ? predictionsData.predictions : []
  const metrics = metricsData?.metrics
  const perTeamAccuracy = Array.isArray(metrics?.per_team_accuracy) ? metrics.per_team_accuracy : []

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile</h1>
          <p className="text-gray-600 mb-6">Please sign in to view your profile and prediction history.</p>
          <a
            href="/sign-in"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium"
          >
            Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">{user.email}</p>
      </div>

      {/* Metrics Cards */}
      {metricsLoading ? (
        <div className="mb-8">
          <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-24 w-full"></div>
            ))}
          </div>
        </div>
      ) : metrics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="text-2xl font-bold text-indigo-600">
              {((metrics?.overall_accuracy_pct ?? 0) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Overall Accuracy</div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {(metrics?.avg_signed_home_error ?? 0).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Avg Home Error</div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {(metrics?.mae_spread ?? 0).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">MAE Spread</div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">
              {(metrics?.mae_total ?? 0).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">MAE Total</div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Prediction History */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Prediction History</h2>
          
          {predictionsLoading ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="animate-pulse">
                <div className="text-gray-600 mb-4">Loading predictions...</div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-200 rounded h-12 w-full"></div>
                  ))}
                </div>
              </div>
            </div>
          ) : predictions.length ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Matchup
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Predicted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actual
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Accurate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {predictions.map((prediction) => (
                      <tr key={prediction?.id || Math.random()}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {prediction?.away_team || 'TBD'} @ {prediction?.home_team || 'TBD'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {prediction?.predicted_away_score ?? 'N/A'} - {prediction?.predicted_home_score ?? 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {prediction?.actual_away_score !== null && prediction?.actual_home_score !== null
                            ? `${prediction.actual_away_score} - ${prediction.actual_home_score}`
                            : 'TBD'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {prediction?.was_accurate !== null ? (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              prediction.was_accurate 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {prediction.was_accurate ? 'Yes' : 'No'}
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {prediction?.created_at ? new Date(prediction.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm text-center">
              <p className="text-gray-600">No predictions yet. Start by making your first prediction!</p>
              <a
                href="/predict"
                className="mt-4 inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Make a Prediction
              </a>
            </div>
          )}
        </div>

        {/* Per-Team Accuracy */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Accuracy</h2>
          
          {metricsLoading ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="animate-pulse">
                <div className="text-gray-600 mb-4">Loading team stats...</div>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-gray-200 rounded h-8 w-full"></div>
                  ))}
                </div>
              </div>
            </div>
          ) : perTeamAccuracy.length ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Team
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Accuracy
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Count
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {perTeamAccuracy.map((team) => (
                      <tr key={team?.team_name || Math.random()}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {team?.team_name || 'Unknown Team'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {((team?.accuracy_pct ?? 0) * 100).toFixed(1)}%
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {team?.prediction_count ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm text-center">
              <p className="text-gray-600">No team data available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
