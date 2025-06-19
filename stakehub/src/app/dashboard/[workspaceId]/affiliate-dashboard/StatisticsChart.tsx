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
    <div className="relative bg-gradient-to-br from-zinc-900/95 to-zinc-800/95 backdrop-blur-xl rounded-2xl border border-zinc-700/50 p-6 shadow-2xl">
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
          <defs>
            <linearGradient id="clientsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
              <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id="profitsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
              <stop offset="100%" stopColor="#d97706" stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#84cc16" stopOpacity={1} />
              <stop offset="100%" stopColor="#65a30d" stopOpacity={0.8} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#374151"
            strokeOpacity={0.3}
          />
          <XAxis
            dataKey="day"
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
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-zinc-800/95 backdrop-blur-xl border border-zinc-700/50 rounded-xl p-4 shadow-2xl">
                    <div className="font-semibold text-white mb-3 text-sm">
                      {label}
                    </div>
                    <div className="space-y-2">
                      {payload.map((entry, index) => (
                        <div
                          key={`tooltip-${index}`}
                          className="flex items-center justify-between gap-4 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full shadow-sm"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-zinc-300 font-medium">
                              {entry.name}
                            </span>
                          </div>
                          <span className="text-white font-bold">
                            {entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
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
            iconSize={10}
            wrapperStyle={{
              color: "#9ca3af",
              fontWeight: 500,
              fontSize: "12px",
            }}
          />
          <Bar
            dataKey="clients"
            stackId="a"
            fill="url(#clientsGradient)"
            radius={[6, 6, 0, 0]}
            name="Clients"
          />
          <Bar
            dataKey="profits"
            stackId="a"
            fill="url(#profitsGradient)"
            radius={[6, 6, 0, 0]}
            name="Profits"
          />
          <Bar
            dataKey="earnings"
            stackId="a"
            fill="url(#earningsGradient)"
            radius={[6, 6, 0, 0]}
            name="Earnings"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
