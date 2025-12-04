import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const QuickStatsCard = ({ title, value, bgColor, textColor, icon, loading }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`${bgColor} rounded-xl p-6 flex-1 shadow-lg border border-white/20 backdrop-blur-sm`}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className={`text-sm font-bold ${textColor} opacity-70 uppercase tracking-wide`}>{title}</h4>
        <div className={`${textColor} opacity-80`}>
          {icon}
        </div>
      </div>
      {loading ? (
        <div className="h-10 bg-white/30 rounded animate-pulse"></div>
      ) : (
        <p className={`text-4xl font-extrabold ${textColor}`}>{value}</p>
      )}
    </motion.div>
  );
};

const QuickStats = ({ data, currentPeriod }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (data && data[currentPeriod || 'daily']) {
      const quickStats = data[currentPeriod || 'daily'].quick_stats;
      setStats(quickStats);
      setLoading(false);
    }
  }, [data, currentPeriod]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/60"
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-1">
          Quick Stats
        </h3>
        <p className="text-slate-500 text-sm font-medium">Today's activity summary</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QuickStatsCard
          title="Check-ins Today"
          value={stats?.checkins_today || 0}
          bgColor="bg-gradient-to-br from-emerald-50 to-teal-50"
          textColor="text-emerald-600"
          loading={loading}
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          }
        />
        <QuickStatsCard
          title="New Badges Earned"
          value={stats?.badges_earned_today || 0}
          bgColor="bg-gradient-to-br from-purple-50 to-pink-50"
          textColor="text-purple-600"
          loading={loading}
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          }
        />
      </div>
    </motion.div>
  );
};

export default QuickStats;
