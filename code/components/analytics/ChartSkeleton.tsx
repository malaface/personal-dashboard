/**
 * Chart Loading Skeleton
 * Displayed while chart data is being fetched
 */

export default function ChartSkeleton() {
  return (
    <div className="w-full h-full animate-pulse">
      <div className="space-y-4">
        {/* Chart title skeleton */}
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>

        {/* Chart area skeleton */}
        <div className="h-64 bg-gray-100 rounded-lg flex items-end justify-around p-4 space-x-2">
          {/* Bars/elements skeleton */}
          <div className="h-3/4 bg-gray-200 rounded w-full"></div>
          <div className="h-1/2 bg-gray-200 rounded w-full"></div>
          <div className="h-5/6 bg-gray-200 rounded w-full"></div>
          <div className="h-2/3 bg-gray-200 rounded w-full"></div>
          <div className="h-4/5 bg-gray-200 rounded w-full"></div>
          <div className="h-1/2 bg-gray-200 rounded w-full"></div>
        </div>

        {/* Legend skeleton */}
        <div className="flex justify-center space-x-4">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  )
}
