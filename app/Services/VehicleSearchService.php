<?php

namespace App\Services;

use App\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class VehicleSearchService
{
    public function search(array $filters): Collection
    {
        $rentalStart = Carbon::parse($filters['rental_start'])->startOfDay();
        $rentalEnd = Carbon::parse($filters['rental_end'])->endOfDay();

        $query = Vehicle::query()
            ->with([
                'agentProfile',
                'category',
                'photos',
                'prices',
                'availabilities',
            ])
            ->where('status', 'available');

        /*
         * Filter jenis kendaraan
         */
        if (!empty($filters['vehicle_type'])) {
            $query->where(
                'vehicle_type',
                $filters['vehicle_type']
            );
        }

        /*
         * Filter kategori kendaraan
         */
        if (!empty($filters['vehicle_category_id'])) {
            $query->where(
                'vehicle_category_id',
                $filters['vehicle_category_id']
            );
        }

        /*
         * Filter lokasi pickup
         */
        if (!empty($filters['location'])) {
            $location = $filters['location'];

            $query->where(
                'pickup_location',
                'like',
                "%{$location}%"
            );
        }

        /*
         * Filter transmisi
         */
        if (!empty($filters['transmission'])) {
            $query->where('transmission', $filters['transmission']);
        }

        /*
         * Filter kapasitas kursi minimum
         */
        if (!empty($filters['seat_capacity'])) {
            $query->where('seat_capacity', '>=', (int) $filters['seat_capacity']);
        }

        /*
         * Exclude kendaraan yang sudah memiliki booking aktif
         * pada periode sewa yang diminta.
         */
        $query->whereDoesntHave('bookingItems', function (Builder $bookingItemQuery) use ($rentalStart, $rentalEnd) {
            $bookingItemQuery
                ->whereHas('booking', function (Builder $bQuery) {
                    $bQuery->whereNotIn('status', [
                        'rejected',
                        'cancelled',
                        'completed',
                        'expired',
                    ]);
                })
                ->whereDate('rental_start', '<=', $rentalEnd->toDateString())
                ->whereDate('rental_end', '>=', $rentalStart->toDateString());
        });

        /*
         * Kendaraan tidak boleh memiliki availability
         * yang berstatus unavailable atau maintenance
         * dan bertabrakan dengan periode sewa.
         *
         * Overlap:
         *
         * availability.start_date <= rental_end
         * AND
         * availability.end_date >= rental_start
         */
        $query->whereDoesntHave(
            'availabilities',
            function (Builder $availabilityQuery) use (
                $rentalStart,
                $rentalEnd
            ) {
                $availabilityQuery
                    ->whereIn('status', [
                        'unavailable',
                        'maintenance',
                    ])
                    ->whereDate(
                        'start_date',
                        '<=',
                        $rentalEnd->toDateString()
                    )
                    ->whereDate(
                        'end_date',
                        '>=',
                        $rentalStart->toDateString()
                    );
            }
        );

        /*
         * Ambil kendaraan yang memiliki harga aktif
         * yang berlaku pada tanggal mulai rental.
         */
        $query->whereHas(
            'prices',
            function (Builder $priceQuery) use ($rentalStart) {
                $priceQuery
                    ->where('is_active', true)
                    ->where(function (Builder $query) use ($rentalStart) {
                        $query
                            ->whereNull('start_date')
                            ->orWhereDate(
                                'start_date',
                                '<=',
                                $rentalStart->toDateString()
                            );
                    })
                    ->where(function (Builder $query) use ($rentalStart) {
                        $query
                            ->whereNull('end_date')
                            ->orWhereDate(
                                'end_date',
                                '>=',
                                $rentalStart->toDateString()
                            );
                    });
            }
        );

        $vehicles = $query
            ->orderBy('name')
            ->get();

        /*
         * Tentukan harga aktif untuk masing-masing kendaraan.
         */
        $vehicles->each(function (Vehicle $vehicle) use ($rentalStart) {
            $activePrice = $vehicle->prices
                ->filter(function ($price) use ($rentalStart) {
                    if (!$price->is_active) {
                        return false;
                    }

                    if (
                        $price->start_date &&
                        $price->start_date->gt($rentalStart)
                    ) {
                        return false;
                    }

                    if (
                        $price->end_date &&
                        $price->end_date->lt($rentalStart)
                    ) {
                        return false;
                    }

                    return true;
                })
                ->sortByDesc(function ($price) {
                    return $price->start_date?->timestamp ?? 0;
                })
                ->first();

            $vehicle->search_price = $activePrice?->price_per_day;
        });

        /*
         * Filter berdasarkan harga minimum.
         */
        if (isset($filters['min_price'])) {
            $vehicles = $vehicles->filter(function (Vehicle $vehicle) use ($filters) {
                return $vehicle->search_price !== null
                    && $vehicle->search_price >= $filters['min_price'];
            });
        }

        /*
         * Filter berdasarkan harga maksimum.
         */
        if (isset($filters['max_price'])) {
            $vehicles = $vehicles->filter(function (Vehicle $vehicle) use ($filters) {
                return $vehicle->search_price !== null
                    && $vehicle->search_price <= $filters['max_price'];
            });
        }

        return $vehicles->values();
    }
}