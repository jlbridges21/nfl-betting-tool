'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

interface Game {
  id: string
  home_team: string
  away_team: string
  home_score: number | null
  away_score: number | null
  game_status: string
  kickoff_time: string
  home_off_yards: number | null
  away_off_yards: number | null
}

interface ScoreboardResponse {
  games: Game[]
}

// Helper function to ensure we always have an array
function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? v : []
}

export default function ScoreboardPage() {
  const [year, setYear] = useState<number>(2025)
  const [week, setWeek] = useState<number>(1)

  const { data, isLoading, error } = useQuery<ScoreboardResponse>({
    queryKey: ['scoreboard', year, week],
    queryFn: async () => {
      const response = await fetch(`/api/scoreboard?year=${year}&week=${week}`)
      if (response.status >= 400) {
        throw new Error(`Failed to fetch scoreboard data: ${response.status} ${response.statusText}`)
      }
      const result = await response.json()
      return result
    },
  })

  // Safely extract games array with fallback
  const games = asArray<Game>(data?.games)
  
  const years = [2023, 2024, 2025]
  const weeks = Array.from({ length: 18 }, (_, i) => i + 1)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">NFL Scoreboard</h1>
        
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              id="year"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {years.map((yearOption) => (
                <option key={yearOption} value={yearOption}>
                  {yearOption}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="week" className="block text-sm font-medium text-gray-700 mb-1">
              Week
            </label>
            <select
              id="week"
              value={week}
              onChange={(e) => setWeek(Number(e.target.value))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {weeks.map((weekOption) => (
                <option key={weekOption} value={weekOption}>
                  Week {weekOption}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-pulse">
            <div className="text-lg text-gray-600">Loading games...</div>
            <div className="mt-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-24 w-full"></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">
            Error loading scoreboard: {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-4">
          {games.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No games available for Week {week}, Year {year}
            </div>
          ) : (
            games.map((game) => (
              <div key={game?.id || Math.random()} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-gray-900">
                      {game?.away_team || 'TBD'} @ {game?.home_team || 'TBD'}
                    </div>
                    
                    {game?.game_status === 'FINAL' ? (
                      <div className="mt-2">
                        <div className="text-2xl font-bold text-gray-900">
                          {game?.away_team || 'TBD'} {game?.away_score ?? 'N/A'} - {game?.home_score ?? 'N/A'} {game?.home_team || 'TBD'}
                        </div>
                        {(game?.home_off_yards || game?.away_off_yards) && (
                          <div className="text-sm text-gray-600 mt-1">
                            Offensive Yards: {game?.away_team || 'TBD'} {game?.away_off_yards || 'N/A'} - {game?.home_off_yards || 'N/A'} {game?.home_team || 'TBD'}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-2">
                        <div className="text-sm text-gray-600">
                          Kickoff: {game?.kickoff_time ? new Date(game.kickoff_time).toLocaleString() : 'TBD'}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Status: {game?.game_status || 'Unknown'}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      game?.game_status === 'FINAL' 
                        ? 'bg-gray-100 text-gray-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {game?.game_status || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
