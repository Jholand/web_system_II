import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const VisitsPointsTrend = ({ data, currentPeriod }) => {
  const [period, setPeriod] = useState(currentPeriod || 'daily');
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    setPeriod(currentPeriod || 'daily');
  }, [currentPeriod]);

  useEffect(() => {
    if (data && data[period]) {
      const chartData = data[period].chart_data;
      if (chartData && chartData.labels && chartData.labels.length > 0) {
        const formattedData = chartData.labels.map((label, index) => ({
          name: label,
          visits: chartData.checkins[index] || 0,
          points: chartData.points[index] || 0,
        }));
        setChartData(formattedData);
      }
    }
  }, [data, period]);

  if (!chartData || chartData.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/60">
      {/* Header with period buttons */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-1">
            Visits & Points Trend
          </h3>
          <p className="text-slate-500 text-sm font-medium">{chartData.period_label}</p>
        </div>
        
        {/* Period selector buttons */}
        <div className="flex gap-2 bg-gradient-to-r from-teal-50 to-cyan-50 p-1 rounded-xl shadow-inner border border-teal-100">
          <button
            onClick={() => setPeriod('daily')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
              period === 'daily'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/40 scale-105'
                : 'text-teal-700 hover:text-teal-900 hover:bg-white/60'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
              period === 'monthly'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/40 scale-105'
                : 'text-teal-700 hover:text-teal-900 hover:bg-white/60'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setPeriod('yearly')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
              period === 'yearly'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/40 scale-105'
                : 'text-teal-700 hover:text-teal-900 hover:bg-white/60'
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80 relative">
        <ResponsiveContainer width="100%" height="100%" minHeight={320}>
          <LineChart 
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorCheckins" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
            <XAxis 
              dataKey="name" 
              stroke="#64748b"
              style={{ fontSize: '12px', fontWeight: '500' }}
            />
            <YAxis 
              yAxisId="left"
              stroke="#10b981"
              style={{ fontSize: '12px', fontWeight: '500' }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#f59e0b"
              style={{ fontSize: '12px', fontWeight: '500' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                padding: '12px'
              }}
              labelStyle={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="visits" 
              name="Check-ins"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 7, fill: '#10b981', stroke: '#fff', strokeWidth: 3 }}
              isAnimationActive={false}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="points" 
              name="Points"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ r: 5, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 7, fill: '#f59e0b', stroke: '#fff', strokeWidth: 3 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VisitsPointsTrend;
