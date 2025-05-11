"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Minus, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NumericFormat } from "react-number-format";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SimulationResult } from "@/app/Short-Track/page";
import { toast } from "sonner";
import { Toaster } from 'sonner';


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




export default function ShortTrackerForms({ onSimulationComplete }: ShortTrackerFormsProps) {
    const [form, setForm] = useState<FormData>({
        goal: "",
        time: "",
        time_unit: "months",
        monthly_investment: "",
        extra_income: "",
        return_rate: "10.0",
        start_date: "",
        initial_value: "",
        inflation_rate: "4.0",
    });

    const [oneTimeInvestments, setOneTimeInvestments] = useState<InvestmentField[]>([{ date: "", amount: "" }]);
    const [monthlyChanges, setMonthlyChanges] = useState<InvestmentField[]>([{ date: "", amount: "" }]);
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [ignoreInflation, setIgnoreInflation] = useState(false);



    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };
    const handleDateSelect = (date: Date | undefined) => {
        if (!date) return;
        setStartDate(date);
        setForm((prev: FormData) => ({
            ...prev,
            start_date: `${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getFullYear()}`,
        }));
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
        const payload = {
            ...form,
            goal: Number(form.goal.replace(",", ".") || 0),
            time: Number(form.time || 0),
            monthly_investment: Number(form.monthly_investment.replace(",", ".") || 0),
            extra_income: Number(form.extra_income.replace(",", ".") || 0),
            return_rate: Number(form.return_rate.replace(",", ".") || 0) / 100,
            initial_value: Number(form.initial_value.replace(",", ".") || 0),
            inflation_rate: ignoreInflation ? 0 : Number(form.inflation_rate.replace(",", ".") || 4.0) / 100,
            one_time_investments: Object.fromEntries(
                oneTimeInvestments.filter((i) => i.date && i.amount).map((i) => [i.date, Number(i.amount.replace(",", "."))])
            ),
            monthly_investment_changes: Object.fromEntries(
                monthlyChanges.filter((i) => i.date && i.amount).map((i) => [i.date, Number(i.amount.replace(",", "."))])
            ),
        };

        const res = await fetch(
            process.env.NEXT_PUBLIC_APP_URL + "/simulate",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            }
        );

        const json = await res.json();

        if (!res.ok) {
            if (res.status == 404 || res.status == 500 || res.status == 400)
                toast.error("Erro na simulação", {
                    description: `${res.status} - ${json?.detail}`,
                });
            else
                toast.error("Erro na simulação", {
                    description: `Erro ao simular meta.`,
                });
        }

        onSimulationComplete(json.data);
    };

    return (
        <Card className="bg-emerald-900 shadow-lg">
            <Toaster />
            <CardHeader>
                <CardTitle className="text-white">Parâmetros de Simulação</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">


                {[
                    { id: "goal", label: "Meta financeira (R$)" },
                    { id: "monthly_investment", label: "Investimento mensal (R$)" },
                    { id: "extra_income", label: "Renda extra mensal (R$)" },
                    { id: "initial_value", label: "Valor inicial (R$)" },
                ].map(({ id, label }) => (
                    <div key={id}>
                        <Label className="text-white" htmlFor={id}>
                            {label}
                        </Label>
                        <NumericFormat
                            id={id}
                            name={id}
                            value={form[id as keyof FormData]}
                            thousandSeparator="."
                            decimalSeparator=","
                            prefix="R$ "
                            decimalScale={2}
                            allowNegative={false}
                            onValueChange={(values) =>
                                setForm((prev) => ({
                                    ...prev,
                                    [id]: values.value, // unformatted value like "1000.00"
                                }))
                            }
                            customInput={Input}
                        />

                    </div>
                ))}

                <div key={'inflation_rate'}>
                    <Label className="text-white" htmlFor={"inflation_rate"}>
                        {'Inflação anual (%)'}
                    </Label>
                    <NumericFormat
                        disabled={ignoreInflation}
                        id={'inflation_rate'}
                        name={'inflation_rate'}
                        value={form['inflation_rate']}
                        thousandSeparator="."
                        decimalSeparator=","
                        suffix=" %"
                        decimalScale={2}
                        allowNegative={false}
                        onValueChange={(values) =>
                            setForm((prev) => ({
                                ...prev,
                                ['inflation_rate']: values.value, // unformatted value like "1000.00"
                            }))
                        }
                        customInput={Input}
                    />
                </div>

                <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                        id="ignore-inflation"
                        checked={ignoreInflation}
                        onCheckedChange={(checked) => setIgnoreInflation(!!checked)}
                    />
                    <Label htmlFor="ignore-inflation" className="text-white">
                        Ignorar inflação
                    </Label>
                </div>


                {[
                    { id: "return_rate", label: "Taxa de retorno anual (%)" },

                ].map(({ id, label }) => (
                    <div key={id}>
                        <Label className="text-white" htmlFor={id}>
                            {label}
                        </Label>
                        <NumericFormat
                            id={id}
                            name={id}
                            value={form[id as keyof FormData]}
                            thousandSeparator="."
                            decimalSeparator=","
                            suffix=" %"
                            decimalScale={2}
                            allowNegative={false}
                            onValueChange={(values) =>
                                setForm((prev) => ({
                                    ...prev,
                                    [id]: values.value, // unformatted value like "1000.00"
                                }))
                            }
                            customInput={Input}
                        />
                    </div>
                ))}

                <div>
                    <Label className="text-white">Data inicial</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full text-left font-normal bg-gray-300  text-black">
                                {startDate ? `${(startDate.getMonth() + 1).toString().padStart(2, "0")}-${startDate.getFullYear()}` : "Selecione uma data"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={handleDateSelect}
                                fromYear={2000}
                                toYear={2100}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="flex flex-col">
                    <Label className="text-white" htmlFor="time">Duração</Label>
                    <div className="flex">
                        <Input
                            id="time"
                            name="time"
                            value={form.time}
                            onChange={handleFormChange}
                            className="w-2/3 rounded-r-none text-center"
                        />
                        <Select
                            onValueChange={(value) =>
                                setForm((prev) => ({ ...prev, time_unit: value }))
                            }
                            value={form.time_unit}
                        >
                            <SelectTrigger id="time_unit" className="bg-gray-300 mt-1 w-1/3 rounded-l-none">
                                <SelectValue placeholder="Unidade" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="months">Meses</SelectItem>
                                <SelectItem value="years">Anos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* One-time investments */}
                <div className="md:col-span-2">
                    <Label className="text-white">Investimentos pontuais</Label>
                    {oneTimeInvestments.map((item, index) => (
                        <div key={index} className="flex gap-3 mb-2 mt-1 items-end">

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-[180px] text-left font-normal bg-gray-300 text-black"
                                    >
                                        {item.date ? item.date : "Selecione uma data"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={
                                            item.date
                                                ? new Date(
                                                    Number(item.date.split("-")[1]),
                                                    Number(item.date.split("-")[0]) - 1
                                                )
                                                : undefined
                                        }
                                        onSelect={(date: Date | undefined) => {
                                            if (!date) return;
                                            const formatted = `${(date.getMonth() + 1)
                                                .toString()
                                                .padStart(2, "0")}-${date.getFullYear()}`;
                                            updateDynamicField(
                                                oneTimeInvestments,
                                                index,
                                                "date",
                                                formatted,
                                                setOneTimeInvestments
                                            );
                                        }}
                                        fromYear={2000}
                                        toYear={2100}
                                    />
                                </PopoverContent>
                            </Popover>

                            <NumericFormat
                                className="mt-0 text-center"
                                placeholder={"Valor (R$)"}
                                value={item.amount}
                                thousandSeparator="."
                                decimalSeparator=","
                                prefix="R$ "
                                decimalScale={2}
                                allowNegative={false}
                                onValueChange={(e) =>
                                    updateDynamicField(oneTimeInvestments, index, "amount", e.value, setOneTimeInvestments)
                                }
                                customInput={Input}
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
                        <div key={index} className="flex gap-2 mb-2 items-end mt-1">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-[180px] text-left font-normal bg-gray-300 text-black"
                                    >
                                        {item.date ? item.date : "Selecione uma data"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={
                                            item.date
                                                ? new Date(
                                                    Number(item.date.split("-")[1]),
                                                    Number(item.date.split("-")[0]) - 1
                                                )
                                                : undefined
                                        }
                                        onSelect={(date: Date | undefined) => {
                                            if (!date) return;
                                            const formatted = `${(date.getMonth() + 1)
                                                .toString()
                                                .padStart(2, "0")}-${date.getFullYear()}`;
                                            updateDynamicField(
                                                monthlyChanges,
                                                index,
                                                "date",
                                                formatted,
                                                setMonthlyChanges
                                            );
                                        }}
                                        fromYear={2000}
                                        toYear={2100}
                                    />
                                </PopoverContent>
                            </Popover>

                            <NumericFormat
                                placeholder={"Valor (R$)"}
                                value={item.amount}
                                thousandSeparator="."
                                decimalSeparator=","
                                prefix="R$ "
                                decimalScale={2}
                                allowNegative={false}
                                onValueChange={(e) =>
                                    updateDynamicField(monthlyChanges, index, "amount", e.value, setMonthlyChanges)
                                }
                                customInput={Input}
                                className="mt-0 text-center"
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
