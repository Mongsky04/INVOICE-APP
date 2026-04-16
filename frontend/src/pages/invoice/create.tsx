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
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-800">Invoice App</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {username}{" "}
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                {role}
              </span>
            </span>
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Stepper */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((label, i) => (
            <div key={i} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep > i + 1
                    ? "bg-green-500 text-white"
                    : currentStep === i + 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {currentStep > i + 1 ? "✓" : i + 1}
              </div>
              <span
                className={`ml-2 text-sm ${
                  currentStep === i + 1
                    ? "text-blue-600 font-medium"
                    : "text-gray-400"
                }`}
              >
                {label}
              </span>
              {i < steps.length - 1 && (
                <div
                  className={`w-12 h-0.5 mx-3 ${
                    currentStep > i + 1 ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {currentStep === 1 && <Step1 />}
          {currentStep === 2 && <Step2 />}
          {currentStep === 3 && <Step3 />}
        </div>
      </div>
    </div>
  );
}
