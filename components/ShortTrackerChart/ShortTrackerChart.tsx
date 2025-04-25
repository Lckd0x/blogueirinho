"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { SimulationResult } from "@/app/Short-Track/page";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


interface ShortTrackerChartProps {
  chartData: Record<string, SimulationResult>;
}

export default function ShortTrackerChart({ chartData }: ShortTrackerChartProps) {
  // Use useMemo so we recalc only when chartData changes
  const { data, options } = useMemo(() => {
    const labels = Object.keys(chartData);
    
    const dataset1 = labels.map((key) => chartData[key].current_value); 
    const dataset2 = labels.map((key) => chartData[key].current_extra_value);

    const data = {
      labels,
      datasets: [
        {
          label: "Acumulado",
          data: dataset1,
          backgroundColor: "#1D4ED8",
        },
        {
          label: "Com renda extra",
          data: dataset2,
          backgroundColor: "#F9A8D4",
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top" as const,
          labels: {
            color: "#fff",
          },
        },
        title: {
          display: true,
          text: "Evolução Mensal",
          color: "#fff",
          font: {
            size: 18,
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          ticks: { color: "#fff" },
          grid: { color: "rgba(255,255,255,0.1)" },
        },
        y: {
          stacked: true,
          ticks: { color: "#fff" },
          grid: { color: "rgba(255,255,255,0.1)" },
        },
      },
    };

    return { data, options };
  }, [chartData]);

  return (
    <Card className="bg-emerald-900 shadow-lg">
      <CardContent className="p-4 h-[400px]">
        <Bar options={options} data={data} />
      </CardContent>
    </Card>
  );
}
