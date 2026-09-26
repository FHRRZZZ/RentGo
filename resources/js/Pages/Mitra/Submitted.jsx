import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import CustomerLayout from "@/Layouts/CustomerLayout";

export default function MitraSubmitted({ agentProfile = null }) {
    const { auth } = usePage().props;

    return (
        <CustomerLayout
            auth={auth}
            activeNav="profil"
            backHref="/"
            backLabel="Beranda"
        >
            <Head title="Pengajuan Terkirim - RentGo" />

            <div className="mx-auto max-w-xl py-8">
                <div className="border border-stone-200 bg-white p-7 text-center shadow-sm">
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-800">
                        ✓
                    </div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b38600]">
                        Pengajuan Mitra RentGo
                    </p>
                    <h1 className="mt-2 text-xl font-semibold tracking-tight text-[#111]">
                        Data berhasil dikirim
                    </h1>
                    <p className="mt-3 text-sm leading-relaxed text-stone-600">
                        Pengajuan {agentProfile?.agency_name ? `untuk ${agentProfile.agency_name} ` : "Anda "}
                        sudah diterima dan sedang menunggu verifikasi admin RentGo.
                        Anda akan menerima email setelah pengajuan diproses.
                    </p>

                    <div className="mt-6 border border-amber-200 bg-amber-50 p-4 text-left text-xs leading-relaxed text-amber-900">
                        <p className="font-semibold">Status: Menunggu verifikasi admin</p>
                        <p className="mt-1">
                            Selama proses verifikasi, Anda tetap dapat menggunakan akun sebagai customer.
                        </p>
                    </div>

                    <Link
                        href="/"
                        className="mt-7 inline-flex bg-[#111] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-stone-700"
                    >
                        Kembali ke Beranda
                    </Link>
                </div>
            </div>
        </CustomerLayout>
    );
}
