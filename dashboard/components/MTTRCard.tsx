"use client";

import { Timer, ArrowDownRight } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { useState, useEffect } from "react";

export default function MTTRCard() {
    const [data, setData] = useState<{ mttr_formatted: string, improvement_percent: number, manual_baseline: string } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/stats/mttr");
                if (res.ok) {
                    setData(await res.json());
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchData();
        // Poll every 5s
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    if (!data) return <div className="text-gray-500 text-xs">Loading MTTR...</div>;

    return (
        <div className="mb-8">
            <MetricCard
                title="Mean Time To Recovery"
                value={data.mttr_formatted}
                icon={Timer}
                trend={`${data.improvement_percent}%`}
                trendDirection="down" // Improvement for time is 'down'
                colorClass="purple"
                description={
                    <span>
                        vs <span className="font-mono text-gray-400">{data.manual_baseline}</span> manual baseline
                    </span>
                }
            />
        </div>
    );
}
