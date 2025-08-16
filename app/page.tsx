'use client'

import { useState, useEffect } from 'react'
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

export default function ScoreboardPage() {
  const [selectedYear, setSelectedYear] = useState(2025)
  const [selectedWeek, setSelectedWeek] = useState(1)

  const { data, isLoading, error } = useQuery<ScoreboardResponse>({
    queryKey: ['scoreboard', selectedYear, selectedWeek],
    queryFn: async () => {
      const response = await fetch(`/api/scoreboard?year=${selectedYear}&week=${selectedWeek}`)
      if (!response.ok) {
        throw new Error('Failed to fetch scoreboard data')
      }
      return response.json()
    },
  })

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
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
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
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {weeks.map((week) => (
                <option key={week} value={week}>
                  Week {week}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-lg text-gray-600">Loading games...</div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">
            Error loading scoreboard: {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        </div>
      )}

      {data && (
        <div className="space-y-4">
          {data.games.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No games found for {selectedYear} Week {selectedWeek}
            </div>
          ) : (
            data.games.map((game) => (
              <div key={game.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-gray-900">
                      {game.away_team} @ {game.home_team}
                    </div>
                    
                    {game.game_status === 'FINAL' ? (
                      <div className="mt-2">
                        <div className="text-2xl font-bold text-gray-900">
                          {game.away_team} {game.away_score} - {game.home_score} {game.home_team}
                        </div>
                        {(game.home_off_yards || game.away_off_yards) && (
                          <div className="text-sm text-gray-600 mt-1">
                            Offensive Yards: {game.away_team} {game.away_off_yards || 'N/A'} - {game.home_off_yards || 'N/A'} {game.home_team}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-2">
                        <div className="text-sm text-gray-600">
                          Kickoff: {new Date(game.kickoff_time).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Status: {game.game_status}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      game.game_status === 'FINAL' 
                        ? 'bg-gray-100 text-gray-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {game.game_status}
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
