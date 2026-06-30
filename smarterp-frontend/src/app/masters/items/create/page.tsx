"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";

interface StockGroup {
  id: number;
  name: string;
}

export default function CreateStockItemPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [groups, setGroups] = useState<StockGroup[]>([]);
  
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [hsnCode, setHsnCode] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("0.0");
  const [sellingPrice, setSellingPrice] = useState("0.0");
  const [quantity, setQuantity] = useState("0.0");
  const [gstRate, setGstRate] = useState("18.0");
  const [unit, setUnit] = useState("PCS");
  const [stockGroupId, setStockGroupId] = useState("");
  
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

    // Fetch stock groups
    apiFetch(`/api/stock/groups?companyId=${comp.id}`)
      .then((data) => {
        setGroups(data);
        if (data.length > 0) setStockGroupId(String(data[0].id));
      })
      .catch((err) => setError("Failed to load stock groups: " + err.message));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!companyId) return;

    try {
      await apiFetch("/api/stock/items", {
        method: "POST",
        body: JSON.stringify({
          name,
          sku,
          hsnCode,
          purchasePrice: Number(purchasePrice),
          sellingPrice: Number(sellingPrice),
          quantity: Number(quantity),
          gstRate: Number(gstRate),
          unit,
          stockGroupId: stockGroupId ? Number(stockGroupId) : null,
          companyId,
        }),
      });
      setSuccess(true);
      setName("");
      setSku("");
      setHsnCode("");
      setPurchasePrice("0.0");
      setSellingPrice("0.0");
      setQuantity("0.0");
      // Reset focus
      document.getElementById("item-name")?.focus();
    } catch (err: any) {
      setError(err.message || "Failed to create stock item");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4 font-mono">
      <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-teal-400">Stock Item Creation</h1>
          <p className="text-slate-500 text-[10px] uppercase mt-1">Create inventory items with purchase & selling prices</p>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-xs px-3 py-1.5 bg-slate-900 border border-slate-800 rounded hover:border-slate-700 text-slate-400"
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
          SUCCESS: Stock item created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Item Name</label>
            <input
              id="item-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Lenovo Laptop V15"
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">SKU / Model Number</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g., LNV-15-2026"
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">HSN Code</label>
            <input
              type="text"
              value={hsnCode}
              onChange={(e) => setHsnCode(e.target.value)}
              placeholder="e.g., 84713010"
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Measuring Unit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none text-xs"
            >
              <option value="PCS">Pieces (PCS)</option>
              <option value="BOX">Boxes (BOX)</option>
              <option value="KG">Kilograms (KG)</option>
              <option value="LTR">Liters (LTR)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Purchase Price (Rate)</label>
            <input
              type="number"
              step="0.01"
              required
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Selling Price (Rate)</label>
            <input
              type="number"
              step="0.01"
              required
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Opening Stock Qty</label>
            <input
              type="number"
              step="0.01"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">GST Rate (%)</label>
            <select
              value={gstRate}
              onChange={(e) => setGstRate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none text-xs"
            >
              <option value="0.0">Exempt (0%)</option>
              <option value="5.0">5% GST</option>
              <option value="12.0">12% GST</option>
              <option value="18.0">18% GST</option>
              <option value="28.0">28% GST</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Stock Group</label>
            <select
              value={stockGroupId}
              onChange={(e) => setStockGroupId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none text-xs"
            >
              {groups.length === 0 && <option value="">Loading groups...</option>}
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
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
