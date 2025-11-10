import React, { useState } from 'react';
import Button from '../common/Button';

const ReviewForm = ({ visitId, destinationName, onSubmit, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      return;
    }

    setLoading(true);
    await onSubmit({ rating, comment });
    setLoading(false);
  };

  const stars = [1, 2, 3, 4, 5];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          How was your experience?
        </h3>
        <p className="text-slate-600">{destinationName}</p>
      </div>

      {/* Star Rating */}
      <div className="flex items-center justify-center gap-2">
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="transition-transform hover:scale-110 active:scale-95"
          >
            <svg
              className={`w-12 h-12 ${
                star <= (hoveredRating || rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-slate-300'
              } transition-colors duration-200`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>

      {rating > 0 && (
        <p className="text-center text-slate-600 animate-fadeIn">
          {rating === 5 && '⭐ Amazing!'}
          {rating === 4 && '😊 Great!'}
          {rating === 3 && '👍 Good!'}
          {rating === 2 && '😐 Okay'}
          {rating === 1 && '😕 Not great'}
        </p>
      )}

      {/* Comment */}
      <div className="relative">
        <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
          Tell us more (optional)
        </label>
        <div className="relative group">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200 hover:border-slate-300 resize-none"
            placeholder="Share your experience..."
          />
          <div className="absolute left-3 top-3 text-slate-400 group-focus-within:text-teal-500 transition-colors duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Bonus Points Notice */}
      {rating > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🪙</span>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Earn Bonus Points!</p>
              <p className="text-sm text-slate-600">
                Get +{rating * 10} points for leaving a review
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={loading}
        >
          Skip
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          disabled={rating === 0 || loading}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </Button>
      </div>
    </form>
  );
};

export default ReviewForm;
