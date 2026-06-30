"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = [
    { name: "Company Selection (F1)", path: "/companies" },
    { name: "Dashboard (Ctrl+H)", path: "/dashboard" },
    { name: "Create Ledger (Alt+L)", path: "/masters/ledgers/create" },
    { name: "View Ledgers (Alt+A)", path: "/masters/ledgers" },
    { name: "Create Account Group (Alt+G)", path: "/masters/groups/create" },
    { name: "Create Stock Item (Alt+S)", path: "/masters/items/create" },
    { name: "Sales Voucher (F8)", path: "/vouchers/sales" },
    { name: "Purchase Voucher (F9)", path: "/vouchers/purchase" },
    { name: "Receipt Voucher (F6)", path: "/vouchers/receipt" },
    { name: "Payment Voucher (F5)", path: "/vouchers/payment" },
    { name: "Balance Sheet (Alt+B)", path: "/reports/balance-sheet" },
    { name: "Profit & Loss (Alt+P)", path: "/reports/profit-loss" },
    { name: "Stock Summary (Alt+R)", path: "/reports/stock-summary" },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          router.push(filteredCommands[selectedIndex].path);
          onClose();
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, router, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden text-white">
        <div className="flex items-center px-4 py-3 bg-slate-950 border-b border-slate-800">
          <Search className="text-slate-400 mr-3" size={20} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or screen name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-0 outline-none placeholder-slate-500 text-slate-100 text-base"
          />
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, idx) => (
              <div
                key={cmd.name}
                onClick={() => {
                  router.push(cmd.path);
                  onClose();
                }}
                className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition ${
                  idx === selectedIndex
                    ? "bg-teal-600 text-white font-medium"
                    : "hover:bg-slate-800 text-slate-300"
                }`}
              >
                <span>{cmd.name}</span>
                <span className="text-xs text-slate-400 font-mono">Enter</span>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-slate-500 text-sm">No commands found.</div>
          )}
        </div>
      </div>
    </div>
  );
};
