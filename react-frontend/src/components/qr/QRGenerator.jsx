import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const QRGenerator = ({ value, size = 200, destinationName }) => {
  const downloadQR = () => {
    const svg = document.getElementById('qr-canvas');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    canvas.width = size;
    canvas.height = size;
    
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${destinationName || 'destination'}-qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="bg-white p-6 rounded-2xl shadow-lg border-4 border-teal-500">
        <QRCodeSVG
          id="qr-canvas"
          value={value}
          size={size}
          level="H"
          includeMargin={true}
        />
      </div>
      
      {destinationName && (
        <p className="text-center font-semibold text-slate-900">{destinationName}</p>
      )}
      
      <button
        onClick={downloadQR}
        className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors duration-200"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download QR Code
      </button>
    </div>
  );
};

export default QRGenerator;
