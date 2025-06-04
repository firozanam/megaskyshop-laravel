<?php

namespace App\Http\Controllers;

use App\Facades\FBPixel;
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
use League\Csv\Writer;
use League\Csv\Reader;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\StreamedResponse;

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
        $content_ids = [];
        
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
            
            // Add product ID to content_ids for Facebook Pixel tracking
            $content_ids[] = (string) $product->id;
            
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
        
        // Track purchase event with Facebook Pixel
        try {
            FBPixel::postEvent([
                'name' => 'Purchase',
                'params' => [
                    'currency' => 'BDT',
                    'value' => $total,
                    'content_type' => 'product',
                    'content_ids' => $content_ids,
                    'order_id' => (string) $order->id
                ]
            ]);
        } catch (\Exception $e) {
            // Log the error but don't stop the order process
            \Log::error("Failed to track Facebook Pixel purchase event: " . $e->getMessage());
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

    /**
     * Export orders to CSV file.
     */
    public function exportOrders(Request $request)
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'status' => 'nullable|in:all,Pending,Processing,Shipped,Delivered,Cancelled',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        // Build query
        $query = Order::with(['items', 'tracking'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Get orders
        $orders = $query->get();

        // Create CSV
        $csv = Writer::createFromString('');
        
        // Add headers
        $csv->insertOne([
            'Order ID',
            'Date',
            'Customer Name',
            'Email',
            'Mobile',
            'Shipping Address',
            'Total',
            'Status',
            'Product ID',
            'Product Name',
            'Quantity',
            'Price',
            'Tracking ID',
            'Partner ID',
        ]);

        // Add data
        foreach ($orders as $order) {
            foreach ($order->items as $item) {
                $csv->insertOne([
                    $order->id,
                    $order->created_at,
                    $order->name,
                    $order->email,
                    $order->mobile,
                    $order->shipping_address,
                    $order->total,
                    $order->status,
                    $item->product_id,
                    $item->name,
                    $item->quantity,
                    $item->price,
                    $order->tracking ? $order->tracking->tracking_id : '',
                    $order->tracking ? $order->tracking->partner_id : '',
                ]);
            }
        }

        // Create response
        $filename = 'orders_export_' . date('Y-m-d_His') . '.csv';
        
        return new StreamedResponse(
            function () use ($csv) {
                echo $csv->toString();
            },
            200,
            [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0',
            ]
        );
    }

    /**
     * Import orders from CSV file.
     */
    public function importOrders(Request $request)
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'csv_file' => 'required|file|mimes:csv,txt',
            'skip_existing' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $skipExisting = $request->has('skip_existing') ? $request->skip_existing : true;
        $file = $request->file('csv_file');
        $reader = Reader::createFromPath($file->getPathname());
        $reader->setHeaderOffset(0);

        $importStats = [
            'total' => 0,
            'created' => 0,
            'skipped' => 0,
            'errors' => 0,
        ];

        // Check if the file has any records
        $records = $reader->getRecords();
        $hasRecords = false;
        foreach ($records as $record) {
            $hasRecords = true;
            break;
        }

        if (!$hasRecords) {
            return redirect()->back()
                ->with('error', 'The CSV file is empty. Please upload a valid file with order data.');
        }

        DB::beginTransaction();
        try {
            $reader = Reader::createFromPath($file->getPathname());
            $reader->setHeaderOffset(0);
            $records = $reader->getRecords();
            $currentOrderId = null;
            $orderData = null;
            $orderItems = [];

            foreach ($records as $offset => $record) {
                $importStats['total']++;
                
                // Check if this is a new order
                if ($currentOrderId !== $record['Order ID']) {
                    // Save previous order if exists
                    if ($currentOrderId !== null) {
                        $this->saveImportedOrder($orderData, $orderItems, $skipExisting, $importStats);
                    }
                    
                    // Start new order
                    $currentOrderId = $record['Order ID'];
                    $orderData = [
                        'id' => $record['Order ID'],
                        'created_at' => $record['Date'],
                        'name' => $record['Customer Name'],
                        'email' => $record['Email'],
                        'mobile' => $record['Mobile'],
                        'shipping_address' => $record['Shipping Address'],
                        'total' => $record['Total'],
                        'status' => $record['Status'],
                        'tracking' => [
                            'tracking_id' => $record['Tracking ID'],
                            'partner_id' => $record['Partner ID'],
                            'status' => $record['Status'],
                        ],
                    ];
                    $orderItems = [];
                }
                
                // Add item to current order
                $orderItems[] = [
                    'product_id' => $record['Product ID'],
                    'name' => $record['Product Name'],
                    'quantity' => $record['Quantity'],
                    'price' => $record['Price'],
                ];
            }
            
            // Save the last order
            if ($currentOrderId !== null) {
                $this->saveImportedOrder($orderData, $orderItems, $skipExisting, $importStats);
            }
            
            DB::commit();
            
            if ($importStats['created'] == 0 && $importStats['skipped'] > 0) {
                return redirect()->back()
                    ->with('warning', "All orders already exist in the database. {$importStats['skipped']} orders were skipped.");
            }
            
            return redirect()->back()
                ->with('success', "Import completed successfully! Created: {$importStats['created']}, Skipped: {$importStats['skipped']}" . 
                    ($importStats['errors'] > 0 ? ", Errors: {$importStats['errors']}" : ""));
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Order import failed: " . $e->getMessage());
            
            return redirect()->back()
                ->withErrors(['import' => "Import failed: " . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Helper method to save an imported order.
     */
    private function saveImportedOrder($orderData, $orderItems, $skipExisting, &$importStats)
    {
        try {
            // Check if order already exists
            $existingOrder = Order::find($orderData['id']);
            if ($existingOrder) {
                if ($skipExisting) {
                    $importStats['skipped']++;
                    return;
                }
            }
            
            // Create or update order
            $order = Order::updateOrCreate(
                ['id' => $orderData['id']],
                [
                    'name' => $orderData['name'],
                    'email' => $orderData['email'],
                    'shipping_address' => $orderData['shipping_address'],
                    'mobile' => $orderData['mobile'],
                    'total' => $orderData['total'],
                    'status' => $orderData['status'],
                    'created_at' => $orderData['created_at'],
                    'updated_at' => now(),
                ]
            );
            
            // Create or update tracking
            OrderTracking::updateOrCreate(
                ['order_id' => $order->id],
                [
                    'tracking_id' => $orderData['tracking']['tracking_id'],
                    'partner_id' => $orderData['tracking']['partner_id'],
                    'status' => $orderData['tracking']['status'],
                ]
            );
            
            // Delete existing items if order already existed
            if ($existingOrder) {
                $order->items()->delete();
            }
            
            // Create order items
            foreach ($orderItems as $item) {
                $order->items()->create([
                    'product_id' => $item['product_id'],
                    'name' => $item['name'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);
            }
            
            $importStats['created']++;
        } catch (\Exception $e) {
            Log::error("Failed to import order {$orderData['id']}: " . $e->getMessage());
            $importStats['errors']++;
        }
    }
} 