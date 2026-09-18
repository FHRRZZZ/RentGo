<div class="notification-wrapper">

    <button
        type="button"
        class="notification-button"
        onclick="toggleNotificationDropdown()"
        aria-label="Notifikasi"
    >
        🔔

        @if ($unreadCount > 0)
            <span class="notification-badge">
                {{ $unreadCount > 99 ? '99+' : $unreadCount }}
            </span>
        @endif
    </button>


    <div
        id="notification-dropdown"
        class="notification-dropdown"
    >

        <div class="notification-header">

            <strong>
                Notifikasi
            </strong>

            @if ($unreadCount > 0)
                <span>
                    {{ $unreadCount }} belum dibaca
                </span>
            @endif

        </div>


        @forelse ($notifications as $notification)

            @php
                $bookingId =
                    $notification->data['booking_id'] ?? null;

                $disputeId =
                    $notification->data['dispute_id'] ?? null;

                if ($disputeId) {
                    $targetUrl = route(
                        'disputes.show',
                        $disputeId
                    );
                } elseif ($bookingId) {
                    $targetUrl = route(
                        'bookings.show',
                        $bookingId
                    );
                } else {
                    $targetUrl = route(
                        'notifications.show',
                        $notification
                    );
                }
            @endphp


            <a
                href="{{ $targetUrl }}"
                class="notification-item
                    {{ !$notification->read_at ? 'notification-unread' : '' }}"
            >

                <div class="notification-item-title">

                    {{ $notification->title }}

                    @if (!$notification->read_at)
                        <span class="notification-dot"></span>
                    @endif

                </div>

                <div class="notification-item-message">
                    {{ \Illuminate\Support\Str::limit(
                        $notification->message,
                        90
                    ) }}
                </div>

                <div class="notification-item-time">
                    {{ $notification->created_at?->diffForHumans() }}
                </div>

            </a>

        @empty

            <div class="notification-empty">
                Belum ada notifikasi.
            </div>

        @endforelse


        <div class="notification-footer">

            <a
                href="{{ route('notifications.index') }}"
            >
                Lihat Semua Notifikasi
            </a>

        </div>

    </div>

</div>


<style>
    .notification-wrapper {
        position: relative;
        display: inline-block;
    }

    .notification-button {
        position: relative;
        width: 42px;
        height: 42px;
        border: none;
        border-radius: 50%;
        background: #f3f4f6;
        cursor: pointer;
        font-size: 20px;
    }

    .notification-button:hover {
        background: #e5e7eb;
    }

    .notification-badge {
        position: absolute;
        top: -4px;
        right: -4px;

        min-width: 18px;
        height: 18px;

        padding: 0 5px;

        display: flex;
        align-items: center;
        justify-content: center;

        border-radius: 999px;

        background: #dc2626;
        color: white;

        font-size: 11px;
        font-weight: bold;
    }

    .notification-dropdown {
        display: none;

        position: absolute;
        top: 50px;
        right: 0;

        width: 360px;
        max-width: calc(100vw - 30px);

        background: white;

        border: 1px solid #e5e7eb;
        border-radius: 10px;

        box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.12);

        overflow: hidden;

        z-index: 9999;
    }

    .notification-dropdown.show {
        display: block;
    }

    .notification-header {
        padding: 15px;

        display: flex;
        justify-content: space-between;
        align-items: center;

        border-bottom: 1px solid #e5e7eb;
    }

    .notification-header span {
        font-size: 12px;
        color: #6b7280;
    }

    .notification-item {
        display: block;

        padding: 14px 15px;

        text-decoration: none;
        color: #111827;

        border-bottom: 1px solid #f3f4f6;
    }

    .notification-item:hover {
        background: #f9fafb;
    }

    .notification-unread {
        background: #eff6ff;
    }

    .notification-item-title {
        font-size: 14px;
        font-weight: bold;

        display: flex;
        align-items: center;
        gap: 7px;
    }

    .notification-item-message {
        margin-top: 5px;

        font-size: 13px;
        color: #6b7280;

        line-height: 1.4;
    }

    .notification-item-time {
        margin-top: 6px;

        font-size: 11px;
        color: #9ca3af;
    }

    .notification-dot {
        width: 7px;
        height: 7px;

        border-radius: 50%;

        background: #2563eb;

        display: inline-block;
    }

    .notification-empty {
        padding: 30px 15px;

        text-align: center;

        color: #6b7280;
        font-size: 14px;
    }

    .notification-footer {
        padding: 12px;

        text-align: center;

        border-top: 1px solid #e5e7eb;
    }

    .notification-footer a {
        color: #2563eb;
        text-decoration: none;

        font-size: 13px;
        font-weight: bold;
    }

    @media (max-width: 500px) {

        .notification-dropdown {
            position: fixed;

            top: 60px;
            right: 15px;
            left: 15px;

            width: auto;
            max-width: none;
        }

    }
</style>


<script>
    function toggleNotificationDropdown() {

        const dropdown =
            document.getElementById(
                'notification-dropdown'
            );

        dropdown.classList.toggle('show');
    }


    document.addEventListener(
        'click',
        function (event) {

            const wrapper =
                document.querySelector(
                    '.notification-wrapper'
                );

            const dropdown =
                document.getElementById(
                    'notification-dropdown'
                );

            if (
                wrapper &&
                dropdown &&
                !wrapper.contains(event.target)
            ) {
                dropdown.classList.remove('show');
            }

        }
    );
</script>