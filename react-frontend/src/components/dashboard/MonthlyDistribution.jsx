import React from 'react';

const MonthlyDistribution = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const data = [240, 220, 290, 320, 420, 540];
  const maxValue = Math.max(...data);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-100">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900 mb-1">Monthly Distribution</h3>
        <p className="text-slate-500 text-sm font-medium">Rewards claimed per month</p>
      </div>

      <div className="relative h-64">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[600, 450, 300, 150, 0].map((value, i) => (
            <div key={i} className="flex items-center">
              <span className="text-xs text-slate-500 font-medium w-12">{value}</span>
              <div className="flex-1 h-px bg-slate-200 ml-2"></div>
            </div>
          ))}
        </div>

        {/* Bars */}
        <div className="absolute inset-0 flex items-end justify-around pl-14 pr-4 pb-8 gap-2">
          {months.map((month, i) => (
            <div key={month} className="flex flex-col items-center flex-1">
              <div
                className="w-full bg-purple-500 rounded-t transition-all hover:bg-purple-600"
                style={{ height: `${(data[i] / 600) * 100}%` }}
              ></div>
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
    </div>
  );
};

export default MonthlyDistribution;
