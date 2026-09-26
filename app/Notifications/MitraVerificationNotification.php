<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MitraVerificationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected string $decision,
        protected ?string $rejectionReason = null
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $subject = match ($this->decision) {
            'approved' => 'Pengajuan Mitra RentGo Disetujui',
            'rejected' => 'Pengajuan Mitra RentGo Ditolak',
            default => 'Status Pengajuan Mitra RentGo',
        };

        $message = match ($this->decision) {
            'approved' => 'Selamat, pengajuan mitra Anda telah disetujui. Anda sekarang dapat masuk ke portal mitra dan mulai menambahkan unit kendaraan.',
            'rejected' => 'Pengajuan mitra Anda belum dapat disetujui. Alasan: ' . ($this->rejectionReason ?: 'Dokumen atau data belum memenuhi persyaratan.'),
            default => 'Status akun mitra Anda telah diperbarui oleh admin RentGo.',
        };

        $mail = (new MailMessage)
            ->subject($subject)
            ->greeting('Halo ' . ($notifiable->name ?: 'Customer') . ',')
            ->line($message);

        if ($this->decision === 'approved') {
            $mail->action('Buka Portal Mitra', url('/mitra'));
        } elseif ($this->decision === 'rejected') {
            $mail->action('Perbaiki Pengajuan', url('/mitra/daftar'));
        }

        return $mail->line('Terima kasih telah menggunakan RentGo.');
    }
}
