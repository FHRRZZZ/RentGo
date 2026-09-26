<?php

namespace App\Constants;

/**
 * Konstanta status booking di RentGo.
 *
 * Nilai ini harus konsisten dengan enum/string yang dipakai
 * di kolom `status` tabel `bookings`.
 */
class BookingStatus
{
    /** Menunggu pembayaran dari customer. */
    const WAITING_PAYMENT = 'pending_payment';

    /** Pembayaran telah diterima, menunggu konfirmasi mitra. */
    const PAID = 'paid';

    /** Menunggu konfirmasi dari mitra. */
    const WAITING_AGENT_CONFIRMATION = 'waiting_agent_confirmation';

    /** Mitra sudah mengonfirmasi booking. */
    const CONFIRMED = 'confirmed';

    /** Kendaraan siap diambil/diantar. */
    const READY_FOR_PICKUP = 'ready_for_pickup';

    /** Rental sedang berjalan (kendaraan sudah diserahkan). */
    const ONGOING = 'ongoing';

    /** Kendaraan sudah dikembalikan oleh customer. */
    const RETURNED = 'returned';

    /** Proses rental selesai. */
    const COMPLETED = 'completed';

    /** Booking dibatalkan (belum ada pembayaran). */
    const CANCELLED = 'cancelled';

    /** Booking ditolak oleh mitra. */
    const REJECTED = 'rejected';

    /** Booking kadaluwarsa (pembayaran tidak dilakukan tepat waktu). */
    const EXPIRED = 'expired';

    /** Menunggu proses refund setelah pembatalan/penolakan dengan pembayaran terlunasi. */
    const REFUND_PENDING = 'refund_pending';
}
