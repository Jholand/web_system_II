import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import { staggerContainer, slideInFromRight, slideInFromBottom, scaleIn } from '../../utils/animations';
import AnimatedPage from '../../components/common/AnimatedPage';
import UserHeader from '../../components/common/UserHeader';
import UserDashboardTabs from '../../components/user/UserDashboardTabs';
import QRScanner from '../../components/qr/QRScanner';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import ToastNotification from '../../components/common/ToastNotification';
import toast from 'react-hot-toast';

const CheckIn = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { userLocation } = useLocation();
  const [showScanner, setShowScanner] = useState(false);
  const [recentCheckIns, setRecentCheckIns] = useState([
    { id: 1, location: 'Grand Hotel Resort', points: 50, time: '2 hours ago', status: 'success' },
    { id: 2, location: 'Mountain Peak', points: 100, time: '1 day ago', status: 'success' },
    { id: 3, location: 'Organic Farm', points: 30, time: '3 days ago', status: 'success' },
  ]);

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login');
  };

  const handleScanSuccess = async (qrCode) => {
    try {
      toast.success('Check-in successful! +50 points');
      setShowScanner(false);
      // Add to recent check-ins
      const newCheckIn = {
        id: Date.now(),
        location: 'New Location',
        points: 50,
        time: 'Just now',
        status: 'success'
      };
      setRecentCheckIns([newCheckIn, ...recentCheckIns]);
    } catch (error) {
      toast.error('Check-in failed. Please try again.');
    }
  };

  return (
    <AnimatedPage className="min-h-screen bg-gray-50">
      <ToastNotification />
      
      <UserHeader user={user} onLogout={handleLogout} />

      <UserDashboardTabs />

      {/* Main Content */}
      <main className="md:ml-64 sm:ml-20 max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:py-8 pb-32 sm:pb-20 md:pb-8 transition-all duration-300">
        <motion.h2 
          className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 sm:mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Your Adventure
        </motion.h2>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {/* Main Check-In Area */}
          <motion.div 
            variants={slideInFromBottom}
            className="lg:col-span-2 space-y-4 sm:space-y-6"
          >
            {/* QR Scanner Card */}
            <motion.div 
              className="bg-white rounded-2xl p-6 sm:p-8 border text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 100, delay: 0.4 }}
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Scan QR Code</h3>
              <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6">Point your camera at a location QR code to check in and earn points</p>
              
              <Button
                variant="primary"
                size="lg"
                onClick={() => setShowScanner(true)}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              >
                Start Scanning
              </Button>
            </motion.div>

            {/* Recent Check-Ins */}
            <motion.div 
              className="bg-white rounded-2xl p-4 sm:p-6 border"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">Recent Check-Ins</h3>
              
              <div className="space-y-3">
                {recentCheckIns.map((checkIn) => (
                  <div key={checkIn.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200 gap-3 sm:gap-0">
                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate">{checkIn.location}</h4>
                        <p className="text-xs sm:text-sm text-slate-600">{checkIn.time}</p>
                      </div>
                    </div>
                    <div className="text-right w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                      <p className="text-base sm:text-lg font-bold text-teal-600">+{checkIn.points} pts</p>
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        Success
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            variants={slideInFromRight}
            className="space-y-4 sm:space-y-6"
          >
            {/* Check-In Stats */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 border border-blue-200">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4">Check-In Stats</h3>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base text-slate-700">Today</span>
                  <span className="text-xl sm:text-2xl font-bold text-blue-600">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base text-slate-700">This Week</span>
                  <span className="text-xl sm:text-2xl font-bold text-blue-600">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base text-slate-700">This Month</span>
                  <span className="text-xl sm:text-2xl font-bold text-blue-600">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base text-slate-700">All Time</span>
                  <span className="text-xl sm:text-2xl font-bold text-blue-600">47</span>
                </div>
              </div>
            </div>

            {/* How to Check-In */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4">How to Check-In</h3>
              
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm sm:text-base">
                    1
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-slate-700">Visit a TravelQuest destination</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm sm:text-base">
                    2
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-slate-700">Find the QR code at the location</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm sm:text-base">
                    3
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-slate-700">Scan the code to earn points</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm sm:text-base">
                    4
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-slate-700">Collect rewards and badges!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Status */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 sm:p-6 border border-emerald-200">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4">Location Status</h3>
              
              {userLocation ? (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm sm:text-base">Location Active</p>
                    <p className="text-xs text-slate-600">GPS enabled and tracking</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm sm:text-base">Location Disabled</p>
                    <p className="text-xs text-slate-600">Please enable GPS</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* QR Scanner Modal */}
      {showScanner && (
        <Modal
          isOpen={showScanner}
          onClose={() => setShowScanner(false)}
          title="Scan QR Code"
        >
          <QRScanner onScanSuccess={handleScanSuccess} />
        </Modal>
      )}
    </AnimatedPage>
  );
};

export default CheckIn;
