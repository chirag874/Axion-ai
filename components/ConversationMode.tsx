import React, { useState, useRef, useEffect } from 'react';
// FIX: Removed 'LiveSession' as it is not an exported member of '@google/genai'.
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAIBlob } from '@google/genai';
import { Mic, MicOff, X } from 'lucide-react';
import AxionCore from './ui/AxionCore';

// Audio utility functions from guidelines
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
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

type ConversationState = 'idle' | 'connecting' | 'listening' | 'speaking' | 'thinking' | 'error';

// FIX: Added a local interface for LiveSession to provide type safety for the session object.
interface LiveSession {
  close(): void;
  sendRealtimeInput(input: { media: GenAIBlob }): void;
}

const ConversationMode: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [conversationState, setConversationState] = useState<ConversationState>('idle');
  const [userTranscription, setUserTranscription] = useState('');
  
  const aiRef = useRef<GoogleGenAI | null>(null);
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const nextStartTimeRef = useRef(0);

  useEffect(() => {
    aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    return () => {
      // Cleanup on unmount
      stopConversation();
    };
  }, []);

  const stopConversation = async () => {
    if (sessionPromiseRef.current) {
        try {
            const session = await sessionPromiseRef.current;
            session.close();
        } catch (e) {
            console.error("Error closing session:", e);
        }
    }
    
    streamRef.current?.getTracks().forEach(track => track.stop());
    scriptProcessorRef.current?.disconnect();
    inputAudioContextRef.current?.close();
    outputAudioContextRef.current?.close();

    streamRef.current = null;
    sessionPromiseRef.current = null;
    scriptProcessorRef.current = null;
    inputAudioContextRef.current = null;
    outputAudioContextRef.current = null;
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    
    setConversationState('idle');
    setUserTranscription('');
  };

  const startConversation = async () => {
    if (conversationState !== 'idle' && conversationState !== 'error') return;

    setConversationState('connecting');

    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      // FIX: Cast window to `any` to allow access to `webkitAudioContext` for broader browser compatibility without TypeScript errors.
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      // FIX: Cast window to `any` to allow access to `webkitAudioContext` for broader browser compatibility without TypeScript errors.
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const source = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
      scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
        const l = inputData.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
          int16[i] = inputData[i] * 32768;
        }
        const pcmBlob: GenAIBlob = {
            data: encode(new Uint8Array(int16.buffer)),
            mimeType: 'audio/pcm;rate=16000',
        };
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
            });
        }
      };
      
      source.connect(scriptProcessorRef.current);
      scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);

      sessionPromiseRef.current = aiRef.current!.live.connect({
        // FIX: Corrected model name from '...-09-25' to '...-09-2025'
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setConversationState('listening');
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
                setUserTranscription(message.serverContent.inputTranscription.text);
            }
            if (message.serverContent?.turnComplete) {
                setUserTranscription('');
            }
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
            if (audioData) {
              setConversationState('speaking');
              const outputCtx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
              const sourceNode = outputCtx.createBufferSource();
              sourceNode.buffer = audioBuffer;
              sourceNode.connect(outputCtx.destination);
              sourcesRef.current.add(sourceNode);
              sourceNode.addEventListener('ended', () => {
                sourcesRef.current.delete(sourceNode);
                if (sourcesRef.current.size === 0) {
                  setConversationState('listening');
                }
              });
              sourceNode.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Session error:', e);
            setConversationState('error');
          },
          onclose: (e: CloseEvent) => {
             // Handled by stopConversation
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction: 'You are Axion AI. You are a friendly, helpful, and slightly futuristic AI assistant. Keep your responses concise and conversational.'
        },
      });

    } catch (err) {
      console.error('Failed to start conversation:', err);
      setConversationState('error');
      await stopConversation();
    }
  };
  
  const getStatusText = () => {
    switch(conversationState) {
        case 'idle': return 'Tap to start conversation';
        case 'connecting': return 'Connecting to Axion...';
        case 'listening': return 'Listening...';
        case 'speaking': return 'Axion is speaking...';
        case 'thinking': return 'Thinking...';
        case 'error': return 'Connection failed. Please try again.';
        default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-8 transition-opacity duration-500">
      <button onClick={onExit} className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 transition-colors">
        <X size={32} />
      </button>

      <div className="flex-grow flex flex-col items-center justify-center w-full max-w-2xl">
        <AxionCore state={conversationState} />
        <p className="mt-8 text-xl text-gray-500 font-medium h-8">{getStatusText()}</p>
        <p className="mt-2 text-2xl text-gray-800 font-semibold h-16 text-center">{userTranscription}</p>
      </div>

      <div className="flex-shrink-0">
         {conversationState === 'idle' || conversationState === 'error' ? (
             <button
                onClick={startConversation}
                className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105"
                aria-label="Start conversation"
            >
                <Mic size={32} />
            </button>
         ) : (
            <button
                onClick={stopConversation}
                className="w-20 h-20 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-all transform hover:scale-105"
                aria-label="Stop conversation"
            >
                <MicOff size={32} />
            </button>
         )}
      </div>
    </div>
  );
};

export default ConversationMode;