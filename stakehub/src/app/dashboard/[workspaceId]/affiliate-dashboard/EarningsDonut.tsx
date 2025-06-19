"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface EarningsDonutProps {
  total: number;
}

export function EarningsDonut({ total }: EarningsDonutProps) {
  const [mounted, setMounted] = useState(false);
  const [animatedTotal, setAnimatedTotal] = useState(0);

  useEffect(() => {
    setMounted(true);

    // Animate total value
    const duration = 2000;
    const steps = 60;
    const increment = total / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setAnimatedTotal(Math.floor(increment * currentStep));

      if (currentStep >= steps) {
        setAnimatedTotal(total);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [total]);

  if (!mounted) return null;

  const data = [
    { name: "Current Week", value: 70 },
    { name: "Last Week", value: 30 },
  ];

  const COLORS = ["#10b981", "#064e3b"];

  return (
    <div className="relative h-full w-full group">
      {/* Outer glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Main chart container */}
      <div className="relative bg-gradient-to-br from-zinc-900/90 to-zinc-800/90 backdrop-blur-xl rounded-2xl border border-zinc-700/50 p-6 shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={8}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              animationBegin={0}
              animationDuration={2000}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  className="hover:brightness-110 transition-all duration-300"
                  style={{
                    filter:
                      index === 0
                        ? "drop-shadow(0 0 8px rgba(16, 185, 129, 0.5))"
                        : "none",
                  }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center space-y-2">
            <div className="relative">
              <p className="text-4xl font-bold bg-gradient-to-r from-white via-emerald-100 to-emerald-200 bg-clip-text text-transparent leading-none">
                ₹{animatedTotal.toLocaleString()}
              </p>
              {/* Subtle shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Total Earnings
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span className="text-zinc-400">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-900" />
            <span className="text-zinc-400">Previous</span>
          </div>
        </div>
      </div>
    </div>
  );
}
