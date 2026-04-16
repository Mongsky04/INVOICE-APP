import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { InvoiceDetail } from "@/types";

interface InvoiceFormState {
  currentStep: number;
  // Step 1
  sender_name: string;
  sender_address: string;
  receiver_name: string;
  receiver_address: string;
  // Step 2
  details: InvoiceDetail[];
  // Actions
  setStep: (step: number) => void;
  setStep1: (data: {
    sender_name: string;
    sender_address: string;
    receiver_name: string;
    receiver_address: string;
  }) => void;
  setDetails: (details: InvoiceDetail[]) => void;
  addDetail: (detail: InvoiceDetail) => void;
  removeDetail: (index: number) => void;
  updateDetail: (index: number, detail: InvoiceDetail) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 1,
  sender_name: "",
  sender_address: "",
  receiver_name: "",
  receiver_address: "",
  details: [] as InvoiceDetail[],
};

export const useInvoiceFormStore = create<InvoiceFormState>()(
  persist(
    (set) => ({
      ...initialState,
      setStep: (step) => set({ currentStep: step }),
      setStep1: (data) => set(data),
      setDetails: (details) => set({ details }),
      addDetail: (detail) =>
        set((state) => ({ details: [...state.details, detail] })),
      removeDetail: (index) =>
        set((state) => ({
          details: state.details.filter((_, i) => i !== index),
        })),
      updateDetail: (index, detail) =>
        set((state) => ({
          details: state.details.map((d, i) => (i === index ? detail : d)),
        })),
      reset: () => set(initialState),
    }),
    {
      name: "invoice-form-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
