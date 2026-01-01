export type BadgeVariant = "default" | "sentinel" | "medic";
export type BadgeState = "active" | "standby" | "processing" | "offline";

interface BadgeProps {
    label: string;
    variant?: BadgeVariant;
    state?: BadgeState;
}

export function Badge({ label, variant = "default", state = "active" }: BadgeProps) {

    // Sentinel Active: Pulsing Green Ring & Blinking Text
    if (variant === "sentinel" && state === "active") {
        return (
            <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-medium text-emerald-300">{label}</span>
                <span className="text-[10px] text-emerald-500/70 font-mono tracking-wider ml-1 animate-[pulse_1s_ease-in-out_infinite]">POLLING</span>
            </div>
        );
    }

    // Medic Processing: AI-Purple with Scanning Animation
    if (variant === "medic" && state === "processing") {
        return (
            <div className="relative overflow-hidden flex items-center gap-2 bg-purple-500/20 px-3 py-1.5 rounded-full border border-purple-500/30">
                {/* CSS Scanning Highlight */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/20 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]"></div>

                <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-400"></span>
                </span>
                <span className="text-xs font-medium text-purple-200 z-10">{label}</span>
            </div>
        );
    }

    // Standby / Default State
    return (
        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 opacity-70">
            <span className="h-2 w-2 rounded-full bg-gray-500"></span>
            <span className="text-xs font-medium text-gray-300">{label}</span>
        </div>
    );
}
