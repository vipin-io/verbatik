// File: app/r/[id]/page.tsx
// v2.4: Corrected all 'any' types to pass Vercel's strict build process.

'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Logo } from '@/app/components/Logo';

// --- TYPE DEFINITIONS ---
interface FeedbackItem {
  category: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  summary: string;
  quote: string;
}

interface ReportData {
  overall_summary: string | { [key: string]: string };
  feedback_items?: FeedbackItem[];
  source_text?: string;
  [key: string]: unknown;
}

// FIXED: Defined specific types for jspdf-autotable to remove 'any'
type AutoTableColumn = string[];
type AutoTableData = string[][];
interface AutoTableOptions {
  startY: number;
}

// Create a custom type for jsPDF with the autoTable plugin method
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (columns: AutoTableColumn, data: AutoTableData, options: AutoTableOptions) => jsPDF;
}

// --- UI COMPONENTS ---
const ReportSkeleton = () => (
    <div className="animate-pulse w-full">
        <div className="h-8 bg-gray-700 rounded-md w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-700 rounded-md w-full mb-6"></div>
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 border border-gray-700 rounded-lg">
                    <div className="flex items-center gap-3 mb-3"><div className="h-6 bg-gray-700 rounded-full w-24"></div><div className="h-6 bg-gray-700 rounded-md w-32"></div></div>
                    <div className="h-5 bg-gray-700 rounded-md w-5/6 mb-3"></div>
                    <div className="h-10 bg-gray-700 rounded-md w-full"></div>
                </div>
            ))}
        </div>
    </div>
);

const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const BugIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.5a8.5 8.5 0 0 0 8.5-8.5V7a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-1-1V3.5a1 1 0 0 0-1-1h-5a1 1 0 0 0-1 1V5a1 1 0 0 1-1 1H5a1 1 0 0 0-1 1v5a8.5 8.5 0 0 0 8.5 8.5Z"/><path d="M7 10.5h10"/><path d="m6 14 1 1"/><path d="m18 14-1 1"/></svg>;
const FeatureIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-4.44a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8.88a2 2 0 0 0 2-2v-8.88Z"/><path d="M18 2h2v2h-2z"/><path d="M15 8h-5"/><path d="M15 12h-5"/><path d="M15 16h-5"/></svg>;
const ComplaintIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>;
const PositiveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a2 2 0 0 1 1.79 1.11L15 5.88Z"/></svg>;

const CategoryIcon = ({ category }: { category: string }) => {
  const lowerCategory = category.toLowerCase();
  if (lowerCategory.includes('bug')) return <BugIcon />;
  if (lowerCategory.includes('feature')) return <FeatureIcon />;
  if (lowerCategory.includes('complaint')) return <ComplaintIcon />;
  if (lowerCategory.includes('positive')) return <PositiveIcon />;
  return null;
};

const parseFeedbackItems = (data: unknown): FeedbackItem[] => {
    const items: FeedbackItem[] = [];
    if (!data || typeof data !== 'object') return items;

    const isFeedbackItem = (item: unknown): item is Omit<FeedbackItem, 'category'> & { category?: string } => {
        return item != null && typeof item === 'object' &&
               'sentiment' in item && typeof (item as FeedbackItem).sentiment === 'string' &&
               'summary' in item && typeof (item as FeedbackItem).summary === 'string' &&
               'quote' in item && typeof (item as FeedbackItem).quote === 'string';
    };
    
    const findItemsRecursively = (obj: unknown, potentialCategory?: string) => {
        if (Array.isArray(obj)) {
            obj.forEach(item => findItemsRecursively(item, potentialCategory));
            return;
        }

        if (isFeedbackItem(obj)) {
            items.push({
                ...obj,
                category: obj.category || potentialCategory || 'General',
            });
            return;
        }

        if (typeof obj === 'object' && obj !== null) {
            Object.entries(obj).forEach(([key, value]) => {
                if (key.toLowerCase() !== 'overall_summary' && key.toLowerCase() !== 'source_text') {
                    findItemsRecursively(value, key);
                }
            });
        }
    };

    findItemsRecursively(data);
    return items;
};

