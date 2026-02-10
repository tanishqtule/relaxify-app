
import { GoogleGenAI, Modality } from "@google/genai";

let currentSource: AudioBufferSourceNode | null = null;
let audioCtx: AudioContext | null = null;
let isProcessing = false;
const speechQueue: string[] = [];

function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const processQueue = async () => {
  if (isProcessing || speechQueue.length === 0) return;
  
  isProcessing = true;
  const text = speechQueue.shift()!;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `In a calm, professional wellness coach voice, say: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio data returned");
    }

    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    
    currentSource = source;
    source.onended = () => {
      currentSource = null;
      isProcessing = false;
      processQueue();
    };
    source.start();
  } catch (err) {
    console.warn("Speech engine error:", err);
    // Recover state after failure
    currentSource = null;
    isProcessing = false;
    setTimeout(processQueue, 500); 
  }
};

export const speak = (text: string, interrupt = false) => {
  if (interrupt) {
    if (currentSource) {
      try { currentSource.stop(); } catch (e) {}
      currentSource = null;
    }
    speechQueue.length = 0; 
    isProcessing = false;
  }
  
  if (speechQueue.length > 0 && speechQueue[speechQueue.length - 1] === text) return;
  
  speechQueue.push(text);
  processQueue();
};
