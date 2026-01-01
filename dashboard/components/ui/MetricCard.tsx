import { LucideIcon } from "lucide-react";

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendDirection?: "up" | "down" | "neutral";
    colorClass?: string;
    description?: string | React.ReactNode;
}

export function MetricCard({
    title,
    value,
    icon: Icon,
    trend,
    trendDirection = "neutral",
    colorClass = "blue",
    description,
}: MetricCardProps) {
    // Map simple color names to Tailwind classes
    const colorMap: Record<string, string> = {
        blue: "from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-400",
        emerald: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-400",
        pink: "from-pink-500/10 to-rose-500/10 border-pink-500/20 text-pink-400",
        amber: "from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-400",
        purple: "from-purple-500/10 to-violet-500/10 border-purple-500/20 text-purple-400",
    };

    const currentTheme = colorMap[colorClass] || colorMap.blue;

    return (
        <div
            className={`bg-gradient-to-r ${currentTheme} border p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden backdrop-blur-sm`}
        >
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Icon size={80} />
            </div>
            <div>
                <h3 className={`font-medium text-sm flex items-center gap-2 mb-2 ${currentTheme.split(" ").pop()}`}>
                    <Icon size={16} /> {title.toUpperCase()}
                </h3>
                <p className="text-4xl font-black text-white mt-1">{value}</p>

                {trend && (
                    <div className={`flex items-center gap-1 mt-2 text-sm font-medium
             ${trendDirection === 'down' ? 'text-emerald-400' : 'text-rose-400'}
           `}>
                        <span>{trend}</span>
                        <span className="opacity-70 text-xs">vs last hour</span>
                    </div>
                )}
            </div>
            {description && (
                <div className="text-xs text-gray-400 mt-4 opacity-80">
                    {description}
                </div>
            )}
        </div>
    );
}
