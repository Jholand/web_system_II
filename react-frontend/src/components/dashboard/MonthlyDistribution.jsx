import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MonthlyDistribution = ({ data, currentPeriod }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (data && data[currentPeriod || 'monthly']) {
      const rewardsData = data[currentPeriod || 'monthly'].rewards_distribution;
      if (rewardsData && rewardsData.labels && rewardsData.labels.length > 0) {
        const formattedData = rewardsData.labels.map((label, index) => ({
          name: label,
          rewards: rewardsData.data[index] || 0,
        }));
        setChartData(formattedData);
      }
    }
  }, [data, currentPeriod]);

  if (!chartData || chartData.length === 0) {
    return null;
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-purple-100">
          <p className="font-semibold text-slate-700 mb-1">{label}</p>
          <p className="text-purple-600 font-bold">
            {payload[0].value} {payload[0].value === 1 ? 'reward' : 'rewards'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/60">
      <div className="mb-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
          Monthly Distribution
        </h3>
        <p className="text-slate-500 text-sm font-medium">Rewards claimed per month</p>
      </div>

      <div className="h-80 relative">
        <ResponsiveContainer width="100%" height="100%" minHeight={320}>
          <BarChart 
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorRewards" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={1}/>
                <stop offset="100%" stopColor="#ec4899" stopOpacity={0.8}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
            <XAxis 
              dataKey="name" 
              stroke="#64748b"
              style={{ fontSize: '12px', fontWeight: '500' }}
            />
            <YAxis 
              stroke="#64748b"
              style={{ fontSize: '12px', fontWeight: '500' }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(168, 85, 247, 0.1)' }} />
            <Bar 
              dataKey="rewards" 
              fill="url(#colorRewards)"
              radius={[8, 8, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyDistribution;
