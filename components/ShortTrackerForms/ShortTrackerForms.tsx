"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormData {
    goal: string;
    time: string;
    time_unit: string;
    monthly_investment: string;
    extra_income: string;
    return_rate: string;
    start_date: string;
    initial_value: string;
    inflation_rate: string;
}

interface InvestmentField {
    date: string;
    amount: string;
}

interface ShortTrackerFormsProps {
    onSimulationComplete: (result: Record<string, SimulationResult>) => void;
}

interface SimulationResult {
    current_value: number;
    current_extra_value: number;
    goal_achieved: string;
}


export default function ShortTrackerForms({ onSimulationComplete }: ShortTrackerFormsProps) {
    const [form, setForm] = useState<FormData>({
        goal: "",
        time: "",
        time_unit: "months",
        monthly_investment: "",
        extra_income: "",
        return_rate: "",
        start_date: "",
        initial_value: "",
        inflation_rate: "4.0",
    });

    const [oneTimeInvestments, setOneTimeInvestments] = useState<InvestmentField[]>([{ date: "", amount: "" }]);
    const [monthlyChanges, setMonthlyChanges] = useState<InvestmentField[]>([{ date: "", amount: "" }]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const updateDynamicField = (
        list: InvestmentField[],
        index: number,
        field: "date" | "amount",
        value: string,
        setList: React.Dispatch<React.SetStateAction<InvestmentField[]>>
    ) => {
        const updated = [...list];
        updated[index][field] = value;
        setList(updated);
    };

    const addField = (
        list: InvestmentField[],
        setList: React.Dispatch<React.SetStateAction<InvestmentField[]>>
    ) => {
        setList([...list, { date: "", amount: "" }]);
    };

    const removeField = (
        list: InvestmentField[],
        setList: React.Dispatch<React.SetStateAction<InvestmentField[]>>
    ) => {
        if (list.length > 1) {
            setList(list.slice(0, -1));
        }
    };

    const handleSubmit = async () => {
        // Build the payload making sure to parse numbers appropriately.
        const payload = {
            ...form,
            goal: Number(form.goal.replace(",",".") || 0),
            time: Number(form.time || 0),
            monthly_investment: Number(form.monthly_investment.replace(",",".") || 0),
            extra_income: Number(form.extra_income.replace(",",".") || 0),
            return_rate: Number(form.return_rate.replace(",",".") || 0)/ 100,
            initial_value: Number(form.initial_value.replace(",",".") || 0),
            inflation_rate: Number(form.inflation_rate.replace(",",".") || 4.0) / 100,
            one_time_investments: Object.fromEntries(
                oneTimeInvestments.filter((i) => i.date && i.amount).map((i) => [i.date, Number(i.amount.replace(",","."))])
            ),
            monthly_investment_changes: Object.fromEntries(
                monthlyChanges.filter((i) => i.date && i.amount).map((i) => [i.date, Number(i.amount.replace(",","."))])
            ),
        };

        const res = await fetch("api/py/simulate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const json = await res.json();
        onSimulationComplete(json.data);
    };

    return (
        <Card className="bg-emerald-900 shadow-lg">
            <CardHeader>
                <CardTitle className="text-white">Parâmetros de Simulação</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { id: "goal", label: "Meta financeira (R$)" },
                    { id: "monthly_investment", label: "Investimento mensal (R$)" },
                    { id: "extra_income", label: "Renda extra mensal (R$)" },
                    { id: "return_rate", label: "Taxa de retorno anual (%)" },
                    { id: "initial_value", label: "Valor inicial (R$)" },
                    { id: "time", label: "Duração" },
                ].map(({ id, label }) => (
                    <div key={id}>
                        <Label className="text-white" htmlFor={id}>
                            {label}
                        </Label>
                        <Input
                            id={id}
                            name={id}
                            value={form[id as keyof FormData]}
                            onChange={handleFormChange}
                            className=""
                        />
                    </div>
                ))}
                
                <div key="start_date">
                    <Label className="text-white" htmlFor="start_date">
                        Data inicial
                    </Label>
                    <Input
                        id="start_date"
                        name="start_date"
                        type="text"
                        placeholder="mm-YYYY"
                        value={form.start_date}
                        onChange={handleFormChange}
                        pattern="\d{2}-\d{4}"
                        title="Formato esperado: mm-YYYY"
                    />
                </div>
                <div key="time_unit">
                    <Label className="text-white" htmlFor="time_unit">
                        Unidade de tempo
                    </Label>
                    <Select
                        onValueChange={(value) =>
                            setForm((prev) => ({ ...prev, time_unit: value }))
                        }
                        value={form.time_unit}
                    >
                        <SelectTrigger className="bg-gray-300 mt-1">
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="months">Meses</SelectItem>
                            <SelectItem value="years">Anos</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div key={"inflation_rate"}>
                    <Label className="text-white" htmlFor={"inflation_rate"}>
                        Inflação anual (%)
                    </Label>
                    <Input
                        id={"inflation_rate"}
                        name={"inflation_rate"}
                        value={form.inflation_rate}
                        onChange={handleFormChange}
                    />
                </div>

                {/* One-time investments */}
                <div className="md:col-span-2">
                    <Label className="text-white">Investimentos pontuais</Label>
                    {oneTimeInvestments.map((item, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                            <Input
                                placeholder="mm-YYYY"
                                value={item.date}
                                type="text"
                                pattern="\d{2}-\d{4}"
                                onChange={(e) =>
                                    updateDynamicField(oneTimeInvestments, index, "date", e.target.value, setOneTimeInvestments)
                                }
                            />
                            <Input
                                placeholder="Valor (R$)"
                                value={item.amount}
                                onChange={(e) =>
                                    updateDynamicField(oneTimeInvestments, index, "amount", e.target.value, setOneTimeInvestments)
                                }
                            />
                        </div>
                    ))}
                    <div className="flex gap-2 mt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => addField(oneTimeInvestments, setOneTimeInvestments)}
                        >
                            <Plus className="w-4 h-4 mr-1" /> Adicionar
                        </Button>
                        {oneTimeInvestments.length > 1 && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => removeField(oneTimeInvestments, setOneTimeInvestments)}
                            >
                                <Minus className="w-4 h-4 mr-1" /> Remover
                            </Button>
                        )}
                    </div>
                </div>

                {/* Monthly investment changes */}
                <div className="md:col-span-2">
                    <Label className="text-white">Mudanças no investimento mensal</Label>
                    {monthlyChanges.map((item, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                            <Input
                                placeholder="mm-YYYY"
                                value={item.date}
                                pattern="\d{2}-\d{4}"
                                onChange={(e) =>
                                    updateDynamicField(monthlyChanges, index, "date", e.target.value, setMonthlyChanges)
                                }
                            />
                            <Input
                                placeholder="Novo valor (R$)"
                                value={item.amount}
                                onChange={(e) =>
                                    updateDynamicField(monthlyChanges, index, "amount", e.target.value, setMonthlyChanges)
                                }
                            />
                        </div>
                    ))}
                    <div className="flex gap-2 mt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => addField(monthlyChanges, setMonthlyChanges)}
                        >
                            <Plus className="w-4 h-4 mr-1" /> Adicionar
                        </Button>
                        {monthlyChanges.length > 1 && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => removeField(monthlyChanges, setMonthlyChanges)}
                                disabled={monthlyChanges.length <= 1}
                            >
                                <Minus className="w-4 h-4 mr-1" /> Remover
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex items-end md:col-span-2">
                    <Button
                        className="bg-blue-700 text-white hover:bg-blue-800"
                        onClick={handleSubmit}
                    >
                        Simular
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
