<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;

use App\Http\Requests\StoreWishlistRequest;
use App\Models\Wishlist;
use App\Services\WishlistService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class WishlistController extends Controller
{
    public function __construct(
        protected WishlistService $wishlistService
    ) {}

    public function index(Request $request): View|JsonResponse
    {
        $this->authorize('viewAny', Wishlist::class);

        $wishlists = $this->wishlistService->getWishlist(Auth::user());

        if (view()->exists('wishlists.index')) {
            return view('wishlists.index', compact('wishlists'));
        }

        return response()->json($wishlists);
    }

    public function store(StoreWishlistRequest $request): RedirectResponse|JsonResponse
    {
        $this->authorize('create', Wishlist::class);

        $wishlist = $this->wishlistService->add(
            Auth::user(),
            $request->integer('vehicle_id')
        );

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Kendaraan berhasil ditambahkan ke wishlist.',
                'wishlist' => $wishlist,
            ], 201);
        }

        return redirect()->back()->with('success', 'Kendaraan berhasil ditambahkan ke wishlist.');
    }

    public function destroy(Request $request, Wishlist $wishlist): RedirectResponse|JsonResponse
    {
        $this->authorize('delete', $wishlist);

        $this->wishlistService->remove(Auth::user(), $wishlist);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Kendaraan berhasil dihapus dari wishlist.',
            ]);
        }

        return redirect()->back()->with('success', 'Kendaraan berhasil dihapus dari wishlist.');
    }
}
