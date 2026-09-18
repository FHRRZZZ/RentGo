<?php

namespace App\Providers;

use App\Models\AgentPayout;
use App\Policies\AgentPayoutPolicy;
use App\Models\Review;
use App\Policies\ReviewPolicy;
use App\Models\Complaint;
use App\Policies\ComplaintPolicy;
use App\Models\Dispute;
use App\Policies\DisputePolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use App\Models\AuditLog;
use App\Policies\AuditLogPolicy;
use App\Models\Notification;
use App\Policies\NotificationPolicy;

class AuthServiceProvider extends ServiceProvider{
    protected $policies = [
        AgentPayout::class => AgentPayoutPolicy::class,
        Review::class => ReviewPolicy::class,
        Complaint::class => ComplaintPolicy::class,
        Dispute::class => DisputePolicy::class,
        Notification::class => NotificationPolicy::class,
        AuditLog::class => AuditLogPolicy::class,
    ];

    public function boot(): void
    {
    }}