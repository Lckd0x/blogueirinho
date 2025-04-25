"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SimulationResult {
  current_value: number;
  current_extra_value: number;
  goal_achieved: string;
}

interface ShortTrackerTableProps {
  data: Record<string, SimulationResult>;
}

export default function ShortTrackerTable({ data }: ShortTrackerTableProps) {
  if (!data) return null;

  const rows = Object.entries(data).map(([date, values]) => {
    const total = values.current_value + values.current_extra_value;

    return (
      <tr key={date} className="border-b border-emerald-300">
        <td className="p-2 text-center">{date}</td>
        <td className="p-2 text-right">R$ {values.current_value.toFixed(2)}</td>
        <td className="p-2 text-right">R$ {values.current_extra_value.toFixed(2)}</td>
        <td className="p-2 text-right font-semibold">R$ {total.toFixed(2)}</td>
        <td className="p-2 text-center">{values.goal_achieved === "Y" ? "✅" : "❌"}</td>
      </tr>
    );
  });

  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <CardTitle className="text-emerald-900">Resultados da Simulação</CardTitle>
      </CardHeader>
      <CardContent className="overflow-auto">
        <table className="w-full text-sm text-emerald-900">
          <thead>
            <tr className="bg-emerald-100 text-emerald-800">
              <th className="p-2 text-center">Mês</th>
              <th className="p-2 text-right">Valor acumulado dos investimentos</th>
              <th className="p-2 text-right">Valor acumulado da renda extra</th>
              <th className="p-2 text-right">Valor total acumulado</th>
              <th className="p-2 text-center">Meta atingida?</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </CardContent>
    </Card>
  );
}
