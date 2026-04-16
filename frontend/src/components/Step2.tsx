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
      <h2 className="text-lg font-semibold text-gray-800">
        Step 2 — Data Barang
      </h2>

      {/* Input Search */}
      <div className="bg-gray-50 p-4 rounded-md border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">
              Kode Barang
            </label>
            <input
              type="text"
              value={codeInput}
              onChange={(e) => {
                setCodeInput(e.target.value);
                setSelectedItem(null);
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Ketik kode barang (cth: BRG-001)"
            />
            {loading && (
              <p className="text-xs text-gray-400 mt-1">Mencari...</p>
            )}
            {/* Suggestions dropdown */}
            {suggestions.length > 0 && !selectedItem && (
              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-800"
                  >
                    <span className="font-mono text-blue-600">{item.code}</span>{" "}
                    — {item.name} ({item.unit}) — Rp{" "}
                    {item.price.toLocaleString("id-ID")}
                  </li>
                ))}
              </ul>
            )}
            {selectedItem && (
              <p className="text-xs text-green-600 mt-1">
                ✓ {selectedItem.name} — Rp{" "}
                {selectedItem.price.toLocaleString("id-ID")}/{selectedItem.unit}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Qty</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min={1}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
        </div>
        <button
          onClick={handleAddItem}
          disabled={!selectedItem}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
        >
          + Tambah Barang
        </button>
      </div>

      {/* Items table */}
      {store.details.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-3 py-2 text-left text-gray-700">
                  No
                </th>
                <th className="border border-gray-200 px-3 py-2 text-left text-gray-700">
                  Kode
                </th>
                <th className="border border-gray-200 px-3 py-2 text-left text-gray-700">
                  Nama Barang
                </th>
                <th className="border border-gray-200 px-3 py-2 text-center text-gray-700">
                  Qty
                </th>
                <th className="border border-gray-200 px-3 py-2 text-right text-gray-700">
                  Harga
                </th>
                <th className="border border-gray-200 px-3 py-2 text-right text-gray-700">
                  Subtotal
                </th>
                <th className="border border-gray-200 px-3 py-2 text-center text-gray-700">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {store.details.map((d, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-3 py-2 text-gray-800">
                    {i + 1}
                  </td>
                  <td className="border border-gray-200 px-3 py-2 font-mono text-blue-600">
                    {d.code}
                  </td>
                  <td className="border border-gray-200 px-3 py-2 text-gray-800">
                    {d.name}
                  </td>
                  <td className="border border-gray-200 px-3 py-2 text-center text-gray-800">
                    {d.quantity} {d.unit}
                  </td>
                  <td className="border border-gray-200 px-3 py-2 text-right text-gray-800">
                    Rp {d.price.toLocaleString("id-ID")}
                  </td>
                  <td className="border border-gray-200 px-3 py-2 text-right font-medium text-gray-800">
                    Rp {d.subtotal.toLocaleString("id-ID")}
                  </td>
                  <td className="border border-gray-200 px-3 py-2 text-center">
                    <button
                      onClick={() => handleRemoveItem(i)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-semibold">
                <td
                  colSpan={5}
                  className="border border-gray-200 px-3 py-2 text-right text-gray-800"
                >
                  Grand Total
                </td>
                <td className="border border-gray-200 px-3 py-2 text-right text-gray-800">
                  Rp {grandTotal.toLocaleString("id-ID")}
                </td>
                <td className="border border-gray-200 px-3 py-2" />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => store.setStep(1)}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition"
        >
          ← Kembali
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
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Selanjutnya →
        </button>
      </div>
    </div>
  );
}
