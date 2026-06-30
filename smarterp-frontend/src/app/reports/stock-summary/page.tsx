"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";

interface StockItem {
  id: number;
  name: string;
  sku: string;
  hsnCode: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  unit: string;
  gstRate: number;
}

export default function StockSummaryPage() {
  const router = useRouter();
  const [items, setItems] = useState<StockItem[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");

  const loadStock = async () => {
    const compJson = localStorage.getItem("smarterp_active_company");
    if (!compJson) {
      router.push("/companies");
      return;
    }
    const comp = JSON.parse(compJson);
    setCompanyName(comp.name);

    try {
      const data = await apiFetch(`/api/reports/stock-summary?companyId=${comp.id}`);
      setItems(data);
    } catch (err: any) {
      setError(err.message || "Failed to load stock summary");
    }
  };

  useEffect(() => {
    loadStock();
  }, []);

  const totalValue = items.reduce((acc, item) => acc + (item.quantity * item.purchasePrice), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 font-mono">
      <div className="border-b border-slate-800 pb-3 flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-xl font-bold text-teal-400">Stock Summary (Alt+R)</h1>
          <p className="text-slate-500 text-[10px] uppercase mt-1">Inventory Valuations</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => window.print()}
            className="text-xs px-3 py-1.5 bg-slate-900 border border-slate-800 rounded hover:border-slate-700 text-slate-300"
          >
            Print Summary
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-xs px-3 py-1.5 bg-slate-900 border border-slate-800 rounded hover:border-slate-700 text-slate-400"
          >
            Back (Esc)
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded font-bold">
          ERROR: {error}
        </div>
      )}

      {/* Frame */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6 print:bg-white print:text-black print:border-0 print:p-0">
        <div className="text-center py-2 border-b border-slate-800 print:border-slate-300">
          <h2 className="text-lg font-bold text-slate-200 print:text-black uppercase">{companyName}</h2>
          <h3 className="text-xs text-slate-400 print:text-slate-600 font-bold uppercase">Stock Valuation Summary</h3>
        </div>

        <div className="overflow-hidden border border-slate-800 print:border-slate-300 rounded">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/60 print:bg-slate-100 border-b border-slate-800 print:border-slate-300 text-slate-400 print:text-slate-700 font-bold uppercase">
                <th className="px-4 py-3">Item Name</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">HSN</th>
                <th className="px-4 py-3 text-right">Available Qty</th>
                <th className="px-4 py-3 text-right">Unit Rate (Purchase)</th>
                <th className="px-4 py-3 text-right">Total Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 print:divide-slate-200 text-slate-300 print:text-black">
              {items.length > 0 ? (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-850/30 transition">
                    <td className="px-4 py-3 font-semibold text-slate-200 print:text-black">{item.name}</td>
                    <td className="px-4 py-3 text-slate-500">{item.sku || "N/A"}</td>
                    <td className="px-4 py-3 text-slate-500">{item.hsnCode || "N/A"}</td>
                    <td className={`px-4 py-3 text-right font-bold ${item.quantity <= 0 ? "text-rose-400" : "text-emerald-400"}`}>
                      {item.quantity.toFixed(2)} {item.unit}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{item.purchasePrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-200 print:text-black">
                      {(item.quantity * item.purchasePrice).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    No inventory items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Valuation Total */}
        <div className="bg-slate-950/60 border border-slate-800 rounded p-4 flex justify-between items-center text-sm font-bold print:border-slate-300 print:text-black">
          <span className="uppercase text-slate-400 print:text-slate-700">Total Stock Value</span>
          <span className="font-mono text-teal-400 print:text-black">{totalValue.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
