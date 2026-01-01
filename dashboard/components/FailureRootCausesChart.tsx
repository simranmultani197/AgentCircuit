"use client";

import { AlertOctagon, ShieldAlert, ZapOff } from "lucide-react";

export default function FailureRootCausesChart() {
    // Mock distribution
    const data = [
        { label: "Validation Errors", value: 65, color: "bg-rose-500", icon: ShieldAlert },
        { label: "Loop Detection", value: 25, color: "bg-amber-500", icon: AlertOctagon },
        { label: "Runtime Exceptions", value: 10, color: "bg-red-600", icon: ZapOff },
    ];

    return (
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
            <h3 className="text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider">Failure Root Causes</h3>

            <div className="space-y-4">
                {data.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div key={item.label} className="group">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="flex items-center gap-2 text-gray-300">
                                    <Icon size={14} className="text-gray-500" />
                                    {item.label}
                                </span>
                                <span className="font-mono text-gray-400">{item.value}%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-700/50 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out group-hover:brightness-110`}
                                    style={{ width: `${item.value}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
