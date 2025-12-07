import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Coins, MapPin, Home, Star, Gift, Hotel, Wheat, Mountain, Navigation } from 'lucide-react';

const DestinationDetail = ({ destination, userLocation, onClose, onCheckIn, onNavigate, isSaved, onToggleSave, isNavigating }) => {
  if (!destination) return null;

  const handleToggleSave = (e) => {
    e.stopPropagation();
    if (onToggleSave) {
      onToggleSave(destination.id);
    }
  };

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

  // Check if user is within 50 meters (0.05 km)
  const isWithinRange = distance !== null && distance <= 0.05;

  const getCategoryColor = (category) => {
    const lowerCategory = category?.toLowerCase() || '';
    switch (lowerCategory) {
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
    <Modal
      isOpen={!!destination}
      onClose={onClose}
      title={destination.name || destination.title}
      titleIcon={<span className="text-2xl">{destination.categoryIcon || '📍'}</span>}
      size="xl"
      footer={
        <div className="flex gap-3 w-full">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1 py-3"
          >
            Cancel
          </Button>
          
          {/* Show Navigate button */}
          {distance !== null && !isWithinRange && onNavigate && (
            <Button
              variant="primary"
              onClick={() => {
                onNavigate(destination);
                onClose();
              }}
              disabled={isNavigating}
              className={`flex-1 py-3 ${isNavigating ? 'bg-gray-400 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600'}`}
              icon={<Navigation className="w-5 h-5" />}
            >
              {isNavigating ? 'Already Navigating' : 'Navigate'}
            </Button>
          )}
          
          {/* Show Scan QR Code button if user is within 50 meters */}
          {isWithinRange && (
            <Button
              variant="primary"
              onClick={() => {
                onCheckIn();
                onClose();
              }}
              disabled={isNavigating}
              className={`flex-1 py-3 ${isNavigating ? 'bg-gray-400 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600'}`}
            >
              {isNavigating ? 'Cannot Scan While Navigating' : 'Scan QR Code'}
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-2">
      {/* Category Badge and Save Button - Inline with Title */}
      <div className="flex items-center gap-2 -mt-1 mb-2">
        {/* Category Badge */}
        <span
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-br ${getCategoryColor(
            destination.category
          )}`}
        >
          <span className="text-sm">{destination.categoryIcon || '📍'}</span>
          {destination.categoryName || destination.category}
        </span>
        
        {/* Save Button */}
        {onToggleSave && (
          <button
            onClick={handleToggleSave}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full border transition-all hover:scale-105 active:scale-95"
            style={{
              borderColor: isSaved ? '#ec4899' : '#cbd5e1',
              backgroundColor: isSaved ? '#fce7f3' : '#f8fafc',
              color: isSaved ? '#ec4899' : '#64748b'
            }}
          >
            <svg
              className={`w-4 h-4 transition-all ${
                isSaved ? 'fill-pink-500 text-pink-500' : 'fill-none text-slate-400'
              }`}
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
              />
            </svg>
            <span className="font-semibold text-xs">
              {isSaved ? 'Saved' : 'Save'}
            </span>
          </button>
        )}
      </div>

      {/* Description */}
      <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
        <p className="text-slate-700 text-xs leading-relaxed line-clamp-2">{destination.description}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Points */}
        <div className="bg-orange-50 rounded-lg p-2 border border-orange-200">
          <div className="flex items-center gap-1 mb-1">
            <Coins className="w-3 h-3 text-orange-600" strokeWidth={2} />
            <span className="text-xs font-semibold text-orange-700">
              Points
            </span>
          </div>
          <p className="text-xl font-bold text-orange-600">{destination.points}</p>
        </div>

        {/* Distance */}
        {distance !== null && (
          <div className="bg-teal-50 rounded-lg p-2 border border-teal-200">
            <div className="flex items-center gap-1 mb-1">
              <MapPin className="w-3 h-3 text-teal-600" strokeWidth={2} />
              <span className="text-xs font-semibold text-teal-700">
                Distance
              </span>
            </div>
            <p className="text-xl font-bold text-teal-600">{distance.toFixed(1)} km</p>
          </div>
        )}

        {/* Location/Address */}
        {(destination.location || destination.address) && (
          <div className="bg-purple-50 rounded-lg p-2 border border-purple-200 col-span-2">
            <div className="flex items-center gap-1 mb-1">
              <Home className="w-3 h-3 text-purple-600" strokeWidth={2} />
              <span className="text-xs font-semibold text-purple-700">
                Address
              </span>
            </div>
            <p className="text-xs font-medium text-purple-900 line-clamp-1">{destination.address || destination.location}</p>
          </div>
        )}

        {/* Rating */}
        {destination.rating && (
          <div className="bg-yellow-50 rounded-lg p-2 border border-yellow-200 col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-600 fill-yellow-600" strokeWidth={2} />
                <span className="text-xs font-semibold text-yellow-700">
                  Rating
                </span>
              </div>
              <div className="flex items-center gap-0.5">
                <p className="text-lg font-bold text-yellow-600">{destination.rating}</p>
                <span className="text-xs text-yellow-700">/5</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Available Rewards */}
      {destination.rewards && destination.rewards.length > 0 && (
        <div className="bg-pink-50 rounded-lg p-2 border border-pink-200">
          <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-1 text-xs">
            <Gift className="w-3 h-3 text-pink-600" strokeWidth={2} />
            Rewards ({destination.rewards.length})
          </h3>
          <div className="grid grid-cols-2 gap-1.5 max-h-[100px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-pink-50">
            {destination.rewards.map((reward, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-1 p-1.5 bg-white rounded border border-pink-200"
              >
                <span className="text-xs font-semibold text-slate-900 line-clamp-1 flex-1">{reward.title}</span>
                <div className="flex-shrink-0 bg-pink-100 px-1.5 py-0.5 rounded">
                  <span className="text-xs font-bold text-pink-600">
                    {reward.points_required || reward.points_cost}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Check-in Tip */}
      {distance !== null && distance <= 0.1 && (
        <div className="bg-teal-50 border border-teal-300 rounded-lg p-2 animate-pulse">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-white"
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
              <p className="font-bold text-teal-900 text-xs">You're here! Scan QR to check in</p>
            </div>
          </div>
        </div>
      )}

      {distance !== null && distance > 0.1 && (
        <div className="bg-blue-50 border border-blue-300 rounded-lg p-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-white"
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
              <p className="font-bold text-blue-900 text-xs">Start Navigation to track journey</p>
            </div>
          </div>
        </div>
      )}
        </div>
    </Modal>
  );
};

export default DestinationDetail;
