import { Card } from "@/components/ui/card";
import React from "react";

type Props = {
  title: string;
  value: string;
  percentage: number;
  trend: "up" | "down";
};

const MetricCard = ({ title, value, percentage, trend }: Props) => {
  return (
    <Card className="p-4 bg-zinc-800">
      <div className="flex justify-between items-start flex-wrap">
        <div>
          <p className="text-sm tracking-wide">{title}</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xl font-semibold">{value}</p>
            <span
              className={`text-xs ${
                trend === "up" ? "text-green-500" : "text-red-500"
              }`}
            >
              {trend === "up" ? "+" : "-"}
              {percentage}%
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MetricCard;
