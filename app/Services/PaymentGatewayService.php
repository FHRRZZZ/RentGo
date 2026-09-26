<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Support\Str;

/**
 * PaymentGatewayService
 *
 * Simulasi payment gateway untuk RentGo. Belum terhubung ke penyedia
 * sungguhan (Midtrans/Xendit), jadi:
 *
 *  - QRIS  : payload QR dibangun dari ID pemesanan (booking number) lalu
 *            digambar menjadi QR code di sisi frontend.
 *  - VA    : nomor Virtual Account di-generate deterministik dari ID booking,
 *            sehingga bisa ditampilkan ulang tanpa disimpan di mana pun.
 *  - COD   : tidak ada instrumen digital, cukup dicatat.
 */
class PaymentGatewayService
{
    /**
     * Nomor merchant/prefix yang dipakai nomor VA RentGo.
     * Contoh hasil: 8808 1234 5678 0004
     */
    private const VA_PREFIX = '8808';

    /** Daftar bank tujuan transfer yang didukung. */
    public const BANKS = [
        'BCA' => [
            'code' => 'BCA',
            'name' => 'Bank Central Asia (BCA)',
            'va_prefix' => '3901',
            'instruction' => 'm-BCA → m-Transfer → BCA Virtual Account',
        ],
        'BNI' => [
            'code' => 'BNI',
            'name' => 'Bank Negara Indonesia (BNI)',
            'va_prefix' => '8810',
            'instruction' => 'Mobile BNI → Transfer → Virtual Account',
        ],
        'BRI' => [
            'code' => 'BRI',
            'name' => 'Bank Rakyat Indonesia (BRI)',
            'va_prefix' => '2621',
            'instruction' => 'BRImo → BRIVA → Masukkan nomor VA',
        ],
        'Mandiri' => [
            'code' => 'Mandiri',
            'name' => 'Bank Mandiri',
            'va_prefix' => '8950',
            'instruction' => 'Livin\' by Mandiri → Bayar → Multipayment',
        ],
    ];

    public const DEFAULT_BANK = 'BCA';

    /**
     * Nomor Virtual Account deterministik untuk sebuah booking.
     * Dibuat dari ID pemesanan agar tetap sama walau ditampilkan ulang.
     */
    public function virtualAccountNumber(Booking $booking, string $bankCode = self::DEFAULT_BANK): string
    {
        $bank = self::BANKS[$bankCode] ?? self::BANKS[self::DEFAULT_BANK];

        // 6 digit terakhir dari booking number dijadikan nomor urut unik,
        // fallback ke id booking bila booking number tidak numerik.
        $digits = preg_replace('/\D/', '', (string) $booking->booking_number);
        $suffix = $digits !== '' ? substr($digits, -6) : str_pad((string) $booking->id, 6, '0', STR_PAD_LEFT);

        return $bank['va_prefix'] . self::VA_PREFIX . str_pad((string) $booking->id, 6, '0', STR_PAD_LEFT) . $suffix;
    }

    /**
     * Payload QRIS berisi ID pemesanan.
     *
     * Format mengikuti struktur EMVCo yang disederhanakan supaya bisa dibaca
     * oleh scanner QRIS asli saat nanti diganti ke gateway sungguhan.
     */
    public function qrisPayload(Booking $booking, ?Payment $payment = null): string
    {
        $merchant = 'RENTGO';
        $amount = (int) round((float) ($payment?->amount ?? $booking->total_amount));
        $reference = $payment?->payment_number ?? $booking->booking_number;

        $fields = [
            // 00 = versi payload, 01 = tipe (12 = dinamis), 26 = akun merchant
            '000201',
            '010212',
            '26' . $this->tag(26, 'ID.CO.QRIS.WWW' . $booking->id),
            '52040000',
            '5303360', // 360 = IDR
            '54' . $this->tag(54, (string) $amount),
            '5802ID',
            '59' . $this->tag(59, $merchant),
            '60' . $this->tag(60, 'JAKARTA'),
            '62' . $this->tag(62, '05' . $this->tag(5, $reference)),
        ];

        $payload = implode('', $fields) . '6304';

        return $payload . $this->crc16($payload);
    }

    /**
     * Data pembayaran siap pakai untuk halaman pembayaran (frontend).
     *
     * @return array<string, mixed>|null
     */
    public function instructionsFor(Booking $booking, string $method, string $bankCode = self::DEFAULT_BANK): ?array
    {
        if ($method === Payment::METHOD_QRIS) {
            return [
                'method' => Payment::METHOD_QRIS,
                'label' => Payment::METHOD_LABELS[Payment::METHOD_QRIS],
                'reference' => $booking->booking_number,
                'qris_payload' => $this->qrisPayload($booking),
                'amount' => (float) $booking->total_amount,
                'expires_at' => $booking->payment_deadline?->toIso8601String(),
            ];
        }

        if ($method === Payment::METHOD_BANK_TRANSFER) {
            $bank = self::BANKS[$bankCode] ?? self::BANKS[self::DEFAULT_BANK];

            return [
                'method' => Payment::METHOD_BANK_TRANSFER,
                'label' => Payment::METHOD_LABELS[Payment::METHOD_BANK_TRANSFER],
                'reference' => $booking->booking_number,
                'bank' => $bank,
                'banks' => array_values(self::BANKS),
                'va_number' => $this->virtualAccountNumber($booking, $bank['code']),
                'account_name' => 'PT RentGo Indonesia',
                'amount' => (float) $booking->total_amount,
                'expires_at' => $booking->payment_deadline?->toIso8601String(),
            ];
        }

        if ($method === Payment::METHOD_COD) {
            return [
                'method' => Payment::METHOD_COD,
                'label' => Payment::METHOD_LABELS[Payment::METHOD_COD],
                'reference' => $booking->booking_number,
                'amount' => (float) $booking->total_amount,
                'note' => 'Bayar tunai kepada mitra saat serah terima unit. Siapkan uang pas.',
            ];
        }

        return null;
    }

    /** Panjang field TLV (2 digit). */
    private function tag(int $number, string $value): string
    {
        return str_pad($number, 2, '0', STR_PAD_LEFT) . str_pad((string) strlen($value), 2, '0', STR_PAD_LEFT) . $value;
    }

    /** CRC16-CCITT (FALSE) untuk checksum QRIS. */
    private function crc16(string $payload): string
    {
        $crc = 0xFFFF;

        for ($i = 0; $i < strlen($payload); $i++) {
            $crc ^= ord($payload[$i]) << 8;

            for ($bit = 0; $bit < 8; $bit++) {
                $crc = ($crc & 0x8000) ? (($crc << 1) ^ 0x1021) : ($crc << 1);
                $crc &= 0xFFFF;
            }
        }

        return strtoupper(str_pad(dechex($crc), 4, '0', STR_PAD_LEFT));
    }

    /**
     * Kode unik 3 digit untuk mencocokkan transfer masuk dengan booking.
     * Dipakai bila nanti verifikasi dilakukan otomatis.
     */
    public function uniqueCode(Booking $booking): int
    {
        return (int) substr((string) abs(crc32($booking->booking_number)), -3);
    }

    /** Referensi struk yang mudah dibaca manusia. */
    public function receiptNumber(Payment $payment): string
    {
        return 'STRUK-' . Str::upper(Str::substr($payment->payment_number, -8));
    }
}
