"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface EarningsDonutProps {
  total: number;
}

export function EarningsDonut({ total }: EarningsDonutProps) {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration errors with SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Create data for the donut chart
  const data = [
    { name: "Current Week", value: 70 },
    { name: "Last Week", value: 30 },
  ];

  const COLORS = ["#2e856e", "#a4de7c"];

  return (
    <div className="relative h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-semibold">{total.toLocaleString()}</p>
        <p className="text-xs text-gray-500">Total</p>
      </div>
    </div>
  );
}
