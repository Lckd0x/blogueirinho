import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function InflationDisplay() {
  const [years, setYears] = useState(1);
  const [resultValue, setResultValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInflation = async () => {
      setLoading(true);

      const end = new Date();
      end.setDate(1); // Primeiro dia do mês atual (mês incompleto será excluído)
      const start = new Date(end);
      start.setFullYear(start.getFullYear() - years); // Subtrai anos

      const formatDate = (date: Date) =>
        date.toLocaleDateString("pt-BR");

      const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json&dataInicial=${formatDate(start)}&dataFinal=${formatDate(end)}`;

      try {
        const res = await fetch(url);
        const data = await res.json();

        const yearlyData: Record<string, number> = {};

        data.forEach((entry: { data: string; valor: string }) => {
          const year = entry.data.split("/")[2];
          const value = parseFloat(entry.valor.replace(",", "."));
          if (!yearlyData[year]) yearlyData[year] = 0;
          yearlyData[year] += value;
        });

        const values = Object.values(yearlyData);
        let finalValue = 0;

        if (years === 1) {
          finalValue = values.reduce((acc, curr) => acc + curr, 0);
        } else {
          finalValue = values.reduce((acc, curr) => acc + curr, 0) / values.length;
        }

        setResultValue(finalValue);
      } catch (error) {
        console.error("Erro ao buscar dados de inflação:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInflation();
  }, [years]);

  return (
    <Card className="bg-emerald-900 shadow-lg">
      <CardHeader>
        <CardTitle className="text-white">Inflação Acumulada</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-2 text-white">
          <Label className="text-white mr-2 mb-2">Período:</Label>
          <Select onValueChange={(value) => setYears(Number(value))} defaultValue="1">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Último 1 ano</SelectItem>
              <SelectItem value="3">Últimos 3 anos</SelectItem>
              <SelectItem value="5">Últimos 5 anos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <p className="text-white">Carregando...</p>
        ) : (
          <>
            
            {resultValue !== null && (
              <p className="text-white mt-2 font-semibold">
                {years === 1
                  ? `Inflação acumulada no último ano: ${resultValue.toFixed(2)}%`
                  : `Média da inflação acumulada dos últimos ${years} anos: ${resultValue.toFixed(2)}%`}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
