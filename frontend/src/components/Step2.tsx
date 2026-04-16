import { useState, useEffect, useRef, useCallback } from "react";
import { useInvoiceFormStore } from "@/stores/invoiceFormStore";
import api from "@/lib/axios";
import type { Item, InvoiceDetail } from "@/types";
import toast from "react-hot-toast";

export default function Step2() {
  const store = useInvoiceFormStore();
  const [codeInput, setCodeInput] = useState("");
  const [suggestions, setSuggestions] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce + AbortController for race condition handling
  const searchItems = useCallback((code: string) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!code.trim()) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    api
      .get<Item[]>("/items", {
        params: { code },
        signal: controller.signal,
      })
      .then((res) => {
        setSuggestions(res.data || []);
      })
      .catch((err) => {
        if (err.name !== "CanceledError") {
          console.error("Search error:", err);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
  }, []);

  // 500ms debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      searchItems(codeInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [codeInput, searchItems]);

  // Cleanup abort controller
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSelectItem = (item: Item) => {
    setSelectedItem(item);
    setCodeInput(item.code);
    setSuggestions([]);
  };

  const handleAddItem = () => {
    if (!selectedItem) {
      toast.error("Pilih barang terlebih dahulu");
      return;
    }
    if (quantity <= 0) {
      toast.error("Quantity harus lebih dari 0");
      return;
    }

    const detail: InvoiceDetail = {
      item_id: selectedItem.id,
      code: selectedItem.code,
      name: selectedItem.name,
      unit: selectedItem.unit,
      quantity,
      price: selectedItem.price,
      subtotal: selectedItem.price * quantity,
    };

    store.addDetail(detail);
    setCodeInput("");
    setSelectedItem(null);
    setQuantity(1);
    toast.success(`${selectedItem.name} ditambahkan`);
  };

  const handleRemoveItem = (index: number) => {
    store.removeDetail(index);
    toast.success("Barang dihapus");
  };

  const grandTotal = store.details.reduce((sum, d) => sum + d.subtotal, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Data Barang</h2>
        <p className="text-slate-500 text-sm mt-1">
          Cari dan tambahkan barang ke invoice
        </p>
      </div>

      {/* Input Search */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <label className="block text-sm text-slate-400 mb-1.5">
              Kode Barang
            </label>
            <input
              type="text"
              value={codeInput}
              onChange={(e) => {
                setCodeInput(e.target.value);
                setSelectedItem(null);
              }}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition text-sm"
              placeholder="Ketik kode barang (cth: BRG-001)"
            />
            {loading && (
              <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                <svg
                  className="animate-spin w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Mencari...
              </p>
            )}
            {/* Suggestions dropdown */}
            {suggestions.length > 0 && !selectedItem && (
              <ul className="absolute z-10 w-full bg-slate-800 border border-slate-600 rounded-xl mt-1 shadow-2xl shadow-black/50 max-h-48 overflow-y-auto">
                {suggestions.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className="px-4 py-2.5 hover:bg-slate-700 cursor-pointer text-sm text-slate-200 flex items-center justify-between gap-2 first:rounded-t-xl last:rounded-b-xl"
                  >
                    <span>
                      <span className="font-mono text-cyan-400">
                        {item.code}
                      </span>
                      <span className="text-slate-400"> — {item.name}</span>
                    </span>
                    <span className="text-slate-500 text-xs whitespace-nowrap">
                      Rp {item.price.toLocaleString("id-ID")}/{item.unit}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {selectedItem && (
              <p className="text-xs text-cyan-400 mt-1.5 flex items-center gap-1">
                <svg
                  className="w-3.5 h-3.5"
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
                {selectedItem.name} — Rp{" "}
                {selectedItem.price.toLocaleString("id-ID")}/{selectedItem.unit}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Qty</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min={1}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition text-sm"
            />
          </div>
        </div>
        <button
          onClick={handleAddItem}
          disabled={!selectedItem}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-4 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition text-sm flex items-center gap-1.5"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Tambah Barang
        </button>
      </div>

      {/* Items table */}
      {store.details.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-700/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left">No</th>
                <th className="px-4 py-3 text-left">Kode</th>
                <th className="px-4 py-3 text-left">Nama Barang</th>
                <th className="px-4 py-3 text-center">Qty</th>
                <th className="px-4 py-3 text-right">Harga</th>
                <th className="px-4 py-3 text-right">Subtotal</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {store.details.map((d, i) => (
                <tr
                  key={i}
                  className="bg-slate-900/50 hover:bg-slate-800/50 transition"
                >
                  <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                  <td className="px-4 py-3 font-mono text-cyan-400 text-xs">
                    {d.code}
                  </td>
                  <td className="px-4 py-3 text-slate-200">{d.name}</td>
                  <td className="px-4 py-3 text-center text-slate-300">
                    {d.quantity} {d.unit}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300">
                    Rp {d.price.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-100">
                    Rp {d.subtotal.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleRemoveItem(i)}
                      className="text-slate-600 hover:text-red-400 transition text-xs font-medium"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-800 border-t border-slate-700">
                <td
                  colSpan={5}
                  className="px-4 py-3 text-right text-slate-400 font-medium text-sm"
                >
                  Grand Total
                </td>
                <td className="px-4 py-3 text-right font-bold text-cyan-400">
                  Rp {grandTotal.toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3" />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <button
          onClick={() => store.setStep(1)}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-5 py-2.5 rounded-xl transition text-sm flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Kembali
        </button>
        <button
          onClick={() => {
            if (store.details.length === 0) {
              toast.error("Tambahkan minimal 1 barang");
              return;
            }
            store.setStep(3);
          }}
          disabled={store.details.length === 0}
          className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-semibold px-6 py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20 text-sm flex items-center gap-2"
        >
          Selanjutnya
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
