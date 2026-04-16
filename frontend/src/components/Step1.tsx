import { useState, FormEvent } from "react";
import { useInvoiceFormStore } from "@/stores/invoiceFormStore";

export default function Step1() {
  const store = useInvoiceFormStore();
  const [senderName, setSenderName] = useState(store.sender_name);
  const [senderAddress, setSenderAddress] = useState(store.sender_address);
  const [receiverName, setReceiverName] = useState(store.receiver_name);
  const [receiverAddress, setReceiverAddress] = useState(
    store.receiver_address,
  );

  const handleNext = (e: FormEvent) => {
    e.preventDefault();
    store.setStep1({
      sender_name: senderName,
      sender_address: senderAddress,
      receiver_name: receiverName,
      receiver_address: receiverAddress,
    });
    store.setStep(2);
  };

  const isValid =
    senderName && senderAddress && receiverName && receiverAddress;

  return (
    <form onSubmit={handleNext} className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">
        Step 1 — Data Pengirim &amp; Penerima
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-medium text-gray-700">Pengirim</h3>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Nama Pengirim
            </label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Masukkan nama pengirim"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Alamat Pengirim
            </label>
            <textarea
              value={senderAddress}
              onChange={(e) => setSenderAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Masukkan alamat pengirim"
              rows={3}
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-gray-700">Penerima</h3>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Nama Penerima
            </label>
            <input
              type="text"
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Masukkan nama penerima"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Alamat Penerima
            </label>
            <textarea
              value={receiverAddress}
              onChange={(e) => setReceiverAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Masukkan alamat penerima"
              rows={3}
              required
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!isValid}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Selanjutnya →
        </button>
      </div>
    </form>
  );
}
