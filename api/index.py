from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime
from dateutil.relativedelta import relativedelta
from typing import Dict, Any
from decimal import Decimal, getcontext, ROUND_HALF_UP
from fastapi.middleware.cors import CORSMiddleware
import sys
sys.dont_write_bytecode = True

origins = [
    "http://localhost:3000",
    "https://blogueirinho.vercel.app",
]


getcontext().prec = 28

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,             # Ou use ["*"] para permitir tudo (não recomendado em produção)
    allow_credentials=True,
    allow_methods=["*"],               # Pode restringir para ["GET", "POST", etc.]
    allow_headers=["*"],              # Pode restringir para ["Authorization", "Content-Type", etc.]
)


class GoalRequest(BaseModel):
    goal: Decimal
    time: int
    time_unit: str  # "months" or "years"
    monthly_investment: Decimal
    extra_income: Decimal
    return_rate: Decimal  # annual interest rate, ex: 0.12 = 12%
    start_date: str  # format: "mm-YYYY"
    initial_value: Decimal = Decimal("0.00")
    one_time_investments: Dict[str, Decimal] = {}  # {"07-2025": 1000.00}
    monthly_investment_changes: Dict[str, Decimal] = {}  # {"10-2025": 1500.00}
    inflation_rate:  Decimal = Decimal("0.00") 

@app.post("/simulate")
def simulate_goal(request: GoalRequest) -> Dict[str, Any]:
    print("Hi")
    try:
        start_date = datetime.strptime(request.start_date, "%m-%Y")
    except ValueError:
        return {"error": "Invalid date format. Use 'mm-YYYY'."}
    print("começo")
    months = request.time if request.time_unit == "months" else request.time * 12
    monthly_rate = (Decimal(1) + request.return_rate) ** (Decimal(1)/Decimal(12)) - Decimal(1)

    results = {}
    value = request.initial_value
    value_with_extra = request.initial_value

    current_monthly_investment = request.monthly_investment
    monthly_inflation = (Decimal(1) + request.inflation_rate) ** (Decimal(1)/Decimal(12)) - Decimal(1)
    adjusted_goal = request.goal
    print("oi")

    for i in range(months):
        date = start_date + relativedelta(months=i)
        key = date.strftime("%m-%Y")

        # Update monthly investment if changed
        if key in request.monthly_investment_changes:
            current_monthly_investment = request.monthly_investment_changes[key]

        # Add punctual investment if present
        punctual = request.one_time_investments.get(key, Decimal("0.00"))

        # Apply compound interest
        value = value * (Decimal(1) + monthly_rate) + current_monthly_investment + punctual
        value_with_extra = value_with_extra * (Decimal(1) + monthly_rate) + request.extra_income + punctual

        if i > 0:
            adjusted_goal *= (Decimal(1) + monthly_inflation)

        value_q = value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        value_with_extra_q = value_with_extra.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        adjusted_goal_q = adjusted_goal.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        results[key] = {
            "current_value": float(value_q),
            "current_extra_value": float(value_with_extra_q),
            "goal_achieved": "Y" if value_q + value_with_extra_q >= adjusted_goal_q else "N"
        }

    return {"data": results}
