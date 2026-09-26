import React, { useMemo, useState, useEffect } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import AgentLayout from "@/Layouts/AgentLayout";

const TONE = "bg-[#111] text-[#F5B800]";

function Avatar({ conversation, small = false }) {
    return (
        <div
            className={`${small ? "h-10 w-10 text-[11px]" : "h-12 w-12 text-xs"} ${
                conversation.tone || TONE
            } relative flex shrink-0 items-center justify-center rounded-full font-bold`}
        >
            {conversation.initials || (conversation.name || "?").charAt(0)}
            {conversation.online && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
            )}
        </div>
    );
}

/**
 * Pesan Customer (sisi Mitra).
 *
 * Data percakapan berasal dari MessageController@index (prop `conversations`).
 * Mengirim pesan memakai route message.store (POST) sehingga tersimpan di server.
 */
export default function AgentMessages({
    conversations: propConversations = [],
}) {
    const { url } = usePage();
    const conversationsList = useMemo(
        () => (propConversations || []).filter((c) => c && c.id !== undefined),
        [propConversations],
    );
    const hasConversations = conversationsList.length > 0;

    // Percakapan aktif diambil dari query string (?conversation=ID) jika ada.
    const initialId = useMemo(() => {
        const match = /[?&]conversation=(\d+)/.exec(url || "");
        if (match) {
            const id = Number(match[1]);
            if (conversationsList.some((c) => c.id === id)) return id;
        }
        return conversationsList[0]?.id ?? null;
    }, [url, conversationsList]);

    const [selectedId, setSelectedId] = useState(initialId);
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState("semua");
    const [draft, setDraft] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
        setSelectedId(initialId);
    }, [initialId]);

    const selectedConversation =
        conversationsList.find((c) => c.id === selectedId) ||
        conversationsList[0] ||
        null;

    const visible = useMemo(
        () =>
            conversationsList.filter((c) => {
                const matchQ = `${c.name || ""} ${c.subject || ""}`
                    .toLowerCase()
                    .includes(query.toLowerCase());
                const matchF =
                    filter === "semua" ||
                    (filter === "belum-dibaca" && c.unread > 0);
                return matchQ && matchF;
            }),
        [conversationsList, filter, query],
    );

    const currentMessages = selectedConversation?.messages || [];

    const handleSend = (e) => {
        e.preventDefault();
        const text = draft.trim();
        if (!text || !selectedConversation) return;
        setSending(true);
        router.post(
            `/message/${selectedConversation.id}`,
            { body: text },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setDraft("");
                    setSending(false);
                },
                onError: () => setSending(false),
            },
        );
    };

    const handleSelect = (id) => {
        setSelectedId(id);
        const target = conversationsList.find((c) => c.id === id);
        // Tandai sudah dibaca di server bila masih ada pesan belum dibaca.
        if (target && target.unread > 0) {
            router.post(
                `/message/${id}/read`,
                {},
                { preserveScroll: true, preserveState: true },
            );
        }
    };

    return (
        <AgentLayout active="/mitra/pesan" title="Pesan dari Customer">
            <Head title="Pesan - RentGo Mitra" />

            <div className="mb-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#F5B800]">
                    Portal Mitra
                </span>
                <div className="flex items-end justify-between gap-3">
                    <div>
                        <h1 className="mt-0.5 text-xl font-bold text-[#111]">
                            Pesan Customer
                        </h1>
                        <p className="mt-1 text-xs text-stone-500">
                            Komunikasi langsung dengan customer yang menyewa
                            unit Anda.
                        </p>
                    </div>
                    <span className="rounded-lg border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-600 shadow-sm">
                        {conversationsList.length} percakapan
                    </span>
                </div>
            </div>

            <section className="grid min-h-[660px] overflow-hidden rounded-xl border-stone-200 bg-white shadow-sm lg:h-[calc(100vh-13rem)] lg:min-h-[680px] lg:grid-cols-[340px_1fr]">
                {/* Sidebar */}
                <aside className="flex flex-col border-b border-stone-200 lg:border-b-0 lg:border-r">
                    <div className="border-b border-stone-200 p-4">
                        <label className="relative block">
                            <span className="sr-only">Cari percakapan</span>
                            <svg
                                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <circle cx="11" cy="11" r="7" />
                                <path strokeLinecap="round" d="m20 20-4-4" />
                            </svg>
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Cari percakapan"
                                className="w-full rounded-lg border-stone-200 bg-stone-50 py-2.5 pl-9 pr-3 text-xs outline-none transition focus:border-[#111] focus:bg-white"
                            />
                        </label>
                        <div className="mt-3 flex gap-1 rounded-lg bg-stone-100 p-1">
                            {[
                                ["semua", "Semua"],
                                ["belum-dibaca", "Belum dibaca"],
                            ].map(([val, lbl]) => (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() => setFilter(val)}
                                    className={`flex-1 rounded-md px-2 py-2 text-[11px] font-semibold transition ${
                                        filter === val
                                            ? "bg-[#111] text-[#F5B800]"
                                            : "text-stone-500 hover:text-[#111]"
                                    }`}
                                >
                                    {lbl}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 divide-y divide-stone-100 overflow-y-auto">
                        {visible.map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => handleSelect(c.id)}
                                className={`flex w-full gap-3 p-4 text-left transition hover:bg-stone-50 ${
                                    selectedId === c.id
                                        ? "border-l-2 border-[#F5B800] bg-[#FFFBEA]"
                                        : "border-l-2 border-transparent"
                                }`}
                            >
                                <Avatar conversation={c} small />
                                <span className="min-w-0 flex-1">
                                    <span className="flex items-center justify-between gap-2">
                                        <span className="truncate text-xs font-semibold text-stone-900">
                                            {c.name}
                                        </span>
                                        <span className="shrink-0 text-[10px] text-stone-400">
                                            {c.time}
                                        </span>
                                    </span>
                                    <span className="mt-0.5 block truncate text-[10px] font-medium text-stone-500">
                                        {c.subject}
                                    </span>
                                    <span className="mt-0.5 block truncate text-[11px] text-stone-400">
                                        {c.preview}
                                    </span>
                                </span>
                                {c.unread > 0 && (
                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F5B800] px-1 text-[10px] font-bold text-[#111]">
                                        {c.unread}
                                    </span>
                                )}
                            </button>
                        ))}
                        {visible.length === 0 && (
                            <p className="p-6 text-center text-xs text-stone-400">
                                {hasConversations
                                    ? "Percakapan tidak ditemukan."
                                    : "Belum ada pesan masuk dari customer."}
                            </p>
                        )}
                    </div>
                </aside>

                {/* Area Chat */}
                <div className="flex min-h-[520px] flex-col bg-stone-50/50 lg:min-h-0">
                    <div className="flex items-center justify-between border-b border-stone-200 bg-white px-5 py-4">
                        {selectedConversation ? (
                            <>
                                <div className="flex min-w-0 items-center gap-3">
                                    <Avatar
                                        conversation={selectedConversation}
                                    />
                                    <div className="min-w-0">
                                        <h2 className="truncate text-sm font-semibold">
                                            {selectedConversation.name}
                                        </h2>
                                        <p className="mt-0.5 truncate text-[11px] text-stone-400">
                                            {selectedConversation.subject}
                                        </p>
                                    </div>
                                </div>
                                {selectedConversation.booking_number && (
                                    <span className="hidden rounded-lg border-stone-200 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-stone-500 sm:inline-block">
                                        {selectedConversation.booking_number}
                                    </span>
                                )}
                            </>
                        ) : (
                            <div>
                                <h2 className="text-sm font-semibold text-stone-700">
                                    Belum ada percakapan
                                </h2>
                                <p className="mt-0.5 text-[11px] text-stone-400">
                                    Pesan dari customer akan muncul di sini.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto p-5">
                        {!hasConversations && (
                            <div className="flex h-full flex-col items-center justify-center py-20 text-center">
                                <svg
                                    className="mb-3 h-12 w-12 text-stone-200"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                                    />
                                </svg>
                                <p className="text-sm font-semibold text-stone-500">
                                    Belum ada pesan
                                </p>
                                <p className="mt-1 text-xs text-stone-400">
                                    Customer akan menghubungi Anda melalui
                                    halaman pesanan.
                                </p>
                            </div>
                        )}
                        {selectedConversation &&
                            currentMessages.length === 0 && (
                                <p className="py-10 text-center text-xs text-stone-400">
                                    Belum ada pesan pada percakapan ini.
                                </p>
                            )}
                        {selectedConversation &&
                            currentMessages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${
                                        msg.from === "me"
                                            ? "justify-end"
                                            : "justify-start"
                                    }`}
                                >
                                    <div
                                        className={`flex max-w-[80%] flex-col sm:max-w-[62%] ${
                                            msg.from === "me"
                                                ? "items-end"
                                                : "items-start"
                                        }`}
                                    >
                                        <div
                                            className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                                                msg.from === "me"
                                                    ? "bg-[#111] text-white"
                                                    : "border border-stone-200 bg-white text-stone-700"
                                            }`}
                                        >
                                            {msg.text}
                                        </div>
                                        <span className="mt-1 px-1 text-[10px] text-stone-400">
                                            {msg.time}
                                        </span>
                                    </div>
                                </div>
                            ))}
                    </div>

                    <form
                        onSubmit={handleSend}
                        className="border-t border-stone-200 bg-white p-4"
                    >
                        <div className="flex items-end gap-3">
                            <textarea
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                rows={1}
                                maxLength={2000}
                                disabled={!selectedConversation}
                                placeholder={
                                    selectedConversation
                                        ? "Tulis pesan ke customer..."
                                        : "Belum ada percakapan aktif"
                                }
                                className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border-stone-200 bg-stone-50 px-4 py-3 text-xs outline-none transition focus:border-[#111] focus:bg-white disabled:opacity-60"
                            />
                            <button
                                type="submit"
                                disabled={
                                    sending ||
                                    !draft.trim() ||
                                    !selectedConversation
                                }
                                aria-label="Kirim pesan"
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F5B800] text-[#111] transition hover:bg-[#e0a800] disabled:opacity-40"
                            >
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m21 3-8.5 18-3.5-8-8-3.5L21 3Z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 13 21 3"
                                    />
                                </svg>
                            </button>
                        </div>
                        <p className="mt-2 text-[10px] text-stone-400">
                            Pesan tersimpan di server dan dapat dibaca customer
                            pada halaman Pesan.
                        </p>
                    </form>
                </div>
            </section>
        </AgentLayout>
    );
}
