"use client";

import { useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Line,
  ComposedChart,
} from "recharts";

interface AnalyticsData {
  day: string;
  deposit: number;
  withdraw: number;
}

interface TooltipData {
  value: number;
  date: string;
}

interface AnalyticsChartProps {
  data: AnalyticsData[];
  tooltip: TooltipData;
}

export function AnalyticsChart({ data, tooltip }: AnalyticsChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const chartData = data.map((item) => ({
    name: item.day,
    income: item.deposit,
    expenses: item.withdraw,
  }));

  return (
    <div className="relative bg-gradient-to-br from-zinc-900/95 to-zinc-800/95 backdrop-blur-xl rounded-2xl border border-zinc-700/50 p-6 shadow-2xl">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
              <stop offset="50%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.1} />
            </linearGradient>

            {/* Glow effects */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#374151"
            strokeOpacity={0.3}
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#9ca3af",
              fontSize: 12,
              fontWeight: 500,
            }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#9ca3af",
              fontSize: 12,
              fontWeight: 500,
            }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-zinc-800/95 backdrop-blur-xl border border-zinc-700/50 rounded-xl p-4 shadow-2xl">
                    <div className="space-y-2">
                      {payload.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm font-medium text-zinc-300">
                              {item.dataKey === "income"
                                ? "Deposits"
                                : "Withdrawals"}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-white">
                            ${item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-zinc-400 mt-2 pt-2 border-t border-zinc-700">
                      {tooltip.date}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />

          <Area
            type="monotone"
            dataKey="income"
            stroke="#10b981"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorIncome)"
            dot={{ r: 5, strokeWidth: 3, fill: "#10b981", stroke: "#064e3b" }}
            activeDot={{
              r: 7,
              strokeWidth: 3,
              fill: "#10b981",
              stroke: "#064e3b",
              filter: "url(#glow)",
            }}
          />

          <Line
            type="monotone"
            dataKey="expenses"
            stroke="#ef4444"
            strokeWidth={3}
            strokeDasharray="5 5"
            dot={{ r: 5, strokeWidth: 3, fill: "#ef4444", stroke: "#7f1d1d" }}
            activeDot={{
              r: 7,
              strokeWidth: 3,
              fill: "#ef4444",
              stroke: "#7f1d1d",
              filter: "url(#glow)",
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
