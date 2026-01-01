"use client";

import { Drawer } from "@/components/ui/Drawer";
import { Sparkles, Terminal, Activity, Download, ShieldAlert, Cpu } from "lucide-react";

interface MedicInsightDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    // In real app, pass the full trace object
    trace: any;
}

export default function MedicInsightDrawer({ isOpen, onClose, trace }: MedicInsightDrawerProps) {
    if (!trace) return null;

    return (
        <Drawer isOpen={isOpen} onClose={onClose} title="">

            {/* Header with Run ID and Badge */}
            <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="text-gray-500 font-mono text-lg">RUN</span> {trace.run_id.slice(-8)}
                    </h2>
                    <p className="text-xs text-gray-400 font-mono mt-1">Node: {trace.node_id}</p>
                </div>
                <div className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                    <Sparkles size={14} className="animate-pulse" />
                    Autonomous Repair
                </div>
            </div>

            {/* Section 1: Medic Hypothesis */}
            <div className="mb-8">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block flex items-center gap-2">
                    <Activity size={14} /> Medic Hypothesis
                </label>
                <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/20 rounded-xl p-5 relative">
                    <p className="text-gray-200 text-sm leading-relaxed font-light">
                        Detected a <span className="text-rose-400 font-mono">SchemaValidationError</span> in the output payload.
                        The field <code className="bg-black/30 px-1 py-0.5 rounded text-indigo-300">value</code> was expected to be an <code className="text-emerald-300">integer</code> but received a <code className="text-amber-300">string</code>.
                        Initiated autonomous repair protocol to cast the type while preserving data integrity.
                    </p>
                </div>
            </div>

            {/* Section 2: Action Log (Terminal Style) */}
            <div className="mb-8">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block flex items-center gap-2">
                    <Terminal size={14} /> Action Log
                </label>
                <div className="bg-black/80 rounded-lg border border-white/10 p-4 font-mono text-xs shadow-inner">
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2 text-gray-500">
                            <span className="text-emerald-500">➜</span>
                            <span>analyzing stack_trace...</span>
                        </div>
                        <div className="flex gap-2 text-gray-500">
                            <span className="text-emerald-500">➜</span>
                            <span>generating repair_patch --strategy=semantic_fix</span>
                        </div>
                        <div className="flex gap-2 text-gray-400 pl-4 border-l border-white/10 ml-1">
                            <span>Applying patch: {`{"op": "replace", "path": "/value", "value": 100}`}</span>
                        </div>
                        <div className="flex gap-2 text-gray-500">
                            <span className="text-emerald-500">➜</span>
                            <span>validating output schema... <span className="text-emerald-400">OK</span></span>
                        </div>
                        <div className="flex gap-2 text-gray-500">
                            <span className="text-emerald-500">➜</span>
                            <span className="text-purple-400">resume_execution()</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 3: Confidence Breakdown */}
            <div className="mb-8 p-5 bg-white/5 rounded-2xl border border-white/5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 block flex items-center gap-2">
                    <Cpu size={14} /> Confidence Metrics
                </label>

                <div className="space-y-4">
                    {/* Logprob Certainty */}
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-300">Logprob Certainty</span>
                            <span className="text-emerald-400 font-mono">98%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-700/50 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[98%] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        </div>
                    </div>

                    {/* State Validation */}
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-300">State Validation</span>
                            <span className="text-teal-400 font-mono">100%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-700/50 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-500 w-[100%]"></div>
                        </div>
                    </div>

                    {/* Historical Success Rate */}
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-300">Historical Success</span>
                            <span className="text-blue-400 font-mono">85%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-700/50 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-[85%]"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 mt-auto pt-6 border-t border-white/5">
                <button
                    className="flex-1 py-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-medium hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2"
                >
                    <ShieldAlert size={16} />
                    Manual Override
                </button>
                <button
                    className="flex-1 py-3 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                    <Download size={16} />
                    Export Logs
                </button>
            </div>

        </Drawer>
    );
}
