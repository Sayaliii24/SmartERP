"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";

interface Ledger {
  id: number;
  name: string;
}

interface StockItem {
  id: number;
  name: string;
  sku: string;
  purchasePrice: number;
  quantity: number;
  gstRate: number;
}

interface LineItem {
  stockItemId: string;
  quantity: number;
  rate: number;
}

export default function PurchaseVoucherPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<number | null>(null);
  
  const [suppliers, setSuppliers] = useState<Ledger[]>([]);
  const [purchaseLedgers, setPurchaseLedgers] = useState<Ledger[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  
  const [voucherNumber, setVoucherNumber] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [partyId, setPartyId] = useState("");
  const [purchaseLedgerId, setPurchaseLedgerId] = useState("");
  const [narration, setNarration] = useState("");
  
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { stockItemId: "", quantity: 1, rate: 0 }
  ]);

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

    // Generate random voucher number
    setVoucherNumber("PUR-" + Math.floor(1000 + Math.random() * 9000));

    // Load Suppliers
    apiFetch(`/api/ledgers?companyId=${comp.id}&type=SUPPLIER`)
      .then((data) => {
        setSuppliers(data);
        if (data.length > 0) setPartyId(String(data[0].id));
      })
      .catch((err) => setError("Failed to load suppliers: " + err.message));

    // Load Purchase Ledgers
    apiFetch(`/api/ledgers?companyId=${comp.id}`)
      .then((data: Ledger[]) => {
        const filtered = data.filter(l => l.name.toLowerCase().includes("purchase"));
        setPurchaseLedgers(filtered.length > 0 ? filtered : data);
        if (filtered.length > 0) {
          setPurchaseLedgerId(String(filtered[0].id));
        } else if (data.length > 0) {
          setPurchaseLedgerId(String(data[0].id));
        }
      })
      .catch((err) => setError("Failed to load purchase accounts: " + err.message));

    // Load Stock Items
    apiFetch(`/api/stock/items?companyId=${comp.id}`)
      .then((data) => setStockItems(data))
      .catch((err) => setError("Failed to load stock items: " + err.message));
  }, [router]);

  const handleLineItemChange = (idx: number, field: keyof LineItem, val: string | number) => {
    const updated = [...lineItems];
    
    if (field === "stockItemId") {
      const selectedItem = stockItems.find(item => String(item.id) === String(val));
      updated[idx] = {
        ...updated[idx],
        stockItemId: String(val),
        rate: selectedItem ? selectedItem.purchasePrice : 0
      };
    } else {
      updated[idx] = {
        ...updated[idx],
        [field]: val
      };
    }
    
    setLineItems(updated);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { stockItemId: "", quantity: 1, rate: 0 }]);
  };

  const removeLineItem = (idx: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== idx));
  };

  // Computations
  const getSubtotal = () => {
    return lineItems.reduce((acc, item) => {
      const amt = item.quantity * item.rate;
      return acc + (isNaN(amt) ? 0 : amt);
    }, 0);
  };

  const getGstAmount = () => {
    return lineItems.reduce((acc, item) => {
      const matched = stockItems.find(st => String(st.id) === String(item.stockItemId));
      const rate = matched ? matched.gstRate : 0;
      const amt = item.quantity * item.rate * (rate / 100);
      return acc + (isNaN(amt) ? 0 : amt);
    }, 0);
  };

  const totalAmount = getSubtotal() + getGstAmount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!partyId || !purchaseLedgerId) {
      setError("Please select a Supplier Party and Purchase Account.");
      return;
    }

    // Compile double entries
    // CREDIT Supplier Party for totalAmount
    // DEBIT Purchase Account for subtotal + tax details on lines
    const entries = [];
    
    // Credit Supplier
    entries.push({
      ledgerId: Number(partyId),
      amount: totalAmount,
      entryType: "CREDIT"
    });

    // Debit Purchase Account
    lineItems.forEach((item) => {
      const lineAmt = item.quantity * item.rate;
      const matchedItem = stockItems.find(st => String(st.id) === String(item.stockItemId));
      const gstRate = matchedItem ? matchedItem.gstRate : 0;
      const lineGst = lineAmt * (gstRate / 100);

      // Purchase Debit
      entries.push({
        ledgerId: Number(purchaseLedgerId),
        amount: lineAmt + lineGst, // include GST on debit line to balance credit
        entryType: "DEBIT",
        stockItemId: Number(item.stockItemId),
        quantity: Number(item.quantity),
        rate: Number(item.rate)
      });
    });

    try {
      await apiFetch("/api/vouchers", {
        method: "POST",
        body: JSON.stringify({
          voucherNumber,
          date,
          type: "PURCHASE",
          companyId,
          narration,
          totalAmount,
          gstAmount: getGstAmount(),
          entries
        })
      });

      setSuccess(true);
      setLineItems([{ stockItemId: "", quantity: 1, rate: 0 }]);
      setNarration("");
      setVoucherNumber("PUR-" + Math.floor(1000 + Math.random() * 9000));
    } catch (err: any) {
      setError(err.message || "Failed to submit purchase voucher");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 font-mono">
      <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-teal-400">Purchase Voucher Creation (F9)</h1>
          <p className="text-slate-500 text-[10px] uppercase mt-1">Post supplier purchases and add stock to inventory</p>
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
          SUCCESS: Purchase voucher posted successfully! Stock quantities increased.
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
        {/* Voucher Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Voucher No</label>
            <input
              type="text"
              required
              value={voucherNumber}
              onChange={(e) => setVoucherNumber(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Party A/c Name (Supplier)</label>
            <select
              value={partyId}
              onChange={(e) => setPartyId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none text-xs"
            >
              <option value="">Select Party</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Purchase Account</label>
            <select
              value={purchaseLedgerId}
              onChange={(e) => setPurchaseLedgerId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none text-xs"
            >
              <option value="">Select Purchase Acc</option>
              {purchaseLedgers.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="space-y-2 border-t border-slate-800 pt-4">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Inventory / Purchase Items</label>
          
          <div className="space-y-2">
            {lineItems.map((item, idx) => {
              const matchedItem = stockItems.find(st => String(st.id) === String(item.stockItemId));
              const availableQty = matchedItem ? matchedItem.quantity : 0;
              const gst = matchedItem ? matchedItem.gstRate : 0;
              
              return (
                <div key={idx} className="flex items-center space-x-3 bg-slate-950/60 p-3 border border-slate-800 rounded-lg">
                  <div className="flex-1 space-y-1">
                    <select
                      value={item.stockItemId}
                      required
                      onChange={(e) => handleLineItemChange(idx, "stockItemId", e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded px-3 py-1.5 text-slate-200 focus:border-teal-500 focus:outline-none text-xs"
                    >
                      <option value="">Select Stock Item</option>
                      {stockItems.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name} ({st.sku || "No SKU"}) - Current Qty: {st.quantity}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-24">
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(idx, "quantity", Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-850 rounded px-3 py-1.5 text-slate-200 text-xs"
                    />
                  </div>

                  <div className="w-32">
                    <input
                      type="number"
                      required
                      step="0.01"
                      placeholder="Rate"
                      value={item.rate}
                      onChange={(e) => handleLineItemChange(idx, "rate", Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-850 rounded px-3 py-1.5 text-slate-200 text-xs"
                    />
                  </div>

                  <div className="w-36 text-right px-2 font-mono text-slate-300 font-bold text-xs">
                    {(item.quantity * item.rate).toFixed(2)}
                    {gst > 0 && <span className="text-[9px] text-slate-500 ml-1">+{gst}% GST</span>}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeLineItem(idx)}
                    disabled={lineItems.length === 1}
                    className="text-rose-400 hover:text-rose-300 p-1.5 disabled:opacity-30 transition"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={addLineItem}
            className="text-xs px-3 py-1.5 bg-slate-900 border border-slate-800 rounded hover:border-slate-700 text-teal-400 font-semibold"
          >
            + Add Row
          </button>
        </div>

        {/* Calculation Summary & Narration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-800 pt-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Narration / Voucher Notes</label>
            <textarea
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              placeholder="Provide purchase details..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none text-xs"
            />
          </div>

          <div className="bg-slate-950/60 p-4 border border-slate-800 rounded-lg space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal:</span>
              <span className="font-mono font-semibold">{getSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">GST Tax (CGST + SGST):</span>
              <span className="font-mono font-semibold text-teal-400">+{getGstAmount().toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-2 text-sm font-bold">
              <span className="text-slate-400">Grand Total:</span>
              <span className="font-mono text-teal-300">{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded font-bold text-xs tracking-wider transition"
          >
            POST PURCHASE VOUCHER (Enter)
          </button>
        </div>
      </form>
    </div>
  );
}
