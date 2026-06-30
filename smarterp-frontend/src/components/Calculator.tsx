"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState("");
  const [result, setResult] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleBtnClick = (val: string) => {
    if (val === "=") {
      try {
        // Safe evaluation using Function constructor
        const evalRes = new Function(`return ${display}`)();
        setResult(evalRes);
        setDisplay(String(evalRes));
      } catch {
        setDisplay("Error");
      }
    } else if (val === "C") {
      setDisplay("");
      setResult(null);
    } else {
      setDisplay((prev) => prev + val);
    }
  };

  const buttons = [
    ["7", "8", "9", "/"],
    ["4", "5", "6", "*"],
    ["1", "2", "3", "-"],
    ["0", ".", "=", "+"],
  ];

  return (
    <div className="fixed bottom-16 right-4 z-50 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden font-mono text-white">
      <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tally Calculator (F4)</span>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition">
          <X size={16} />
        </button>
      </div>
      <div className="p-4 bg-slate-950">
        <div className="h-12 text-right text-xl font-bold px-2 py-1 mb-4 bg-slate-900 rounded border border-slate-800 text-teal-400 overflow-x-auto select-all">
          {display || "0"}
        </div>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => handleBtnClick("C")}
            className="col-span-4 py-2 bg-rose-600 hover:bg-rose-500 rounded font-semibold text-sm transition"
          >
            Clear
          </button>
          {buttons.flat().map((btn) => (
            <button
              key={btn}
              onClick={() => handleBtnClick(btn)}
              className={`py-3 text-lg font-semibold rounded transition ${
                btn === "="
                  ? "bg-teal-600 hover:bg-teal-500 text-white"
                  : ["/", "*", "-", "+"].includes(btn)
                  ? "bg-slate-800 hover:bg-slate-700 text-teal-400"
                  : "bg-slate-700 hover:bg-slate-600 text-slate-100"
              }`}
            >
              {btn}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
