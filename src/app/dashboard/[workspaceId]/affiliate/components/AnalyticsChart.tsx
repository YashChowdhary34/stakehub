"use client";

import { useEffect, useState } from "react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
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
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
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
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#374151"
        />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#9ca3af", fontSize: 12 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#9ca3af", fontSize: 12 }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-lg">
                  <div className="text-sm font-medium text-white">
                    ${payload[0].value}
                  </div>
                  <div className="text-xs text-zinc-400">{tooltip.date}</div>
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
          fillOpacity={1}
          fill="url(#colorIncome)"
          dot={{ r: 4, strokeWidth: 2, fill: "#10b981" }}
          activeDot={{ r: 6, strokeWidth: 2, fill: "#10b981" }}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          stroke="#ef4444"
          strokeWidth={2}
          dot={{ r: 4, strokeWidth: 2, fill: "#ef4444" }}
          activeDot={{ r: 6, strokeWidth: 2, fill: "#ef4444" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
