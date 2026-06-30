"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";
import { Plus, Building, Calendar, MapPin, ArrowRight } from "lucide-react";

interface Company {
  id: number;
  name: string;
  gstNumber: string;
  financialYear: string;
  address: string;
  state: string;
  contactInfo: string;
}

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [financialYear, setFinancialYear] = useState("2026-2027");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [error, setError] = useState("");

  const loadCompanies = async () => {
    try {
      const data = await apiFetch("/api/companies");
      setCompanies(data);
    } catch (err: any) {
      setError(err.message || "Failed to load companies");
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleSelectCompany = (company: Company) => {
    localStorage.setItem("smarterp_active_company", JSON.stringify(company));
    // Trigger seed for account groups
    apiFetch(`/api/ledgers/groups?companyId=${company.id}`).catch(() => {});
    router.push("/dashboard");
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (companies.length >= 5) {
      setError("Maximum limit of 5 companies reached!");
      return;
    }

    try {
      const newCompany = await apiFetch("/api/companies", {
        method: "POST",
        body: JSON.stringify({ name, gstNumber, financialYear, address, state, contactInfo }),
      });
      setShowCreateForm(false);
      setName("");
      setGstNumber("");
      setAddress("");
      setState("");
      setContactInfo("");
      loadCompanies();
      handleSelectCompany(newCompany);
    } catch (err: any) {
      setError(err.message || "Failed to create company");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-teal-400 tracking-wider">Company Management</h1>
          <p className="text-slate-500 text-xs mt-1">Select an active company or create a new one (Limit: 5)</p>
        </div>
        {!showCreateForm && companies.length < 5 && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-semibold transition"
          >
            <Plus size={16} />
            <span>Create Company</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-lg font-medium">
          {error}
        </div>
      )}

      {showCreateForm ? (
        <div className="bg-slate-900 border border-slate-850 rounded-xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-slate-300 mb-6 flex items-center space-x-2">
            <Building className="text-teal-400" size={20} />
            <span>Create New Company</span>
          </h2>
          <form onSubmit={handleCreateCompany} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Company Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Apex Trading LLC"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:border-teal-500 focus:outline-none text-sm transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">GST Number</label>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                placeholder="e.g., 27AAAAA1111A1Z1"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:border-teal-500 focus:outline-none text-sm transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Financial Year</label>
              <input
                type="text"
                required
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                placeholder="e.g., 2026-2027"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:border-teal-500 focus:outline-none text-sm transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact Info</label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="e.g., phone or email"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:border-teal-500 focus:outline-none text-sm transition"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full address of the company..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:border-teal-500 focus:outline-none text-sm transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g., Maharashtra"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:border-teal-500 focus:outline-none text-sm transition"
              />
            </div>

            <div className="md:col-span-2 flex justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-semibold transition"
              >
                Create & Select
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {companies.length > 0 ? (
            companies.map((comp) => (
              <div
                key={comp.id}
                onClick={() => handleSelectCompany(comp)}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-teal-500/50 hover:bg-slate-900/80 cursor-pointer shadow-md group transition duration-300"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-slate-200 group-hover:text-teal-400 transition">
                      {comp.name}
                    </h3>
                    <div className="space-y-1.5 text-xs text-slate-500 font-mono">
                      <div className="flex items-center space-x-2">
                        <Calendar size={12} />
                        <span>F.Y. {comp.financialYear}</span>
                      </div>
                      {comp.gstNumber && (
                        <div>GSTIN: <span className="text-slate-400">{comp.gstNumber}</span></div>
                      )}
                      {comp.state && (
                        <div className="flex items-center space-x-2">
                          <MapPin size={12} />
                          <span>{comp.state}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-2 bg-slate-800 group-hover:bg-teal-600/20 group-hover:text-teal-400 text-slate-500 rounded-lg transition">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-12 border border-dashed border-slate-800 rounded-xl">
              <Building className="mx-auto text-slate-600 mb-3" size={32} />
              <p className="text-slate-500 text-sm">No companies registered yet. Create one to begin!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
