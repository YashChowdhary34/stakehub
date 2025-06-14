import { Calendar } from "lucide-react";

interface DateRangePickerProps {
  value: string;
  onChange?: (value: string) => void;
}

export function DateRangePicker({ value }: DateRangePickerProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-zinc-400 border border-zinc-700 bg-zinc-800 rounded-md px-3 py-2 hover:bg-zinc-700 transition-colors">
      <Calendar className="h-4 w-4" />
      <span>{value}</span>
    </div>
  );
}
