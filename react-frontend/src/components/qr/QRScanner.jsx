import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Button from '../common/Button';

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (scanning && scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          qrbox: {
            width: 250,
            height: 250,
          },
          fps: 5,
        },
        false
      );

      scanner.render(
        (decodedText) => {
          scanner.clear();
          setScanning(false);
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
  }, [scanning, onScanSuccess]);

  const startScanning = () => {
    setScanning(true);
  };

  const stopScanning = () => {
    setScanning(false);
  };

  return (
    <div className="space-y-4">
      {!scanning ? (
        <div className="text-center space-y-4">
          <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-8 border-2 border-dashed border-teal-300">
            <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 bg-white rounded-full shadow-lg">
              <svg className="w-12 h-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Scan QR Code</h3>
            <p className="text-slate-600 mb-6">
              Position the QR code within the frame to check in
            </p>
            <Button variant="primary" onClick={startScanning}>
              Start Scanning
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div id="qr-reader" ref={scannerRef} className="rounded-2xl overflow-hidden"></div>
          <Button variant="outline" onClick={stopScanning} className="w-full">
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
