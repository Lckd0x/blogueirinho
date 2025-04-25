import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export default function InflationDisplay() {
  const [resultValue, setResultValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInflation = async () => {
      setLoading(true);

      const end = new Date();
      end.setDate(1); // início do mês atual
      const start = new Date(end);
      start.setMonth(start.getMonth() - 12); // subtrai os meses

      const formatDate = (date: Date) =>
        date.toLocaleDateString("pt-BR");

      const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json&dataInicial=${formatDate(start)}&dataFinal=${formatDate(end)}`;

      try {
        const res = await fetch(url);
        const data = await res.json();

        // Soma os valores mês a mês
        const totalInflation = data.reduce((sum: number, entry: { valor: string; data: string }) => {
          const original = entry.valor;
          const parsed = parseInt(original.replace(".", ""));        
          return sum + parsed;
        }, 0);
        

        setResultValue(totalInflation/100);
      } catch (error) {
        console.error("Erro ao buscar dados de inflação:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInflation();
  }, []);

  return (
    <Card className="bg-emerald-900 shadow-lg">
      <CardHeader>
        <CardTitle className="text-white">Inflação Acumulada</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-white">Carregando...</p>
        ) : (
          resultValue !== null && (
            <p className="text-white mt-2 font-regular">
              Inflação acumulada nos últimos 12 meses : <strong>{resultValue.toFixed(2)}%</strong>
            </p>
          )
        )}
      </CardContent>
    </Card>
  );
}
