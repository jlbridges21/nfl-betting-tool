'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
  SortingState,
} from '@tanstack/react-table'

interface TeamStat {
  team_name: string
  off_points_per_game: number
  def_points_per_game_allowed: number
  off_yards_per_game: number
  def_yards_per_game_allowed: number
  wins: number
  losses: number
  ties: number
}

interface TeamStatsResponse {
  team_stats: TeamStat[]
}

const columnHelper = createColumnHelper<TeamStat>()

const columns = [
  columnHelper.accessor('team_name', {
    header: 'Team',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('wins', {
    header: 'W',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('losses', {
    header: 'L',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('ties', {
    header: 'T',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('off_points_per_game', {
    header: 'Off PPG',
    cell: (info) => info.getValue().toFixed(1),
  }),
  columnHelper.accessor('def_points_per_game_allowed', {
    header: 'Def PPA',
    cell: (info) => info.getValue().toFixed(1),
  }),
  columnHelper.accessor('off_yards_per_game', {
    header: 'Off YPG',
    cell: (info) => info.getValue().toFixed(1),
  }),
  columnHelper.accessor('def_yards_per_game_allowed', {
    header: 'Def YPA',
    cell: (info) => info.getValue().toFixed(1),
  }),
]

export default function TeamStatsPage() {
  const [selectedYear, setSelectedYear] = useState(2025)
  const [selectedWeek, setSelectedWeek] = useState('latest')
  const [sorting, setSorting] = useState<SortingState>([])

  const { data, isLoading, error } = useQuery<TeamStatsResponse>({
    queryKey: ['team-stats', selectedYear, selectedWeek],
    queryFn: async () => {
      const response = await fetch(`/api/team-stats?year=${selectedYear}&asOfWeek=${selectedWeek}`)
      if (response.status >= 400) {
        throw new Error(`Failed to fetch team stats: ${response.status} ${response.statusText}`)
      }
      const result = await response.json()
      return result
    },
  })

  // Safely extract team stats array with fallback
  const teamStats = Array.isArray(data?.team_stats) ? data.team_stats : []

  const table = useReactTable({
    data: teamStats,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const years = [2023, 2024, 2025]
  const weeks = ['latest', ...Array.from({ length: 18 }, (_, i) => (i + 1).toString())]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Team Statistics</h1>
        
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
              As of Week
            </label>
            <select
              id="week"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {weeks.map((week) => (
                <option key={week} value={week}>
                  {week === 'latest' ? 'Latest' : `Week ${week}`}
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
            <div className="text-lg text-gray-600 mb-4">Loading team statistics...</div>
            <div className="bg-gray-200 rounded-lg h-64 w-full"></div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">
            Error loading team stats: {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {teamStats.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No team statistics found for {selectedYear} {selectedWeek === 'latest' ? '(latest)' : `Week ${selectedWeek}`}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className="flex items-center space-x-1">
                            <span>
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                            </span>
                            <span className="text-gray-400">
                              {{
                                asc: '↑',
                                desc: '↓',
                              }[header.column.getIsSorted() as string] ?? '↕'}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row?.id || Math.random()} className="hover:bg-gray-50">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell?.id || Math.random()} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      {!isLoading && !error && teamStats.length > 0 && (
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
            <div><strong>W/L/T:</strong> Wins/Losses/Ties</div>
            <div><strong>Off PPG:</strong> Offensive Points Per Game</div>
            <div><strong>Def PPA:</strong> Defensive Points Per Game Allowed</div>
            <div><strong>Off YPG:</strong> Offensive Yards Per Game</div>
            <div><strong>Def YPA:</strong> Defensive Yards Per Game Allowed</div>
          </div>
        </div>
      )}
    </div>
  )
}
