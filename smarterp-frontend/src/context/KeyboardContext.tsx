"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

interface KeyboardContextType {
  registerShortcut: (key: string, action: () => void) => void;
  unregisterShortcut: (key: string) => void;
  isCalculatorOpen: boolean;
  setCalculatorOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

const KeyboardContext = createContext<KeyboardContextType | undefined>(undefined);

export const KeyboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [shortcuts, setShortcuts] = useState<Record<string, () => void>>({});
  const [isCalculatorOpen, setCalculatorOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);

  const registerShortcut = useCallback((key: string, action: () => void) => {
    setShortcuts((prev) => ({ ...prev, [key.toLowerCase()]: action }));
  }, []);

  const unregisterShortcut = useCallback((key: string) => {
    setShortcuts((prev) => {
      const copy = { ...prev };
      delete copy[key.toLowerCase()];
      return copy;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.key) return;

      // 1. Construct shortcut string
      let keyCombo = "";
      if (e.ctrlKey) keyCombo += "ctrl+";
      if (e.altKey) keyCombo += "alt+";
      if (e.shiftKey) keyCombo += "shift+";
      
      // Handle function keys and ESC
      if (e.key.startsWith("F") && e.key.length > 1) {
        keyCombo += e.key.toLowerCase();
      } else if (e.key === "Escape") {
        keyCombo += "escape";
      } else {
        keyCombo += e.key.toLowerCase();
      }

      // Check if input/textarea is focused, except for global keycombos like Ctrl+K or F-keys
      const activeEl = document.activeElement;
      const isInputFocused =
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true");

      // Global intercepts (even if input is focused)
      if (keyCombo === "ctrl+k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
        return;
      }
      if (keyCombo === "f4") {
        e.preventDefault();
        setCalculatorOpen((prev) => !prev);
        return;
      }
      
      // Navigation mappings
      const navShortcuts: Record<string, string> = {
        "f1": "/companies",
        "ctrl+h": "/dashboard",
        "alt+l": "/masters/ledgers/create",
        "alt+a": "/masters/ledgers",
        "alt+g": "/masters/groups/create",
        "alt+s": "/masters/items/create",
        "f5": "/vouchers/payment",
        "f6": "/vouchers/receipt",
        "f7": "/vouchers/journal",
        "f8": "/vouchers/sales",
        "f9": "/vouchers/purchase",
        "alt+b": "/reports/balance-sheet",
        "alt+p": "/reports/profit-loss",
        "alt+r": "/reports/stock-summary"
      };

      if (navShortcuts[keyCombo]) {
        e.preventDefault();
        router.push(navShortcuts[keyCombo]);
        return;
      }

      if (keyCombo === "escape") {
        // Go back in navigation, unless custom registered
        if (shortcuts["escape"]) {
          shortcuts["escape"]();
        } else {
          // Go back up one directory level or to dashboard
          if (pathname !== "/dashboard" && pathname !== "/login" && pathname !== "/companies") {
            e.preventDefault();
            router.push("/dashboard");
          }
        }
        return;
      }

      // If input is focused, don't run custom shortcuts (like letter keys)
      if (isInputFocused) return;

      // Run custom registered shortcuts
      if (shortcuts[keyCombo]) {
        e.preventDefault();
        shortcuts[keyCombo]();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts, router, pathname]);

  return (
    <KeyboardContext.Provider
      value={{
        registerShortcut,
        unregisterShortcut,
        isCalculatorOpen,
        setCalculatorOpen,
        isSearchOpen,
        setSearchOpen,
      }}
    >
      {children}
    </KeyboardContext.Provider>
  );
};

export const useKeyboard = () => {
  const context = useContext(KeyboardContext);
  if (!context) {
    throw new Error("useKeyboard must be used within a KeyboardProvider");
  }
  return context;
};
