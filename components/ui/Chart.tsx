import React from 'react'

interface ChartData {
  label: string
  value: number
  color?: string
}

interface ChartProps {
  data: ChartData[]
  title: string
  type: 'bar' | 'line' | 'pie'
  height?: number
  showValues?: boolean
  maxValue?: number
}

export default function Chart({ 
  data, 
  title, 
  type, 
  height = 200, 
  showValues = true,
  maxValue
}: ChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value), 1)
  
  const getBarColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ]
    return colors[index % colors.length]
  }

  const getPieColor = (index: number) => {
    const colors = [
      'fill-blue-500',
      'fill-green-500',
      'fill-yellow-500', 
      'fill-red-500',
      'fill-purple-500',
      'fill-pink-500',
      'fill-indigo-500',
      'fill-teal-500'
    ]
    return colors[index % colors.length]
  }

  if (type === 'bar') {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-3" style={{ height }}>
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-20 text-sm text-gray-600 truncate">
                {item.label}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                <div
                  className={`h-6 rounded-full transition-all duration-300 ${getBarColor(index)}`}
                  style={{ width: `${(item.value / max) * 100}%` }}
                />
                {showValues && (
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                    {item.value}
                  </span>
                )}
              </div>
              {showValues && (
                <div className="w-12 text-sm text-gray-600 text-right">
                  {item.value}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'line') {
    const points = data.map((item, index) => ({
      x: (index / (data.length - 1)) * 100,
      y: 100 - (item.value / max) * 100
    }))

    const pathData = points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ')

    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="relative" style={{ height }}>
          <svg width="100%" height="100%" className="absolute inset-0">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map(y => (
              <line
                key={y}
                x1="0"
                y1={y + '%'}
                x2="100%"
                y2={y + '%'}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}
            
            {/* Line chart */}
            <path
              d={pathData}
              stroke="#3b82f6"
              strokeWidth="2"
              fill="none"
            />
            
            {/* Data points */}
            {points.map((point, index) => (
              <circle
                key={index}
                cx={point.x + '%'}
                cy={point.y + '%'}
                r="4"
                fill="#3b82f6"
              />
            ))}
          </svg>
          
          {/* Labels */}
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            {data.map((item, index) => (
              <span key={index} className="truncate">
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (type === 'pie') {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    let currentAngle = 0

    const slices = data.map((item, index) => {
      const percentage = item.value / total
      const startAngle = currentAngle
      const endAngle = currentAngle + (percentage * 360)
      currentAngle = endAngle

      const x1 = 50 + 40 * Math.cos(startAngle * Math.PI / 180)
      const y1 = 50 + 40 * Math.sin(startAngle * Math.PI / 180)
      const x2 = 50 + 40 * Math.cos(endAngle * Math.PI / 180)
      const y2 = 50 + 40 * Math.sin(endAngle * Math.PI / 180)

      const largeArcFlag = percentage > 0.5 ? 1 : 0

      const pathData = [
        `M 50 50`,
        `L ${x1} ${y1}`,
        `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ')

      return { pathData, percentage, label: item.label, color: getPieColor(index) }
    })

    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center space-x-6">
          <div className="relative" style={{ width: height, height }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              {slices.map((slice, index) => (
                <path
                  key={index}
                  d={slice.pathData}
                  className={slice.color}
                />
              ))}
            </svg>
          </div>
          
          <div className="flex-1 space-y-2">
            {slices.map((slice, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${slice.color.replace('fill-', 'bg-')}`} />
                <span className="text-sm text-gray-600">{slice.label}</span>
                <span className="text-sm font-medium text-gray-900">
                  {Math.round(slice.percentage * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return null
} 