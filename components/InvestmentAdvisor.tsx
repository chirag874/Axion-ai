import React, { useState } from 'react';
import { User } from '../types';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';
import Spinner from './ui/Spinner';
import { LineChart, Lightbulb, TrendingUp } from 'lucide-react';

interface InvestmentAdvisorProps {
  currentUser: User;
  themeClasses: {
    accentTextColor: string;
    borderColor: string;
    accentBg: string;
    accentBgHover: string;
  };
}

const InvestmentAdvisor: React.FC<InvestmentAdvisorProps> = ({ currentUser, themeClasses }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const model = 'gemini-2.5-flash';
  const systemInstruction = `You are Axion AI, an intelligent investment advisor.
Provide insightful analysis on stocks, crypto, and market trends.
Your tone should be analytical, helpful, and slightly futuristic.
You must always include the following disclaimer at the end of every response, formatted exactly like this:
---
**Disclaimer:** I am an AI assistant. This information is for educational purposes only and should not be considered financial advice. Please consult with a qualified financial professional before making any investment decisions.`;

  const handleGetAdvice = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setResponse('');
    setError(null);
    try {
      const result = await ai.models.generateContent({
        model,
        contents: query,
        config: { systemInstruction },
      });
      setResponse(result.text);
    } catch (err) {
      console.error(err);
      setError('Failed to get investment advice. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className={`p-4 border-b ${themeClasses.borderColor}`}>
        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
          <LineChart className={themeClasses.accentTextColor} />
          Investment Advisor
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {!response && !isLoading && (
          <div className="text-center text-gray-400 flex flex-col items-center justify-center h-full">
            <Lightbulb size={64} className="mx-auto text-gray-300" />
            <h3 className="text-xl font-semibold mt-4 text-gray-600">Market Insights Await</h3>
            <p className="max-w-md mt-2 text-gray-500">Ask about stock trends, cryptocurrency analysis, or general investment strategies.</p>
          </div>
        )}
        {isLoading && (
          <div className="flex justify-center items-center h-full">
            <Spinner size="lg"/>
          </div>
        )}
        {error && <div className="text-red-500 text-center">{error}</div>}
        {response && (
          <div className="prose prose-sm max-w-full bg-white p-6 rounded-lg border">
            <Markdown>{response}</Markdown>
          </div>
        )}
      </div>

      <div className={`p-4 border-t ${themeClasses.borderColor} bg-gray-50`}>
        <div className="flex items-center bg-white border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleGetAdvice()}
            placeholder="e.g., 'Analyze the future of AI stocks...'"
            className="flex-1 w-full bg-transparent p-4 text-gray-800 placeholder-gray-400 focus:outline-none"
            disabled={isLoading}
          />
          <button
            onClick={handleGetAdvice}
            disabled={isLoading || !query.trim()}
            className={`flex items-center justify-center gap-2 m-1 px-6 py-2 rounded-md font-semibold text-white transition-colors ${themeClasses.accentBg} ${themeClasses.accentBgHover} disabled:bg-gray-400`}
          >
            <TrendingUp size={16} />
            Analyze
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvestmentAdvisor;