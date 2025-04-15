"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Roboto_Mono } from "next/font/google";
import InflationDisplay from "@/components/InflationDisplay/page";
import ShortTrackerForms from "@/components/ShortTrackerForms/ShortTrackerForms";
import ShortTrackerChart from "@/components/ShortTrackerChart/ShortTrackerChart";

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-roboto-mono",
});

export default function ShortTrack() {
  // State to hold chart data returned from the simulation form.
  const [chartData, setChartData] = useState<{ [key: string]: [number, number] }>({});

  return (
    <div className={`${robotoMono.className} min-h-screen p-8 pb-20 sm:p-20 bg-emerald-800`}>
      <div className="mx-auto max-w-4xl flex flex-col gap-8">
        <h1 className="text-4xl text-amber-100 font-bold">Short Track</h1>
        <Separator className="bg-white" />
        <p className="text-amber-100 font-bold">
          Simulação de metas financeiras com base em investimentos mensais e rendimentos.
        </p>

        <ShortTrackerForms onSimulationComplete={setChartData} />
        <InflationDisplay />
        <ShortTrackerChart chartData={chartData} />
      </div>
    </div>
  );
}
