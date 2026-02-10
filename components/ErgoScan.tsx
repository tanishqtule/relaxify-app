
import React, { useRef, useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

export const ErgoScan: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function setupCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    }
    setupCamera();
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const runAnalysis = async () => {
    if (!canvasRef.current || !videoRef.current) return;
    setLoading(true);
    setAnalysis(null);

    const ctx = canvasRef.current.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0, 640, 480);
    const base64Data = canvasRef.current.toDataURL('image/jpeg').split(',')[1];

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
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
      setAnalysis("Unable to analyze right now. Make sure your desk is well lit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-black text-[#2C3E50] tracking-tighter">AI Ergonomic Auditor</h2>
        <p className="text-gray-400 font-medium mt-2">Let Gemini scan your workspace for hidden health risks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="relative glass-card rounded-[48px] overflow-hidden premium-shadow border border-white p-4">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover rounded-[32px] bg-black shadow-inner" />
          <canvas ref={canvasRef} width={640} height={480} className="hidden" />
          
          <button 
            onClick={runAnalysis}
            disabled={loading}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 px-10 py-5 premium-gradient text-white rounded-2xl font-black shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Analyzing Environment..." : "Scan My Workspace"}
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[40px] premium-shadow border border-gray-50 min-h-[300px] flex flex-col">
            <h3 className="text-[10px] font-black text-teal-500 uppercase tracking-[0.3em] mb-4">Gemini Insights</h3>
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-400">
                <div className="w-12 h-12 border-4 border-teal-100 border-t-teal-500 rounded-full animate-spin" />
                <p className="text-xs font-bold uppercase tracking-widest">Processing Frames...</p>
              </div>
            ) : analysis ? (
              <div className="prose prose-sm text-gray-600 leading-relaxed italic animate-in fade-in duration-500">
                "{analysis}"
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-300 text-center px-8">
                <p className="text-sm font-medium">Position your camera to show your desk and monitor, then hit Scan.</p>
              </div>
            )}
          </div>

          <div className="bg-[#2C3E50] p-8 rounded-[40px] text-white">
            <h4 className="text-xs font-black text-teal-400 uppercase tracking-widest mb-2">Ergo Dashboard</h4>
            <div className="space-y-3">
              <ErgoMetric label="Lumbar Support" level={85} />
              <ErgoMetric label="Monitor Alignment" level={40} />
              <ErgoMetric label="Ambient Lighting" level={60} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ErgoMetric = ({ label, level }: { label: string, level: number }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[9px] font-black uppercase">
      <span>{label}</span>
      <span className={level > 70 ? 'text-teal-400' : 'text-orange-400'}>{level}%</span>
    </div>
    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${level > 70 ? 'bg-teal-400' : 'bg-orange-400'}`} style={{ width: `${level}%` }} />
    </div>
  </div>
);
