"use client";

interface SparklineProps {
    data?: number[];
    width?: number;
    height?: number;
    color?: string;
    label?: string;
}

export function Sparkline({
    data = [40, 42, 45, 48, 47, 50, 52, 51, 53, 55],
    width = 60,
    height = 20,
    color = "#10b981", // Emerald 500
    label
}: SparklineProps) {
    const points = data;
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = max - min || 1;

    const pathStats = points.map((p, i) => {
        const x = (i / (points.length - 1)) * width;
        const y = height - ((p - min) / range) * height;
        return `${x},${y}`;
    }).join(" ");

    return (
        <div className={`flex items-center gap-2 ${label ? "ml-2 pl-2 border-l border-white/10" : ""}`}>
            {label && (
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">{label}</span>
                </div>
            )}
            <svg width={width} height={height} className="overflow-visible">
                <polyline
                    points={pathStats}
                    fill="none"
                    stroke={color}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ filter: `drop-shadow(0 0 4px ${color}80)` }} // Hex + 50% opacity
                />
            </svg>
        </div>
    );
}
