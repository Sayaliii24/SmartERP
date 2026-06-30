"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";

interface Ledger {
  id: number;
  name: string;
  currentBalance: number;
}

interface ProfitLoss {
  totalIncomes: number;
  totalExpenses: number;
  netProfitOrLoss: number;
  incomes: Ledger[];
  expenses: Ledger[];
}

export default function ProfitLossPage() {
  const router = useRouter();
  const [data, setData] = useState<ProfitLoss | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [financialYear, setFinancialYear] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const compJson = localStorage.getItem("smarterp_active_company");
    if (!compJson) {
      router.push("/companies");
      return;
    }
    const comp = JSON.parse(compJson);
    setCompanyName(comp.name);
    setFinancialYear(comp.financialYear);

    apiFetch(`/api/reports/profit-loss?companyId=${comp.id}`)
      .then((res) => setData(res))
      .catch((err) => setError("Failed to fetch profit and loss statement: " + err.message));
  }, [router]);

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 font-mono text-rose-400">
        ERROR: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto py-8 font-mono text-slate-500">
        Loading Profit & Loss Statement...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 font-mono">
      <div className="border-b border-slate-800 pb-3 flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-xl font-bold text-teal-400">Profit & Loss A/c</h1>
          <p className="text-slate-500 text-[10px] uppercase mt-1">Income & Expenditure Statement</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => window.print()}
            className="text-xs px-3 py-1.5 bg-slate-900 border border-slate-800 rounded hover:border-slate-700 text-slate-300"
          >
            Print Sheet (Ctrl+P)
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-xs px-3 py-1.5 bg-slate-900 border border-slate-800 rounded hover:border-slate-700 text-slate-400"
          >
            Back (Esc)
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6 print:bg-white print:text-black print:border-0 print:p-0">
        {/* Header Block */}
        <div className="text-center space-y-1 py-4 border-b border-slate-800 print:border-slate-300">
          <h2 className="text-lg font-bold text-slate-200 print:text-black uppercase">{companyName}</h2>
          <h3 className="text-xs text-slate-400 print:text-slate-600 font-bold uppercase">Profit & Loss Statement</h3>
          <p className="text-[10px] text-slate-500 print:text-slate-500">For Financial Year {financialYear}</p>
        </div>

        {/* T-Account Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 border border-slate-800 print:border-slate-300 rounded divide-y md:divide-y-0 md:divide-x divide-slate-800 print:divide-slate-300 text-xs">
          {/* Expenses Side */}
          <div className="flex flex-col h-full min-h-[300px]">
            <div className="bg-slate-950/60 print:bg-slate-100 px-4 py-2 border-b border-slate-800 print:border-slate-300 font-bold text-slate-400 print:text-slate-700 flex justify-between">
              <span>EXPENSES</span>
              <span>Amount</span>
            </div>
            
            <div className="p-4 flex-1 space-y-2">
              {data.expenses.map((l) => (
                <div key={l.id} className="flex justify-between">
                  <span className="text-slate-300 print:text-black">{l.name}</span>
                  <span className="font-mono">{l.currentBalance.toFixed(2)}</span>
                </div>
              ))}
              {data.expenses.length === 0 && (
                <div className="text-slate-600 py-4 text-center">No expenses logged.</div>
              )}
            </div>

            <div className="bg-slate-950/40 px-4 py-3 border-t border-slate-800 print:border-slate-300 font-bold text-slate-300 print:text-black flex justify-between">
              <span>TOTAL EXPENSES</span>
              <span className="font-mono text-rose-400 print:text-black">{data.totalExpenses.toFixed(2)}</span>
            </div>
          </div>

          {/* Incomes Side */}
          <div className="flex flex-col h-full min-h-[300px]">
            <div className="bg-slate-950/60 print:bg-slate-100 px-4 py-2 border-b border-slate-800 print:border-slate-300 font-bold text-slate-400 print:text-slate-700 flex justify-between">
              <span>REVENUES & INCOME</span>
              <span>Amount</span>
            </div>

            <div className="p-4 flex-1 space-y-2">
              {data.incomes.map((l) => (
                <div key={l.id} className="flex justify-between">
                  <span className="text-slate-300 print:text-black">{l.name}</span>
                  <span className="font-mono">{l.currentBalance.toFixed(2)}</span>
                </div>
              ))}
              {data.incomes.length === 0 && (
                <div className="text-slate-600 py-4 text-center">No income accounts recorded.</div>
              )}
            </div>

            <div className="bg-slate-950/40 px-4 py-3 border-t border-slate-800 print:border-slate-300 font-bold text-slate-300 print:text-black flex justify-between">
              <span>TOTAL REVENUE</span>
              <span className="font-mono text-emerald-400 print:text-black">{data.totalIncomes.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Profit/Loss block */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 flex justify-between items-center text-sm font-bold print:border-slate-300 print:text-black">
          <span className="uppercase text-slate-400 print:text-slate-700">
            {data.netProfitOrLoss >= 0 ? "Net Profit" : "Net Loss"}
          </span>
          <span className={`font-mono text-base ${data.netProfitOrLoss >= 0 ? "text-emerald-400" : "text-rose-400"} print:text-black`}>
            {data.netProfitOrLoss.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
