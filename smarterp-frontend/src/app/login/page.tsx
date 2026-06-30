"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // If already logged in, go to companies
    if (localStorage.getItem("smarterp_token")) {
      router.push("/companies");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      if (isRegister) {
        await apiFetch("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        setMessage("Registration successful! You can now log in.");
        setIsRegister(false);
        setPassword("");
      } else {
        const data = await apiFetch("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        localStorage.setItem("smarterp_token", data.token);
        localStorage.setItem("smarterp_email", data.email);
        localStorage.setItem("smarterp_userId", String(data.userId));
        router.push("/companies");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-teal-400 tracking-wider">SmartERP</h1>
          <p className="text-slate-400 text-sm">
            {isRegister ? "Create your ERP account" : "Log in to your business ledger"}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm rounded-lg text-center font-medium">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., accountant@company.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:border-teal-500 focus:outline-none transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:border-teal-500 focus:outline-none transition"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold tracking-wider hover:shadow-lg hover:shadow-teal-600/20 transition duration-200"
          >
            {isRegister ? "REGISTER" : "LOG IN"}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
              setMessage("");
            }}
            className="text-xs font-medium text-teal-400 hover:text-teal-300 transition"
          >
            {isRegister ? "Already have an account? Log In" : "Need a new account? Register here"}
          </button>
        </div>
      </div>
    </div>
  );
}
