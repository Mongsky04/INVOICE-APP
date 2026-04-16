import { useState } from "react";
import { useInvoiceFormStore } from "@/stores/invoiceFormStore";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import type { Invoice } from "@/types";

export default function Step3() {
  const store = useInvoiceFormStore();
  const role = useAuthStore((s) => s.role);
  const [submitting, setSubmitting] = useState(false);
  const [submittedInvoice, setSubmittedInvoice] = useState<Invoice | null>(
    null,
  );

  const grandTotal = store.details.reduce((sum, d) => sum + d.subtotal, 0);
  const isKerani = role === "kerani";

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Role-based payload transformation
      const payload = {
        sender_name: store.sender_name,
        sender_address: store.sender_address,
        receiver_name: store.receiver_name,
        receiver_address: store.receiver_address,
        details: store.details.map((d) => {
          if (isKerani) {
            // Kerani: hapus harga dan total dari payload
            return {
              item_id: d.item_id,
              quantity: d.quantity,
            };
          }
          // Admin: kirim utuh
          return {
            item_id: d.item_id,
            quantity: d.quantity,
            price: d.price,
            subtotal: d.subtotal,
          };
        }),
      };

      const res = await api.post<Invoice>("/invoices", payload);
      setSubmittedInvoice(res.data);
      toast.success("Invoice berhasil dibuat!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Gagal membuat invoice");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = async (inv: Invoice) => {
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const tanggal = new Date(inv.created_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const detailRows = inv.details
        .map(
          (d, i) => `
          <tr>
            <td style="border:1px solid #bbb;padding:8px 10px;text-align:center;">${i + 1}</td>
            <td style="border:1px solid #bbb;padding:8px 10px;">${d.item?.name || "-"}</td>
            <td style="border:1px solid #bbb;padding:8px 10px;text-align:center;">${d.quantity}</td>
            <td style="border:1px solid #bbb;padding:8px 10px;text-align:right;">Rp ${d.price.toLocaleString("id-ID")}</td>
            <td style="border:1px solid #bbb;padding:8px 10px;text-align:right;">Rp ${d.subtotal.toLocaleString("id-ID")}</td>
          </tr>`,
        )
        .join("");

      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.width = "794px";
      container.style.background = "white";
      container.innerHTML = `
    <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#222;font-size:13px;line-height:1.5;padding:30px 40px;">
      <div style="text-align:center;padding-bottom:14px;border-bottom:3px double #333;margin-bottom:20px;">
        <h1 style="font-size:26px;letter-spacing:3px;margin:0 0 2px 0;color:#1a1a1a;">FLEETIFY LOGISTICS</h1>
        <p style="font-size:11px;color:#555;margin:2px 0;">Jl. Logistik Raya No. 123, Kelapa Gading, Jakarta Utara 14240</p>
        <p style="font-size:11px;color:#555;margin:2px 0;">Telp: (021) 456-7890 | Email: info@fleetify.co.id</p>
      </div>
      <h2 style="text-align:center;font-size:18px;margin:0 0 20px 0;letter-spacing:1px;">INVOICE / RESI PENGIRIMAN</h2>
      <div style="margin-bottom:20px;">
        <p style="margin:2px 0;"><strong>No. Invoice:</strong> ${inv.invoice_number}</p>
        <p style="margin:2px 0;"><strong>Tanggal:</strong> ${tanggal}</p>
      </div>
      <table style="width:100%;margin-bottom:24px;border-spacing:10px 0;border-collapse:separate;">
        <tr>
          <td style="width:48%;vertical-align:top;padding:12px;border:1px solid #ddd;background:#fafafa;">
            <p style="font-size:11px;text-transform:uppercase;color:#777;margin:0 0 6px 0;border-bottom:1px solid #ddd;padding-bottom:4px;">Pengirim</p>
            <p style="font-weight:bold;font-size:14px;margin:2px 0;">${inv.sender_name}</p>
            <p style="font-size:12px;color:#444;margin:2px 0;">${inv.sender_address}</p>
          </td>
          <td style="width:48%;vertical-align:top;padding:12px;border:1px solid #ddd;background:#fafafa;">
            <p style="font-size:11px;text-transform:uppercase;color:#777;margin:0 0 6px 0;border-bottom:1px solid #ddd;padding-bottom:4px;">Penerima</p>
            <p style="font-weight:bold;font-size:14px;margin:2px 0;">${inv.receiver_name}</p>
            <p style="font-size:12px;color:#444;margin:2px 0;">${inv.receiver_address}</p>
          </td>
        </tr>
      </table>
      <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
        <thead>
          <tr style="background:#e8e8e8;">
            <th style="border:1px solid #bbb;padding:8px 10px;text-align:center;font-size:12px;width:40px;">No</th>
            <th style="border:1px solid #bbb;padding:8px 10px;text-align:left;font-size:12px;">Nama Barang</th>
            <th style="border:1px solid #bbb;padding:8px 10px;text-align:center;font-size:12px;width:60px;">Qty</th>
            <th style="border:1px solid #bbb;padding:8px 10px;text-align:right;font-size:12px;width:120px;">Harga Satuan</th>
            <th style="border:1px solid #bbb;padding:8px 10px;text-align:right;font-size:12px;width:120px;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${detailRows}</tbody>
        <tfoot>
          <tr style="background:#f0f0f0;font-weight:bold;">
            <td colspan="4" style="border:1px solid #bbb;padding:10px;text-align:right;font-size:14px;">GRAND TOTAL</td>
            <td style="border:1px solid #bbb;padding:10px;text-align:right;font-size:14px;">Rp ${inv.total_amount.toLocaleString("id-ID")}</td>
          </tr>
        </tfoot>
      </table>
      <table style="width:100%;margin-top:60px;">
        <tr>
          <td style="width:50%;text-align:center;">
            <div style="margin-top:80px;border-top:1px solid #333;width:180px;margin-left:auto;margin-right:auto;padding-top:6px;font-size:12px;">Pengirim</div>
          </td>
          <td style="width:50%;text-align:center;">
            <div style="margin-top:80px;border-top:1px solid #333;width:180px;margin-left:auto;margin-right:auto;padding-top:6px;font-size:12px;">Penerima</div>
          </td>
        </tr>
      </table>
      <div style="margin-top:40px;text-align:center;font-size:10px;color:#999;border-top:1px solid #eee;padding-top:8px;">
        Dokumen ini dicetak secara otomatis oleh sistem Fleetify Invoice App.
      </div>
    </div>`;

      document.body.appendChild(container);

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${inv.invoice_number}.pdf`);

      document.body.removeChild(container);
      toast.success("PDF berhasil didownload!");
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Gagal generate PDF");
    }
  };

  if (submittedInvoice) {
    return (
      <div className="space-y-6">
        {/* Success banner */}
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-cyan-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <p className="text-cyan-300 font-semibold">
              Invoice Berhasil Dibuat
            </p>
            <p className="text-cyan-500 text-sm font-mono mt-0.5">
              {submittedInvoice.invoice_number}
            </p>
          </div>
        </div>

        {/* Detail card */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 space-y-5">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wider text-cyan-500 font-medium">
                Pengirim
              </p>
              <p className="font-semibold text-slate-100">
                {submittedInvoice.sender_name}
              </p>
              <p className="text-slate-400 text-xs">
                {submittedInvoice.sender_address}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wider text-purple-400 font-medium">
                Penerima
              </p>
              <p className="font-semibold text-slate-100">
                {submittedInvoice.receiver_name}
              </p>
              <p className="text-slate-400 text-xs">
                {submittedInvoice.receiver_address}
              </p>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden border border-slate-700/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-2.5 text-left">Barang</th>
                  <th className="px-4 py-2.5 text-center">Qty</th>
                  <th className="px-4 py-2.5 text-right">Harga</th>
                  <th className="px-4 py-2.5 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {submittedInvoice.details.map((d) => (
                  <tr key={d.id} className="bg-slate-900/50">
                    <td className="px-4 py-2.5 text-slate-200">
                      {d.item?.name || "-"}
                    </td>
                    <td className="px-4 py-2.5 text-center text-slate-300">
                      {d.quantity}
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-300">
                      Rp {d.price.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-100 font-medium">
                      Rp {d.subtotal.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-right">
            <span className="text-slate-400 text-sm">Total </span>
            <span className="font-bold text-xl text-cyan-400">
              Rp {submittedInvoice.total_amount.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        <div className="flex justify-between pt-2">
          <button
            onClick={() => {
              setSubmittedInvoice(null);
              store.reset();
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-5 py-2.5 rounded-xl transition text-sm"
          >
            Buat Invoice Baru
          </button>
          <button
            onClick={() => submittedInvoice && handlePrint(submittedInvoice)}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-500/20 text-sm flex items-center gap-2"
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
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Cetak Invoice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">
          Review &amp; Submit
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Periksa kembali data sebelum mengirim
        </p>
      </div>

      {isKerani && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-sm text-yellow-300 flex items-center gap-2">
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          Login sebagai <strong className="text-yellow-200">Kerani</strong> —
          data harga &amp; total tidak akan dikirim ke server.
        </div>
      )}

      {/* Pengirim & Penerima */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-4">
          Data Pengirim &amp; Penerima
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-xs text-cyan-500 font-medium uppercase tracking-wider">
              Pengirim
            </p>
            <p className="font-semibold text-slate-100">{store.sender_name}</p>
            <p className="text-slate-400 text-xs">{store.sender_address}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-purple-400 font-medium uppercase tracking-wider">
              Penerima
            </p>
            <p className="font-semibold text-slate-100">
              {store.receiver_name}
            </p>
            <p className="text-slate-400 text-xs">{store.receiver_address}</p>
          </div>
        </div>
      </div>

      {/* Daftar Barang */}
      <div className="rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="bg-slate-800 px-4 py-3">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">
            Daftar Barang
          </p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800/50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="px-4 py-2.5 text-left">No</th>
              <th className="px-4 py-2.5 text-left">Kode</th>
              <th className="px-4 py-2.5 text-left">Nama</th>
              <th className="px-4 py-2.5 text-center">Qty</th>
              {!isKerani && (
                <>
                  <th className="px-4 py-2.5 text-right">Harga</th>
                  <th className="px-4 py-2.5 text-right">Subtotal</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {store.details.map((d, i) => (
              <tr
                key={i}
                className="bg-slate-900/50 hover:bg-slate-800/30 transition"
              >
                <td className="px-4 py-2.5 text-slate-500">{i + 1}</td>
                <td className="px-4 py-2.5 font-mono text-cyan-400 text-xs">
                  {d.code}
                </td>
                <td className="px-4 py-2.5 text-slate-200">{d.name}</td>
                <td className="px-4 py-2.5 text-center text-slate-300">
                  {d.quantity} {d.unit}
                </td>
                {!isKerani && (
                  <>
                    <td className="px-4 py-2.5 text-right text-slate-300">
                      Rp {d.price.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold text-slate-100">
                      Rp {d.subtotal.toLocaleString("id-ID")}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {!isKerani && (
          <div className="bg-slate-800/50 px-4 py-3 text-right border-t border-slate-700/50">
            <span className="text-slate-400 text-sm">Grand Total </span>
            <span className="font-bold text-xl text-cyan-400">
              Rp {grandTotal.toLocaleString("id-ID")}
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <button
          onClick={() => store.setStep(2)}
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
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-semibold px-6 py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20 text-sm flex items-center gap-2"
        >
          {submitting ? (
            <>
              <svg
                className="animate-spin w-4 h-4"
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
              Memproses...
            </>
          ) : (
            <>
              Submit Invoice
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
            </>
          )}
        </button>
      </div>
    </div>
  );
}
