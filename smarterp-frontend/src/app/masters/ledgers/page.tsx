"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";
import { Trash2, Search } from "lucide-react";

interface Ledger {
  id: number;
  name: string;
  ledgerType: string;
  openingBalance: number;
  currentBalance: number;
  gstNumber: string;
}

export default function LedgersListPage() {
  const router = useRouter();
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const loadLedgers = async () => {
    const compJson = localStorage.getItem("smarterp_active_company");
    if (!compJson) {
      router.push("/companies");
      return;
    }
    const comp = JSON.parse(compJson);
    try {
      const data = await apiFetch(`/api/ledgers?companyId=${comp.id}`);
      setLedgers(data);
    } catch (err: any) {
      setError(err.message || "Failed to load ledgers");
    }
  };

  useEffect(() => {
    loadCompaniesAndLedgers();
  }, []);

  const loadCompaniesAndLedgers = async () => {
    await loadLedgers();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this ledger?")) return;
    try {
      await apiFetch(`/api/ledgers/${id}`, { method: "DELETE" });
      loadLedgers();
    } catch (err: any) {
      setError(err.message || "Failed to delete ledger");
    }
  };

  const filteredLedgers = ledgers.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.ledgerType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 font-mono">
      <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-teal-400">Ledgers List</h1>
          <p className="text-slate-500 text-[10px] uppercase mt-1">View and alter company ledger accounts</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => router.push("/masters/ledgers/create")}
            className="text-xs px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded font-bold transition"
          >
            Create Ledger (Alt+L)
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

      <div className="flex items-center px-3 py-2 bg-slate-900 border border-slate-800 rounded">
        <Search className="text-slate-500 mr-2" size={16} />
        <input
          type="text"
          placeholder="Filter by name or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-0 outline-none text-xs text-slate-200 placeholder-slate-600 w-full"
        />
      </div>

      <div className="bg-slate-900 border border-slate-850 rounded-lg overflow-hidden shadow-lg">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Opening Bal</th>
              <th className="px-4 py-3">Current Bal</th>
              <th className="px-4 py-3">GSTIN</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40 text-slate-300">
            {filteredLedgers.length > 0 ? (
              filteredLedgers.map((l) => (
                <tr key={l.id} className="hover:bg-slate-850/40 transition">
                  <td className="px-4 py-3 font-semibold text-slate-200">{l.name}</td>
                  <td className="px-4 py-3 text-teal-400">{l.ledgerType}</td>
                  <td className="px-4 py-3 font-mono">{l.openingBalance.toFixed(2)}</td>
                  <td className={`px-4 py-3 font-mono font-bold ${l.currentBalance < 0 ? "text-rose-400" : "text-emerald-400"}`}>
                    {l.currentBalance.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{l.gstNumber || "N/A"}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(l.id)}
                      className="text-rose-400 hover:text-rose-300 p-1.5 rounded hover:bg-slate-800 transition"
                      title="Delete Ledger"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500">
                  No ledgers matching query found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
