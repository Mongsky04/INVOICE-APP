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
      <div>
        <h2 className="text-lg font-semibold text-slate-100">
          Data Pengirim &amp; Penerima
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Isi informasi pengirim dan penerima barang
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pengirim */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <h3 className="font-medium text-cyan-400 text-sm uppercase tracking-wider">
              Pengirim
            </h3>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Nama</label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition text-sm"
              placeholder="Nama pengirim"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">
              Alamat
            </label>
            <textarea
              value={senderAddress}
              onChange={(e) => setSenderAddress(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition text-sm resize-none"
              placeholder="Alamat lengkap pengirim"
              rows={3}
              required
            />
          </div>
        </div>

        {/* Penerima */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-400" />
            <h3 className="font-medium text-purple-400 text-sm uppercase tracking-wider">
              Penerima
            </h3>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Nama</label>
            <input
              type="text"
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition text-sm"
              placeholder="Nama penerima"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">
              Alamat
            </label>
            <textarea
              value={receiverAddress}
              onChange={(e) => setReceiverAddress(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition text-sm resize-none"
              placeholder="Alamat lengkap penerima"
              rows={3}
              required
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={!isValid}
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
    </form>
  );
}
