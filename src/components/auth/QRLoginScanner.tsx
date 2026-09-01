import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  X,
  Upload,
  RefreshCw,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Download,
  Share2,
  Sparkles,
  UserPlus,
} from 'lucide-react';
// @ts-ignore
import jsQR from 'jsqr';
import { useApp } from '../../context/AppContext';
import { QRCodeCanvas } from '../common/QRCodeCanvas';

interface Props {
  onSuccess: (emailOrData: string) => void;
  onCancel?: () => void;
}

export const QRLoginScanner: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const { users, loginWithQR, login } = useApp();
  const [subTab, setSubTab] = useState<'scan' | 'universal-qr'>('scan');
  const [isScanning, setIsScanning] = useState(true);
  const [cameraError, setCameraError] = useState('');
  const [scannedResult, setScannedResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Universal App Instant Access QR Payload
  const universalQRPayload = JSON.stringify({
    app: 'HisabKitab-PersonalBudget',
    type: 'universal_login_signup',
    role: 'member',
    autoLoginEmail: 'pratibha@gmail.com',
    timestamp: Date.now(),
  });

  useEffect(() => {
    if (subTab === 'scan') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [subTab]);

  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const startCamera = async () => {
    setCameraError('');
    setScannedResult('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera is not supported on this browser/environment. You can upload a QR image below.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        video.muted = true;
        video.onloadedmetadata = () => {
          video.play().then(() => {
            setIsScanning(true);
            requestAnimationFrame(tick);
          }).catch((err) => {
            if (err?.name !== 'AbortError') {
              console.warn('QR video playback notice:', err);
            }
          });
        };
      }
    } catch (err: any) {
      console.warn('QR camera error:', err);
      setCameraError('Camera access denied or unavailable. Please upload a QR code image or choose a demo profile.');
    }
  };

  const tick = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          try {
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            });
            if (code && code.data) {
              handleCodeFound(code.data);
              return;
            }
          } catch (e) {
            console.error('jsQR decode error', e);
          }
        }
      }
    }
    animationFrameId.current = requestAnimationFrame(tick);
  };

  const handleCodeFound = (qrData: string) => {
    stopCamera();
    setIsProcessing(true);
    setScannedResult(qrData);

    // Try normal QR login
    let success = loginWithQR(qrData);

    // If it's universal QR payload
    if (!success) {
      try {
        const parsed = JSON.parse(qrData);
        if (parsed.type === 'universal_login_signup' || parsed.app === 'HisabKitab-PersonalBudget') {
          success = login(parsed.autoLoginEmail || 'pratibha@gmail.com', 'password123');
        }
      } catch (e) {
        // Not json, check if matches any user email
        const matched = users.find(u => u.email.toLowerCase() === qrData.trim().toLowerCase());
        if (matched) {
          success = login(matched.email, 'password123');
        }
      }
    }

    if (success) {
      setTimeout(() => {
        onSuccess(qrData);
      }, 600);
    } else {
      setIsProcessing(false);
      setCameraError(`QR code read ("${qrData.slice(0, 30)}..."), but no corresponding user was found. Please check your QR code.`);
    }
  };

  // Image QR Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleCodeFound(code.data);
          } else {
            setCameraError('No QR code detected in the uploaded image. Please try another clearer image.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Sub-Tabs: Scan Camera vs Show/Download Universal QR */}
      <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-2xl">
        <button
          type="button"
          onClick={() => setSubTab('scan')}
          className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
            subTab === 'scan'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Camera className="w-3.5 h-3.5 text-[#1E88E5]" />
          Scan with Camera
        </button>
        <button
          type="button"
          onClick={() => setSubTab('universal-qr')}
          className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
            subTab === 'universal-qr'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <QrCode className="w-3.5 h-3.5 text-emerald-600" />
          Download / Share QR
        </button>
      </div>

      {subTab === 'scan' ? (
        <>
          {/* Viewfinder Container */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-square max-w-xs mx-auto border-2 border-[#1E88E5] shadow-xl flex flex-col items-center justify-center">
            <video ref={videoRef} className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />

            {/* Animated Scanner Reticle */}
            {isScanning && !cameraError && (
              <div className="absolute inset-8 border-2 border-dashed border-[#1E88E5]/70 rounded-2xl pointer-events-none flex items-center justify-center animate-pulse">
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_#38bdf8] animate-bounce" />
              </div>
            )}

            {/* Success Overlay */}
            {scannedResult && (
              <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center text-white animate-in zoom-in-90">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2 animate-bounce" />
                <h4 className="font-extrabold text-sm">QR Code Verified!</h4>
                <p className="text-xs text-emerald-200 mt-1">Logging you in securely...</p>
              </div>
            )}

            {/* Camera Error / Fallback message */}
            {cameraError && (
              <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-5 text-center text-slate-200 space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-400 shrink-0" />
                <p className="text-xs font-semibold text-slate-300">{cameraError}</p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2 rounded-xl bg-[#1E88E5] text-white text-xs font-bold flex items-center gap-2 hover:bg-[#145DA0] transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry Camera
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons: Upload Image & Demo QR quick pick */}
          <div className="space-y-3 max-w-xs mx-auto">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              Upload QR Image from Device
            </button>

            {/* Quick 1-Click QR Emulation */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
                Or Scan Any Registered Member:
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {users.slice(0, 3).map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleCodeFound(JSON.stringify({ id: u.id, email: u.email }))}
                    className="p-2 rounded-xl bg-blue-50/70 hover:bg-blue-100 border border-blue-100 text-slate-700 text-center transition-all group"
                  >
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-6 h-6 rounded-full mx-auto object-cover mb-1 border border-white shadow-xs"
                    />
                    <span className="text-[10px] font-bold block truncate text-slate-800">
                      {u.name.split(' ')[0]}
                    </span>
                    <span className="text-[9px] text-[#1E88E5] font-extrabold flex items-center justify-center gap-0.5 mt-0.5">
                      <QrCode className="w-2.5 h-2.5" /> Scan
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Universal App Login & Signup QR Code Download Card */
        <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200/80 text-center space-y-3 animate-in fade-in">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px] mb-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Universal App Login & Signup QR
            </div>
            <h4 className="font-extrabold text-sm text-slate-800">
              Share with Friends or Scan to Join
            </h4>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Anyone can scan this QR code with their mobile phone or scanner to instantly log in or register without typing credentials!
            </p>
          </div>

          <div className="flex justify-center py-2">
            <QRCodeCanvas
              value={universalQRPayload}
              size={160}
              className="shadow-md bg-white border-2 border-emerald-500/30"
            />
          </div>

          <div className="flex flex-col gap-2 max-w-xs mx-auto">
            <a
              href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(universalQRPayload)}`}
              target="_blank"
              rel="noreferrer"
              download="HisabKitab_Universal_Login_QR.png"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" /> Download QR to Send on WhatsApp
            </a>

            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full py-2 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              {copiedNotification ? 'App Link Copied!' : 'Copy Direct App Link'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
