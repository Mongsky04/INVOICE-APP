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

  const handlePrint = (inv: Invoice) => {
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

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      toast.error("Popup diblokir browser. Izinkan popup untuk mencetak.");
      return;
    }

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${inv.invoice_number}</title>
  <style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #222; font-size: 13px; line-height: 1.5; background: white; }
    .page { padding: 30mm 20mm; width: 210mm; min-height: 297mm; }
    .header { text-align: center; padding-bottom: 14px; border-bottom: 3px double #333; margin-bottom: 20px; }
    .header h1 { font-size: 26px; letter-spacing: 3px; margin-bottom: 4px; color: #1a1a1a; }
    .header p { font-size: 11px; color: #555; margin: 2px 0; }
    .title { text-align: center; font-size: 18px; margin-bottom: 20px; letter-spacing: 1px; }
    .meta { margin-bottom: 20px; }
    .meta p { margin: 2px 0; }
    .parties { width: 100%; border-collapse: separate; border-spacing: 10px 0; margin-bottom: 24px; }
    .party-cell { width: 48%; vertical-align: top; padding: 12px; border: 1px solid #ddd; background: #fafafa; }
    .party-label { font-size: 11px; text-transform: uppercase; color: #777; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 6px; }
    .party-name { font-weight: bold; font-size: 14px; margin: 2px 0; }
    .party-address { font-size: 12px; color: #444; margin: 2px 0; }
    .items { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    .items th { border: 1px solid #bbb; padding: 8px 10px; font-size: 12px; background: #e8e8e8; }
    .items td { border: 1px solid #bbb; padding: 8px 10px; }
    .items tfoot td { background: #f0f0f0; font-weight: bold; font-size: 14px; }
    .signatures { width: 100%; margin-top: 60px; }
    .sig-line { margin-top: 80px; border-top: 1px solid #333; width: 180px; margin-left: auto; margin-right: auto; padding-top: 6px; font-size: 12px; text-align: center; }
    .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 8px; }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <h1>FLEETIFY LOGISTICS</h1>
      <p>Jl. Logistik Raya No. 123, Kelapa Gading, Jakarta Utara 14240</p>
      <p>Telp: (021) 456-7890 | Email: info@fleetify.co.id</p>
    </div>
    <h2 class="title">INVOICE / RESI PENGIRIMAN</h2>
    <div class="meta">
      <p><strong>No. Invoice:</strong> ${inv.invoice_number}</p>
      <p><strong>Tanggal:</strong> ${tanggal}</p>
    </div>
    <table class="parties">
      <tr>
        <td class="party-cell">
          <p class="party-label">Pengirim</p>
          <p class="party-name">${inv.sender_name}</p>
          <p class="party-address">${inv.sender_address}</p>
        </td>
        <td class="party-cell">
          <p class="party-label">Penerima</p>
          <p class="party-name">${inv.receiver_name}</p>
          <p class="party-address">${inv.receiver_address}</p>
        </td>
      </tr>
    </table>
    <table class="items">
      <thead>
        <tr>
          <th style="text-align:center;width:40px;">No</th>
          <th style="text-align:left;">Nama Barang</th>
          <th style="text-align:center;width:60px;">Qty</th>
          <th style="text-align:right;width:130px;">Harga Satuan</th>
          <th style="text-align:right;width:130px;">Subtotal</th>
        </tr>
      </thead>
      <tbody>${detailRows}</tbody>
      <tfoot>
        <tr>
          <td colspan="4" style="text-align:right;padding:10px;">GRAND TOTAL</td>
          <td style="text-align:right;padding:10px;">Rp ${inv.total_amount.toLocaleString("id-ID")}</td>
        </tr>
      </tfoot>
    </table>
    <table class="signatures">
      <tr>
        <td style="width:50%;text-align:center;"><div class="sig-line">Pengirim</div></td>
        <td style="width:50%;text-align:center;"><div class="sig-line">Penerima</div></td>
      </tr>
    </table>
    <div class="footer">Dokumen ini dicetak secara otomatis oleh sistem Fleetify Invoice App.</div>
  </div>
  <script>window.onload = function() { window.print(); window.close(); };<\/script>
</body>
</html>`);

    printWindow.document.close();
  };

  if (submittedInvoice) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
          <p className="text-green-800 font-semibold text-lg">
            ✓ Invoice Berhasil Dibuat
          </p>
          <p className="text-green-600 text-sm mt-1">
            No. {submittedInvoice.invoice_number}
          </p>
        </div>

        {/* Screen UI */}
        <div className="bg-white border rounded-md p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Pengirim</p>
              <p className="font-medium text-gray-800">
                {submittedInvoice.sender_name}
              </p>
              <p className="text-gray-600">{submittedInvoice.sender_address}</p>
            </div>
            <div>
              <p className="text-gray-500">Penerima</p>
              <p className="font-medium text-gray-800">
                {submittedInvoice.receiver_name}
              </p>
              <p className="text-gray-600">
                {submittedInvoice.receiver_address}
              </p>
            </div>
          </div>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left text-gray-600">Barang</th>
                <th className="py-2 text-center text-gray-600">Qty</th>
                <th className="py-2 text-right text-gray-600">Harga</th>
                <th className="py-2 text-right text-gray-600">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {submittedInvoice.details.map((d) => (
                <tr key={d.id} className="border-b">
                  <td className="py-2 text-gray-800">{d.item?.name || "-"}</td>
                  <td className="py-2 text-center text-gray-800">
                    {d.quantity}
                  </td>
                  <td className="py-2 text-right text-gray-800">
                    Rp {d.price.toLocaleString("id-ID")}
                  </td>
                  <td className="py-2 text-right text-gray-800">
                    Rp {d.subtotal.toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-right font-semibold text-lg text-gray-800">
            Total: Rp {submittedInvoice.total_amount.toLocaleString("id-ID")}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => {
              setSubmittedInvoice(null);
              store.reset();
            }}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition"
          >
            Buat Invoice Baru
          </button>
          <button
            onClick={() => submittedInvoice && handlePrint(submittedInvoice)}
            className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition"
          >
            🖨 Cetak Invoice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">
        Step 3 — Review &amp; Submit
      </h2>

      {isKerani && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
          ⚠ Anda login sebagai <strong>Kerani</strong> — data harga &amp; total
          tidak akan dikirim ke server.
        </div>
      )}

      {/* Review data */}
      <div className="bg-white border rounded-md p-6 space-y-4">
        <h3 className="font-medium text-gray-700 border-b pb-2">
          Data Pengirim &amp; Penerima
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Pengirim</p>
            <p className="font-medium text-gray-800">{store.sender_name}</p>
            <p className="text-gray-600">{store.sender_address}</p>
          </div>
          <div>
            <p className="text-gray-500">Penerima</p>
            <p className="font-medium text-gray-800">{store.receiver_name}</p>
            <p className="text-gray-600">{store.receiver_address}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-md p-6 space-y-4">
        <h3 className="font-medium text-gray-700 border-b pb-2">
          Daftar Barang
        </h3>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left text-gray-600">No</th>
              <th className="py-2 text-left text-gray-600">Kode</th>
              <th className="py-2 text-left text-gray-600">Nama</th>
              <th className="py-2 text-center text-gray-600">Qty</th>
              {!isKerani && (
                <>
                  <th className="py-2 text-right text-gray-600">Harga</th>
                  <th className="py-2 text-right text-gray-600">Subtotal</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {store.details.map((d, i) => (
              <tr key={i} className="border-b">
                <td className="py-2 text-gray-800">{i + 1}</td>
                <td className="py-2 font-mono text-blue-600">{d.code}</td>
                <td className="py-2 text-gray-800">{d.name}</td>
                <td className="py-2 text-center text-gray-800">
                  {d.quantity} {d.unit}
                </td>
                {!isKerani && (
                  <>
                    <td className="py-2 text-right text-gray-800">
                      Rp {d.price.toLocaleString("id-ID")}
                    </td>
                    <td className="py-2 text-right text-gray-800">
                      Rp {d.subtotal.toLocaleString("id-ID")}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {!isKerani && (
          <div className="text-right font-semibold text-lg text-gray-800">
            Grand Total: Rp {grandTotal.toLocaleString("id-ID")}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => store.setStep(2)}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition"
        >
          ← Kembali
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {submitting ? "Memproses..." : "Submit Invoice"}
        </button>
      </div>
    </div>
  );
}
