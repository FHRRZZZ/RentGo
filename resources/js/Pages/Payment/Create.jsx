import React, { useMemo, useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import CustomerLayout from "@/Layouts/CustomerLayout";
import { Card } from "@/Components/RentGo/Ui";
import { qrSvgDataUri } from "@/Lib/qrCode";

const formatRupiah = (val) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(val || 0);

const formatDeadline = (dateStr) => {
    if (!dateStr) return "-";
    try {
        return new Date(dateStr).toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return dateStr;
    }
};

/** Metode pembayaran yang tersedia beserta ikon & deskripsinya. */
const METHODS = [
    {
        value: "qris",
        label: "QRIS",
        hint: "Scan QR pakai m-Banking / e-Wallet apa pun",
        icon: (
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 4.5v4.5h4.5v-4.5h-4.5zm12 0v4.5h4.5v-4.5h-4.5zm-12 12v4.5h4.5v-4.5h-4.5zm9 0v4.5m4.5-4.5v4.5m-4.5-9v4.5m4.5-4.5v4.5"
            />
        ),
    },
    {
        value: "bank_transfer",
        label: "Transfer Bank",
        hint: "Virtual Account BCA / BNI / BRI / Mandiri",
        icon: (
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 9.75 12 4.5l9 5.25M4.5 9.75v9m4.5-9v9m6-9v9m4.5-9v9M3 18.75h18M2.25 21h19.5"
            />
        ),
    },
    {
        value: "cash",
        label: "Bayar di Tempat (COD)",
        hint: "Bayar tunai ke mitra saat serah terima unit",
        icon: (
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0017.25 4.5H6.75A2.25 2.25 0 004.5 6.75v10.5A2.25 2.25 0 006.75 19.5z"
            />
        ),
    },
];

export default function PaymentCreate({
    auth = {},
    booking = null,
    instructions = null,
    banks = [],
    selectedMethod = "qris",
    bankCode = "BCA",
}) {
    const [method, setMethod] = useState(selectedMethod);
    const [bank, setBank] = useState(bankCode);
    const [proofFile, setProofFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const vehicle = booking?.items?.[0]?.vehicle || null;

    // QR-nya dibangun dari ID pemesanan (payload QRIS dari server).
    const qrisPayload = instructions?.qris_payload || "";
    const qrImage = useMemo(
        () =>
            method === "qris" && qrisPayload
                ? qrSvgDataUri(qrisPayload, { scale: 6 })
                : null,
        [method, qrisPayload],
    );

    const total = Number(booking?.total_amount || 0);

    const changeMethod = (value) => {
        setMethod(value);
        setErrorMessage(null);
        router.get(
            `/payments/create/${booking?.id}`,
            { method: value, bank },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    const changeBank = (value) => {
        setBank(value);
        router.get(
            `/payments/create/${booking?.id}`,
            { method: "bank_transfer", bank: value },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    const copyVa = async () => {
        if (!instructions?.va_number) return;
        try {
            await navigator.clipboard.writeText(instructions.va_number);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage(null);

        if (method !== "cash" && !proofFile) {
            setErrorMessage("Unggah bukti pembayaran terlebih dahulu.");
            return;
        }

        const formData = new FormData();
        formData.append("booking_id", booking.id);
        formData.append("payment_method", method);
        if (method === "bank_transfer") formData.append("bank_code", bank);
        if (proofFile) formData.append("proof_file", proofFile);

        setIsSubmitting(true);
        router.post("/payments", formData, {
            onError: (errs) => {
                setIsSubmitting(false);
                setErrorMessage(
                    Object.values(errs).filter(Boolean).join(" ") ||
                        "Pembayaran gagal dikirim. Periksa kembali data Anda.",
                );
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    if (!booking) {
        return (
            <CustomerLayout
                auth={auth}
                activeNav="pesanan"
                backHref="/pesanan"
                backLabel="Pesanan"
            >
                <Head title="Pembayaran - RentGo" />
                <Card className="border p-10 text-center">
                    <p className="text-sm font-semibold">
                        Data pesanan tidak ditemukan
                    </p>
                    <Link
                        href="/pesanan"
                        className="mt-4 inline-block rounded-sm bg-[#F5B800] px-5 py-2 text-xs font-bold uppercase tracking-wider"
                    >
                        Kembali ke Pesanan
                    </Link>
                </Card>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout
            auth={auth}
            activeNav="pesanan"
            backHref="/pesanan"
            backLabel="Pesanan"
        >
            <Head title="Pembayaran Pesanan - RentGo" />

            {/* Header */}
            <div className="mb-6">
                <div className="mb-1 flex items-center gap-2">
                    <span className="h-2 w-2 bg-[#F5B800]" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b38600]">
                        Pembayaran Pesanan
                    </span>
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-[#111]">
                    Pilih Metode Pembayaran
                </h1>
                <p className="mt-1 text-xs text-stone-500">
                    Selesaikan pembayaran sebelum{" "}
                    <span className="font-semibold text-[#111]">
                        {formatDeadline(booking.payment_deadline)}
                    </span>{" "}
                    agar pesanan tidak otomatis dibatalkan.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Kolom kiri: metode + instruksi */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Pilihan metode */}
                    <Card className="border p-5">
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">
                            1. Metode Pembayaran
                        </p>
                        <div className="grid gap-3 sm:grid-cols-3">
                            {METHODS.map((item) => {
                                const active = method === item.value;
                                return (
                                    <button
                                        key={item.value}
                                        type="button"
                                        onClick={() => changeMethod(item.value)}
                                        className={`rounded-sm border p-3 text-left transition-all ${
                                            active
                                                ? "border-[#111] bg-[#111] text-white"
                                                : "border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-400 hover:bg-white"
                                        }`}
                                    >
                                        <svg
                                            className={`mb-2 h-5 w-5 ${active ? "text-[#F5B800]" : "text-stone-500"}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={1.6}
                                        >
                                            {item.icon}
                                        </svg>
                                        <p className="text-xs font-bold">
                                            {item.label}
                                        </p>
                                        <p
                                            className={`mt-0.5 text-[10px] leading-snug ${
                                                active
                                                    ? "text-stone-300"
                                                    : "text-stone-500"
                                            }`}
                                        >
                                            {item.hint}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Instruksi */}
                    <Card className="border p-5">
                        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">
                            2. Instruksi Pembayaran
                        </p>

                        {/* QRIS */}
                        {method === "qris" && (
                            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                                <div className="rounded-sm border-stone-200 bg-white p-3">
                                    {qrImage ? (
                                        <img
                                            src={qrImage}
                                            alt="QRIS RentGo"
                                            className="h-48 w-48"
                                        />
                                    ) : (
                                        <div className="flex h-48 w-48 items-center justify-center text-center text-[11px] text-stone-400">
                                            QR belum tersedia
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-2 text-xs text-stone-600">
                                    <p className="font-semibold text-[#111]">
                                        Scan QR code di samping
                                    </p>
                                    <p className="leading-relaxed">
                                        Buka aplikasi m-Banking atau e-Wallet
                                        (GoPay, OVO, Dana, ShopeePay), pilih{" "}
                                        <b>Scan QRIS</b>, lalu periksa nominal{" "}
                                        <b>{formatRupiah(total)}</b> sebelum
                                        konfirmasi.
                                    </p>
                                    <div className="rounded-sm border-stone-200 bg-stone-50 p-3">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                                            Kode referensi
                                        </p>
                                        <p className="mt-0.5 font-mono text-[11px] font-semibold text-[#111] break-all">
                                            {qrisPayload || "-"}
                                        </p>
                                    </div>
                                    <p className="text-[11px] text-stone-400">
                                        QR ini dibuat dari ID pemesanan{" "}
                                        {booking.booking_number}.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Transfer Bank / VA */}
                        {method === "bank_transfer" && (
                            <div className="space-y-4 text-xs">
                                <div className="flex flex-wrap gap-1.5">
                                    {(banks.length
                                        ? banks
                                        : [{ code: "BCA", name: "BCA" }]
                                    ).map((b) => (
                                        <button
                                            key={b.code}
                                            type="button"
                                            onClick={() => changeBank(b.code)}
                                            className={`rounded-sm border px-3 py-1.5 text-[11px] font-bold transition-colors ${
                                                bank === b.code
                                                    ? "border-[#111] bg-[#111] text-[#F5B800]"
                                                    : "border-stone-300 bg-white text-stone-700 hover:border-black"
                                            }`}
                                        >
                                            {b.code}
                                        </button>
                                    ))}
                                </div>

                                <div className="rounded-sm border-stone-200 bg-stone-50 p-4">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                                        Nomor Virtual Account
                                    </p>
                                    <div className="mt-1 flex-wrap items-center gap-3">
                                        <span className="font-mono text-lg font-bold tracking-wider text-[#111]">
                                            {instructions?.va_number || "-"}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={copyVa}
                                            className="rounded-sm border-stone-300 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-700 hover:border-black"
                                        >
                                            {copied ? "Tersalin" : "Salin"}
                                        </button>
                                    </div>
                                    <p className="mt-2 text-[11px] text-stone-500">
                                        Atas nama{" "}
                                        <b>
                                            {instructions?.account_name ||
                                                "PT RentGo Indonesia"}
                                        </b>
                                    </p>
                                </div>

                                <div className="space-y-1.5 text-stone-600">
                                    <p className="font-semibold text-[#111]">
                                        Cara transfer:
                                    </p>
                                    <ol className="list-decimal space-y-1 pl-4">
                                        <li>
                                            {instructions?.bank?.instruction ||
                                                "Buka aplikasi m-Banking lalu pilih menu transfer Virtual Account."}
                                        </li>
                                        <li>
                                            Masukkan nomor Virtual Account di
                                            atas.
                                        </li>
                                        <li>
                                            Pastikan nominal tepat{" "}
                                            <b>{formatRupiah(total)}</b>, lalu
                                            selesaikan transaksi.
                                        </li>
                                        <li>
                                            Unggah bukti transfer di bagian
                                            bawah halaman ini.
                                        </li>
                                    </ol>
                                </div>
                            </div>
                        )}

                        {/* COD */}
                        {method === "cash" && (
                            <div className="space-y-2 text-xs text-stone-600">
                                <p className="font-semibold text-[#111]">
                                    Bayar tunai saat serah terima unit
                                </p>
                                <p className="leading-relaxed">
                                    {instructions?.note ||
                                        "Bayar tunai kepada mitra saat serah terima kendaraan. Siapkan uang pas."}
                                </p>
                                <p className="rounded-sm border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-900">
                                    Pesanan langsung diteruskan ke mitra dan
                                    tidak perlu verifikasi pembayaran.
                                </p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Kolom kanan: ringkasan + submit */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-4">
                        <Card className="border p-5">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">
                                Ringkasan Pesanan
                            </p>
                            <p className="mt-2 font-mono text-xs font-semibold text-[#111]">
                                {booking.booking_number}
                            </p>
                            <p className="mt-1 text-xs font-semibold">
                                {vehicle?.name ||
                                    [vehicle?.brand, vehicle?.model]
                                        .filter(Boolean)
                                        .join(" ") ||
                                    "Unit kendaraan"}
                            </p>
                            <p className="text-[11px] text-stone-500">
                                {vehicle?.license_plate}
                            </p>

                            <div className="mt-4 space-y-2 border-t border-stone-200 pt-3 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-stone-500">
                                        Sewa unit
                                    </span>
                                    <span className="font-medium">
                                        {formatRupiah(booking.rental_amount)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-stone-500">
                                        Biaya layanan
                                    </span>
                                    <span className="font-medium">
                                        {formatRupiah(booking.service_fee)}
                                    </span>
                                </div>
                                {Number(booking.delivery_fee) > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-stone-500">
                                            Biaya antar
                                        </span>
                                        <span className="font-medium">
                                            {formatRupiah(booking.delivery_fee)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-stone-500">
                                        Deposit (refundable)
                                    </span>
                                    <span className="font-medium">
                                        {formatRupiah(booking.deposit_amount)}
                                    </span>
                                </div>
                                <div className="flex justify-between border-t border-stone-200 pt-2 text-sm font-bold text-[#111]">
                                    <span>Total bayar</span>
                                    <span>{formatRupiah(total)}</span>
                                </div>
                            </div>
                        </Card>

                        <Card className="border p-5">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">
                                    3. Konfirmasi
                                </p>

                                {method !== "cash" && (
                                    <div>
                                        <label className="block text-xs font-semibold text-stone-700">
                                            Bukti pembayaran
                                            <span className="text-red-500">
                                                {" "}
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={(e) =>
                                                setProofFile(
                                                    e.target.files?.[0] || null,
                                                )
                                            }
                                            className="mt-1.5 w-full text-xs file:mr-3 file:rounded-sm file:border-0 file:bg-[#111] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#F5B800]"
                                        />
                                        <p className="mt-1 text-[10px] text-stone-400">
                                            Format JPG, PNG, atau PDF (maks
                                            5MB).
                                        </p>
                                    </div>
                                )}

                                {errorMessage && (
                                    <p className="rounded-sm border-red-200 bg-red-50 p-2.5 text-[11px] font-medium text-red-700">
                                        {errorMessage}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full rounded-sm bg-[#F5B800] py-3 text-xs font-bold uppercase tracking-wider text-[#111] transition-colors hover:bg-[#e0a800] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSubmitting
                                        ? "Mengirim..."
                                        : method === "cash"
                                          ? "Konfirmasi & Dapatkan Struk"
                                          : "Saya Sudah Bayar"}
                                </button>

                                <p className="text-center text-[10px] text-stone-400">
                                    Setelah dikirim, struk pemesanan otomatis
                                    terbuka dan bisa dicetak.
                                </p>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
