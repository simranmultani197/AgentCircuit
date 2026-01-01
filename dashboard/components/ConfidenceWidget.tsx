"use client";

import { HelpCircle } from "lucide-react";

export default function ConfidenceWidget() {
    // Mock Data
    const totalScore = 92;
    const metrics = [
        { label: "Token Logprobs", value: 88, weight: "30%", color: "bg-purple-500", tooltip: "Calculated via LLM Logprobs" },
        { label: "State Verification", value: 100, weight: "50%", color: "bg-emerald-500", tooltip: "Verified via CLI exit codes" },
        { label: "Pattern Consistency", value: 85, weight: "20%", color: "bg-blue-500", tooltip: "Historical pattern match rate" },
    ];

    // Radial Gauge Math
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    // Semi-circle: we only show half (180 deg) or partial
    // Let's do a 240 degree arc for "high density" look or standard semi-circle. 
    // User asked for "semi-circular".
    // Semi-circle = strike-dasharray of (pi * r). Max offset = pi*r.
    // Actually, easiest way for semi-circle is dasharray = circumference, dashoffset = circumference - (value/100 * circumference/2) (if fully semi-circle mapped to 100%)

    // Let's settle on a nice 180 degree semi-circle.
    const arcLength = Math.PI * radius; // Half circumference
    const strokeDashoffset = arcLength - (totalScore / 100) * arcLength;

    return (
        <div className="bg-slate-900/50 backdrop-blur-md border border-purple-500/20 rounded-2xl p-6 flex flex-col items-center shadow-xl">

            {/* Radial Gauge */}
            <div className="relative mb-6">
                <svg width="200" height="110" className="overflow-visible">
                    {/* Track */}
                    <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="#1f2937" // gray-800
                        strokeWidth="12"
                        strokeLinecap="round"
                    />
                    {/* Progress */}
                    <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="#a855f7" // purple-500
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={arcLength * 2} // Full circle length to prevent wrapping issues if not careful, but technically arcLength is enough for the path
                        strokeDashoffset={strokeDashoffset} // This logic might need tweaking because dasharray starts from 0? 
                        // Actually for path, dasharray matches path length. Arc length IS the path length here.
                        style={{
                            strokeDasharray: arcLength,
                            strokeDashoffset: strokeDashoffset,
                            filter: "drop-shadow(0 0 8px rgba(168, 85, 247, 0.6))"
                        }}
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>

                {/* Centered Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-0">
                    <span className="text-4xl font-mono font-bold text-white tracking-tighter">{totalScore}%</span>
                    <span className="text-[10px] text-purple-300 font-mono uppercase tracking-widest mt-1">Confidence</span>
                </div>
            </div>

            {/* Metric Triad */}
            <div className="w-full space-y-4">
                {metrics.map((m) => (
                    <div key={m.label} className="group">
                        <div className="flex justify-between items-center text-xs font-mono mb-1.5 text-gray-400">
                            <div className="flex items-center gap-1.5 cursor-help">
                                {m.label}
                                <div className="relative">
                                    <HelpCircle size={10} className="text-gray-600 group-hover:text-gray-300 transition-colors" />
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-black border border-white/10 rounded px-2 py-1 text-[10px] text-center text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                        {m.tooltip}
                                    </div>
                                </div>
                            </div>
                            <span className={m.value === 100 ? "text-emerald-400" : "text-gray-300"}>
                                {m.value}%
                            </span>
                        </div>

                        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${m.color} rounded-full transition-all duration-1000`}
                                style={{ width: `${m.value}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}
