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
    <Card className="relative p-6 bg-gradient-to-br from-zinc-900/95 to-zinc-800/95 backdrop-blur-xl border border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-500 group overflow-hidden shadow-xl hover:shadow-2xl">
      {/* Background gradient overlay */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${
          trend === "up"
            ? "bg-gradient-to-br from-emerald-500/5 to-emerald-600/5"
            : "bg-gradient-to-br from-red-500/5 to-red-600/5"
        }`}
      />

      {/* Subtle animated border */}
      <div
        className={`absolute inset-0 rounded-lg bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 ${
          trend === "up"
            ? "from-emerald-500/20 via-transparent to-emerald-500/20"
            : "from-red-500/20 via-transparent to-red-500/20"
        } blur-sm animate-pulse`}
      />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <p className="text-xs font-semibold text-zinc-400 tracking-widest uppercase mb-3 group-hover:text-zinc-300 transition-colors duration-300">
              {title}
            </p>
            <div className="flex items-end gap-4">
              <p className="text-3xl font-bold bg-gradient-to-r from-white via-zinc-100 to-zinc-200 bg-clip-text text-transparent group-hover:from-white group-hover:to-white transition-all duration-500">
                {value}
              </p>
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm transition-all duration-300 group-hover:scale-105 ${
                  trend === "up"
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/20"
                    : "bg-red-500/15 text-red-300 border border-red-500/30 shadow-sm shadow-red-500/20"
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

          {/* Animated icon */}
          <div
            className={`p-4 rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${
              trend === "up"
                ? "bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 text-emerald-400 shadow-lg shadow-emerald-500/20"
                : "bg-gradient-to-br from-red-500/20 to-red-600/20 text-red-400 shadow-lg shadow-red-500/20"
            }`}
          >
            {trend === "up" ? (
              <TrendingUp className="h-6 w-6" />
            ) : (
              <TrendingDown className="h-6 w-6" />
            )}
          </div>
        </div>

        {/* Enhanced bottom section */}
        <div className="pt-4 border-t border-gradient-to-r from-transparent via-zinc-700/50 to-transparent">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors duration-300">
              {trend === "up" ? "↗ Increased" : "↘ Decreased"} from last period
            </p>
            <div
              className={`w-2 h-2 rounded-full animate-pulse ${
                trend === "up" ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Subtle corner accent */}
      <div
        className={`absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-5 ${
          trend === "up" ? "bg-emerald-500" : "bg-red-500"
        }`}
      />
    </Card>
  );
};

export default MetricCard;
