import React from 'react';

const VisitsPointsTrend = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const pointsData = [22, 32, 45, 50, 62, 82];
  const visitsData = [0, 0, 0, 0, 0, 0];

  const maxValue = 90;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-100">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900 mb-1">Visits & Points Trend</h3>
        <p className="text-slate-500 text-sm font-medium">Last 6 months performance</p>
      </div>

      <div className="relative h-64">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[80000, 60000, 40000, 20000, 0].map((value, i) => (
            <div key={i} className="flex items-center">
              <span className="text-xs text-slate-500 font-medium w-12">{value}</span>
              <div className="flex-1 h-px bg-slate-200 ml-2"></div>
            </div>
          ))}
        </div>

        {/* Chart content */}
        <div className="absolute inset-0 flex items-end justify-around pl-14 pr-4 pb-8">
          {months.map((month, i) => (
            <div key={month} className="flex flex-col items-center flex-1">
              <div className="relative w-full h-full">
                {/* Orange line for points */}
                {i > 0 && (
                  <svg className="absolute inset-0 w-full h-full overflow-visible">
                    <line
                      x1="0%"
                      y1={`${100 - (pointsData[i - 1] / maxValue) * 100}%`}
                      x2="100%"
                      y2={`${100 - (pointsData[i] / maxValue) * 100}%`}
                      stroke="#f59e0b"
                      strokeWidth="2"
                    />
                  </svg>
                )}
                {/* Data point */}
                <div
                  className="absolute left-1/2 transform -translate-x-1/2"
                  style={{ bottom: `${(pointsData[i] / maxValue) * 100}%` }}
                >
                  <div className="w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-14 right-4 flex justify-around">
          {months.map((month) => (
            <span key={month} className="text-xs text-gray-500">
              {month}
            </span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <span className="text-orange-500">◆</span>
          <span className="text-sm text-gray-600">Points (+1000)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-500">◆</span>
          <span className="text-sm text-gray-600">Visits</span>
        </div>
      </div>
    </div>
  );
};

export default VisitsPointsTrend;
