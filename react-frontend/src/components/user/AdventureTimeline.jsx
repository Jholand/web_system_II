import React from 'react';

const AdventureTimeline = ({ visits, totalVisits }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        </svg>
        <h3 className="text-xl font-bold text-slate-900">Adventure Timeline</h3>
      </div>
      <p className="text-slate-600 mb-6">{totalVisits} destinations visited</p>

      <div className="space-y-4">
        {visits.map((visit, index) => (
          <div key={visit.id} className="flex items-center gap-4">
            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold">
              {index + 1}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900">{visit.destination.name}</h4>
              <p className="text-sm text-slate-600">{visit.destination.category} • {visit.createdAt}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-orange-500">+{visit.points}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdventureTimeline;
