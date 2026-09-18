<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaymentRequest;
use App\Http\Requests\VerifyPaymentRequest;
use Illuminate\Support\Facades\Storage;
use App\Models\Booking;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class PaymentController extends Controller
{
    public function __construct(
        private PaymentService $paymentService
    ) {}

    /**
     * Daftar pembayaran dengan filter dan pagination.
     */
    public function index(Request $request): View
    {
        $this->authorize('viewAny', Payment::class);

        $query = Payment::query()
            ->with([
                'booking.customer',
                'booking.agentProfile',
            ])
            ->latest();

        // Customer hanya melihat pembayaran miliknya
        if (Auth::user()->hasRole('customer')) {
            $query->whereHas('booking', function ($query) {
                $query->where('customer_id', Auth::id());
            });
        }

        // Mitra hanya melihat pembayaran booking miliknya
        if (Auth::user()->hasRole('mitra')) {
            $query->whereHas('booking.agentProfile', function ($query) {
                $query->where('user_id', Auth::id());
            });
        }

        // Filter status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter metode pembayaran
        if ($request->filled('payment_method')) {
        $query->where(
            'payment_method',
            $request->payment_method
            );
        }

        $payments = $query
            ->paginate(15)
            ->withQueryString();

        return view('payments.index', compact('payments'));
    }


    /**
     * Form pembayaran booking.
     */
    public function create(Booking $booking): View
    {
        $this->authorize('create', Payment::class);

        if ($booking->customer_id !== Auth::id()) {
            abort(403);
        }

        if ($booking->status !== 'pending_payment') {
            abort(422, 'Booking ini tidak dapat melakukan pembayaran.');
        }

        $booking->load([
            'items.vehicle',
            'agentProfile',
        ]);

        return view('payments.create', compact('booking'));
    }

    /**
     * Menyimpan pembayaran.
     */
    public function store(
        StorePaymentRequest $request
    ): RedirectResponse {
        $this->authorize('create', Payment::class);

        $booking = Booking::query()
            ->findOrFail($request->integer('booking_id'));

        $payment = $this->paymentService->create(
            Auth::user(),
            $booking,
            $request->validated(),
            $request->file('proof_file'),
            $request
        );

        return redirect()
            ->route('payments.show', $payment)
            ->with(
                'success',
                'Pembayaran berhasil dibuat. Silakan menunggu proses verifikasi.'
            );
    }

    /**
     * Detail pembayaran.
     */
    public function show(Payment $payment): View
    {
        $this->authorize('view', $payment);

        $payment->load([
            'booking.items.vehicle',
            'booking.customer',
            'booking.agentProfile',
            'verifier',
        ]);

        return view('payments.show', compact('payment'));
    }

    /**
     * Menampilkan bukti pembayaran secara aman.
     */
    public function proof(Payment $payment)
{
    $this->authorize('view', $payment);

    if (!$payment->proof_file_path) {
        abort(404, 'Bukti pembayaran tidak tersedia.');
    }

    $disk = Storage::disk('private');

    if (!$disk->exists($payment->proof_file_path)) {
        abort(404, 'File bukti pembayaran tidak ditemukan.');
    }

    $filePath = $payment->proof_file_path;
    $absolutePath = $disk->path($filePath);
    $mimeType = finfo_file(finfo_open(FILEINFO_MIME_TYPE), $absolutePath) ?: 'application/octet-stream';
    $fileContents = $disk->get($filePath);

    return response($fileContents, 200)
        ->header('Content-Type', $mimeType)
        ->header('Content-Disposition', 'inline; filename="' . basename($filePath) . '"');
}


    /**
     * Verifikasi pembayaran oleh admin.
     */
    public function verify(
    VerifyPaymentRequest $request,
    Payment $payment
): RedirectResponse {
    $this->authorize('verify', $payment);

    $validated = $request->validated();

    $this->paymentService->verify(
        $payment,
        Auth::user(),
        $validated['status'],
        $validated['notes'] ?? null,
        $request
    );

    return redirect()
        ->route('payments.show', $payment)
        ->with(
            'success',
            'Status pembayaran berhasil diperbarui.'
        );
    }
}