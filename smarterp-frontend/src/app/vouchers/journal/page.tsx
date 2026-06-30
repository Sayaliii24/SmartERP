"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function JournalVoucherPage() {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4 font-mono">
      <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-teal-400">Journal Voucher (F7)</h1>
          <p className="text-slate-500 text-[10px] uppercase mt-1">Record adjusting and transfer entries</p>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-xs px-3 py-1.5 bg-slate-900 border border-slate-800 rounded hover:border-slate-700 text-slate-400"
        >
          Quit (Esc)
        </button>
      </div>

      <div className="bg-slate-900 border border-amber-700/40 rounded-lg p-8 text-center space-y-4">
        <div className="text-4xl">🚧</div>
        <h2 className="text-lg font-bold text-amber-400">Coming Soon</h2>
        <p className="text-slate-500 text-sm">
          Journal Voucher module is not yet implemented in this version.
          <br />
          Use <span className="text-teal-400 font-bold">Purchase Voucher (F9)</span> or{" "}
          <span className="text-teal-400 font-bold">Sales Voucher (F8)</span> for your transactions.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded font-bold text-xs tracking-wider transition"
        >
          Back to Dashboard (Esc)
        </button>
      </div>
    </div>
  );
}
