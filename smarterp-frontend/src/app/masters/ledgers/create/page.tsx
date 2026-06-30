"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";

interface AccountGroup {
  id: number;
  name: string;
}

export default function CreateLedgerPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [groups, setGroups] = useState<AccountGroup[]>([]);
  
  const [name, setName] = useState("");
  const [groupId, setGroupId] = useState("");
  const [ledgerType, setLedgerType] = useState("CUSTOMER");
  const [openingBalance, setOpeningBalance] = useState("0.0");
  const [gstNumber, setGstNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const compJson = localStorage.getItem("smarterp_active_company");
    if (!compJson) {
      router.push("/companies");
      return;
    }
    const comp = JSON.parse(compJson);
    setCompanyId(comp.id);

    // Fetch groups for company
    apiFetch(`/api/ledgers/groups?companyId=${comp.id}`)
      .then((data) => {
        setGroups(data);
        if (data.length > 0) setGroupId(String(data[0].id));
      })
      .catch((err) => setError("Failed to load account groups: " + err.message));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!companyId) return;

    try {
      await apiFetch("/api/ledgers", {
        method: "POST",
        body: JSON.stringify({
          name,
          groupId: Number(groupId),
          companyId,
          openingBalance: Number(openingBalance),
          currentBalance: Number(openingBalance),
          gstNumber,
          mobileNumber,
          address,
          ledgerType,
        }),
      });
      setSuccess(true);
      setName("");
      setOpeningBalance("0.0");
      setGstNumber("");
      setMobileNumber("");
      setAddress("");
      // Reset focus to ledger name
      document.getElementById("ledger-name")?.focus();
    } catch (err: any) {
      setError(err.message || "Failed to create ledger");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4 font-mono">
      <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-teal-400">Ledger Creation</h1>
          <p className="text-slate-500 text-[10px] uppercase mt-1">Create accounts (Customers, Suppliers, Banks)</p>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-xs px-3 py-1.5 bg-slate-900 border border-slate-800 rounded hover:border-slate-700 text-slate-400 hover:text-slate-200"
        >
          Quit (Esc)
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded font-bold">
          ERROR: {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs rounded font-bold">
          SUCCESS: Ledger created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Ledger Name</label>
            <input
              id="ledger-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Star Enterprise"
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Ledger Type</label>
            <select
              value={ledgerType}
              onChange={(e) => setLedgerType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none text-xs"
            >
              <option value="CUSTOMER">Customer (Debtor)</option>
              <option value="SUPPLIER">Supplier (Creditor)</option>
              <option value="BANK">Bank Account</option>
              <option value="CASH">Cash Account</option>
              <option value="INCOME">Income / Revenue</option>
              <option value="EXPENSE">Expense / Cost</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Under Account Group</label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none text-xs"
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Opening Balance</label>
            <input
              type="number"
              step="0.01"
              required
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">GSTIN (If any)</label>
            <input
              type="text"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
              placeholder="e.g., 27AAAAA1111A1Z1"
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Contact Number</label>
            <input
              type="text"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="e.g., +919876543210"
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none text-xs"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full address of the ledger contact..."
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded font-bold text-xs tracking-wider transition"
          >
            SUBMIT (Enter)
          </button>
        </div>
      </form>
    </div>
  );
}
