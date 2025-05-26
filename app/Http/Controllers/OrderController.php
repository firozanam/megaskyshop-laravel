<?php

namespace App\Http\Controllers;

use App\Mail\OrderConfirmation;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderTracking;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Display a listing of the orders for admin.
     */
    public function adminIndex(Request $request)
    {
        $query = Order::with(['items', 'tracking'])
            ->orderBy('created_at', 'desc');
        
        // Filter by status if provided
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        
        // Search by name, email, or mobile
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('mobile', 'like', "%{$search}%");
            });
        }
        
        $orders = $query->paginate(15)->withQueryString();
        
        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'filters' => $request->only(['status', 'search']),
        ]);
    }
    
    /**
     * Display the specified order for admin.
     */
    public function adminShow(string $id)
    {
        $order = Order::with(['items.product', 'tracking', 'user'])
            ->findOrFail($id);
        
        return Inertia::render('admin/orders/show', [
            'order' => $order,
        ]);
    }
    
    /**
     * Update the specified order status.
     */
    public function updateStatus(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:Pending,Processing,Shipped,Delivered,Cancelled',
        ]);
        
        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }
        
        $order = Order::findOrFail($id);
        $order->status = $request->status;
        $order->save();
        
        // Update tracking status if exists
        if ($order->tracking) {
            $order->tracking->status = $request->status;
            $order->tracking->save();
        }
        
        return redirect()->back()
            ->with('success', 'Order status updated successfully.');
    }
    
    /**
     * Update tracking information for an order.
     */
    public function updateTracking(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'tracking_id' => 'nullable|string|max:255',
            'partner_id' => 'nullable|string|max:255',
            'status' => 'required|in:Pending,Processing,Shipped,Delivered,Cancelled',
            'details' => 'nullable|json',
        ]);
        
        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }
        
        $order = Order::findOrFail($id);
        
        // Create or update tracking information
        $tracking = $order->tracking ?? new OrderTracking(['order_id' => $order->id]);
        $tracking->tracking_id = $request->tracking_id;
        $tracking->partner_id = $request->partner_id;
        $tracking->status = $request->status;
        
        if ($request->has('details')) {
            $tracking->details = $request->details;
        }
        
        $tracking->save();
        
        // Update order status to match tracking status
        $order->status = $request->status;
        $order->save();
        
        return redirect()->back()
            ->with('success', 'Order tracking information updated successfully.');
    }
    
    /**
     * Display a listing of the user's orders.
     */
    public function userIndex()
    {
        $orders = Order::with(['items'])
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);
        
        return Inertia::render('Orders/Index', [
            'orders' => $orders,
        ]);
    }
    
    /**
     * Display the specified order for the user.
     */
    public function userShow(string $id)
    {
        $order = Order::with(['items.product', 'tracking'])
            ->where('user_id', Auth::id())
            ->findOrFail($id);
        
        return Inertia::render('Orders/Show', [
            'order' => $order,
        ]);
    }
    
    /**
     * Store a newly created order.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'shipping_address' => 'required|string',
            'mobile' => 'required|string|max:20',
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);
        
        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }
        
        // Calculate total and validate stock
        $total = 0;
        $items = [];
        
        foreach ($request->items as $item) {
            $product = Product::findOrFail($item['id']);
            
            // Check if enough stock
            if ($product->stock < $item['quantity']) {
                return redirect()->back()
                    ->withErrors(['stock' => "Not enough stock for {$product->name}. Available: {$product->stock}"])
                    ->withInput();
            }
            
            $itemTotal = $product->price * $item['quantity'];
            $total += $itemTotal;
            
            $items[] = [
                'product_id' => $product->id,
                'name' => $product->name,
                'quantity' => $item['quantity'],
                'price' => $product->price,
                'image' => $product->main_image,
            ];
            
            // Reduce stock
            $product->stock -= $item['quantity'];
            $product->save();
        }
        
        // Create order
        $order = Order::create([
            'user_id' => Auth::check() ? Auth::id() : null,
            'name' => $request->name,
            'email' => $request->email,
            'shipping_address' => $request->shipping_address,
            'mobile' => $request->mobile,
            'total' => $total,
            'status' => 'Pending',
        ]);
        
        // Create order items
        foreach ($items as $item) {
            $order->items()->create($item);
        }
        
        // Create tracking
        $order->tracking()->create([
            'status' => 'Pending',
        ]);
        
        // Send order confirmation email to admin if admin email is set
        $adminEmail = config('mail.admin_email');
        if ($adminEmail) {
            try {
                Mail::to($adminEmail)->send(new OrderConfirmation($order));
            } catch (\Exception $e) {
                // Log the error but don't stop the order process
                \Log::error("Failed to send order confirmation email: " . $e->getMessage());
            }
        }
        
        return redirect()->route('orders.success', ['id' => $order->id])
            ->with('success', 'Order placed successfully!');
    }
    
    /**
     * Show order success page.
     */
    public function success(string $id)
    {
        $order = Order::with('items')->findOrFail($id);
        
        // Verify this order belongs to the current user if logged in
        if (Auth::check() && $order->user_id !== Auth::id()) {
            abort(403);
        }
        
        return Inertia::render('Orders/Success', [
            'order' => $order,
        ]);
    }
} 