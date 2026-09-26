<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentRequest;
use App\Models\Booking;
use App\Models\Payment;
use App\Services\PaymentGatewayService;
use App\Services\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\View;

/**
 * PaymentController khusus Customer (penyewa).
 *
 * Berisi alur pembayaran dari sisi customer: memilih metode, membuat
 * pembayaran, melihat struk, dan mengunduh bukti pembayaran.
 */
class PaymentController extends Controller
{
    public function __construct(
        private PaymentService $paymentService,
        private PaymentGatewayService $paymentGatewayService
    ) {}

    /**
     * Form pembayaran booking.
     *
     * Menampilkan pilihan metode: COD, QRIS (QR dari ID pemesanan), dan
     * Transfer Bank / Virtual Account.
     */
    public function create(Request $request, Booking $booking): \Inertia\Response|View|RedirectResponse
    {
        $this->authorize('create', Payment::class);

        if ($booking->customer_id !== Auth::id()) {
            abort(403);
        }

        // Booking yang sudah punya pembayaran diarahkan ke struk, bukan form lagi.
        $existingPayment = $booking->payments()->latest()->first();

        if ($existingPayment) {
            return redirect()->route('payments.receipt', $existingPayment);
        }

        if ($booking->status !== 'pending_payment' && $booking->status !== 'waiting_payment') {
            abort(422, 'Booking ini tidak dapat melakukan pembayaran.');
        }

        $booking->load([
            'items.vehicle.photos',
            'agentProfile.user',
        ]);

        $selectedMethod = $request->string('method', Payment::METHOD_QRIS)->toString();
        if (!array_key_exists($selectedMethod, Payment::METHOD_LABELS)) {
            $selectedMethod = Payment::METHOD_QRIS;
        }

        $bankCode = $request->string('bank', PaymentGatewayService::DEFAULT_BANK)->toString();

        return \Inertia\Inertia::render('Payment/Create', [
            'booking' => $booking,
            'bookingNumber' => $booking->booking_number,
            'selectedMethod' => $selectedMethod,
            'bankCode' => $bankCode,
            // Instruksi pembayaran per metode (QRIS payload / nomor VA / catatan COD)
            'instructions' => $this->paymentGatewayService->instructionsFor($booking, $selectedMethod, $bankCode),
            'banks' => array_values(PaymentGatewayService::BANKS),
            'methods' => collect(Payment::METHOD_LABELS)
                ->map(fn($label, $method) => ['value' => $method, 'label' => $label])
                ->values(),
        ]);
    }

    /**
     * Struk / bukti pemesanan setelah pembayaran dibuat.
     */
    public function receipt(Payment $payment): \Inertia\Response|View
    {
        $this->authorize('view', $payment);

        $payment->load([
            'booking.items.vehicle.photos',
            'booking.customer',
            'booking.agentProfile.user',
            'verifier',
        ]);

        return \Inertia\Inertia::render('Payment/Receipt', [
            'payment' => $payment,
            'booking' => $payment->booking,
            'receiptNumber' => $this->paymentGatewayService->receiptNumber($payment),
            'instructions' => $this->paymentGatewayService->instructionsFor(
                $payment->booking,
                $payment->payment_method,
                $payment->bank_code ?? PaymentGatewayService::DEFAULT_BANK
            ),
            // Dipakai kartu pembayaran yang tampil di sidebar struk (QRIS/VA).
            'instructionsForMethod' => $this->paymentGatewayService->instructionsFor(
                $payment->booking,
                $payment->payment_method,
                $payment->bank_code ?? PaymentGatewayService::DEFAULT_BANK
            ),
            'qrisPayload' => $payment->payment_method === Payment::METHOD_QRIS
                ? $this->paymentGatewayService->qrisPayload($payment->booking, $payment)
                : null,
        ]);
    }

    /**
     * Menyimpan pembayaran.
     */
    public function store(StorePaymentRequest $request): RedirectResponse
    {
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

        // Setelah berhasil memesan & memilih metode, customer langsung
        // mendapat struk pemesanan.
        return redirect()
            ->route('payments.receipt', $payment)
            ->with(
                'success',
                $payment->payment_method === Payment::METHOD_COD
                    ? 'Pesanan berhasil dibuat. Bayar tunai saat serah terima unit.'
                    : 'Pesanan berhasil dibuat. Selesaikan pembayaran sesuai instruksi di struk.'
            );
    }

    /**
     * Detail pembayaran = struk pemesanan.
     */
    public function show(Payment $payment): \Inertia\Response|View
    {
        $this->authorize('view', $payment);

        $payment->load([
            'booking.items.vehicle',
            'booking.customer',
            'booking.agentProfile',
            'verifier',
        ]);

        return redirect()->route('payments.receipt', $payment);
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
}
