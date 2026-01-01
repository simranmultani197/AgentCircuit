"use client";

import { Timer, ArrowDownRight } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";

export default function MTTRCard() {
    // In Phase 3 w/ backend, fetch this real data.
    // For now, mock as requested: 42s with 15% improvement
    return (
        <div className="mb-8">
            <MetricCard
                title="Mean Time To Recovery"
                value="42s"
                icon={Timer}
                trend="15%"
                trendDirection="down" // Improvement for time is 'down'
                colorClass="purple"
                description={
                    <span>
                        vs <span className="font-mono text-gray-400">14m</span> manual baseline
                    </span>
                }
            />
        </div>
    );
}
