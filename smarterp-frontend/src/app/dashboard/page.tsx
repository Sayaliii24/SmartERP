"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface MenuItem {
  name: string;
  path: string;
  group: "MASTERS" | "TRANSACTIONS" | "REPORTS";
  hotkey: string; // The letter to press to trigger immediately
}

const menuItems: MenuItem[] = [
  { name: "Create Ledger", path: "/masters/ledgers/create", group: "MASTERS", hotkey: "l" },
  { name: "Alter Ledgers", path: "/masters/ledgers", group: "MASTERS", hotkey: "a" },
  { name: "Create Stock Item", path: "/masters/items/create", group: "MASTERS", hotkey: "s" },
  { name: "Sales Voucher", path: "/vouchers/sales", group: "TRANSACTIONS", hotkey: "v" },
  { name: "Purchase Voucher", path: "/vouchers/purchase", group: "TRANSACTIONS", hotkey: "p" },
  { name: "Balance Sheet", path: "/reports/balance-sheet", group: "REPORTS", hotkey: "b" },
  { name: "Profit & Loss", path: "/reports/profit-loss", group: "REPORTS", hotkey: "d" },
  { name: "Stock Summary", path: "/reports/stock-summary", group: "REPORTS", hotkey: "r" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [activeCompany, setActiveCompany] = useState<{ name: string; financialYear: string; gstNumber?: string } | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const compJson = localStorage.getItem("smarterp_active_company");
    if (compJson) {
      try {
        setActiveCompany(JSON.parse(compJson));
      } catch {
        setActiveCompany(null);
      }
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid hotkeys when typing in input
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % menuItems.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + menuItems.length) % menuItems.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        router.push(menuItems[selectedIndex].path);
      } else {
        // Hotkey selection
        const key = e.key.toLowerCase();
        const found = menuItems.find((item) => item.hotkey === key);
        if (found) {
          e.preventDefault();
          router.push(found.path);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, router]);

  const activeGroupItems = (groupName: "MASTERS" | "TRANSACTIONS" | "REPORTS") => {
    return menuItems.map((item, idx) => ({ ...item, globalIdx: idx })).filter(item => item.group === groupName);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-8 h-full max-w-6xl mx-auto py-4 font-mono">
      {/* Left Info Panel */}
      <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between text-xs space-y-6 shadow-md text-slate-400">
        <div>
          <div className="text-teal-400 font-bold uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
            Current Status
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-slate-500 font-semibold mb-1">CURRENT COMPANY:</div>
              <div className="text-sm font-bold text-slate-200">{activeCompany?.name || "None Selected"}</div>
            </div>
            <div>
              <div className="text-slate-500 font-semibold mb-1">FINANCIAL YEAR:</div>
              <div className="text-sm font-bold text-slate-200">{activeCompany?.financialYear || "N/A"}</div>
            </div>
            {activeCompany?.gstNumber && (
              <div>
                <div className="text-slate-500 font-semibold mb-1">GSTIN:</div>
                <div className="text-sm font-bold text-slate-200">{activeCompany.gstNumber}</div>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg text-slate-500 text-[11px] leading-relaxed">
          <span className="text-teal-400 font-bold">Tip:</span> Use <span className="text-slate-300 font-bold">Arrow Keys</span> to navigate the menu on the right. Press the <span className="text-teal-400 font-bold underline">underlined letter</span> as a hotkey to select immediately!
        </div>
      </div>

      {/* Right Menu Panel (Gateway of Tally) */}
      <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-xl shadow-lg flex flex-col overflow-hidden">
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <span className="text-teal-400 font-bold tracking-widest uppercase text-sm">Gateway of SmartERP</span>
          <span className="text-slate-500 text-[10px]">Tally Gateway Menu</span>
        </div>

        <div className="p-6 flex-1 flex flex-col space-y-6">
          {(["MASTERS", "TRANSACTIONS", "REPORTS"] as const).map((groupName) => (
            <div key={groupName} className="space-y-2">
              <div className="text-[11px] font-bold text-slate-500 tracking-widest uppercase border-b border-slate-800/40 pb-1 mb-3">
                {groupName}
              </div>
              <div className="space-y-1">
                {activeGroupItems(groupName).map((item) => {
                  const isActive = item.globalIdx === selectedIndex;
                  // Capitalize the hotkey character in the label
                  const nameParts = item.name.split("");
                  const hotkeyIndex = item.name.toLowerCase().indexOf(item.hotkey);
                  
                  return (
                    <div
                      key={item.name}
                      onClick={() => router.push(item.path)}
                      className={`px-4 py-2.5 rounded-lg cursor-pointer flex items-center justify-between text-sm transition ${
                        isActive
                          ? "bg-teal-600 text-white font-bold"
                          : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <span>
                        {hotkeyIndex !== -1 ? (
                          <>
                            {item.name.substring(0, hotkeyIndex)}
                            <span className={`underline font-extrabold ${isActive ? "text-white" : "text-teal-400"}`}>
                              {item.name.charAt(hotkeyIndex)}
                            </span>
                            {item.name.substring(hotkeyIndex + 1)}
                          </>
                        ) : (
                          item.name
                        )}
                      </span>
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                        isActive ? "bg-teal-700 text-teal-200" : "bg-slate-950 text-slate-500 border border-slate-800"
                      }`}>
                        {item.hotkey}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
