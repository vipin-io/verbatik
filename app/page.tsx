// File: app/page.tsx
// v2.10: Definitive version. Incorporates all expert feedback for a high-converting, professional landing page.

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from './components/Logo';
import { motion } from 'framer-motion';

const PaperclipIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-500 group-hover:text-indigo-400 transition-colors">
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.59a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
  </svg>
);

// --- NEW: Preview Card Component ---
const PreviewCard = ({ category, sentiment, summary, priority }: { category: string, sentiment: string, summary: string, priority: string }) => {
  const sentimentColor = sentiment === 'Positive' ? 'text-green-400' : sentiment === 'Negative' ? 'text-red-400' : 'text-yellow-400';
  const priorityColor = priority === 'High' ? 'bg-red-500/20 text-red-300' : priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-500/20 text-gray-300';

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-gray-800/50 border border-gray-700/80 rounded-lg p-4 text-left"
    >      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold ${sentimentColor}`}>{sentiment}</span>
          <span className="text-xs text-indigo-400 font-medium">{category}</span>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${priorityColor}`}>{priority}</span>
      </div>
      <p className="text-sm text-gray-200 font-medium">{summary}</p>
    </motion.div>);
};


const loadingMessages = [
  "Connecting to AI...",
  "Analyzing themes...",
  "Sifting through feedback...",
  "Generating insights...",
  "Finalizing your report...",
];

export default function HomePage() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      let messageIndex = 0;
      setLoadingMessage(loadingMessages[messageIndex]);
      interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 2000);
    } else {
      setLoadingMessage('');
    }
    return () => clearInterval(interval);
  }, [isLoading]);


  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const WORD_LIMIT = 1500;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'An unknown error occurred.');
      }

      const { jobId } = result;
      router.push(`/r/${jobId}`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4 font-sans text-white overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-5"></div>

      <div className="w-full max-w-3xl mx-auto text-center px-4">
        <div className="flex flex-col items-center justify-center gap-2 mb-8">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text-3xl font-bold text-gray-200">Verbatik</span>
          </div>
          <p className="text-sm text-indigo-400 font-medium">Verbatim to Value.</p>
        </div>

        <h1 className="text-4xl font-bold tracking-tighter bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 text-transparent bg-clip-text">
          Stop Reading. Start Understanding.
        </h1>

        <p className="mt-6 text-lg text-gray-400 max-w-xl mx-auto">
          Paste raw user feedback, get a clear, actionable report in <span className="text-white">10 seconds.</span>
        </p>

        <form onSubmit={handleSubmit} className="w-full mt-12 bg-gray-800/20 border border-gray-700/50 rounded-xl shadow-2xl p-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500 backdrop-blur-md">
          <div className="relative">
            <textarea
              id="feedback-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g., 'I love the new dark mode, but the app crashes when I try to export a PDF...'"
              className="w-full h-64 p-4 text-gray-300 placeholder-gray-500 bg-transparent border-none resize-none focus:ring-0 focus:outline-none"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between pt-2 px-4 pb-2 border-t border-gray-700/50">
            <div className="flex items-center space-x-2">
              <button type="button" title="Attach file (coming soon)" className="group p-2 text-gray-500 rounded-full hover:bg-gray-700/50 transition-colors cursor-not-allowed opacity-50">
                <PaperclipIcon />
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`text-sm font-medium ${wordCount > WORD_LIMIT ? 'text-red-500' : 'text-gray-400'}`}>
                {wordCount} / {WORD_LIMIT} words
              </span>
              <small className="block text-xs text-gray-500 mt-1">
                ≈15 tweets or 200 lines of text
              </small>
              <button
                type="submit"
                disabled={isLoading || text.trim() === '' || wordCount > WORD_LIMIT}
                className="px-5 py-2 w-48 text-center font-semibold text-white bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Analyzing...</span>
                  </div>
                ) : 'Get Report'}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-4 text-center h-6">
          {isLoading && <p className="text-indigo-400 animate-pulse">{loadingMessage}</p>}
          {error && <p className="text-red-400 font-medium">{error}</p>}
        </div>

        {/* --- NEW: Hero Preview & Trust Signals --- */}
        <div className="mt-16 w-full max-w-2xl mx-auto">
          <p className="text-center text-sm font-semibold text-gray-400 mb-4">YOUR INSTANT REPORT WILL LOOK LIKE THIS</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <PreviewCard category="Bug Report" sentiment="Negative" summary="App crashes when exporting to PDF" priority="High" />
            <PreviewCard category="Feature Request" sentiment="Neutral" summary="Users want a calendar view for deadlines" priority="Medium" />
            <PreviewCard category="Positive Feedback" sentiment="Positive" summary="Users love the new dark mode" priority="Low" />
          </div>
          <div className="mt-8 text-center">
            <p className="text-lg font-semibold text-gray-200">Trusted by Product Managers at leading startups.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
