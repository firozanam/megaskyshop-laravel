<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminCustomerController extends Controller
{
    /**
     * Display a listing of customers.
     */
    public function index(Request $request)
    {
        // Start with a base query
        $query = Order::query()
            ->select(
                DB::raw('COALESCE(user_id, CONCAT("guest_", mobile)) as customer_id'),
                'name',
                'email',
                'mobile',
                DB::raw('MIN(created_at) as first_order_date'),
                DB::raw('COUNT(*) as order_count'),
                DB::raw('SUM(total) as total_spent'),
                DB::raw('MAX(created_at) as last_order_date'),
                DB::raw('IF(user_id IS NULL, "guest", "registered") as customer_type')
            )
            ->groupBy('customer_id', 'name', 'email', 'mobile', 'customer_type');

        // Apply search filter if provided
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('mobile', 'like', "%{$search}%");
            });
        }

        // Apply customer type filter if provided
        if ($request->has('type') && in_array($request->type, ['registered', 'guest'])) {
            if ($request->type === 'registered') {
                $query->whereNotNull('user_id');
            } else {
                $query->whereNull('user_id');
            }
        }

        // Sort options
        $sortField = $request->sort_by ?? 'last_order_date';
        $sortDirection = $request->sort_direction ?? 'desc';
        
        // Validate sort field
        $allowedSortFields = [
            'name', 'email', 'first_order_date', 'last_order_date', 
            'order_count', 'total_spent'
        ];
        
        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'last_order_date';
        }
        
        $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');

        // Execute query with pagination
        $customers = $query->paginate(15)->withQueryString();

        // Return view with data
        return Inertia::render('admin/customers/index', [
            'customers' => $customers,
            'filters' => $request->only(['search', 'type', 'sort_by', 'sort_direction']),
        ]);
    }

    /**
     * Display customer details with their order history.
     */
    public function show(Request $request, $id)
    {
        // Determine if this is a user ID or a guest ID
        $isRegistered = !str_starts_with($id, 'guest_');
        $mobile = null; // Initialize mobile variable here to avoid undefined variable error
        
        if ($isRegistered) {
            // For registered users
            $user = User::findOrFail($id);
            $customer = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'mobile' => $this->getCustomerMobile($user->id),
                'type' => 'registered',
                'created_at' => $user->created_at,
            ];
            
            $orders = Order::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->with(['items', 'tracking'])
                ->paginate(10);
                
            // For registered users, we need to get the mobile from their orders
            $mobile = $this->getCustomerMobile($user->id);
        } else {
            // For guest users, extract the mobile number from guest ID
            $mobile = substr($id, 6);
            
            // Get the first order to extract customer details
            $firstOrder = Order::whereNull('user_id')
                ->where('mobile', $mobile)
                ->first();
                
            if (!$firstOrder) {
                return redirect()->route('admin.customers.index')
                    ->with('error', 'Customer not found');
            }
            
            $customer = [
                'id' => $id,
                'name' => $firstOrder->name,
                'email' => $firstOrder->email,
                'mobile' => $firstOrder->mobile,
                'type' => 'guest',
                'created_at' => $firstOrder->created_at,
            ];
            
            $orders = Order::whereNull('user_id')
                ->where('mobile', $mobile)
                ->orderBy('created_at', 'desc')
                ->with(['items', 'tracking'])
                ->paginate(10);
        }
        
        // Calculate customer statistics
        $stats = [
            'total_orders' => $orders->total(),
            'total_spent' => Order::when($isRegistered, function($query) use ($id) {
                    $query->where('user_id', $id);
                }, function($query) use ($mobile) {
                    if ($mobile) {
                        $query->whereNull('user_id')->where('mobile', $mobile);
                    }
                })->sum('total'),
            'average_order_value' => Order::when($isRegistered, function($query) use ($id) {
                    $query->where('user_id', $id);
                }, function($query) use ($mobile) {
                    if ($mobile) {
                        $query->whereNull('user_id')->where('mobile', $mobile);
                    }
                })->avg('total'),
            'first_order_date' => Order::when($isRegistered, function($query) use ($id) {
                    $query->where('user_id', $id);
                }, function($query) use ($mobile) {
                    if ($mobile) {
                        $query->whereNull('user_id')->where('mobile', $mobile);
                    }
                })->min('created_at'),
            'last_order_date' => Order::when($isRegistered, function($query) use ($id) {
                    $query->where('user_id', $id);
                }, function($query) use ($mobile) {
                    if ($mobile) {
                        $query->whereNull('user_id')->where('mobile', $mobile);
                    }
                })->max('created_at'),
        ];
        
        return Inertia::render('admin/customers/show', [
            'customer' => $customer,
            'orders' => $orders,
            'stats' => $stats,
        ]);
    }
    
    /**
     * Get the customer's mobile number from their orders.
     */
    private function getCustomerMobile($userId)
    {
        $order = Order::where('user_id', $userId)->latest()->first();
        return $order ? $order->mobile : null;
    }
} 