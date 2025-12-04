import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Button from '../common/Button';
import { Camera, FileImage, Keyboard } from 'lucide-react';

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [scanMode, setScanMode] = useState(null); // null, 'camera', 'manual', 'file'
  const [manualCode, setManualCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (scanning && scanMode === 'camera' && scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          qrbox: {
            width: 280,
            height: 280,
          },
          fps: 10, // Increased FPS for faster real-time scanning
          aspectRatio: 1.0,
          disableFlip: false,
          rememberLastUsedCamera: true,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          defaultZoomValueIfSupported: 2,
        },
        false
      );

      scanner.render(
        (decodedText) => {
          console.log('QR Code detected:', decodedText);
          scanner.clear();
          setScanning(false);
          setScanMode(null);
          onScanSuccess && onScanSuccess(decodedText);
        },
        (error) => {
          // Handle scan errors silently (too noisy otherwise)
          console.debug(error);
        }
      );

      return () => {
        scanner.clear().catch((error) => console.error('Error clearing scanner:', error));
      };
    }
  }, [scanning, scanMode, onScanSuccess]);

  const startScanning = (mode) => {
    setErrorMessage(''); // Clear any previous errors
    setScanMode(mode);
    if (mode === 'camera') {
      setScanning(true);
    }
  };

  const stopScanning = () => {
    setScanning(false);
    setScanMode(null);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScanSuccess && onScanSuccess(manualCode.trim());
      setManualCode('');
      setScanMode(null);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear previous error and show loading state
    setErrorMessage('');
    setScanMode('file');

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        const msg = 'Please select an image file (JPG, PNG, etc.)';
        setErrorMessage(msg);
        onScanError && onScanError(msg);
        setScanMode(null);
        return;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        const msg = 'Image too large. Please use a smaller image (max 10MB)';
        setErrorMessage(msg);
        onScanError && onScanError(msg);
        setScanMode(null);
        return;
      }

      const { Html5Qrcode } = await import('html5-qrcode');
      const html5QrCode = new Html5Qrcode('qr-reader-file');
      
      // Try scanning with more lenient settings
      // First attempt: normal scan with aspectRatio enabled for better image handling
      let result = null;
      try {
        result = await html5QrCode.scanFile(file, true); // true = show image
      } catch (firstError) {
        console.log('First scan attempt failed, trying without aspect ratio:', firstError);
        // Second attempt: try without aspect ratio constraints
        try {
          result = await html5QrCode.scanFile(file, false);
        } catch (secondError) {
          console.error('Both scan attempts failed:', secondError);
          throw secondError;
        }
      }
      
      if (result && result.trim()) {
        setErrorMessage('');
        onScanSuccess && onScanSuccess(result);
        setScanMode(null);
      } else {
        const msg = '❌ No QR code detected. Make sure:\n• QR code is clearly visible\n• All 4 corners are in frame\n• Image is well-lit and in focus';
        setErrorMessage(msg);
        onScanError && onScanError(msg);
        setScanMode(null);
      }
    } catch (error) {
      console.error('Error scanning file:', error);
      
      // Provide more specific error messages
      let msg = '❌ Could not read QR code. ';
      if (error.message && error.message.includes('NotFoundException')) {
        msg += 'Try:\n• Getting closer to the QR code\n• Using better lighting\n• Taking photo straight-on (not at angle)\n• Making sure QR code fills the frame';
      } else if (error.message && error.message.includes('ChecksumException')) {
        msg += 'QR code appears damaged. Try taking another photo with better focus.';
      } else {
        msg += 'Please try again with a clearer photo or use "Enter Manually" option.';
      }
      
      setErrorMessage(msg);
      onScanError && onScanError(msg);
      setScanMode(null);
    } finally {
      // Reset file input so same file can be selected again
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Error Message Display */}
      {errorMessage && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 animate-shake">
          <div className="flex items-start gap-3">
            <div className="text-2xl">❌</div>
            <div className="flex-1">
              <p className="font-bold text-red-900 mb-1">Scan Failed</p>
              <p className="text-sm text-red-700 whitespace-pre-line">{errorMessage}</p>
              <button 
                onClick={() => setErrorMessage('')}
                className="mt-3 text-xs text-red-600 underline hover:text-red-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {!scanMode ? (
        <div className="space-y-3">
          <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-6 border-2 border-dashed border-teal-300">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-white rounded-full shadow-lg">
              <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Scan QR Code</h3>
            <p className="text-slate-600 text-center mb-4 text-sm">
              Choose how you want to scan the QR code
            </p>
          </div>

          {/* Scan Options */}
          <div className="grid grid-cols-1 gap-3">
            {/* File Upload - RECOMMENDED for mobile */}
            <label className="flex items-center gap-3 p-5 bg-gradient-to-r from-purple-50 to-pink-50 border-4 border-purple-400 rounded-xl hover:border-purple-500 hover:shadow-2xl transition-all group cursor-pointer relative">
              <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-lg animate-pulse">
                ✨ RECOMMENDED
              </div>
              <div className="w-14 h-14 bg-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                <FileImage className="w-7 h-7 text-white" />
              </div>
              <div className="text-left flex-1 pr-8">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-slate-900 text-lg">📸 Take Photo</p>
                </div>
                <p className="text-sm text-purple-700 font-semibold">Opens camera → Snap photo → Auto scan!</p>
              </div>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Camera Scan - Real-time (HTTPS only warning) */}
            <button
              onClick={() => startScanning('camera')}
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-300 rounded-xl hover:border-teal-500 hover:shadow-lg transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
                HTTPS Only
              </div>
              <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center shadow-md">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-slate-900">📹 Real-Time Camera</p>
                <p className="text-xs text-teal-700 font-medium">Live scanning (requires secure connection)</p>
              </div>
            </button>

            {/* Manual Input */}
            <button
              onClick={() => setScanMode('manual')}
              className="flex items-center gap-3 p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                <Keyboard className="w-6 h-6 text-blue-600 group-hover:text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-slate-900">⌨️ Enter Manually</p>
                <p className="text-xs text-slate-600">Type the QR code text directly</p>
              </div>
            </button>
          </div>

          {/* Tips Section */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-xl p-5 mt-3">
            <p className="font-bold text-blue-900 mb-3 flex items-center gap-2 text-lg">
              📱 Mobile Users - Use "Take Photo" Above!
            </p>
            <p className="text-sm text-blue-800 mb-3 font-medium">
              Camera access requires HTTPS. "Take Photo" method works perfectly on HTTP:
            </p>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5 text-lg">✓</span>
                <span><strong>Click "Take Photo"</strong> - Opens your camera app</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5 text-lg">✓</span>
                <span><strong>Get close</strong> - QR code fills most of frame</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5 text-lg">✓</span>
                <span><strong>Good light</strong> - Well-lit, no shadows or glare</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5 text-lg">✓</span>
                <span><strong>Hold steady</strong> - Clear, focused photo</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5 text-lg">✓</span>
                <span><strong>Auto scan!</strong> - System reads QR automatically</span>
              </li>
            </ul>
          </div>
        </div>
      ) : scanMode === 'camera' && scanning ? (
        <div className="space-y-4">
          {/* Real-time Scanning Header */}
          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl p-4 shadow-lg animate-pulse">
            <div className="flex items-center justify-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <p className="font-bold text-lg">📹 LIVE SCANNING...</p>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-center text-sm mt-2 text-teal-50">Point your camera at the QR code - it will scan automatically!</p>
          </div>
          
          {/* Camera View */}
          <div id="qr-reader" ref={scannerRef} className="rounded-2xl overflow-hidden shadow-2xl border-4 border-teal-400"></div>
          
          {/* Tips while scanning */}
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-3">
            <p className="text-sm text-yellow-800 text-center font-medium">
              💡 Keep QR code centered in the scanning box
            </p>
          </div>
          
          <Button variant="outline" onClick={stopScanning} className="w-full bg-red-50 hover:bg-red-100 border-red-300 text-red-700 font-bold">
            ❌ Stop Scanning
          </Button>
        </div>
      ) : scanMode === 'manual' ? (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Enter QR Code</h3>
            <p className="text-sm text-slate-600 mb-4">
              Type or paste the QR code text shown at the destination
            </p>
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="e.g., RESTAURANTS-TES-001"
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-mono text-lg bg-white text-slate-900 placeholder-slate-400"
              autoFocus
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={stopScanning}
              className="w-full"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={!manualCode.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verify Code
            </Button>
          </div>
        </form>
      ) : scanMode === 'file' ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-slate-900 font-semibold mt-4">Scanning QR Code...</p>
          <p className="text-slate-600 text-sm mt-2">Please wait while we process your image</p>
          <div id="qr-reader-file" className="hidden"></div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="text-slate-600 mt-4">Processing...</p>
          <div id="qr-reader-file" className="hidden"></div>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
