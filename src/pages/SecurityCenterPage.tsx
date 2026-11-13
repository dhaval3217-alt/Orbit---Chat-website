import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleDot,
  FileCheck2,
  Image,
  Link2,
  QrCode,
  ScanSearch,
  Shield,
  ShieldAlert,
  UploadCloud,
} from 'lucide-react';
import { QRCodeScanner } from '../components/security/QRCodeScanner.js';
import { api } from '../services/api.js';
import { useAuthStore } from '../store/authStore.js';
import {
  analyzeUrl,
  scanFileMetadata,
  type SecurityAnalysis,
} from '../utils/securityEngine.js';

type ScanLevel = SecurityAnalysis['level'];
type ScanType = 'link' | 'image' | 'file' | 'qr' | 'video';
type ScannerMode = ScanType | 'overview' | 'inbox' | 'history';

interface ScanRecord {
  id: string;
  type: ScanType;
  label: string;
  level: ScanLevel;
  recommendation: string;
  createdAt: string;
  userId?: string;
}

const STORAGE_KEY = 'orbit-threat-detection-history';

const getStorage = (): Storage | null => (
  typeof localStorage === 'undefined' ? null : localStorage
);

const TOOLS: Array<{
  name: string;
  mode: ScannerMode;
  icon: typeof Link2;
  description: string;
  iconClass: string;
}> = [
  { name: 'Scan Link', mode: 'link', icon: Link2, description: 'Review a URL for suspicious structure.', iconClass: 'bg-cyan-500/10 text-cyan-300' },
  { name: 'Scan Image', mode: 'image', icon: Image, description: 'Review image file metadata.', iconClass: 'bg-amber-500/10 text-amber-300' },
  { name: 'Scan File', mode: 'file', icon: FileCheck2, description: 'Check file name, type, and size indicators.', iconClass: 'bg-emerald-500/10 text-emerald-300' },
  { name: 'Live QR Scanner', mode: 'qr', icon: QrCode, description: 'Scan with your camera or upload a QR image.', iconClass: 'bg-violet-500/10 text-violet-300' },
  { name: 'Security Inbox', mode: 'inbox', icon: UploadCloud, description: 'Review scans that need your attention.', iconClass: 'bg-blue-500/10 text-blue-300' },
  { name: 'Scan History', mode: 'history', icon: Activity, description: 'Review your recent security checks.', iconClass: 'bg-rose-500/10 text-rose-300' },
];

const readHistory = (): ScanRecord[] => {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const value: unknown = JSON.parse(storage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(value)) return [];
    return value.flatMap((entry): ScanRecord[] => {
      if (typeof entry !== 'object' || entry === null) return [];
      const saved = entry as Record<string, unknown>;
      if (typeof saved.id !== 'string' || typeof saved.label !== 'string' || typeof saved.createdAt !== 'string') return [];

      const level: ScanLevel | undefined = saved.level === 'No Known Threat Detected' ||
        saved.level === 'Suspicious' ||
        saved.level === 'Potentially Dangerous' ||
        saved.level === 'Scan Inconclusive'
        ? saved.level
        : saved.risk === 'Safe'
          ? 'No Known Threat Detected'
          : saved.risk === 'Suspicious'
            ? 'Suspicious'
            : saved.risk === 'High Risk'
              ? 'Potentially Dangerous'
              : saved.risk === 'Unable to Verify'
                ? 'Scan Inconclusive'
                : undefined;
      const type: ScanType | undefined = saved.type === 'media'
        ? 'image'
        : saved.type === 'link' || saved.type === 'image' || saved.type === 'file' || saved.type === 'qr' || saved.type === 'video'
          ? saved.type
          : undefined;
      if (!level || !type) return [];
      return [{
        id: saved.id,
        type,
        label: saved.label,
        level,
        recommendation: typeof saved.recommendation === 'string'
          ? saved.recommendation
          : typeof saved.status === 'string'
            ? saved.status
            : 'Review the recorded scan indicators.',
        createdAt: saved.createdAt,
        userId: typeof saved.userId === 'string' ? saved.userId : undefined,
      }];
    });
  } catch (error) {
    console.error('Unable to read security scan history:', error);
    return [];
  }
};

const getMode = (scanner?: string): ScannerMode => {
  if (scanner === 'url') return 'link';
  if (scanner && ['link', 'image', 'file', 'video', 'qr', 'inbox', 'history'].includes(scanner)) {
    return scanner as ScannerMode;
  }
  return 'overview';
};

