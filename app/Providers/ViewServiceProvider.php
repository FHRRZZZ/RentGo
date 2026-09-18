<?php

namespace App\Providers;

use App\Models\Notification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class ViewServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        View::composer(
            'components.notification-dropdown',
            function ($view) {

                if (!Auth::check()) {
                    $view->with([
                        'notifications' => collect(),
                        'unreadCount' => 0,
                    ]);

                    return;
                }

                $user = Auth::user();

                $notifications = Notification::query()
                    ->where('user_id', $user->id)
                    ->latest()
                    ->limit(5)
                    ->get();

                $unreadCount = Notification::query()
                    ->where('user_id', $user->id)
                    ->whereNull('read_at')
                    ->count();

                $view->with([
                    'notifications' => $notifications,
                    'unreadCount' => $unreadCount,
                ]);
            }
        );
    }
}