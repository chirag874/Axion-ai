import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { GoogleGenAI, Operation } from '@google/genai';
import Spinner from './ui/Spinner';
import { VIDEO_GENERATION_MESSAGES } from '../constants';
import { Image as ImageIcon, Video, Sparkles, Wand2, KeyRound } from 'lucide-react';

interface GenerativeStudioProps {
  currentUser: User;
  themeClasses: {
    accentTextColor: string;
    borderColor: string;
    accentBg: string;
    accentBgHover: string;
  };
}

const GenerativeStudio: React.FC<GenerativeStudioProps> = ({ currentUser, themeClasses }) => {
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // API Key state
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'ok' | 'missing'>('checking');

  // Image state
  const [images, setImages] = useState<string[]>([]);

  // Video state
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoadingMessage, setVideoLoadingMessage] = useState('');
  const operationRef = useRef<Operation<any> | null>(null);
  const pollingIntervalRef = useRef<number | null>(null);

  const checkApiKey = async () => {
    // Veo models require user-selected API keys.
    if (activeTab === 'video') {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setApiKeyStatus(hasKey ? 'ok' : 'missing');
    } else {
      // Imagen model can use project-level key
      setApiKeyStatus('ok');
    }
  };

  useEffect(() => {
    setApiKeyStatus('checking');
    checkApiKey();
  }, [activeTab]);

  const handleSelectKey = async () => {
    await window.aistudio.openSelectKey();
    setApiKeyStatus('checking');
    checkApiKey();
  };
  
  const cleanupPolling = () => {
    if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
    }
  };
  
  const handleGeneration = async () => {
    if (!prompt.trim()) return;

    setError(null);
    setIsGenerating(true);

    if (activeTab === 'image') {
        setImages([]);
    } else {
        setVideoUrl(null);
        setVideoLoadingMessage(VIDEO_GENERATION_MESSAGES[0]);
    }
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      if (activeTab === 'image') {
          const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: { numberOfImages: 1, aspectRatio: '1:1' },
          });
          const generatedImages = response.generatedImages.map(
            (img) => `data:image/png;base64,${img.image.imageBytes}`
          );
          setImages(generatedImages);
      } else {
          const operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
          });
          operationRef.current = operation;
          cleanupPolling();
          pollingIntervalRef.current = window.setInterval(() => pollVideoOperation(ai), 10000);
      }
    } catch (err: any) {
        if (err.message?.includes('API key not valid') || err.message?.includes('entity was not found')) {
            setError('Your API Key is invalid. Please select a valid one.');
            setApiKeyStatus('missing');
        } else {
            setError(`Failed to start ${activeTab} generation. Please try again.`);
        }
        console.error(err);
        setIsGenerating(false);
    } finally {
        if (activeTab === 'image') {
            setIsGenerating(false);
        }
    }
  };

  const pollVideoOperation = async (ai: GoogleGenAI) => {
      if(!operationRef.current) {
        cleanupPolling();
        return;
      };

      try {
        const operation = await ai.operations.getVideosOperation({operation: operationRef.current});
        operationRef.current = operation;

        if(operation.done) {
            cleanupPolling();
            setIsGenerating(false);

            if (operation.error) {
                setError(`Video generation failed: ${operation.error.message}`);
                return;
            }

            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if(downloadLink){
                try {
                    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                    if (!videoResponse.ok) throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
                    const videoBlob = await videoResponse.blob();
                    setVideoUrl(URL.createObjectURL(videoBlob));
                } catch(fetchError) {
                    console.error("Error fetching video:", fetchError);
                    setError('Video finished, but failed to download. Please try again.');
                }
            } else {
                 setError('Video generation finished, but no video was returned.');
            }
        }
      } catch (err) {
         console.error(err);
         setError('An error occurred while checking video status.');
         cleanupPolling();
         setIsGenerating(false);
      }
  };

  useEffect(() => {
    let messageInterval: number;
    if (isGenerating && activeTab === 'video') {
      let messageIndex = 0;
      setVideoLoadingMessage(VIDEO_GENERATION_MESSAGES[0]);
      messageInterval = window.setInterval(() => {
        messageIndex = (messageIndex + 1) % VIDEO_GENERATION_MESSAGES.length;
        setVideoLoadingMessage(VIDEO_GENERATION_MESSAGES[messageIndex]);
      }, 5000);
    }
    return () => clearInterval(messageInterval);
  }, [isGenerating, activeTab]);
  
  useEffect(() => () => cleanupPolling(), []);

  const ApiKeyGate = () => (
    <div className="text-center text-gray-500 flex flex-col items-center justify-center p-8">
        <KeyRound size={48} className="text-yellow-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700">API Key Required</h3>
        <p className="mt-2 max-w-sm">
            Video generation with Veo requires selecting a personal API key. Please select a key to continue.
        </p>
        <p className="text-xs mt-1 max-w-sm">
            You can learn more about billing at <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ai.google.dev/gemini-api/docs/billing</a>.
        </p>
        <button
            onClick={handleSelectKey}
            className={`mt-6 flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-semibold text-white transition-colors ${themeClasses.accentBg} ${themeClasses.accentBgHover}`}
        >
            <KeyRound size={16} /> Select API Key
        </button>
    </div>
  );
  
  const OutputArea = () => {
    if (apiKeyStatus !== 'ok') return null;
    if (isGenerating) {
        return (
            <div className="text-center">
                <Spinner size="lg" />
                <p className="mt-4 text-lg font-medium text-gray-700">Generating {activeTab}...</p>
                {activeTab === 'video' && <p className="mt-2 text-sm text-gray-500">{videoLoadingMessage}</p>}
            </div>
        );
    }
    if (error) return <div className="text-center text-red-500"><p>{error}</p></div>;
    
    if (activeTab === 'image' && images.length > 0) {
        return (
            <div className="w-full h-full p-4 animate-content-appear">
                {images.map((imgSrc, i) => (
                    <img key={i} src={imgSrc} alt={`Generated image ${i + 1}`} className="rounded-lg shadow-lg w-full h-full object-contain" />
                ))}
            </div>
        );
    }
    if (activeTab === 'video' && videoUrl) {
        return (
            <div className="w-full h-full p-4 animate-content-appear">
                <video src={videoUrl} controls autoPlay className="rounded-lg shadow-lg w-full h-full object-contain"></video>
            </div>
        );
    }
    return (
        <div className="text-center text-gray-400">
            <Sparkles size={64} className="mx-auto" />
            <p className="mt-4 font-medium text-gray-600">Your creations will appear here.</p>
            <p className="text-sm">Describe what you want to generate.</p>
        </div>
    );
  }

  return (
    <div className="flex h-full bg-white">
      <style>{`
        @keyframes content-appear {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-content-appear {
          animation: content-appear 0.5s ease-out forwards;
        }
      `}</style>
      <div className={`w-96 flex-shrink-0 border-r ${themeClasses.borderColor} flex flex-col`}>
        <div className={`p-4 border-b ${themeClasses.borderColor}`}>
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                <Wand2 className={themeClasses.accentTextColor} />
                Generative Studio
            </h2>
        </div>
        <div className="p-6 space-y-6 flex-grow">
            <div>
                <label className="font-semibold text-gray-700">Mode</label>
                <div className="flex items-center space-x-2 mt-2 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('image')}
                        className={`w-full px-4 py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium transition ${activeTab === 'image' ? `bg-white shadow-sm ${themeClasses.accentTextColor}` : 'text-gray-500 hover:bg-gray-200'}`}
                    >
                        <ImageIcon size={16} /> Image
                    </button>
                    <button
                        onClick={() => setActiveTab('video')}
                        className={`w-full px-4 py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium transition ${activeTab === 'video' ? `bg-white shadow-sm ${themeClasses.accentTextColor}` : 'text-gray-500 hover:bg-gray-200'}`}
                    >
                        <Video size={16} /> Video
                    </button>
                </div>
            </div>

            <div>
                 <label htmlFor="prompt-input" className="font-semibold text-gray-700">Prompt</label>
                 <textarea
                    id="prompt-input"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={`Describe the ${activeTab} you want to create...`}
                    className={`mt-2 flex-1 w-full p-3 text-gray-800 placeholder-gray-400 focus:outline-none resize-none border rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClasses.borderColor}`}
                    rows={8}
                    disabled={isGenerating || apiKeyStatus !== 'ok'}
                />
            </div>
        </div>
        <div className={`p-6 border-t ${themeClasses.borderColor}`}>
             <button
                onClick={handleGeneration}
                disabled={isGenerating || !prompt.trim() || apiKeyStatus !== 'ok'}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-colors ${themeClasses.accentBg} ${themeClasses.accentBgHover} disabled:bg-gray-400 disabled:opacity-70`}
            >
                <Sparkles size={18} />
                Generate
            </button>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
          {apiKeyStatus === 'checking' && <Spinner />}
          {apiKeyStatus === 'missing' && <ApiKeyGate />}
          <OutputArea />
      </div>
    </div>
  );
};

export default GenerativeStudio;
