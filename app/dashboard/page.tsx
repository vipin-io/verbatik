// File: app/dashboard/page.tsx
// v2.7: A definitive refactor for type-safety to resolve all Recharts build errors.

'use client';

import { Area, AreaChart, CartesianGrid, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, Sector } from 'recharts';
import { Logo } from '@/app/components/Logo';
import Link from 'next/link';
import React, { useState } from 'react';

// --- TYPE DEFINITIONS ---
interface MonthlySummary {
    day: number;
    bugs: number;
    features: number;
    positives: number;
}

interface SentimentData {
    name: string;
    value: number;
    color: string;
}

// A more specific type for the tooltip payload from Recharts
interface TooltipPayload {
    stroke: string;
    name: string;
    value: number | string;
}

// Our custom props interface for the tooltip component
interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
    label?: string | number;
}


// --- MOCK DATA ---
const generateDailyData = (): MonthlySummary[] => {
    const data = [];
    for (let i = 1; i <= 30; i++) {
        data.push({
            day: i,
            bugs: 5 + Math.floor(Math.random() * 10),
            features: 10 + Math.floor(Math.random() * 15),
            positives: 20 + Math.floor(Math.random() * 10),
        });
    }
    return data;
};

const mockData = {
  "monthlySummary": generateDailyData(),
  "sentimentConsensus": { "positive": 45, "negative": 35, "neutral": 20 },
  "themeBreakdown": [
    { "theme": "Positive Feedback", "count": 35, "sentiment": "Positive" },
    { "theme": "Feature Request", "count": 20, "sentiment": "Neutral" },
    { "theme": "Bug Report", "count": 18, "sentiment": "Negative" },
    { "theme": "Performance Complaint", "count": 12, "sentiment": "Negative" },
    { "theme": "UI/UX Complaint", "count": 10, "sentiment": "Negative" },
    { "theme": "Pricing", "count": 5, "sentiment": "Neutral" }
  ]
};
// --- End of Mock Data ---


// --- Data Transformation & Styling ---
const sentimentData: SentimentData[] = [
    { name: 'Positive', value: mockData.sentimentConsensus.positive, color: '#34d399' },
    { name: 'Negative', value: mockData.sentimentConsensus.negative, color: '#f87171' },
    { name: 'Neutral', value: mockData.sentimentConsensus.neutral, color: '#9ca3af' },
];

const themeColors: { [key: string]: string } = {
    "Bug Report": "#f87171",
    "Feature Request": "#60a5fa",
    "UI/UX Complaint": "#fb923c",
    "Positive Feedback": "#34d399",
    "Performance Complaint": "#facc15",
    "Pricing": "#9ca3af"
};

// --- Reusable UI Components ---
const ChartContainer = ({ title, children, className }: { title: string, children: React.ReactNode, className?: string }) => (
    <div className={`bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 flex flex-col ${className}`}>
        <h3 className="text-base font-semibold text-white mb-4">{title}</h3>
        <div className="flex-grow w-full h-full">{children}</div>
    </div>
);

const ActiveShape = (props: any) => { // 'any' is pragmatic here due to complex Recharts types
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
    return (
        <g>
            <text x={cx} y={cy} dy={-8} textAnchor="middle" fill="#fff" className="text-3xl font-bold">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
            <text x={cx} y={cy} dy={12} textAnchor="middle" fill="#9ca3af" className="text-sm">
                {payload.name}
            </text>
            <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} fill={fill} />
        </g>
    );
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-lg">
                <p className="text-sm font-semibold text-white mb-2">Day {label}</p>
                {payload.map((entry, index) => (
                    <div key={`item-${index}`} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.stroke }}></div>
                            <p className="text-sm text-gray-300">{entry.name}:</p>
                        </div>
                        <p className="text-sm font-bold text-white">{entry.value}</p>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const SidebarLink = ({ icon, text, active }: { icon: React.ReactNode, text: string, active?: boolean }) => (
    <a href="#" className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
        {icon}
        <span>{text}</span>
    </a>
);


export default function DashboardPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const onPieEnter = (_: unknown, index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="flex min-h-screen bg-gray-900 font-sans text-white">
      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 bg-gray-900 border-r border-gray-800 p-4 flex flex-col">
        <div className="flex items-center gap-3 mb-8 px-2">
            <Logo />
            <span className="text-xl font-bold text-gray-100">Verbatik</span>
        </div>
        <nav className="flex flex-col gap-2">
            <SidebarLink icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>} text="Dashboard" active />
            <SidebarLink icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6M9 19a2 2 0 002 2h2a2 2 0 002-2M9 19A2 2 0 017 17v-6a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2m-6 0h6"></path></svg>} text="Reports" />
            <SidebarLink icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>} text="Archive" />
            <SidebarLink icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1h-3"></path></svg>} text="Users" />
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <div className="flex items-center gap-4">
                <input type="text" placeholder="Search..." className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <button className="px-4 py-2 font-semibold text-white bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700 transition-colors text-sm">
                    Export Data
                </button>
            </div>
        </header>

        <main className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ChartContainer title="Sentiment Consensus" className="md:col-span-1 h-auto">
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={sentimentData} 
                                dataKey="value" 
                                nameKey="name" 
                                cx="50%" 
                                cy="50%" 
                                innerRadius={50} 
                                outerRadius={70} 
                                onMouseEnter={onPieEnter}
                                activeShape={<ActiveShape activeIndex={activeIndex} />} // FIXED: Pass activeIndex to a wrapper
                            >
                                {sentimentData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="#1f2937" className="focus:outline-none" />)}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <ChartContainer title="Monthly Summary" className="md:col-span-1 lg:col-span-3 h-auto">
                     <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={mockData.monthlySummary} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                             <defs>
                                <linearGradient id="colorPositivesArea" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#34d399" stopOpacity={0.4}/><stop offset="95%" stopColor="#34d399" stopOpacity={0}/></linearGradient>
                                <linearGradient id="colorBugsArea" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f87171" stopOpacity={0.4}/><stop offset="95%" stopColor="#f87171" stopOpacity={0}/></linearGradient>
                            </defs>
                            <XAxis dataKey="day" tick={{ fill: '#9ca3af' }} fontSize={12} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#9ca3af' }} fontSize={12} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{stroke: '#4f46e5', strokeWidth: 1, strokeDasharray: '3 3'}} />
                            <Area type="monotone" dataKey="positives" stroke="#34d399" fill="url(#colorPositivesArea)" strokeWidth={2} />
                            <Area type="monotone" dataKey="bugs" stroke="#f87171" fill="url(#colorBugsArea)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Top Themes This Week</h3>
                <div className="space-y-4">
                    {mockData.themeBreakdown.map((item) => (
                        <div key={item.theme} className="flex items-center gap-4 group">
                            <div className="w-48 text-sm text-gray-400 font-medium group-hover:text-white transition-colors">{item.theme}</div>
                            <div className="flex-1 bg-gray-700/50 rounded-full h-4 overflow-hidden">
                                <div className="h-4 rounded-full transition-all duration-500" style={{ width: `${item.count}%`, backgroundColor: themeColors[item.theme] || '#6b7280' }}></div>
                            </div>
                            <div className="w-12 text-right text-sm font-semibold text-white">{item.count}%</div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
      </div>
    </div>
  );
}
