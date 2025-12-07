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
        <div className="space-y-2">
          {/* Scan Options */}
          <div className="grid grid-cols-1 gap-2">
            {/* File Upload - RECOMMENDED for mobile */}
            <label className="flex items-center gap-2 p-2 bg-purple-50 border border-purple-300 rounded-md hover:bg-purple-100 transition-all cursor-pointer">
              <div className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center">
                <FileImage className="w-4 h-4 text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-slate-900 text-xs">📸 Take Photo</p>
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
              className="flex items-center gap-2 p-2 bg-teal-50 border border-teal-300 rounded-md hover:bg-teal-100 transition-all"
            >
              <div className="w-8 h-8 bg-teal-500 rounded flex items-center justify-center">
                <Camera className="w-4 h-4 text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-slate-900 text-xs">📹 Live scanning</p>
              </div>
            </button>

            {/* Manual Input */}
            <button
              onClick={() => setScanMode('manual')}
              className="flex items-center gap-2 p-2 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-all"
            >
              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                <Keyboard className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-slate-900 text-xs">⌨️ Enter Manually</p>
              </div>
            </button>
          </div>

          {/* Tips Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
            <p className="font-semibold text-blue-900 text-xs mb-1">
              📱 Tips: Use "Take Photo" for mobile
            </p>
            <ul className="text-xs text-blue-800 space-y-0.5">
              <li>• Get close - QR fills frame</li>
              <li>• Good lighting, no glare</li>
              <li>• Hold steady, clear focus</li>
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
