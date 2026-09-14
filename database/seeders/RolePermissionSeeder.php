<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'manage_users',
            'manage_agents',
            'verify_agents',
            'manage_categories',
            'manage_vehicles',
            'verify_vehicles',
            'manage_bookings',
            'manage_payments',
            'manage_refunds',
            'manage_rentals',
            'manage_transactions',
            'manage_commissions',
            'manage_payouts',
            'manage_customers',
            'manage_reviews',
            'manage_complaints',
            'manage_disputes',
            'view_reports',
            'view_audit_logs',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        $admin = Role::firstOrCreate([
            'name' => 'admin',
            'guard_name' => 'web',
        ]);

        $mitra = Role::firstOrCreate([
            'name' => 'mitra',
            'guard_name' => 'web',
        ]);

        $customer = Role::firstOrCreate([
            'name' => 'customer',
            'guard_name' => 'web',
        ]);

        // Admin memiliki seluruh permission
        $admin->syncPermissions(Permission::all());

        // Mitra
        $mitra->syncPermissions([
            'manage_vehicles',
            'manage_bookings',
            'manage_payments',
            'manage_rentals',
            'manage_transactions',
            'manage_commissions',
            'manage_payouts',
            'manage_reviews',
        ]);

        // Customer
        $customer->syncPermissions([
            'manage_bookings',
            'manage_payments',
            'manage_rentals',
            'manage_reviews',
        ]);
    }
}