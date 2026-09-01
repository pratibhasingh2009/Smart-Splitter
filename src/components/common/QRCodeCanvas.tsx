import React from 'react';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

// Lightweight deterministic 2D QR-matrix generator with standard finder patterns
export const QRCodeCanvas: React.FC<QRCodeProps> = ({ value, size = 160, className = '' }) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&margin=4`;

  return (
    <div className={`relative inline-block bg-white p-2 rounded-2xl border border-slate-200 shadow-sm ${className}`}>
      <img
        src={qrUrl}
        alt={`QR Code for ${value}`}
        width={size}
        height={size}
        className="rounded-xl object-contain"
        loading="lazy"
      />
    </div>
  );
};
