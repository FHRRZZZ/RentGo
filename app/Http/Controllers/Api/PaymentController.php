<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * API Payment — upload bukti, cek status pembayaran.
 */
class PaymentController extends Controller
{
    /**
     * GET /api/payments/{id}
     * Detail pembayaran.
     */
    public function show(Request $request, Payment $payment): JsonResponse
    {
        $booking = $payment->booking;
        abort_unless($booking?->customer_id === $request->user()->id, 403);

        $payment->load('booking');

        return response()->json([
            'data' => $this->formatPayment($payment),
        ]);
    }

    /**
     * POST /api/payments
     * Buat pembayaran untuk booking yang sudah dikonfirmasi mitra.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'booking_id'     => ['required', 'integer', 'exists:bookings,id'],
            'payment_method' => ['required', 'in:cash,qris,bank_transfer'],
            'bank_code'      => ['nullable', 'string', 'max:20'],
        ]);

        $booking = Booking::findOrFail($validated['booking_id']);
        abort_unless($booking->customer_id === $request->user()->id, 403);
        abort_unless(in_array($booking->status, ['confirmed', 'pending_payment']), 422, 'Booking belum dikonfirmasi mitra.');

        // Jika sudah ada payment pending, kembalikan yang lama
        $existing = Payment::where('booking_id', $booking->id)->whereIn('status', ['pending', 'awaiting_verification'])->first();
        if ($existing) {
            return response()->json(['data' => $this->formatPayment($existing)]);
        }

        $payment = Payment::create([
            'booking_id'     => $booking->id,
            'payment_number' => 'PAY-' . strtoupper(uniqid()),
            'payment_method' => $validated['payment_method'],
            'bank_code'      => $validated['bank_code'] ?? null,
            'amount'         => $booking->total_amount,
            'status'         => 'pending',
        ]);

        $booking->update(['status' => 'pending_payment']);

        return response()->json([
            'message' => 'Tagihan pembayaran berhasil dibuat.',
            'data'    => $this->formatPayment($payment),
        ], 201);
    }

    /**
     * POST /api/payments/{id}/proof
     * Upload bukti pembayaran (QRIS / bank transfer).
     */
    public function uploadProof(Request $request, Payment $payment): JsonResponse
    {
        $booking = $payment->booking;
        abort_unless($booking?->customer_id === $request->user()->id, 403);
        abort_unless(in_array($payment->status, ['pending']), 422, 'Bukti hanya bisa diunggah untuk pembayaran pending.');

        $request->validate([
            'proof' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ]);

        // Hapus bukti lama
        if ($payment->proof_file_path) {
            Storage::disk('private')->delete($payment->proof_file_path);
        }

        $path = $request->file('proof')->store('payment-proofs/' . $booking->id, 'private');

        $payment->update([
            'proof_file_path' => $path,
            'status'          => 'awaiting_verification',
        ]);

        return response()->json([
            'message' => 'Bukti pembayaran berhasil diunggah. Menunggu verifikasi mitra.',
            'data'    => $this->formatPayment($payment->fresh()),
        ]);
    }

    // ------------------------------------------------------------------
    // Helper
    // ------------------------------------------------------------------
    private function formatPayment(Payment $p): array
    {
        return [
            'id'             => $p->id,
            'payment_number' => $p->payment_number,
            'payment_method' => $p->payment_method,
            'amount'         => (float) $p->amount,
            'status'         => $p->status,
            'va_number'      => $p->va_number,
            'bank_code'      => $p->bank_code,
            'has_proof'      => (bool) $p->proof_file_path,
            'paid_at'        => $p->paid_at?->toISOString(),
            'verified_at'    => $p->verified_at?->toISOString(),
            'notes'          => $p->notes,
            'created_at'     => $p->created_at?->toISOString(),
        ];
    }
}
