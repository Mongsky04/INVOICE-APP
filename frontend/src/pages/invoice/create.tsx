import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/stores/authStore";
import { useInvoiceFormStore } from "@/stores/invoiceFormStore";
import Step1 from "@/components/Step1";
import Step2 from "@/components/Step2";
import Step3 from "@/components/Step3";

const steps = ["Data Klien", "Data Barang", "Review & Cetak"];

export default function CreateInvoice() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const username = useAuthStore((s) => s.username);
  const role = useAuthStore((s) => s.role);
  const logout = useAuthStore((s) => s.logout);
  const currentStep = useInvoiceFormStore((s) => s.currentStep);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, [router, isAuthenticated]);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navbar */}
      <nav className="bg-slate-900 border-b border-slate-700/50 sticky top-0 z-20 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <span className="text-slate-100 font-semibold tracking-tight">
              Fleetify Invoice
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">{username}</span>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                role === "admin"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
              }`}
            >
              {role}
            </span>
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="text-sm text-slate-500 hover:text-red-400 transition ml-1"
            >
              Keluar
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Stepper */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((label, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold transition-all ${
                    currentStep > i + 1
                      ? "bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/30"
                      : currentStep === i + 1
                        ? "bg-gradient-to-br from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/20"
                        : "bg-slate-800 text-slate-500 border border-slate-700"
                  }`}
                >
                  {currentStep > i + 1 ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`mt-1.5 text-xs font-medium whitespace-nowrap ${
                    currentStep === i + 1
                      ? "text-cyan-400"
                      : currentStep > i + 1
                        ? "text-slate-400"
                        : "text-slate-600"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-16 h-px mx-3 mb-5 ${currentStep > i + 1 ? "bg-cyan-500/50" : "bg-slate-700"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl p-6">
          {currentStep === 1 && <Step1 />}
          {currentStep === 2 && <Step2 />}
          {currentStep === 3 && <Step3 />}
        </div>
      </div>
    </div>
  );
}
