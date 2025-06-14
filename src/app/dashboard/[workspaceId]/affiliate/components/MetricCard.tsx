import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import React from "react";

type Props = {
  title: string;
  value: string;
  percentage: number;
  trend: "up" | "down";
};

const MetricCard = ({ title, value, percentage, trend }: Props) => {
  return (
    <Card className="p-6 bg-zinc-900/50 border-zinc-800 backdrop-blur-sm hover:bg-zinc-900/70 transition-all duration-300 group">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-400 tracking-wide uppercase">
            {title}
          </p>
          <div className="flex items-end gap-3 mt-3">
            <p className="text-3xl font-bold text-zinc-100 group-hover:text-white transition-colors">
              {value}
            </p>
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                trend === "up"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {trend === "up" ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>
                {trend === "up" ? "+" : "-"}
                {percentage}%
              </span>
            </div>
          </div>
        </div>
        <div
          className={`p-3 rounded-full ${
            trend === "up"
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {trend === "up" ? (
            <TrendingUp className="h-6 w-6" />
          ) : (
            <TrendingDown className="h-6 w-6" />
          )}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-500">
          {trend === "up" ? "Increased" : "Decreased"} from last period
        </p>
      </div>
    </Card>
  );
};

export default MetricCard;
