import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle2, Eye, EyeOff, FileImage, Flashlight, LoaderCircle, Play, RotateCcw, ShieldAlert, Smartphone, StopCircle, Zap } from 'lucide-react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { analyzeQrContent, classifyQrContent, formatContentPreview, SecurityAnalysis } from '../../utils/securityEngine.js';
import { api } from '../../services/api.js';

type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => {
  detect(image: CanvasImageSource): Promise<Array<{ rawValue?: string }>>;
};
type BarcodeDetectorWindow = Window & {
  BarcodeDetector?: BarcodeDetectorConstructor;
};

type QrResult = {
  id: string;
  content: string;
  classification: ReturnType<typeof classifyQrContent>;
  analysis?: SecurityAnalysis;
  source: 'camera' | 'upload';
};

interface QRCodeScannerProps {
  onScanComplete?: (label: string, analysis: SecurityAnalysis) => void;
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScanComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const detectorRef = useRef<InstanceType<BarcodeDetectorConstructor> | null>(null);
  const scanTimerRef = useRef<number | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [scanLoading, setScanLoading] = useState(false);
  const [result, setResult] = useState<QrResult | null>(null);
  const [flashlight, setFlashlight] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [showSensitive, setShowSensitive] = useState(false);
  const [lastScanId, setLastScanId] = useState('');

  const stopCamera = () => {
    if (scanTimerRef.current) window.clearInterval(scanTimerRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraActive(false);
    setFlashlight(false);
  };

  const analyzeContent = async (content: string, source: QrResult['source']) => {
    const classification = classifyQrContent(content);
    const localAnalysis = analyzeQrContent(content);
    const nextResult: QrResult = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      content,
      classification,
      analysis: localAnalysis,
      source,
    };

    try {
      const response = await api.post<SecurityAnalysis>('/security/analyze', {
        qrContent: content,
        url: classification.type === 'url' ? classification.value : undefined,
      });
      nextResult.analysis = response || localAnalysis;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown API error';
      setCameraError(`The security API could not be reached (${message}). Showing a local QR-content review only.`);
    }

    setResult(nextResult);
    onScanComplete?.(`QR ${classification.type}`, nextResult.analysis || localAnalysis);
    setLastScanId(content);
    stopCamera();
  };