const levelStyle = (level: ScanLevel) => {
  if (level === 'No Known Threat Detected') return 'border-emerald-400/30 bg-emerald-500/15 text-emerald-300';
  if (level === 'Potentially Dangerous') return 'border-rose-400/30 bg-rose-500/15 text-rose-300';
  if (level === 'Suspicious') return 'border-amber-400/30 bg-amber-500/15 text-amber-300';
  return 'border-slate-400/20 bg-slate-500/15 text-slate-200';
};

const toRecordLevel = (analysis: SecurityAnalysis): ScanLevel => analysis.level;

export const SecurityCenterPage: React.FC = () => {
  const { scanner } = useParams<{ scanner?: string }>();
  const { user } = useAuthStore();
  const [mode, setMode] = useState<ScannerMode>(() => getMode(scanner));
  const [linkInput, setLinkInput] = useState('');
  const [analysis, setAnalysis] = useState<SecurityAnalysis | null>(null);
  const [scanError, setScanError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scans, setScans] = useState<ScanRecord[]>([]);

  useEffect(() => {
    setMode(getMode(scanner));
    setAnalysis(null);
    setScanError('');
  }, [scanner]);

  useEffect(() => {
    setScans(readHistory().filter((scan) => !user?.id || scan.userId === user.id));
  }, [user?.id]);

  const addScan = (type: ScanType, label: string, result: SecurityAnalysis) => {
    const record: ScanRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      label,
      level: toRecordLevel(result),
      recommendation: result.recommendation,
      createdAt: result.scanTime,
      userId: user?.id,
    };
    const allRecords = readHistory();
    const nextAll = [record, ...allRecords.filter((item) => item.id !== record.id)].slice(0, 50);
    const storage = getStorage();
    if (storage) {
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(nextAll));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown storage error';
        setScanError(`Scan completed, but the report could not be saved in this browser (${message}).`);
      }
    } else {
      setScanError('Scan completed, but browser storage is unavailable; the report will not persist after leaving this page.');
    }
    setScans(nextAll.filter((item) => !user?.id || item.userId === user.id));
  };

  const scanUrl = async () => {
    if (!linkInput.trim()) {
      setScanError('Enter a link to scan.');
      return;
    }

    setIsScanning(true);
    setScanError('');
    let result: SecurityAnalysis;
    try {
      result = await api.post<SecurityAnalysis>('/security/analyze', { url: linkInput.trim() });
    } catch (error) {
      result = analyzeUrl(linkInput);
      const message = error instanceof Error ? error.message : 'Unknown API error';
      setScanError(`The security API could not be reached (${message}). Showing a local URL-structure review only.`);
    } finally {
      setIsScanning(false);
    }
    setAnalysis(result);
    addScan('link', result.url || linkInput.trim(), result);
  };

  const scanFile = async (event: ChangeEvent<HTMLInputElement>, type: 'file' | 'image' | 'video') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanError('');
    const localResult = scanFileMetadata(file);
    let result: SecurityAnalysis;
    try {
      result = await api.post<SecurityAnalysis>('/security/analyze', {
        filename: file.name,
        mimeType: file.type,
        size: file.size,
      });
    } catch (error) {
      result = localResult;
      const message = error instanceof Error ? error.message : 'Unknown API error';
      setScanError(`The security API could not be reached (${message}). Showing a local file-metadata review only.`);
    } finally {
      setIsScanning(false);
      event.target.value = '';
    }
    setAnalysis(result);
    addScan(type, file.name, result);
  };

  const onQrScan = (label: string, result: SecurityAnalysis) => {
    setAnalysis(result);
    addScan('qr', label, result);
  };

  const metrics = [
    { label: 'No Known Threat', value: scans.filter((scan) => scan.level === 'No Known Threat Detected').length, icon: CheckCircle2, color: 'text-emerald-300', bg: 'bg-emerald-500/10' },
    { label: 'Suspicious', value: scans.filter((scan) => scan.level === 'Suspicious').length, icon: AlertTriangle, color: 'text-amber-300', bg: 'bg-amber-500/10' },
    { label: 'Potentially Dangerous', value: scans.filter((scan) => scan.level === 'Potentially Dangerous').length, icon: ShieldAlert, color: 'text-rose-300', bg: 'bg-rose-500/10' },
    { label: 'QR Scans', value: scans.filter((scan) => scan.type === 'qr').length, icon: QrCode, color: 'text-cyan-300', bg: 'bg-cyan-500/10' },
  ];

  const visibleScans = useMemo(() => (
    mode === 'inbox'
      ? scans.filter((scan) => scan.level === 'Suspicious' || scan.level === 'Potentially Dangerous')
      : scans
  ), [mode, scans]);

  const showHistory = mode === 'history' || mode === 'inbox';

  return (
    <div className="min-w-0 space-y-6 text-white">
      <header className="relative min-w-0 overflow-hidden rounded-[30px] border border-emerald-400/20 bg-[radial-gradient(circle_at_top_left,_rgba(52,211,153,0.22),_transparent_32%),linear-gradient(135deg,#0e1c1d,#111827,#0c1727)] p-5 sm:p-8">
        <div className="relative z-10 flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300">
              <Shield className="h-3.5 w-3.5" /> AI Security Center
            </div>
            <h1 className="break-words text-2xl font-black tracking-tight text-white sm:text-4xl">Threat Detection &amp; Security</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
              Analyze links, files, images, and QR codes before interacting with them. Findings are indicators, not a guarantee that content is safe.
            </p>
          </div>
          <Link to="/security/qr" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 text-center text-xs font-black uppercase tracking-[0.14em] text-emerald-950 transition hover:bg-emerald-300">
            Open Live Scanner <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <section aria-label="Security scan metrics" className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="min-w-0 rounded-[24px] border border-white/10 bg-[#0d1420]/85 p-4 sm:p-5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} ${color}`}><Icon className="h-5 w-5" /></div>
            <p className="mt-4 text-3xl font-black text-white">{value}</p>
            <p className="mt-1 break-words text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
          </div>
        ))}
      </section>

      <section className="grid min-w-0 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="min-w-0 rounded-[28px] border border-white/10 bg-[#0d1420]/85 p-4 sm:p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">Security tools</p><h2 className="mt-1 text-xl font-bold text-white">Choose a scan</h2></div>
            <ScanSearch className="h-6 w-6 shrink-0 text-emerald-300" />
          </div>
          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
            {TOOLS.map(({ name, mode: toolMode, icon: Icon, description, iconClass }) => (
              <Link key={toolMode} to={toolMode === 'overview' ? '/security' : `/security/${toolMode}`} className={`group flex min-w-0 items-center gap-3 rounded-2xl border p-3 text-left transition sm:gap-4 sm:p-4 ${mode === toolMode ? 'border-emerald-400/30 bg-emerald-500/5' : 'border-white/10 bg-slate-950/30 hover:border-white/20 hover:bg-white/5'}`}>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${iconClass}`}><Icon className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="block break-words text-sm font-bold text-white">{name}</span><span className="mt-1 block text-xs leading-relaxed text-slate-400">{description}</span></span>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-500 transition group-hover:translate-x-1 group-hover:text-white" />
              </Link>
            ))}
          </div>
        </div>

        <div className="min-w-0 rounded-[28px] border border-white/10 bg-[#0d1420]/85 p-4 sm:p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">Recent activity</p>
          <h2 className="mt-1 text-xl font-bold text-white">Security timeline</h2>
          {scans.length ? (
            <div className="mt-5 space-y-3">
              {scans.slice(0, 4).map((scan) => (
                <div key={scan.id} className="flex min-w-0 gap-3 rounded-2xl border border-white/10 bg-slate-950/30 p-3">
                  <CircleDot className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                  <div className="min-w-0 flex-1"><p className="break-words text-xs font-semibold text-white">{scan.label}</p><p className="mt-1 text-[11px] text-slate-400">{scan.level}</p></div>
                  <time className="shrink-0 text-right text-[10px] text-slate-500">{new Date(scan.createdAt).toLocaleString()}</time>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-slate-950/30 p-5 text-sm text-slate-400">
              Your security timeline will appear here after your first scan.
            </div>
          )}
        </div>
      </section>

      <div className="rounded-[28px] border border-amber-400/20 bg-amber-500/5 p-4 text-sm leading-relaxed text-amber-100">
        No scan can guarantee that a link, image, file, or QR code is safe. Orbit checks available structure and metadata only; use trusted security tools for high-impact decisions.
      </div>

      {mode === 'link' && (
        <section className="grid min-w-0 gap-5 xl:grid-cols-2">
          <div className="min-w-0 rounded-[28px] border border-white/10 bg-[#0d1420]/85 p-5">
            <h2 className="text-lg font-bold">Scan Link</h2>
            <p className="mt-1 text-sm text-slate-400">Review URL structure and available threat indicators.</p>
            <label htmlFor="security-url" className="mt-5 block text-xs font-semibold text-slate-300">Link to analyze</label>
            <div className="mt-2 flex min-w-0 flex-col gap-3 sm:flex-row">
              <input id="security-url" value={linkInput} onChange={(event) => setLinkInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void scanUrl(); }} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0b1220] px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50" placeholder="https://example.com" />
              <button type="button" onClick={() => void scanUrl()} disabled={isScanning} className="rounded-xl bg-cyan-400 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 disabled:opacity-50">{isScanning ? 'Scanning…' : 'Scan Link'}</button>
            </div>
          </div>
          <AnalysisResult analysis={analysis} error={scanError} />
        </section>
      )}

      {(mode === 'file' || mode === 'image' || mode === 'video') && (
        <section className="grid min-w-0 gap-5 xl:grid-cols-2">
          <div className="min-w-0 rounded-[28px] border border-white/10 bg-[#0d1420]/85 p-5">
            <h2 className="text-lg font-bold">{mode === 'image' ? 'Scan Image' : mode === 'video' ? 'Scan Video' : 'Scan File'}</h2>
            <p className="mt-1 text-sm text-slate-400">This scanner reviews file name, MIME type, and size; it does not inspect file contents.</p>
            <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-emerald-400/30 bg-emerald-500/5 p-7 text-center transition hover:border-emerald-300/60 hover:bg-emerald-500/10 sm:p-10">
              <UploadCloud className="h-10 w-10 text-emerald-300" />
              <span className="mt-3 text-base font-semibold text-white">Select from your device</span>
              <span className="mt-1 break-words text-xs text-slate-400">Your file stays on this device; only basic metadata is sent for analysis.</span>
              <input type="file" accept={mode === 'image' ? 'image/*' : mode === 'video' ? 'video/*' : undefined} className="sr-only" onChange={(event) => void scanFile(event, mode)} />
            </label>
            {isScanning && <p role="status" className="mt-3 text-sm text-cyan-300">Analyzing file metadata…</p>}
          </div>
          <AnalysisResult analysis={analysis} error={scanError} />
        </section>
      )}

      {mode === 'qr' && <QRCodeScanner onScanComplete={onQrScan} />}

      {showHistory && (
        <section className="min-w-0 rounded-[28px] border border-white/10 bg-[#0d1420]/85 p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">{mode === 'inbox' ? 'Security inbox' : 'Scan history'}</p><h2 className="mt-1 text-xl font-bold text-white">{mode === 'inbox' ? 'Scans requiring attention' : 'Your security reports'}</h2></div>
            <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">{visibleScans.length} {visibleScans.length === 1 ? 'report' : 'reports'}</span>
          </div>
          {visibleScans.length ? (
            <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {visibleScans.map((scan) => <ScanReport key={scan.id} scan={scan} />)}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/30 p-6 text-center text-sm text-slate-400">
              {mode === 'inbox' ? 'No suspicious or potentially dangerous scans are currently in your inbox.' : 'No scan history yet. Run a security check to create your first report.'}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

const AnalysisResult: React.FC<{ analysis: SecurityAnalysis | null; error: string }> = ({ analysis, error }) => (
  <section className="min-w-0 rounded-[28px] border border-white/10 bg-[#0d1420]/85 p-5" aria-live="polite">
    <div className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-cyan-300" /><h2 className="text-lg font-bold">Scan Result</h2></div>
    {error && <p role="alert" className="mt-4 break-words rounded-xl border border-amber-400/20 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-200">{error}</p>}
    {analysis ? (
      <div className="mt-4 space-y-3">
        <span className={`inline-flex max-w-full break-words rounded-full border px-3 py-1.5 text-xs font-bold ${levelStyle(analysis.level)}`}>{analysis.level}</span>
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <p className="text-xs text-slate-400">{analysis.category} · Risk score {analysis.riskScore}/100</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-200">{analysis.recommendation}</p>
          <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-300">{analysis.indicators.map((indicator) => <li key={indicator} className="flex gap-2"><span className="text-cyan-300">•</span><span className="min-w-0 break-words">{indicator}</span></li>)}</ul>
        </div>
        <p className="text-[11px] text-slate-500">{analysis.reputation} · {new Date(analysis.scanTime).toLocaleString()}</p>
      </div>
    ) : (
      <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-slate-950/30 p-6 text-center text-sm text-slate-400"><ScanSearch className="mx-auto mb-2 h-8 w-8 text-cyan-300" />Run a scan to review its result.</div>
    )}
  </section>
);

const ScanReport: React.FC<{ scan: ScanRecord }> = ({ scan }) => (
  <article className="min-w-0 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
    <div className="flex min-w-0 items-start justify-between gap-2">
      <div className="min-w-0"><p className="break-words text-sm font-bold text-white">{scan.label}</p><p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-400">{scan.type} scan</p></div>
      <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold ${levelStyle(scan.level)}`}>{scan.level}</span>
    </div>
    <p className="mt-3 break-words text-xs leading-relaxed text-slate-300">{scan.recommendation}</p>
    <time className="mt-3 block text-[11px] text-slate-500">{new Date(scan.createdAt).toLocaleString()}</time>
  </article>
);
