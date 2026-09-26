<?php

namespace App\Http\Controllers\Agent;

use App\Constants\BookingStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\ConfirmBookingRequest;
use App\Http\Requests\VerifyBookingPaymentRequest;
use App\Models\Booking;
use App\Models\Dispute;
use App\Models\Payment;
use App\Models\RentalDamage;
use App\Services\BookingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\View;

/**
 * BookingController khusus Mitra (Agent).
 *
 * Berisi aksi yang dilakukan mitra: melihat pesanan masuk untuk armadanya,
 * mengonfirmasi/menolak pesanan, dan menandai unit siap diambil.
 */
class BookingController extends Controller
{
    public function __construct(
        private BookingService $bookingService
    ) {}

    /*
    |--------------------------------------------------------------------------
    | Index — Pesanan Masuk
    |--------------------------------------------------------------------------
    */

    public function index(Request $request): \Inertia\Response|View|\Illuminate\Http\JsonResponse
    {
        $this->authorize('viewAny', Booking::class);

        $user = Auth::user();
        $agentProfileId = $user->agentProfile?->id;
        abort_unless($agentProfileId, 403);

        $query = Booking::query()
            ->with([
                'customer',
                'agentProfile.user',
                'items.vehicle.photos',
                'payments',
            ])
            ->where('agent_profile_id', $agentProfileId)
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $bookings = $query->paginate(15)->withQueryString();

        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return response()->json($bookings);
        }

