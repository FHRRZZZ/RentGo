<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/*
|--------------------------------------------------------------------------
| Domain BOOKING
|--------------------------------------------------------------------------
| Model: Booking, BookingItem, BookingCancellation, Wishlist,
|        RentalCheckout, RentalCheckin, RentalDamage.
*/

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'agent_profile_id',
        'booking_number',
        'rental_start',
        'rental_end',
        'fulfillment_type',
        'pickup_location',
        'pickup_latitude',
        'pickup_longitude',
        'pickup_landmark',
        'delivery_address',
        'delivery_latitude',
        'delivery_longitude',
        'delivery_landmark',
        'rental_amount',
        'delivery_fee',
        'service_fee',
        'additional_fee',
        'deposit_amount',
        'total_amount',
        'status',
        'customer_note',
        'agent_note',
        'payment_deadline',
    ];

    protected $casts = [
        'rental_start' => 'datetime',
        'rental_end' => 'datetime',
        'payment_deadline' => 'datetime',
        'rental_amount' => 'decimal:2',
        'delivery_fee' => 'decimal:2',
        'service_fee' => 'decimal:2',
        'additional_fee' => 'decimal:2',
        'deposit_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'pickup_latitude' => 'float',
        'pickup_longitude' => 'float',
        'delivery_latitude' => 'float',
        'delivery_longitude' => 'float',
    ];

    /**
     * Koordinat titik serah terima aktif sesuai metode pemenuhan.
     * Dipakai peta pada halaman pesanan / serah terima mitra.
     */
    public function activeCoordinate(): ?array
    {
        if ($this->fulfillment_type === 'delivery') {
            return $this->delivery_latitude !== null && $this->delivery_longitude !== null
                ? ['lat' => $this->delivery_latitude, 'lng' => $this->delivery_longitude]
                : null;
        }

        return $this->pickup_latitude !== null && $this->pickup_longitude !== null
            ? ['lat' => $this->pickup_latitude, 'lng' => $this->pickup_longitude]
            : null;
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function agentProfile()
    {
        return $this->belongsTo(AgentProfile::class);
    }

    public function items()
    {
        return $this->hasMany(BookingItem::class);
    }

    public function cancellations()
    {
        return $this->hasMany(BookingCancellation::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function refunds()
    {
        return $this->hasMany(Refund::class);
    }

    public function checkout()
    {
        return $this->hasOne(RentalCheckout::class);
    }

    public function checkin()
    {
        return $this->hasOne(RentalCheckin::class);
    }

    public function rentalDamages()
    {
        return $this->hasMany(RentalDamage::class);
    }

    public function transaction()
    {
        return $this->hasOne(Transaction::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function complaints()
    {
        return $this->hasMany(Complaint::class);
    }

    public function disputes()
    {
        return $this->hasMany(Dispute::class);
    }

    public function rentalCheckout()
    {
        return $this->hasOne(RentalCheckout::class);
    }

    public function rentalCheckin()
    {
        return $this->hasOne(RentalCheckin::class);
    }
}

class BookingItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'vehicle_id',
        'rental_start',
        'rental_end',
        'rental_days',
        'price_per_day',
        'rental_amount',
        'notes',
    ];

    protected $casts = [
        'rental_start' => 'datetime',
        'rental_end' => 'datetime',
        'price_per_day' => 'decimal:2',
        'rental_amount' => 'decimal:2',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}

class BookingCancellation extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'actor_id',
        'reason',
        'cancelled_at',
        'refund_percentage',
        'refund_status',
        'refund_amount',
    ];

    protected $casts = [
        'cancelled_at' => 'datetime',
        'refund_percentage' => 'decimal:2',
        'refund_amount' => 'decimal:2',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}

class Wishlist extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'vehicle_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}

class RentalCheckout extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'vehicle_id',
        'checkout_at',
        'vehicle_condition',
        'photos',
        'odometer',
        'fuel_level',
        'equipment',
        'notes',
        'customer_confirmed',
        'customer_confirmed_at',
    ];

    protected $casts = [
        'checkout_at' => 'datetime',
        'photos' => 'array',
        'equipment' => 'array',
        'customer_confirmed' => 'boolean',
        'customer_confirmed_at' => 'datetime',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function damages()
    {
        return $this->hasMany(RentalDamage::class, 'rental_checkin_id');
    }
}

class RentalCheckin extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'vehicle_id',
        'checkin_at',
        'vehicle_condition',
        'photos',
        'odometer',
        'fuel_level',
        'equipment',
        'notes',
        'is_late_return',
        'late_return_fee',
        'customer_confirmed',
        'customer_confirmed_at',
    ];

    protected $casts = [
        'checkin_at' => 'datetime',
        'photos' => 'array',
        'equipment' => 'array',
        'odometer' => 'decimal:2',
        'fuel_level' => 'decimal:2',
        'is_late_return' => 'boolean',
        'late_return_fee' => 'decimal:2',
        'customer_confirmed' => 'boolean',
        'customer_confirmed_at' => 'datetime',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function damages()
    {
        return $this->hasMany(RentalDamage::class);
    }
}

class RentalDamage extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'vehicle_id',
        'rental_checkin_id',
        'description',
        'location',
        'severity',
        'photos',
        'repair_cost',
        'customer_charge',
        'deducted_from_deposit',
        'status',
        'notes',
    ];

    protected $casts = [
        'photos' => 'array',
        'repair_cost' => 'decimal:2',
        'customer_charge' => 'decimal:2',
        'deducted_from_deposit' => 'boolean',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function rentalCheckin()
    {
        return $this->belongsTo(
            RentalCheckin::class,
            'rental_checkin_id'
        );
    }
}
