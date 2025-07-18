// File: app/page.tsx
// v2.3: Re-applied the vibrant gradient to the headline for a more dynamic feel.

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from './components/Logo';

const PaperclipIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-500 group-hover:text-indigo-400 transition-colors">
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.59a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
  </svg>
);

export default function HomePage() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // REFINED: Added a "spotlight" effect to the background for a more dynamic feel
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4 font-sans text-white overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-5"></div>
      
      <div className="w-full max-w-3xl mx-auto text-center">
        {/* REFINED: A cleaner, more professional brand lock-up */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <Logo />
          <span className="text-2xl font-semibold text-gray-200">Verbatik</span>
        </div>
        
        {/* REFINED: Headline is now a single, powerful line with the vibrant gradient */}
        <h1 className="text-4xl font-bold tracking-tighter bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 text-transparent bg-clip-text">
          Stop Reading. Start Understanding.
        </h1>
        
        {/* REFINED: Sub-headline is more stylized and better spaced */}
        <p className="mt-6 text-lg text-gray-400 max-w-xl mx-auto">
          Paste raw user feedback, get a clear, actionable report in <span className="text-white">10 seconds.</span>
        </p>

        {/* REFINED: Added more vertical space to let the content breathe */}
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
              <button
                type="submit"
                disabled={isLoading || text.trim() === '' || wordCount > WORD_LIMIT}
                className="px-5 py-2 font-semibold text-white bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </div>
                ) : 'Get My Insight Report'}
              </button>
            </div>
          </div>
        </form>
        
        {error && (
            <div className="mt-4 text-center p-3 bg-red-900/50 border border-red-700 rounded-lg">
                <p className="text-red-400 font-medium">{error}</p>
            </div>
        )}

        <p className="text-center mt-12 text-sm text-gray-500">
            Tagline: Verbatim to Value.
        </p>
      </div>
    </div>
  );
}
