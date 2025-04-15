export async function simulate(payload: SimulationRequest): Promise<SimulationResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/py/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Requested failed");
  }
  return res.json();
}

// Interfaces
export interface SimulationRequest {
  goal: number;
  time: number;
  time_unit: "months" | "years";
  monthly_investment: number;
  extra_income: number;
  return_rate: number;
  start_date: string;          // "MM-YYYY"
  initial_value: number;
  inflation_rate: number;
  one_time_investments: Record<string, number>;            // { "MM-YYYY": amount }
  monthly_investment_changes: Record<string, number>;      // { "MM-YYYY": amount }
}

export interface SimulationResponse {
  data: Record<string, {
    current_value: number;
    current_extra_value: number;
  }>;
}
