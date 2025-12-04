import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLocation as useUserLocation } from '../contexts/LocationContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8000/api'
  : `http://${window.location.hostname}:8000/api`;

export const useCheckIn = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const { userLocation, calculateDistance } = useUserLocation();
  const [showScanModal, setShowScanModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [scannedQRCode, setScannedQRCode] = useState(null);
  const [checkInDestination, setCheckInDestination] = useState(null);
  const [destinations, setDestinations] = useState([]);

  const fetchDestinations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/destinations`);
      const data = response.data.data || [];
      
      const transformedDestinations = data.map(dest => ({
        id: dest.id,
        name: dest.name,
        title: dest.name,
        category: dest.category?.name?.toLowerCase() || 'hotel',
        categoryId: dest.category?.id || '',
        categoryIcon: dest.category?.icon || '📍',
        categoryName: dest.category?.name || 'Uncategorized',
        description: dest.description || 'No description available',
        address: `${dest.address?.street || ''} ${dest.address?.barangay || ''}, ${dest.address?.city || ''}, ${dest.address?.province || ''}`.trim(),
        latitude: parseFloat(dest.coordinates?.latitude) || 0,
        longitude: parseFloat(dest.coordinates?.longitude) || 0,
        points: dest.points_reward || 50,
        rating: dest.stats?.average_rating || 0,
        reviewCount: dest.stats?.total_reviews || 0,
        qrCode: dest.qr_code || `${dest.category?.name?.toUpperCase()?.replace(' ', '-')}-${dest.name?.substring(0, 3)?.toUpperCase()}-${String(dest.id).padStart(3, '0')}`,
        visitRadius: dest.visit_radius || 100,
        rewards: dest.rewards || [],
        images: dest.images || [],
        operatingHours: dest.operating_hours || []
      }));

      setDestinations(transformedDestinations);
      return transformedDestinations;
    } catch (error) {
      console.error('Error fetching destinations:', error);
      toast.error('Failed to load destinations');
      return [];
    }
  };

  const handleScanSuccess = (qrCode, destinationsList = destinations) => {
    console.log('=== QR SCAN DEBUG ===');
    console.log('QR Code scanned:', qrCode);
    
    // Find destination by QR code
    const targetDestination = destinationsList.find(dest => 
      dest.qrCode?.trim().toLowerCase() === qrCode.trim().toLowerCase()
    );
    
    if (!targetDestination) {
      console.error('No destination found with QR code:', qrCode);
      toast.error(`No destination found with QR code: ${qrCode}. Please make sure you're at the correct location.`, {
        duration: 5000
      });
      setShowScanModal(false);
      return;
    }

    console.log('Found destination by QR code:', targetDestination);

    // Verify QR code matches destination FIRST
    const expectedQRCode = targetDestination.qrCode;
    
    console.log('Comparing QR codes:', { expected: expectedQRCode?.trim(), scanned: qrCode?.trim() });
    
    // Case-insensitive comparison
    if (qrCode.trim().toLowerCase() !== expectedQRCode.trim().toLowerCase()) {
      console.error('QR Code mismatch!', { expected: expectedQRCode, got: qrCode });
      toast.error(`❌ Invalid QR code.\n\nExpected: ${expectedQRCode}\nGot: ${qrCode}\n\nPlease check the code and try again.`, {
        duration: 5000,
        style: {
          fontSize: '14px',
          whiteSpace: 'pre-line'
        }
      });
      setShowScanModal(false);
      return;
    }

    console.log('✓ QR Code verified!');

    // NOW check if user is within allowed radius (STRICT CHECK)
    if (!userLocation || !calculateDistance) {
      toast.error(
        <div className="space-y-2">
          <p className="font-bold">📍 Location Required</p>
          <p className="text-sm">Please enable location services to check in and leave a review.</p>
          <p className="text-xs mt-2 opacity-80">You must be at the destination to provide feedback.</p>
        </div>,
        { 
          duration: 6000,
          style: { maxWidth: '400px' }
        }
      );
      setShowScanModal(false);
      return;
    }

    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      targetDestination.latitude,
      targetDestination.longitude
    );
    
    const distanceInMeters = distance * 1000;
    const allowedRadius = targetDestination.visitRadius || 100;
    
    console.log('GPS Check:', {
      distance: distanceInMeters.toFixed(0) + 'm',
      allowedRadius: allowedRadius + 'm',
      userLocation,
      destinationLocation: { lat: targetDestination.latitude, lng: targetDestination.longitude }
    });
    
    // STRICT: User must be within radius to proceed
    if (distanceInMeters > allowedRadius) {
      toast.error(
        <div className="space-y-2">
          <p className="font-bold">🚫 Too Far from Destination</p>
          <p className="text-sm">You must be within {allowedRadius}m to check in and leave a review</p>
          <p className="text-sm font-semibold">Current distance: {distanceInMeters.toFixed(0)}m away</p>
          <p className="text-xs mt-2 pt-2 border-t border-red-300 opacity-90">
            💡 Move closer to the destination and try scanning again. This ensures authentic reviews from actual visitors.
          </p>
        </div>,
        { 
          duration: 8000,
          style: { 
            maxWidth: '420px',
            background: '#fee2e2',
            border: '2px solid #ef4444',
            color: '#7f1d1d'
          }
        }
      );
      setShowScanModal(false);
      console.warn('❌ Distance check failed - user too far away');
      return;
    }

    console.log('✓ Within check-in radius');

    // All checks passed - QR verified AND user is within radius
    // Now show review form
    setScannedQRCode(qrCode);
    setCheckInDestination(targetDestination);
    setShowScanModal(false);
    setShowReviewModal(true);
    toast.success(`✅ Check-in verified for ${targetDestination.name}! Please leave a review.`, {
      duration: 4000,
      style: {
        background: '#10b981',
        color: '#fff',
        fontWeight: '600',
      }
    });
    console.log('✓ All checks passed - opening review form');
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        toast.error('Please log in to check in');
        navigate('/login');
        return { success: false };
      }

      console.log('Submitting check-in review:', {
        destination_id: reviewData.destinationId,
        qr_code: reviewData.qrCode,
        rating: reviewData.rating,
        hasToken: !!token
      });

      // Get CSRF cookie first (for Sanctum)
      const BASE_URL = API_BASE_URL.replace('/api', '');
      try {
        await axios.get(`${BASE_URL}/sanctum/csrf-cookie`, {
          withCredentials: true
        });
      } catch (csrfError) {
        console.warn('CSRF cookie fetch failed, continuing...', csrfError);
      }

      // Submit check-in with review
      const response = await axios.post(`${API_BASE_URL}/checkins`, {
        destination_id: reviewData.destinationId,
        qr_code: reviewData.qrCode,
        rating: reviewData.rating,
        review_text: reviewData.review
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: true
      });

      console.log('Check-in response:', response.data);

      if (response.data.success) {
        const pointsEarned = response.data.data.points || checkInDestination.points;
        const totalPoints = response.data.data.total_points;
        const newBadges = response.data.data.new_badges || [];
        
        // Update user points in context
        if (setUser && user) {
          const updatedUser = {
            ...user,
            total_points: totalPoints
          };
          setUser(updatedUser);
          // Update localStorage to persist the new points
          try {
            localStorage.setItem('user_data', JSON.stringify(updatedUser));
          } catch (storageError) {
            console.error('Failed to update user data in storage:', storageError);
          }
        }

        // Show check-in success toast
        toast.success(
          <div className="space-y-1">
            <p className="font-bold text-lg">✅ Check-in Successful!</p>
            <p className="text-sm">+{pointsEarned} points earned</p>
            <p className="text-xs opacity-90">Total Points: {totalPoints}</p>
          </div>,
          { 
            duration: 6000,
            style: {
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              padding: '16px',
              borderRadius: '12px'
            }
          }
        );

        // Show badge achievements if any
        if (newBadges.length > 0) {
          setTimeout(() => {
            newBadges.forEach((badge, index) => {
              setTimeout(() => {
                toast.success(
                  <div className="space-y-2">
                    <p className="font-bold text-xl">🎉 New Badge Earned!</p>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{badge.icon || '🏆'}</span>
                      <div>
                        <p className="font-bold text-lg">{badge.name}</p>
                        <p className="text-sm opacity-90">+{badge.points_reward} bonus points!</p>
                        <p className="text-xs opacity-75 uppercase">{badge.rarity} Badge</p>
                      </div>
                    </div>
                  </div>,
                  { 
                    duration: 8000,
                    style: {
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: '#fff',
                      padding: '20px',
                      borderRadius: '16px',
                      minWidth: '320px'
                    }
                  }
                );
              }, index * 1000); // Stagger badge notifications
            });
          }, 1000); // Wait 1s after check-in success
        }

        // Reset states
        setShowReviewModal(false);
        setCheckInDestination(null);
        setScannedQRCode(null);

        return { success: true, points: pointsEarned, totalPoints, newBadges };
      } else {
        toast.error(response.data.message || 'Check-in failed');
        return { success: false };
      }
    } catch (error) {
      console.error('Check-in error:', error);
      console.error('Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        data: error.response?.data,
        url: error.config?.url
      });
      
      if (error.response?.status === 404) {
        toast.error(
          <div>
            <p className="font-bold">API Route Not Found</p>
            <p className="text-sm mt-1">The check-in endpoint is not accessible.</p>
            <p className="text-xs mt-1">URL: {error.config?.url}</p>
            <p className="text-xs">Please ensure the Laravel server is running.</p>
          </div>,
          { duration: 6000 }
        );
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to submit check-in. Please try again.');
      }
      
      return { success: false };
    }
  };

  return {
    showScanModal,
    setShowScanModal,
    showReviewModal,
    setShowReviewModal,
    scannedQRCode,
    checkInDestination,
    destinations,
    fetchDestinations,
    handleScanSuccess,
    handleReviewSubmit,
    resetCheckIn: () => {
      setShowScanModal(false);
      setShowReviewModal(false);
      setCheckInDestination(null);
      setScannedQRCode(null);
    }
  };
};
