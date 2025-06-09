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
import { ChartTooltipContent } from "@/components/ui/chart";

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

  // Prevent hydration errors with SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Transform data for the chart
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
            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" axisLine={false} tickLine={false} />
        <YAxis axisLine={false} tickLine={false} />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <ChartTooltipContent>
                  <div className="text-sm font-medium">${payload[0].value}</div>
                  <div className="text-xs text-gray-500">{tooltip.date}</div>
                </ChartTooltipContent>
              );
            }
            return null;
          }}
        />
        <Area
          type="monotone"
          dataKey="income"
          stroke="#82ca9d"
          fillOpacity={1}
          fill="url(#colorIncome)"
          dot={{ r: 4, strokeWidth: 2 }}
          activeDot={{ r: 6, strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          stroke="#a4de7c"
          strokeWidth={2}
          dot={{ r: 4, strokeWidth: 2 }}
          activeDot={{ r: 6, strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
