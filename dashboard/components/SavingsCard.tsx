"use client";

import { useEffect, useState } from "react";
import { DollarSign, HeartPulse, TrendingUp } from "lucide-react";

type SavingsStats = {
    total_money_saved: number;
    failures_prevented: number;
    loops_killed: number;
    roi_multiplier: number;
};

export default function SavingsCard() {
    const [stats, setStats] = useState<SavingsStats | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/stats/savings");
                if (res.ok) {
                    setStats(await res.json());
                }
            } catch (e) {
                console.error(e);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-6">

            {/* Total Savings */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <DollarSign size={80} />
                </div>
                <div>
                    <h3 className="text-emerald-400 font-medium text-sm flex items-center gap-2">
                        <DollarSign size={16} /> NET SAVINGS
                    </h3>
                    <p className="text-4xl font-black text-white mt-2">
                        ${stats.total_money_saved.toFixed(2)}
                    </p>
                </div>
                <p className="text-xs text-gray-400 mt-4">
                    Cumulative cost of averted restarts.
                </p>
            </div>

            {/* Lives Saved (Failures Prevented) */}
            <div className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <HeartPulse size={80} />
                </div>
                <div>
                    <h3 className="text-pink-400 font-medium text-sm flex items-center gap-2">
                        <HeartPulse size={16} /> LIVES SAVED
                    </h3>
                    <p className="text-4xl font-black text-white mt-2">
                        {stats.failures_prevented}
                    </p>
                </div>
                <p className="text-xs text-gray-400 mt-4">
                    Critical failures auto-repaired by Medic.
                </p>
            </div>

            {/* ROI Multiplier */}
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <TrendingUp size={80} />
                </div>
                <div>
                    <h3 className="text-amber-400 font-medium text-sm flex items-center gap-2">
                        <TrendingUp size={16} /> ROI FACTOR
                    </h3>
                    <p className="text-4xl font-black text-white mt-2">
                        {stats.roi_multiplier}x
                    </p>
                </div>
                <p className="text-xs text-gray-400 mt-4">
                    Return on Infrastructure spend.
                </p>
            </div>

        </div>
    );
}
