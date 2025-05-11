"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Bebas_Neue, IBM_Plex_Sans } from "next/font/google";
import InflationDisplay from "@/components/InflationDisplay/page";
import ShortTrackerForms from "@/components/ShortTrackerForms/ShortTrackerForms";
import ShortTrackerChart from "@/components/ShortTrackerChart/ShortTrackerChart";
import ShortTrackerTable from "@/components/ShortTrackerTable/ShortTrackerTable";

const ibm = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-roboto-mono",
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-roboto-mono",
});

export interface SimulationResult {
  current_value: number;
  current_extra_value: number;
  adjusted_goal_value: number;
  goal_achieved: string;
}

export default function ShortTrack() {
  // State to hold full API response data
  const [responseData, setResponseData] = useState<Record<string, SimulationResult>>({});

  return (
    <div className={`${ibm.className} min-h-screen p-8 pb-20 sm:p-20 bg-emerald-800`}>
      <div className="mx-auto max-w-4xl flex flex-col gap-8">
        <h1 className={`${bebas.className} text-4xl text-amber-100 font-bold`}>Short Track</h1>
        <h2 className="text-amber-100 font-regular text-l">
          Simulação de metas financeiras com base em investimentos mensais e rendimentos.
        </h2>
        <Separator className="bg-white" />

        <ShortTrackerForms onSimulationComplete={setResponseData} />
        <InflationDisplay />
        <ShortTrackerChart chartData={responseData} />
        <ShortTrackerTable data={responseData} />
      </div>
    </div>
  );
}
