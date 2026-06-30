"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useKeyboard } from "@/context/KeyboardContext";
import { Calculator } from "./Calculator";
import { CommandPalette } from "./CommandPalette";
import { LogOut, Search, Calculator as CalcIcon } from "lucide-react";

interface TallyLayoutProps {
  children: React.ReactNode;
}

export const TallyLayout: React.FC<TallyLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isCalculatorOpen, setCalculatorOpen, isSearchOpen, setSearchOpen } = useKeyboard();
  const [activeCompany, setActiveCompany] = useState<{ id: number; name: string } | null>(null);
  const [userEmail, setUserEmail] = useState("");

  // Re-read local storage on load/navigation
  useEffect(() => {
    const token = localStorage.getItem("smarterp_token");
    if (!token && pathname !== "/login") {
      router.push("/login");
      return;
    }

    const email = localStorage.getItem("smarterp_email") || "";
    setUserEmail(email);

    const compJson = localStorage.getItem("smarterp_active_company");
    if (compJson) {
      try {
        setActiveCompany(JSON.parse(compJson));
      } catch {
        setActiveCompany(null);
      }
    } else {
      setActiveCompany(null);
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("smarterp_token");
    localStorage.removeItem("smarterp_email");
    localStorage.removeItem("smarterp_active_company");
    router.push("/login");
  };

  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Tally side panel items
  const sidebarButtons = [
    { label: "F1: Select Comp", path: "/companies", shortcut: "F1" },
    { label: "Ctrl+H: Dashboard", path: "/dashboard", shortcut: "Ctrl+H" },
    { label: "F5: Payment", path: "/vouchers/payment", shortcut: "F5" },
    { label: "F6: Receipt", path: "/vouchers/receipt", shortcut: "F6" },
    { label: "F7: Journal", path: "/vouchers/journal", shortcut: "F7" },
    { label: "F8: Sales", path: "/vouchers/sales", shortcut: "F8" },
    { label: "F9: Purchase", path: "/vouchers/purchase", shortcut: "F9" },
    { label: "Alt+L: Cr Ledger", path: "/masters/ledgers/create", shortcut: "Alt+L" },
    { label: "Alt+S: Cr Item", path: "/masters/items/create", shortcut: "Alt+S" },
    { label: "Alt+B: Bal Sheet", path: "/reports/balance-sheet", shortcut: "Alt+B" },
    { label: "Alt+P: Profit Loss", path: "/reports/profit-loss", shortcut: "Alt+P" },
    { label: "Alt+R: Stock Summary", path: "/reports/stock-summary", shortcut: "Alt+R" },
    { label: "Esc: Quit/Back", path: "/dashboard", shortcut: "Esc" }
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans select-none text-slate-100">
      {/* Tally Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 text-xs px-4 py-2 flex items-center justify-between font-mono shadow-md">
        <div className="flex items-center space-x-6">
          <span className="font-extrabold text-teal-400 tracking-widest text-sm cursor-pointer" onClick={() => router.push("/dashboard")}>
            SmartERP
          </span>
          <span className="text-slate-400">|</span>
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">Company:</span>
            <span className="text-teal-300 font-semibold">{activeCompany ? activeCompany.name : "None Selected (F1)"}</span>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <button 
            onClick={() => setSearchOpen(true)}
            className="flex items-center space-x-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-300"
          >
            <Search size={12} />
            <span>Search (Ctrl+K)</span>
          </button>

          <button 
            onClick={() => setCalculatorOpen(!isCalculatorOpen)}
            className="flex items-center space-x-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-300"
          >
            <CalcIcon size={12} />
            <span>Calc (F4)</span>
          </button>

          <span className="text-slate-500">{userEmail}</span>
          <button 
            onClick={handleLogout}
            className="text-rose-400 hover:text-rose-300 flex items-center space-x-1 transition"
          >
            <LogOut size={12} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Screen Content (Left/Center) */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6 relative">
          {!activeCompany && pathname !== "/companies" ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <h2 className="text-2xl font-bold text-slate-300">No Company Selected</h2>
              <p className="text-slate-500 text-sm">Please select or create a company to begin accounting operations.</p>
              <button 
                onClick={() => router.push("/companies")}
                className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium shadow-md transition"
              >
                Go to Company Selection (F1)
              </button>
            </div>
          ) : (
            children
          )}
        </main>

        {/* Tally Right Panel Shortcuts Button Bar */}
        <aside className="w-52 bg-slate-900 border-l border-slate-800 flex flex-col p-2 space-y-1.5 overflow-y-auto font-mono text-[11px]">
          <div className="text-slate-500 font-bold uppercase tracking-wider px-2 py-1 border-b border-slate-800 mb-2">
            Quick Actions
          </div>
          {sidebarButtons.map((btn) => (
            <button
              key={btn.label}
              onClick={() => {
                if (btn.shortcut === "Esc") {
                  if (pathname !== "/dashboard") router.push("/dashboard");
                } else {
                  router.push(btn.path);
                }
              }}
              className={`w-full text-left px-3 py-2 rounded transition flex items-center justify-between border ${
                pathname === btn.path
                  ? "bg-teal-950/40 border-teal-800 text-teal-300 font-semibold"
                  : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700"
              }`}
            >
              <span>{btn.label}</span>
            </button>
          ))}
        </aside>
      </div>

      {/* Overlays */}
      <Calculator isOpen={isCalculatorOpen} onClose={() => setCalculatorOpen(false)} />
      <CommandPalette isOpen={isSearchOpen} onClose={() => setSearchOpen(false)} />

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 text-[10px] text-slate-500 px-4 py-1.5 flex items-center justify-between font-mono">
        <span>Tally-like Keyboard-First Gateway UI</span>
        <span className="text-teal-600">SmartERP v1.0.0</span>
      </footer>
    </div>
  );
};
