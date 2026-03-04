
import React, { useRef, useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

export const ErgoScan: React.FC = () => {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [analysis,   setAnalysis]   = useState<string | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [camError,   setCamError]   = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function setupCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCamError(null);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('Permission') || msg.includes('NotAllowed')) {
          setCamError('Camera access denied. Please allow camera permissions and reload.');
        } else if (msg.includes('NotFound') || msg.includes('DevicesNotFound')) {
          setCamError('No camera found. Please connect a camera and reload.');
        } else {
          setCamError('Could not start camera. Check your device settings.');
        }
      }
    }

    setupCamera();

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const runAnalysis = async () => {
    if (!canvasRef.current || !videoRef.current || camError) return;
    setLoading(true);
    setAnalysis(null);

    const ctx = canvasRef.current.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0, 640, 480);
    const base64Data = canvasRef.current.toDataURL('image/jpeg').split(',')[1];

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [
          {
            parts: [
              { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
              { text: "Analyze the user's workspace for ergonomics. Look at monitor height, desk clutter, lighting, and general sitting posture. Provide 3 specific, actionable professional tips to improve their health. Keep it friendly and concise (under 80 words)." }
            ]
          }
        ]
      });
      setAnalysis(response.text || "Setup looks great! Keep up the good work.");
    } catch (err) {
      setAnalysis("Unable to analyze right now. Make sure your desk is well lit and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="max-w-4xl mx-auto space-y-8"
      style={{ animation: 'entrance 0.7s cubic-bezier(0.16,1,0.3,1) both' }}
    >
      <div className="text-center mb-8">
        <h2
          className="text-4xl font-black tracking-tighter"
          style={{ color: 'var(--text-primary)' }}
        >
          AI Ergonomic Auditor
        </h2>
        <p
          className="font-medium mt-2"
          style={{ color: 'var(--text-muted)' }}
        >
          Let Gemini scan your workspace for hidden health risks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Camera feed */}
        <div
          className="relative rounded-[48px] overflow-hidden premium-shadow p-4"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
          }}
        >
          {camError ? (
            /* Camera error state */
            <div
              className="flex flex-col items-center justify-center rounded-[32px] text-center p-10"
              style={{
                minHeight: 280,
                background: 'rgba(239,68,68,0.05)',
                border: '1px dashed rgba(239,68,68,0.3)',
              }}
            >
              <p className="text-4xl mb-4">📷</p>
              <p className="font-black mb-2" style={{ color: '#EF4444' }}>Camera Unavailable</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {camError}
              </p>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover rounded-[32px] shadow-inner"
              style={{ background: 'var(--bg-page)', minHeight: 220 }}
            />
          )}

          <canvas ref={canvasRef} width={640} height={480} className="hidden" />

          <button
            onClick={runAnalysis}
            disabled={loading || !!camError}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 px-10 py-5 premium-gradient text-white rounded-2xl font-black shadow-2xl btn-ripple"
            style={{
              transition: 'transform 0.2s ease, opacity 0.2s ease',
              opacity: loading || camError ? 0.5 : 1,
              cursor: loading || camError ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? 'Analyzing Environment…' : 'Scan My Workspace'}
          </button>
        </div>

        <div className="space-y-6">
          {/* AI insights panel */}
          <div
            className="p-8 rounded-[40px] premium-shadow flex flex-col"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              minHeight: 300,
            }}
          >
            <h3
              className="text-[10px] font-black uppercase tracking-[0.3em] mb-4"
              style={{ color: '#38F9D7' }}
            >
              Gemini Insights
            </h3>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div
                  className="w-12 h-12 border-4 rounded-full animate-spin"
                  style={{
                    borderColor: 'rgba(56,249,215,0.15)',
                    borderTopColor: '#38F9D7',
                  }}
                />
                <p
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Processing Frames…
                </p>
              </div>
            ) : analysis ? (
              <p
                className="text-sm leading-relaxed italic flex-1"
                style={{
                  color: 'var(--text-secondary)',
                  animation: 'entrance 0.5s ease both',
                }}
              >
                "{analysis}"
              </p>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center px-8">
                <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                  Position your camera to show your desk and monitor, then hit Scan.
                </p>
              </div>
            )}
          </div>

          {/* Ergo metrics panel */}
          <div
            className="p-8 rounded-[40px]"
            style={{
              background: 'linear-gradient(145deg, #0D1F35 0%, #132A45 100%)',
              border: '1px solid rgba(56,249,215,0.1)',
            }}
          >
            <h4
              className="text-xs font-black uppercase tracking-widest mb-4"
              style={{ color: '#38F9D7' }}
            >
              Ergo Dashboard
            </h4>
            <div className="space-y-3">
              <ErgoMetric label="Lumbar Support"     level={85} />
              <ErgoMetric label="Monitor Alignment"  level={40} />
              <ErgoMetric label="Ambient Lighting"   level={60} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ErgoMetric = ({ label, level }: { label: string; level: number }) => (
  <div className="space-y-1">
    <div
      className="flex justify-between text-[9px] font-black uppercase tracking-widest"
      style={{ color: 'rgba(220,240,236,0.8)' }}
    >
      <span>{label}</span>
      <span style={{ color: level > 70 ? '#38F9D7' : '#F59E0B' }}>{level}%</span>
    </div>
    <div
      className="h-1.5 rounded-full overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.08)' }}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${level}%`,
          background: level > 70
            ? 'linear-gradient(90deg, #38F9D7, #20C997)'
            : 'linear-gradient(90deg, #F59E0B, #D97706)',
          transition: 'width 1.2s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      />
    </div>
  </div>
);
