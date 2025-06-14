"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface StatisticsData {
  day: string;
  clients: number;
  profits: number;
  earnings: number;
}

interface StatisticsChartProps {
  data: StatisticsData[];
}

export function StatisticsChart({ data }: StatisticsChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 0,
          bottom: 5,
        }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#374151"
        />
        <XAxis
          dataKey="day"
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
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-lg">
                  <div className="font-medium text-white mb-2">{label}</div>
                  {payload.map((entry, index) => (
                    <div
                      key={`tooltip-${index}`}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-zinc-300">
                        {entry.name}: {entry.value}
                      </span>
                    </div>
                  ))}
                </div>
              );
            }
            return null;
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ color: "#9ca3af" }}
        />
        <Bar
          dataKey="clients"
          stackId="a"
          fill="#10b981"
          radius={[4, 4, 0, 0]}
          name="Clients"
        />
        <Bar
          dataKey="profits"
          stackId="a"
          fill="#f59e0b"
          radius={[4, 4, 0, 0]}
          name="Profits"
        />
        <Bar
          dataKey="earnings"
          stackId="a"
          fill="#84cc16"
          radius={[4, 4, 0, 0]}
          name="Earnings"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
