<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Controller;
use App\Models\AgentProfile;
use App\Models\Booking;
use App\Models\Conversation;
use App\Services\MessageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Percakapan customer ↔ mitra.
 *
 * Satu controller melayani kedua peran; pemilihan halaman (customer/mitra)
 * ditentukan dari role user agar tidak ada route duplikat.
 */
class MessageController extends Controller
{
    public function __construct(
        protected MessageService $messageService
    ) {}

    /**
     * Halaman daftar percakapan.
     */
    public function index(Request $request): \Inertia\Response
    {
        $user = Auth::user();
        $conversations = $this->messageService->conversationsFor($user);

        $page = $user->hasRole('mitra')
            ? 'Agent/Messages'
            : 'Message/Index';

        return \Inertia\Inertia::render($page, [
            'conversations' => $conversations,
        ]);
    }

    /**
     * Mulai (atau buka kembali) percakapan untuk sebuah pesanan.
     *
     * Customer memakai tombol "Chat Mitra" pada halaman Pesanan Saya; mitra
     * memakai tombol pada detail pesanan. Setelah percakapan tersedia, user
     * diarahkan ke halaman pesan dengan percakapan tersebut terpilih.
     */
    public function startForBooking(Booking $booking): RedirectResponse
    {
        $user = Auth::user();

        // Mitra hanya boleh membuka percakapan untuk pesanannya sendiri.
        if ($user->hasRole('mitra')) {
            abort_unless(
                $booking->agent_profile_id === $user->agentProfile?->id,
                403,
                'Anda tidak memiliki akses ke pesanan ini.'
            );
        }

        $conversation = $this->messageService->findOrCreateForBooking($booking, $user);

        return redirect()
            ->route('message.index', ['conversation' => $conversation->id])
            ->with('success', 'Percakapan dibuka. Silakan kirim pesan Anda.');
    }

    /**
     * Mulai (atau buka kembali) percakapan langsung dengan seorang mitra
     * tanpa memerlukan pesanan. Dipakai tombol "Chat Mitra" pada halaman
     * toko mitra (Store.jsx).
     */
    public function startForAgent(AgentProfile $agentProfile): RedirectResponse
    {
        $user = Auth::user();

        $conversation = $this->messageService->findOrCreateForAgent($agentProfile, $user);

        return redirect()
            ->route('message.index', ['conversation' => $conversation->id])
            ->with('success', 'Percakapan dibuka. Silakan kirim pesan Anda.');
    }

    /**
     * Kirim pesan baru ke sebuah percakapan.
     */
    public function store(Request $request, Conversation $conversation): RedirectResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $this->messageService->send($conversation, $user, $validated['body']);

        return redirect()
            ->route('message.index', ['conversation' => $conversation->id])
            ->with('success', 'Pesan terkirim.');
    }

    /**
     * Tandai pesan pada percakapan sebagai sudah dibaca.
     */
    public function markAsRead(Conversation $conversation): RedirectResponse
    {
        $this->messageService->markAsRead($conversation, Auth::user());

        return redirect()
            ->route('message.index', ['conversation' => $conversation->id]);
    }
}
