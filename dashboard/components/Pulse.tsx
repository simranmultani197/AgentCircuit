"use client";

import { useEffect, useState } from "react";
import { Activity, MoreHorizontal } from "lucide-react";
import { StatusTag } from "@/components/ui/StatusTag";
import MedicInsightDrawer from "@/components/MedicInsightDrawer";

type Trace = {
    id: number;
    run_id: string;
    node_id: string;
    status: string;
    timestamp: string;
    input_state: any;
    output_state: any;
    recovery_attempts: number;
};

export default function Pulse() {
    const [traces, setTraces] = useState<Trace[]>([]);
    const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);

    const fetchTraces = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/traces?limit=20");
            if (res.ok) {
                setTraces(await res.json());
            }
        } catch (e) {
            console.error("Failed to fetch traces", e);
        }
    };

    useEffect(() => {
        fetchTraces();
        const interval = setInterval(fetchTraces, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm mt-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Activity className="text-blue-400" /> Live Pulse
                </h2>
                <span className="text-xs text-green-400 animate-pulse">● Monitoring Active</span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-white/5 uppercase text-xs font-medium">
                        <tr>
                            <th className="px-4 py-3 rounded-l-lg">Run ID</th>
                            <th className="px-4 py-3">Node</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Confidence</th>
                            <th className="px-4 py-3 rounded-r-lg text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {traces.map((trace) => (
                            <tr
                                key={trace.id}
                                className={`hover:bg-white/5 transition-colors cursor-pointer ${trace.status === 'repaired' ? 'bg-teal-500/5' : ''}`}
                                onClick={() => trace.status === 'repaired' && setSelectedTrace(trace)}
                            >
                                <td className="px-4 py-3 font-mono text-white/70">
                                    <div className="flex items-center gap-2">
                                        {trace.run_id.slice(-8)}
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-medium text-white">{trace.node_id}</td>
                                <td className="px-4 py-3">
                                    <StatusTag status={trace.status} />
                                </td>
                                <td className="px-4 py-3">
                                    {trace.status === 'repaired' && (
                                        <div className="flex items-center gap-2 w-24">
                                            <div className="h-1.5 flex-1 bg-gray-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-teal-400 w-[95%]"></div>
                                            </div>
                                            <span className="text-xs text-teal-400">95%</span>
                                        </div>
                                    )}
                                    {(trace.status === 'success' || trace.status.startsWith('failed')) && <span className="text-white/20">-</span>}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-white">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {traces.length === 0 && (
                    <div className="text-center py-10 text-gray-600">
                        No active traces found. Run a script!
                    </div>
                )}
            </div>

            <MedicInsightDrawer
                isOpen={!!selectedTrace}
                onClose={() => setSelectedTrace(null)}
                trace={selectedTrace}
            />
        </div>
    );
}