  const scanFrame = async () => {
    const video = videoRef.current;
    if (!video || !cameraActive || !detectorRef.current) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const context = canvas.getContext('2d');
      if (context) context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const decoded = await detectorRef.current.detect(canvas);
      if (decoded.length > 0) {
        const value = decoded[0]?.rawValue || '';
        if (value && value !== lastScanId) {
          setScanLoading(true);
          window.setTimeout(() => {
            analyzeContent(value, 'camera');
            setScanLoading(false);
          }, 180);
        }
      }
    } catch {
      // The next frame will retry; this does not expose camera data or send frames to the server.
    }
  };

  useEffect(() => {
    if (!cameraActive) return;
    const Detector = (window as BarcodeDetectorWindow).BarcodeDetector;
    if (Detector) detectorRef.current = new Detector({ formats: ['qr_code'] });
    scanTimerRef.current = window.setInterval(scanFrame, 250);
    return () => {
      if (scanTimerRef.current) window.clearInterval(scanTimerRef.current);
    };
  }, [cameraActive]);

  useEffect(() => () => stopCamera(), []);

  const startCamera = async () => {
    setCameraError('');
    setResult(null);
    setScanLoading(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('This browser does not support camera access.');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode } },
        audio: false,
      });
      if (!videoRef.current) throw new Error('The camera preview is unavailable.');
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      streamRef.current = stream;
      setCameraActive(true);
      setScanLoading(false);
    } catch (error) {
      setScanLoading(false);
      setCameraError(error instanceof Error ? error.message : 'Camera access was blocked or unavailable.');
    }
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setCameraError('Choose a JPG, PNG, WEBP, or another image file.');
      return;
    }
    setScanLoading(true);
    setCameraError('');
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d');
      if (context) context.drawImage(image, 0, 0);

      const decodeUploadedQr = async (): Promise<string | null> => {
        const Detector = (window as BarcodeDetectorWindow).BarcodeDetector;
        if (Detector) {
          try {
            const decoded = await new Detector({ formats: ['qr_code'] }).detect(canvas);
            return decoded[0]?.rawValue || null;
          } catch {
            // Fall back to the browser-side decoder below when the native API rejects.
          }
        }

        try {
          const reader = new BrowserQRCodeReader();
          const result = reader.decodeFromCanvas(canvas);
          return result.getText() || null;
        } catch {
          return null;
        }
      };

      decodeUploadedQr().then((value) => {
        if (!value) {
          setCameraError('No QR code was detected in this image. Try a clearer, well-lit image.');
          setScanLoading(false);
        } else {
          analyzeContent(value, 'upload');
          setScanLoading(false);
        }
        URL.revokeObjectURL(objectUrl);
      }).catch(() => {
        setCameraError('The uploaded image could not be decoded.');
        URL.revokeObjectURL(objectUrl);
        setScanLoading(false);
      });
    };
    image.onerror = () => {
      setCameraError('The selected image could not be read.');
      URL.revokeObjectURL(objectUrl);
      setScanLoading(false);
    };
    image.src = objectUrl;
  };

  const typeLabel = result?.classification.type === 'url' ? '🔗 URL' : result?.classification.type === 'wifi' ? '📶 Wi-Fi Network' : result?.classification.type === 'contact' ? '👤 Contact' : result?.classification.type === 'phone' ? '📞 Phone Number' : result?.classification.type === 'email' ? '📧 Email' : result?.classification.type === 'sms' ? '📱 SMS' : result?.classification.type === 'calendar' ? '📅 Event' : '📝 Text';

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-cyan-400/20 bg-gradient-to-br from-cyan-500/15 via-slate-900 to-indigo-500/10 p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-cyan-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300"><ShieldAlert className="h-3.5 w-3.5" /> Security scanner</div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Live QR Security Scanner</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">Scan a QR code and instantly check what it contains and whether its destination appears suspicious.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-slate-300"><span className="font-semibold text-white">Privacy:</span> Camera frames stay on your device.</div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0b111d]">
          <div ref={frameRef} className={`relative aspect-[4/3] min-h-[340px] w-full overflow-hidden bg-slate-950 ${cameraActive ? 'camera-active' : ''}`}>
            <video ref={videoRef} muted playsInline className={`h-full w-full object-cover ${cameraActive ? 'block' : 'hidden'}`} />
            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-[26px] border border-cyan-300/20 bg-cyan-400/10 text-cyan-300 shadow-2xl shadow-cyan-500/10"><Camera className="h-9 w-9" /></div>
                <h2 className="mt-5 text-xl font-bold text-white">LIVE CAMERA</h2>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-400">Point your camera at a QR code. Camera permission is requested only when you press Start Camera.</p>
                <div className="mt-5 flex h-40 w-40 items-center justify-center rounded-[34px] border border-dashed border-cyan-300/30 bg-cyan-400/[0.03]">
                  <Smartphone className="h-16 w-16 text-cyan-300/45" />
                </div>
              </div>
            )}
            {cameraActive && <div className="pointer-events-none absolute inset-5 rounded-[28px] border-2 border-cyan-300 shadow-[0_0_0_1px_rgba(34,211,238,0.28),0_0_30px_rgba(34,211,238,0.45)]"><div className="absolute -left-1 -top-1 h-7 w-7 border-l-2 border-t-2 border-cyan-300" /><div className="absolute -right-1 -top-1 h-7 w-7 border-r-2 border-t-2 border-cyan-300" /><div className="absolute -bottom-1 -left-1 h-7 w-7 border-b-2 border-l-2 border-cyan-300" /><div className="absolute -bottom-1 -right-1 h-7 w-7 border-b-2 border-r-2 border-cyan-300" /></div>}
            {scanLoading && <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70"><LoaderCircle className="h-10 w-10 animate-spin text-cyan-300" /></div>}
          </div>
          <div className="grid gap-3 border-t border-white/10 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <button onClick={startCamera} disabled={cameraActive || scanLoading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-xs font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"><Play className="h-4 w-4" /> Start Camera</button>
            <button onClick={stopCamera} disabled={!cameraActive} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-white transition hover:bg-white/10 disabled:opacity-40"><StopCircle className="h-4 w-4" /> Stop Camera</button>
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-white transition hover:bg-white/10"><FileImage className="h-4 w-4" /> Upload QR Image<input type="file" accept="image/*" className="hidden" onChange={handleUpload} /></label>
            <button onClick={() => { setResult(null); setLastScanId(''); }} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-white transition hover:bg-white/10"><RotateCcw className="h-4 w-4" /> Scan Again</button>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-white/10 px-4 py-3 text-[11px] text-slate-400"><button onClick={() => setFacingMode(facingMode === 'environment' ? 'user' : 'environment')} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2"><Smartphone className="h-3.5 w-3.5" /> Switch camera</button><button onClick={() => setFlashlight((value) => !value)} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2"><Flashlight className="h-3.5 w-3.5" /> {flashlight ? 'Flashlight on' : 'Flashlight off'}</button><span>Camera permission is required only to start the scanner.</span></div>
          {cameraError && <div className="mx-4 mb-4 rounded-xl border border-amber-400/20 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-200">{cameraError}</div>}
        </div>

        <div className="space-y-4">
          <div className="rounded-[28px] border border-white/10 bg-[#0b111d] p-5">
            <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">Decoded result</p><h2 className="mt-1 text-lg font-bold text-white">QR content analysis</h2></div><ShieldAlert className="h-6 w-6 text-cyan-300" /></div>
            {result ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Type</p><p className="mt-1 text-xl font-black text-white">{typeLabel}</p><p className="mt-3 break-all text-sm leading-relaxed text-slate-300">{formatContentPreview(result.content, 500)}</p></div>
                {result.classification.type === 'wifi' && <div className="rounded-2xl border border-amber-400/20 bg-amber-500/5 p-4"><p className="text-xs font-semibold text-amber-200">Network:</p><p className="mt-1 text-sm text-white">{String(result.classification.metadata?.ssid || 'Unknown')}</p><p className="mt-1 text-xs text-slate-400">Security: {String(result.classification.metadata?.security || 'Unknown')}</p><button onClick={() => setShowSensitive((value) => !value)} className="mt-3 flex items-center gap-2 text-[11px] font-bold text-cyan-300">{showSensitive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {showSensitive ? 'Hide sensitive details' : 'Reveal sensitive details only if you need them'}</button>{showSensitive && <p className="mt-3 break-all rounded-lg bg-black/30 p-3 text-xs text-slate-300">Wi-Fi credentials are never shown on the main result screen. Matching or saved data is not stored automatically.</p>}</div>}
                {result.analysis && <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"><div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-300">Security status</span><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${result.analysis.level === 'No Known Threat Detected' ? 'bg-emerald-500/20 text-emerald-300' : result.analysis.level === 'Potentially Dangerous' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'}`}>{result.analysis.level}</span></div><p className="mt-3 text-sm leading-relaxed text-slate-300">{result.analysis.recommendation}</p><p className="mt-3 text-xs text-slate-500">Risk score: {result.analysis.riskScore}/100 · {new Date(result.analysis.scanTime).toLocaleString()}</p></div>}
                <div className="flex gap-2"><button onClick={() => { setResult(null); setLastScanId(''); }} className="flex-1 rounded-xl bg-white px-4 py-3 text-xs font-bold text-slate-950">Scan Another QR</button><button onClick={() => navigator.clipboard?.writeText(result.content)} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-white">Copy decoded content</button></div>
              </div>
            ) : <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-slate-950/30 p-7 text-center"><Zap className="mx-auto h-8 w-8 text-slate-500" /><p className="mt-3 text-sm font-semibold text-slate-300">No QR detected yet</p><p className="mt-1 text-xs leading-relaxed text-slate-500">The scanner will decode and classify the content locally. No destination is opened automatically.</p></div>}
          </div>
          <div className="rounded-[28px] border border-white/10 bg-[#0b111d] p-5"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300"><CheckCircle2 className="h-5 w-5" /></div><div><h3 className="text-sm font-bold text-white">Your privacy controls</h3><p className="text-xs text-slate-500">No camera footage, QR image, or decoded payload is stored automatically.</p></div></div></div>
        </div>
      </div>
    </section>
  );
};
