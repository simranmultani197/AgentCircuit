import { LucideIcon, CheckCircle, AlertOctagon, RefreshCw, XCircle } from "lucide-react";

type StatusType = "success" | "repaired" | "failed" | "failed_loop" | "failed_validation" | "running";

interface StatusTagProps {
    status: StatusType | string;
}

export function StatusTag({ status }: StatusTagProps) {
    let color = "bg-gray-500/20 text-gray-400 border-gray-500/30";
    let icon: LucideIcon = CheckCircle;
    let label = status;

    if (status === "repaired") {
        color = "bg-teal-500/20 text-teal-400 border-teal-500/30";
        icon = RefreshCw;
        label = "Repaired";
    } else if (status === "success") {
        color = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
        icon = CheckCircle;
        label = "Success";
    } else if (status.startsWith("failed")) {
        color = "bg-rose-500/20 text-rose-400 border-rose-500/30";
        icon = XCircle;
        if (status === "failed_loop") {
            label = "Loop Detected";
            icon = AlertOctagon;
            color = "bg-amber-500/20 text-amber-400 border-amber-500/30";
        } else if (status === "failed_validation") {
            label = "Invalid Schema";
        } else {
            label = "Failed";
        }
    }

    const Icon = icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${color}`}>
            <Icon size={12} className={status === 'repaired' ? 'animate-spin-slow' : ''} />
            {label}
        </span>
    );
}
