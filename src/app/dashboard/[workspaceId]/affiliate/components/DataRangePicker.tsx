import { Calendar } from "lucide-react";

interface DateRangePickerProps {
  value: string;
  onChange?: (value: string) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 border rounded-md px-2 py-1">
      <Calendar className="h-4 w-4" />
      <span>{value}</span>
    </div>
  );
}
