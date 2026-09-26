<?php

namespace App\Http\Requests;

use App\Models\Payment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/*
|--------------------------------------------------------------------------
| Domain PEMBAYARAN
|--------------------------------------------------------------------------
| Request: StorePaymentRequest, VerifyPaymentRequest, ProcessRefundRequest,
| StoreTransactionRequest, ProcessAgentPayoutRequest.
*/

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'booking_id' => ['required', 'integer', 'exists:bookings,id'],
            'payment_method' => [
                'required',
                Rule::in([
                    Payment::METHOD_COD,
                    Payment::METHOD_QRIS,
                    Payment::METHOD_BANK_TRANSFER,
                ]),
            ],
            // Bank tujuan untuk transfer VA (opsional, ada default).
            'bank_code' => ['nullable', 'string', Rule::in(['BCA', 'BNI', 'BRI', 'Mandiri'])],
            'proof_file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // COD dibayar tunai saat serah terima unit, jadi tidak perlu bukti.
            if ($this->payment_method === Payment::METHOD_COD) {
                return;
            }

            // QRIS & transfer bank diverifikasi manual dari bukti transfer.
            if (!$this->hasFile('proof_file')) {
                $validator->errors()->add(
                    'proof_file',
                    'Bukti pembayaran wajib diupload untuk metode QRIS dan transfer bank.'
                );
            }
        });
    }

    public function messages(): array
    {
        return [
            'booking_id.required' => 'Booking wajib dipilih.',
            'booking_id.exists' => 'Booking tidak ditemukan.',
            'payment_method.required' => 'Metode pembayaran wajib dipilih.',
            'payment_method.in' => 'Metode pembayaran harus COD, QRIS, atau Transfer Bank.',
            'bank_code.in' => 'Bank tujuan tidak didukung.',
            'proof_file.file' => 'Bukti pembayaran harus berupa file.',
            'proof_file.mimes' => 'Bukti pembayaran harus berupa JPG, JPEG, PNG, atau PDF.',
            'proof_file.max' => 'Ukuran bukti pembayaran maksimal 5 MB.',
            'notes.max' => 'Catatan maksimal 1000 karakter.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('booking_id')) {
            $this->merge(['booking_id' => (int) $this->booking_id]);
        }

        if ($this->has('bank_code') && $this->bank_code) {
            $this->merge(['bank_code' => strtoupper((string) $this->bank_code)]);
        }
    }
}

class VerifyPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(['paid', 'failed', 'expired', 'cancelled'])],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Status pembayaran wajib dipilih.',
            'status.in' => 'Status pembayaran tidak valid.',
            'notes.string' => 'Catatan harus berupa teks.',
            'notes.max' => 'Catatan maksimal 1000 karakter.',
        ];
    }
}

class ProcessRefundRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(['processing', 'completed', 'failed', 'cancelled'])],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Status refund wajib dipilih.',
            'status.in' => 'Status refund tidak valid.',
            'notes.string' => 'Catatan harus berupa teks.',
            'notes.max' => 'Catatan maksimal 1000 karakter.',
        ];
    }
}

class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole(['admin', 'mitra']) ?? false;
    }

    public function rules(): array
    {
        return [
            'booking_id' => ['required', 'integer', 'exists:bookings,id'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'booking_id.required' => 'Booking wajib dipilih.',
            'booking_id.exists' => 'Booking tidak ditemukan.',
            'notes.max' => 'Catatan maksimal 2000 karakter.',
        ];
    }
}

class ProcessAgentPayoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(['processing', 'paid', 'failed', 'cancelled'])],
            'payout_method' => ['required', Rule::in(['bank_transfer', 'cash'])],
            'account_name' => ['nullable', 'string', 'max:255'],
            'account_number' => ['nullable', 'string', 'max:100'],
            'bank_name' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Status payout wajib dipilih.',
            'status.in' => 'Status payout tidak valid.',
            'payout_method.required' => 'Metode payout wajib dipilih.',
            'payout_method.in' => 'Metode payout tidak valid.',
            'account_name.max' => 'Nama rekening maksimal 255 karakter.',
            'account_number.max' => 'Nomor rekening maksimal 100 karakter.',
            'notes.max' => 'Catatan maksimal 2000 karakter.',
        ];
    }
}
