<?php

namespace App\Services;

use App\Models\AgentProfile;
use App\Models\Booking;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Layanan percakapan customer ↔ mitra.
 *
 * Semua akses percakapan melewati service ini agar aturan kepemilikan
 * (siapa yang boleh melihat/mengirim) terpusat di satu tempat.
 */
class MessageService
{
    /**
     * Daftar percakapan milik user (customer atau mitra), siap dikirim ke Inertia.
     */
    public function conversationsFor(User $user)
    {
        $query = Conversation::query()
            ->with([
                'customer:id,name,avatar,phone',
                'agentProfile:id,user_id,agency_name',
                'agentProfile.user:id,name,avatar,phone',
                'latestMessage',
            ])
            ->orderByDesc('last_message_at')
            ->orderByDesc('id');

        if ($user->hasRole('customer')) {
            $query->where('customer_id', $user->id);
        } elseif ($user->hasRole('mitra')) {
            $agentProfileId = $user->agentProfile?->id;
            $query->where('agent_profile_id', $agentProfileId ?? 0);
        }

        return $query->get()->map(
            fn(Conversation $c) => $this->toArray($c, $user)
        )->values()->all();
    }

    /**
     * Ubah satu percakapan menjadi bentuk yang dipakai halaman chat.
     */
    public function toArray(Conversation $conversation, User $user): array
    {
        $conversation->loadMissing([
            'customer:id,name,avatar,phone',
            'agentProfile:id,user_id,agency_name',
            'agentProfile.user:id,name,avatar,phone',
            'messages.sender:id,name,avatar',
            'booking:id,booking_number,status',
        ]);

        $isCustomer = $user->hasRole('customer');

        // Pesan dari sisi lawan yang belum dibaca.
        $unread = $conversation->messages
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->count();

        $name = $isCustomer
            ? $conversation->counterpartLabel($user)
            : ($conversation->customer?->name ?? 'Customer');

        $last = $conversation->messages->last();

        return [
            'id' => $conversation->id,
            'booking_id' => $conversation->booking_id,
            'booking_number' => $conversation->booking?->booking_number,
            'subject' => $conversation->subject
                ?: ($conversation->booking?->booking_number
                    ? 'Pesanan ' . $conversation->booking->booking_number
                    : 'Percakapan sewa'),
            'name' => $name,
            'initials' => mb_strtoupper(mb_substr($name, 0, 1)),
            'tone' => 'bg-stone-200 text-stone-700',
            'online' => false,
            'unread' => $unread,
            'time' => $last?->created_at?->diffForHumans() ?? '',
            'preview' => $last
                ? mb_strimwidth($last->body, 0, 60, '…')
                : 'Belum ada pesan',
            'messages' => $conversation->messages->map(fn(Message $m) => [
                'id' => $m->id,
                'from' => $m->sender_id === $user->id ? 'me' : 'them',
                'text' => $m->body,
                'time' => $m->created_at?->format('d M H:i'),
            ])->values()->all(),
        ];
    }

    /**
     * Ambil percakapan milik user, atau gagal 403 bila bukan pemiliknya.
     */
    public function findForUser(int $conversationId, User $user): Conversation
    {
        $conversation = Conversation::query()->findOrFail($conversationId);

        abort_unless($conversation->involves($user), 403, 'Anda tidak memiliki akses ke percakapan ini.');

        return $conversation;
    }

    /**
     * Cari atau buat percakapan untuk sebuah booking.
     *
     * Dipakai saat customer menekan "Chat Mitra" dari halaman Pesanan Saya.
     */
    public function findOrCreateForBooking(Booking $booking, User $user): Conversation
    {
        abort_unless(
            $booking->customer_id === $user->id || $user->hasRole('admin'),
            403,
            'Anda tidak memiliki akses ke pesanan ini.'
        );

        $agentProfileId = $booking->agent_profile_id;

        abort_if(!$agentProfileId, 422, 'Pesanan ini belum memiliki mitra penyedia.');

        return Conversation::firstOrCreate(
            [
                'booking_id' => $booking->id,
                'customer_id' => $booking->customer_id,
                'agent_profile_id' => $agentProfileId,
            ],
            [
                'subject' => 'Pesanan ' . $booking->booking_number,
                'last_message_at' => now(),
            ]
        );
    }

    /**
     * Cari atau buat percakapan langsung dengan seorang mitra (tanpa pesanan).
     *
     * Dipakai saat pengunjung menekan "Chat Mitra" pada halaman toko mitra
     * (Store.jsx) sebelum ada pesanan apa pun.
     */
    public function findOrCreateForAgent(AgentProfile $agentProfile, User $user): Conversation
    {
        abort_if(
            $agentProfile->user_id === $user->id,
            403,
            'Anda tidak dapat memulai percakapan dengan toko Anda sendiri.'
        );

        return Conversation::firstOrCreate(
            [
                'booking_id' => null,
                'customer_id' => $user->id,
                'agent_profile_id' => $agentProfile->id,
            ],
            [
                'subject' => 'Tanya ' . ($agentProfile->agency_name ?: 'Mitra RentGo'),
                'last_message_at' => now(),
            ]
        );
    }

    /**
     * Kirim pesan ke dalam percakapan.
     */
    public function send(Conversation $conversation, User $user, string $body): Message
    {
        abort_unless($conversation->involves($user), 403, 'Anda tidak memiliki akses ke percakapan ini.');

        return DB::transaction(function () use ($conversation, $user, $body) {
            $role = $user->hasRole('mitra')
                ? 'mitra'
                : ($user->hasRole('admin') ? 'admin' : 'customer');

            $message = $conversation->messages()->create([
                'sender_id' => $user->id,
                'sender_role' => $role,
                'body' => $body,
            ]);

            $conversation->update(['last_message_at' => now()]);

            return $message->refresh();
        });
    }

    /**
     * Tandai semua pesan lawan sebagai sudah dibaca.
     */
    public function markAsRead(Conversation $conversation, User $user): void
    {
        $conversation->messages()
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }
}