        return \Inertia\Inertia::render('Agent/Bookings', [
            'bookings' => $bookings->items(),
            'pagination' => $bookings,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Show — Detail Pesanan (Progres & Rincian)
    |--------------------------------------------------------------------------
    */

    /**
     * Halaman detail pesanan untuk mitra: menampilkan alur tahapan pesanan
     * (progress tracker), rincian biaya, data penyewa & unit, serta aksi mitra
     * (setujui/tolak pembayaran, konfirmasi/tolak pesanan, tandai siap diambil).
     */
    public function show(Request $request, Booking $booking): \Inertia\Response|View|\Illuminate\Http\JsonResponse
    {
        $this->authorize('view', $booking);

        $booking->load([
            'items.vehicle.photos',
            'agentProfile.user',
            'customer',
            'payments.verifier',
            'rentalCheckout',
            'rentalCheckin',
            'rentalDamages',
            'transaction',
            'reviews',
            'disputes',
            'cancellations',
        ]);

        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return response()->json($booking);
        }

        return \Inertia\Inertia::render('Agent/BookingShow', [
            'booking' => $booking,
            'bookingNumber' => $booking->booking_number,
            // Detail penyewa untuk pengecekan keamanan unit oleh mitra.
            'customerDetails' => $this->customerDetailsFor($booking),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Confirm / Reject Booking
    |--------------------------------------------------------------------------
    */

    public function confirm(ConfirmBookingRequest $request, Booking $booking): RedirectResponse
    {
        /*
         * Pesanan hanya boleh dikonfirmasi setelah pembayaran benar-benar
         * masuk (lihat BookingService::assertPaymentSettled & policy).
         */
        $this->authorize('confirm', $booking);

        $validated = $request->validated();

        $this->bookingService->confirmByAgent(
            $booking,
            Auth::user(),
            $validated['status'],
            $validated['agent_note'] ?? null,
            $request
        );

        if ($validated['status'] === 'rejected') {
            return redirect()
                ->route('mitra.bookings.show', $booking)
                ->with(
                    'success',
                    'Booking berhasil ditolak. Refund akan diproses oleh admin.'
                );
        }

        return redirect()
            ->route('mitra.bookings.show', $booking)
            ->with('success', 'Booking berhasil dikonfirmasi.');
    }

    /**
     * Mitra menandai booking siap diambil / diantar.
     */
    public function readyForPickup(Request $request, Booking $booking): RedirectResponse
    {
        /*
         * Aksi ini mengubah pesanan yang SUDAH dikonfirmasi menjadi siap
         * diambil, sehingga kepemilikan dicek lewat 'view' (bukan 'confirm'
         * yang mensyaratkan status waiting_agent_confirmation). Validasi
         * status/kelayakan selebihnya dilakukan BookingService.
         */
        $this->authorize('view', $booking);

        try {
            $this->bookingService->markReadyForPickup(
                $booking,
                Auth::user(),
                $request
            );
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return redirect()
            ->route('mitra.bookings.show', $booking)
            ->with('success', 'Status booking berhasil diubah menjadi siap diambil (ready for pickup).');
    }

    /**
     * Tahap "Berjalan": mitra membuka form check-in (Catat Pengembalian).
     *
     * Hanya ditampilkan saat booking berstatus ongoing.
     */
    public function checkin(Request $request, Booking $booking): \Inertia\Response|View|RedirectResponse
    {
        $this->authorize('view', $booking);

        /*
         * Pengembalian hanya berlaku saat unit sedang berjalan (ongoing).
         * Bila status sudah berbeda (mis. sudah returned/completed), mitra
         * diarahkan kembali ke detail pesanan — bukan halaman 403 buntu.
         */
        if ($booking->status !== BookingStatus::ONGOING) {
            return redirect()
                ->route('mitra.bookings.show', $booking)
                ->with(
                    'error',
                    $booking->status === BookingStatus::RETURNED
                        ? 'Pengembalian unit sudah tercatat. Lanjutkan dengan "Selesaikan Pesanan".'
                        : 'Pengembalian hanya dapat dicatat saat unit sedang berjalan.'
                );
        }

        $booking->load([
            'customer',
            'items.vehicle.photos',
            'rentalCheckout',
            'rentalCheckin',
        ]);

        return \Inertia\Inertia::render('Agent/RentalCheckin', [
            'booking'      => $booking,
            'bookingNumber' => $booking->booking_number,
            'checkout'     => $booking->rentalCheckout,
        ]);
    }

    /**
     * Tahap "Dikembalikan": mitra menyelesaikan pesanan.
     */
    public function complete(Request $request, Booking $booking): RedirectResponse
    {
        $this->authorize('view', $booking);

        try {
            $this->bookingService->completeByAgent(
                $booking,
                Auth::user(),
                $request
            );
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return redirect()
            ->route('mitra.bookings.show', $booking)
            ->with('success', 'Pesanan berhasil diselesaikan.');
    }

    /*
    |--------------------------------------------------------------------------
    | Verifikasi Pembayaran Customer (Bukti Bayar QRIS / Transfer Bank)
    |--------------------------------------------------------------------------
    */

    /**
     * Mitra menyetujui pembayaran customer (dana sudah masuk).
     *
     * Untuk QRIS & transfer bank, dana masuk ke rekening mitra sehingga
     * mitra yang memeriksa bukti bayar/mutasi sebelum unit diproses.
     */
    public function approvePayment(VerifyBookingPaymentRequest $request, Booking $booking): RedirectResponse
    {
        $this->authorize('verifyPayment', $booking);

        $payment = $this->resolveAgentPayment($booking, $request->integer('payment_id'));

        $this->bookingService->approvePayment(
            $booking,
            $payment,
            Auth::user(),
            $request->validated()['notes'] ?? null,
            $request
        );

        return redirect()
            ->route('mitra.bookings.show', $booking)
            ->with('success', 'Pembayaran customer disetujui. Pesanan siap Anda konfirmasi.');
    }

    /**
     * Mitra menolak pembayaran customer (dana/bukti tidak sesuai).
     */
    public function rejectPayment(VerifyBookingPaymentRequest $request, Booking $booking): RedirectResponse
    {
        $this->authorize('verifyPayment', $booking);

        $payment = $this->resolveAgentPayment($booking, $request->integer('payment_id'));

        $this->bookingService->rejectPayment(
            $booking,
            $payment,
            Auth::user(),
            $request->validated()['notes'] ?? null,
            $request
        );

        return redirect()
            ->route('mitra.bookings.show', $booking)
            ->with('success', 'Pembayaran ditolak. Customer diminta mengunggah bukti pembayaran yang benar.');
    }

    /**
     * Menampilkan bukti pembayaran (file privat) untuk diperiksa mitra.
     */
    public function paymentProof(Request $request, Booking $booking)
    {
        $this->authorize('verifyPayment', $booking);

        $payment = $this->resolveAgentPayment($booking, $request->integer('payment_id'));

        if (!$payment->proof_file_path) {
            abort(404, 'Customer belum mengunggah bukti pembayaran.');
        }

        $disk = Storage::disk('private');

        if (!$disk->exists($payment->proof_file_path)) {
            abort(404, 'File bukti pembayaran tidak ditemukan.');
        }

        $filePath = $payment->proof_file_path;
        $mimeType = finfo_file(
            finfo_open(FILEINFO_MIME_TYPE),
            $disk->path($filePath)
        ) ?: 'application/octet-stream';

        return response($disk->get($filePath), 200)
            ->header('Content-Type', $mimeType)
            ->header('Content-Disposition', 'inline; filename="' . basename($filePath) . '"');
    }

    /**
     * Susun detail penyewa untuk pengecekan mitra sebelum menyerahkan unit.
     *
     * Memuat identitas (KTP/SIM), alamat, kontak darurat, dokumen pendukung
     * (KTP/SIM beserta status verifikasinya), serta ringkasan riwayat sewa pada
     * mitra ini sebagai indikator risiko. Hanya data yang relevan dengan
     * keamanan unit yang ditampilkan.
     */
    protected function customerDetailsFor(Booking $booking): array
    {
        $customer = $booking->customer;

        if (!$customer) {
            return ['available' => false];
        }

        $customer->loadMissing(['customerProfile.documents']);
        $profile = $customer->customerProfile;

        $documents = ($profile?->documents ?? collect())
            ->map(fn ($doc) => [
                'id' => $doc->id,
                'type' => $doc->document_type,
                'number' => $doc->document_number,
                'status' => $doc->status,
                'has_file' => (bool) $doc->file_path,
                'rejection_reason' => $doc->rejection_reason,
                'expires_at' => $doc->expires_at?->toDateString(),
                // URL file privat (dijaga policy: hanya mitra terkait & admin).
                'file_url' => $doc->file_path
                    ? route('customer-documents.file', $doc)
                    : null,
            ])
            ->values()
            ->all();

        $agentProfileId = $booking->agent_profile_id;

        // Riwayat hanya untuk unit mitra ini (bukan seluruh platform).
        $scoped = fn () => Booking::query()
            ->where('customer_id', $customer->id)
            ->where('agent_profile_id', $agentProfileId);

        $totalBookings = $scoped()->count();
        $completedBookings = $scoped()->where('status', BookingStatus::COMPLETED)->count();

        // Kerugian/insiden pada unit mitra ini → indikator risiko penyewa.
        $damageCount = \App\Models\RentalDamage::query()
            ->whereHas('booking', fn ($q) => $q
                ->where('customer_id', $customer->id)
                ->where('agent_profile_id', $agentProfileId))
            ->count();

        $bookingIds = $scoped()->pluck('id');
        $disputeCount = \App\Models\Dispute::whereIn('booking_id', $bookingIds)->count();

        $verifiedDocuments = collect($documents)->where('status', 'approved')->count();

        return [
            'available' => true,
            'name' => $customer->name,
            'email' => $customer->email,
            'phone' => $profile?->phone ?? null,
            'avatar' => $customer->avatar,
            'identityNumber' => $profile?->identity_number,
            'simType' => $profile?->sim_type,
            'dateOfBirth' => $profile?->date_of_birth?->toDateString(),
            'address' => $profile?->address,
            'city' => $profile?->city,
            'province' => $profile?->province,
            'emergencyName' => $profile?->emergency_name,
            'emergencyRelation' => $profile?->emergency_relation,
            'emergencyPhone' => $profile?->emergency_phone,
            'profileComplete' => (bool) $profile,
            'documents' => $documents,
            'verifiedDocuments' => $verifiedDocuments,
            'totalDocuments' => count($documents),
            'stats' => [
                'totalBookings' => $totalBookings,
                'completedBookings' => $completedBookings,
                'damages' => $damageCount,
                'disputes' => $disputeCount,
            ],
        ];
    }

    /**
     * Ambil payment yang akan diverifikasi mitra.
     *
     * Bila payment_id tidak dikirim (atau berisi 0), dipakai pembayaran yang
     * masih menunggu keputusan mitra; kalau tidak ada, pembayaran terakhir.
     */
    protected function resolveAgentPayment(Booking $booking, ?int $paymentId = null): Payment
    {
        $payment = null;

        if ($paymentId) {
            $payment = $booking->payments()->whereKey($paymentId)->first();
        }

        if (!$payment) {
            $payment = $booking->payments()
                ->whereIn('status', Payment::PENDING_STATUSES)
                ->latest('id')
                ->first();
        }

        $payment ??= $booking->payments()->latest('id')->first();

        abort_unless($payment, 404, 'Data pembayaran tidak ditemukan pada pesanan ini.');

        return $payment;
    }
}
