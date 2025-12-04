import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { Star, Send, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLocation } from '../../contexts/LocationContext';

const CheckInReview = ({ destination, scannedQRCode, onSubmit, onCancel }) => {
  const { userLocation, calculateDistance } = useLocation();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [distance, setDistance] = useState(null);
  const [isInRange, setIsInRange] = useState(true);

  useEffect(() => {
    if (userLocation && destination && calculateDistance) {
      const dist = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        destination.latitude,
        destination.longitude
      );
      const distanceInMeters = dist * 1000;
      const allowedRadius = destination.visitRadius || 100;
      
      setDistance(distanceInMeters);
      setIsInRange(distanceInMeters <= allowedRadius);
    }
  }, [userLocation, destination, calculateDistance]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please provide a rating');
      return;
    }

    if (!review.trim()) {
      toast.error('Please write a review');
      return;
    }

    setSubmitting(true);
    try {
      const result = await onSubmit({
        destinationId: destination.id,
        qrCode: scannedQRCode,
        rating,
        review: review.trim()
      });
      
      // If location check failed, don't clear the form
      if (!result?.success) {
        setSubmitting(false);
      }
    } catch (error) {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Location Status */}
      {distance !== null && (
        <div className={`rounded-xl p-4 border-2 ${
          isInRange 
            ? 'bg-green-50 border-green-300' 
            : 'bg-red-50 border-red-300'
        }`}>
          <div className="flex items-start gap-3">
            <MapPin className={`w-5 h-5 mt-0.5 ${
              isInRange ? 'text-green-600' : 'text-red-600'
            }`} />
            <div className="flex-1">
              {isInRange ? (
                <>
                  <p className="font-bold text-green-900 mb-1">✓ Location Verified</p>
                  <p className="text-sm text-green-700">
                    You're {distance.toFixed(0)}m away - within {destination.visitRadius || 100}m radius
                  </p>
                </>
              ) : (
                <>
                  <p className="font-bold text-red-900 mb-1">⚠️ Out of Range</p>
                  <p className="text-sm text-red-700 mb-2">
                    You're {distance.toFixed(0)}m away. Must be within {destination.visitRadius || 100}m to submit review.
                  </p>
                  <p className="text-xs text-red-600 bg-red-100 rounded p-2">
                    💡 Move closer to the destination to enable review submission.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Rate Your Experience <span className="text-red-500">*</span>
          </label>
          <div className="flex justify-center gap-3 p-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110 focus:outline-none bg-white rounded-lg p-1"
              >
                <Star
                  className={`w-10 h-10 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-white text-slate-300 stroke-slate-300 stroke-2'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center text-sm font-medium text-slate-700 mt-2">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          )}
        </div>

        {/* Review */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Write a Review <span className="text-red-500">*</span>
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience at this destination..."
            rows={4}
            maxLength={500}
            className="w-full px-4 py-3 bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
            required
          />
          <p className="text-xs text-slate-500 mt-1.5">
            {review.length}/500 characters
          </p>
        </div>

        {/* Info Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5">
          <p className="text-xs text-blue-800 leading-relaxed">
            <strong className="font-semibold">Location Requirement:</strong> You must be within {destination.visitRadius || 100}m of the destination to submit a review. This ensures authentic feedback from actual visitors.
          </p>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
            className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={submitting || rating === 0 || !review.trim() || !isInRange}
            className={`w-full ${
              isInRange 
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            icon={<Send className="w-4 h-4" />}
          >
            {submitting ? 'Submitting...' : isInRange ? 'Submit & Claim' : 'Out of Range'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CheckInReview;
