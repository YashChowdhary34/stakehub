import { Calendar } from "lucide-react";

interface DateRangePickerProps {
  value: string;
  onChange?: (value: string) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  return (
    <div className="relative group">
      <div
        className="flex items-center gap-3 text-sm font-medium text-zinc-300 border border-zinc-700/50 bg-gradient-to-r from-zinc-800/90 to-zinc-700/90 backdrop-blur-xl rounded-xl px-4 py-3 hover:border-zinc-600/50 hover:bg-gradient-to-r hover:from-zinc-700/90 hover:to-zinc-600/90 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl group-hover:shadow-emerald-500/10"
        onClick={() => onChange && onChange(value)}
      >
        <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/30 transition-colors duration-300">
          <Calendar className="h-4 w-4" />
        </div>
        <span className="select-none group-hover:text-white transition-colors duration-300">
          {value}
        </span>

        {/* Subtle animated indicator */}
        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse opacity-60" />
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm" />
    </div>
  );
}