const ReportPage = () => {
  const params = useParams();
  const reportId = params.id as string;

  const [report, setReport] = useState<ReportData | null>(null);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [hoveredQuote, setHoveredQuote] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) return;
    const fetchReport = async () => {
      setLoading(true);
      setError('');
      try {
        const { data, error: fetchError } = await supabase.from('reports').select('report_data').eq('id', reportId).single();
        if (fetchError) throw new Error('Report not found. It may have expired or the link is incorrect.');
        if (data && data.report_data) {
          const reportData = data.report_data as ReportData;
          setReport(reportData);
          const parsedItems = parseFeedbackItems(reportData);
          setFeedbackItems(parsedItems);
        } else {
           throw new Error('Report data is empty or invalid.');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    if (!report) return;
    const doc = new jsPDF() as jsPDFWithAutoTable;
    doc.setFontSize(18);
    doc.text("ThemeFinder Analysis Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    const summaryText = typeof report.overall_summary === 'string' ? report.overall_summary : Object.values(report.overall_summary).join(' ');
    doc.text(`Overall Summary: ${summaryText}`, 14, 32);
    const tableColumn: AutoTableColumn = ["Category", "Sentiment", "Summary", "Quote"];
    const tableRows: AutoTableData = [];
    feedbackItems.forEach(item => {
        const ticketData = [ item.category, item.sentiment, item.summary, item.quote ];
        tableRows.push(ticketData);
    });
    
    doc.autoTable(tableColumn, tableRows, { startY: 40 });
    doc.save(`ThemeFinder_Report_${reportId}.pdf`);
  };
  
  const highlightedSourceText = useMemo(() => {
    const sourceText = typeof report?.source_text === 'string' ? report.source_text : '';
    if (!sourceText || !hoveredQuote) return sourceText;
    
    const parts = sourceText.split(new RegExp(`(${hoveredQuote})`, 'gi'));
    return parts.map((part: string, index: number) => 
      part.toLowerCase() === hoveredQuote.toLowerCase() ? 
        <mark key={index} className="bg-indigo-500/50 text-white rounded">{part}</mark> : 
        <span key={index}>{part}</span>
    );
  }, [report, hoveredQuote]);

  const getSummaryText = (summary: unknown): string => {
    if (typeof summary === 'string') return summary;
    if (typeof summary === 'object' && summary !== null) {
      return (summary as { summary_text?: string }).summary_text || Object.values(summary).join(' ');
    }
    return 'No summary available.';
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 md:p-8 font-sans text-white">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
           <Link href="/" aria-label="Back to Home" className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 text-transparent bg-clip-text hover:opacity-80 transition-opacity">
            <Logo />
            <span>ThemeFinder</span>
          </Link>
          {report && (
            <div className="flex items-center gap-2">
              <button onClick={handleCopyLink} aria-label="Copy share link" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <ShareIcon /> {copied ? 'Copied!' : 'Share'}
              </button>
              <button onClick={handleDownloadPDF} aria-label="Download report as PDF" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <DownloadIcon /> Download PDF
              </button>
            </div>
          )}
        </header>

        <main>
          {loading && <ReportSkeleton />}
          {error && (
            <div className="text-center p-6 bg-red-900/50 border border-red-700 rounded-lg">
              <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Report</h2>
              <p className="text-red-300">{error}</p>
            </div>
          )}
          {report && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Analysis Report</h1>
                  <p className="text-lg text-gray-400 mb-6">{getSummaryText(report.overall_summary)}</p>
                </div>
                <div className="space-y-4">
                  {feedbackItems.length > 0 ? feedbackItems.map((item, index) => (
                    <div key={index} 
                         className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 transition-all duration-200 hover:border-indigo-500/50"
                         onMouseEnter={() => setHoveredQuote(item.quote)}
                         onMouseLeave={() => setHoveredQuote(null)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`flex items-center gap-2 px-2 py-1 text-xs font-semibold rounded-full ${
                          item.sentiment === 'Positive' ? 'bg-green-500/10 text-green-300' :
                          item.sentiment === 'Negative' ? 'bg-red-500/10 text-red-300' :
                          'bg-gray-500/10 text-gray-300'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            item.sentiment === 'Positive' ? 'bg-green-400' :
                            item.sentiment === 'Negative' ? 'bg-red-400' :
                            'bg-gray-400'
                          }`}></div>
                          {item.sentiment}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm font-medium text-indigo-400">
                          <CategoryIcon category={item.category} />
                          {item.category}
                        </span>
                      </div>
                      <p className="text-gray-200 mb-2 font-medium">{item.summary}</p>
                      <blockquote className="text-gray-400 border-l-2 border-gray-600 pl-3 italic">
                        &quot;{item.quote}&quot;
                      </blockquote>
                    </div>
                  )) : (
                    <div className="text-center p-6 bg-gray-800/50 border border-gray-700 rounded-lg">
                      <h3 className="font-semibold text-white mb-1">Analysis Complete</h3>
                      <p className="text-gray-400">No individual feedback items were categorized in this report.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-8">
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <h3 className="font-bold text-white mb-2">Get Weekly Reports</h3>
                  <p className="text-sm text-gray-400 mb-4">Get AI-powered summaries of your user feedback delivered to your inbox every week.</p>
                  <button className="w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500">
                    Upgrade to Pro
                  </button>
                </div>
                <div className="group relative bg-gray-800/50 border border-gray-700 rounded-lg p-4 opacity-60">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white">Compare Themes</h3>
                    <LockIcon />
                  </div>
                  <p className="text-sm text-gray-400 mt-2">Compare this week&apos;s themes with historical data to track trends. (Pro Feature)</p>
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-950 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Track trends week-over-week
                  </div>
                </div>
                {typeof report?.source_text === 'string' && (
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <h3 className="font-bold text-white mb-2">Source Text</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{highlightedSourceText}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};



export default ReportPage;
