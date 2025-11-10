import React from 'react';
import Button from '../common/Button';
import { Coins, MapPin, Home, Star, Gift, Hotel, Wheat, Mountain } from 'lucide-react';

const DestinationDetail = ({ destination, userLocation, onClose, onCheckIn, onNavigate }) => {
  if (!destination) return null;

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getCategoryIcon = (category) => {
    const iconProps = { className: "w-10 h-10 text-white", strokeWidth: 2 };
    switch (category) {
      case 'hotel':
        return <Hotel {...iconProps} />;
      case 'agri farm':
        return <Wheat {...iconProps} />;
      case 'tourist spot':
        return <Mountain {...iconProps} />;
      default:
        return <MapPin {...iconProps} />;
    }
  };

  const distance = userLocation
    ? calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        destination.latitude,
        destination.longitude
      )
    : null;

  const getCategoryColor = (category) => {
    switch (category) {
      case 'hotel':
        return 'from-blue-400 to-blue-600';
      case 'agri farm':
        return 'from-green-400 to-green-600';
      case 'tourist spot':
        return 'from-purple-400 to-purple-600';
      default:
        return 'from-teal-400 to-teal-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Icon */}
      <div className="text-center">
        <div
          className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${getCategoryColor(
            destination.category
          )} rounded-3xl shadow-lg mb-4`}
        >
          {getCategoryIcon(destination.category)}
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{destination.title}</h2>
        <span
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${destination.categoryColor}`}
        >
          {destination.category}
        </span>
      </div>

      {/* Description */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
        <p className="text-slate-700 leading-relaxed">{destination.description}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Points */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="w-5 h-5 text-orange-600" strokeWidth={2} />
            <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">
              Points
            </span>
          </div>
          <p className="text-3xl font-bold text-orange-600">{destination.points}</p>
          <p className="text-xs text-orange-700 mt-1">Check-in reward</p>
        </div>

        {/* Distance */}
        {distance !== null && (
          <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-4 border border-teal-200">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-teal-600" strokeWidth={2} />
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wide">
                Distance
              </span>
            </div>
            <p className="text-3xl font-bold text-teal-600">{distance.toFixed(1)}</p>
            <p className="text-xs text-teal-700 mt-1">kilometers away</p>
          </div>
        )}

        {/* Location/Address */}
        {(destination.location || destination.address) && (
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200 col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <Home className="w-5 h-5 text-purple-600" strokeWidth={2} />
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">
                Address
              </span>
            </div>
            <p className="text-sm font-medium text-purple-900">{destination.address || destination.location}</p>
            {destination.address && (
              <div className="flex items-center gap-1 mt-2 text-xs text-purple-600">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-mono">{destination.latitude?.toFixed(6)}, {destination.longitude?.toFixed(6)}</span>
              </div>
            )}
          </div>
        )}

        {/* Rating */}
        {destination.rating && (
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-4 border border-yellow-200 col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" strokeWidth={2} />
                <span className="text-xs font-bold text-yellow-700 uppercase tracking-wide">
                  Rating
                </span>
              </div>
              <div className="flex items-center gap-1">
                <p className="text-2xl font-bold text-yellow-600">{destination.rating}</p>
                <span className="text-sm text-yellow-700">/5</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Available Rewards */}
      {destination.rewards && destination.rewards.length > 0 && (
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 border border-pink-200">
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Gift className="w-5 h-5 text-pink-600" strokeWidth={2} />
            Available Rewards
          </h3>
          <div className="space-y-2">
            {destination.rewards.map((reward, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-white rounded-lg"
              >
                <span className="text-sm font-medium text-slate-900">{reward.title}</span>
                <span className="text-xs font-bold text-pink-600">
                  {reward.points_cost} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Check-in Tip */}
      {distance !== null && distance <= 0.1 && (
        <div className="bg-teal-50 border-2 border-teal-300 rounded-2xl p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="font-bold text-teal-900">You're here!</p>
              <p className="text-sm text-teal-700">Scan the QR code to check in</p>
            </div>
          </div>
        </div>
      )}

      {distance !== null && distance > 0.1 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-blue-900">Start Navigation</p>
              <p className="text-sm text-blue-700">
                Track your journey to this location
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Close
        </Button>
        
        {/* Show Start Navigation button if user is far from destination */}
        {distance !== null && distance > 0.1 && onNavigate && (
          <Button
            variant="primary"
            onClick={() => onNavigate(destination)}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            }
          >
            Navigate
          </Button>
        )}
        
        {/* Show Scan QR Code button if user is close */}
        {distance !== null && distance <= 0.1 && (
          <Button
            variant="primary"
            onClick={onCheckIn}
            className="flex-1"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
            }
          >
            Scan QR Code
          </Button>
        )}
      </div>
    </div>
  );
};

export default DestinationDetail;
