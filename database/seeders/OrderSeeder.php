<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderTracking;
use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $csvFile = fopen(base_path("docs/megaskyshop.orders.csv"), "r");
        
        // Skip the first line (header)
        $header = fgetcsv($csvFile);
        
        // Map header indices for easier access
        $headerMap = array_flip($header);
        
        // Track successfully imported orders
        $importedCount = 0;
        $failedCount = 0;
        
        while (($data = fgetcsv($csvFile)) !== false) {
            try {
                // Skip if no data
                if (empty($data[0])) {
                    continue;
                }
                
                // Create order
                $order = Order::create([
                    'user_id' => null, // No user mapping in the new system
                    'name' => $data[$headerMap['name']] ?? 'Unknown',
                    'email' => $data[$headerMap['email']] ?? null,
                    'shipping_address' => $data[$headerMap['shippingAddress']] ?? '',
                    'mobile' => $data[$headerMap['mobile']] ?? '',
                    'total' => $data[$headerMap['total']] ?? 0,
                    'status' => $this->mapStatus($data[$headerMap['status']] ?? 'Pending'),
                    'created_at' => $data[$headerMap['createdAt']] ? date('Y-m-d H:i:s', strtotime($data[$headerMap['createdAt']])) : now(),
                    'updated_at' => $data[$headerMap['updatedAt']] ? date('Y-m-d H:i:s', strtotime($data[$headerMap['updatedAt']])) : now(),
                ]);
                
                // Process items - we need to handle up to 2 items from the CSV format
                for ($i = 0; $i < 2; $i++) {
                    $productId = $data[$headerMap["items[{$i}].id"]] ?? null;
                    $productName = $data[$headerMap["items[{$i}].name"]] ?? null;
                    $quantity = $data[$headerMap["items[{$i}].quantity"]] ?? null;
                    $price = $data[$headerMap["items[{$i}].price"]] ?? null;
                    $image = $data[$headerMap["items[{$i}].image"]] ?? null;
                    
                    if ($productName && $quantity && $price) {
                        // Try to find product by name if we have a product ID from the CSV
                        $product = null;
                        if ($productId) {
                            // First try to find by name for better matching
                            $product = Product::where('name', $productName)->first();
                            
                            // If not found, try to find any product that contains this name
                            if (!$product) {
                                $product = Product::where('name', 'like', "%{$productName}%")->first();
                            }
                        }
                        
                        OrderItem::create([
                            'order_id' => $order->id,
                            'product_id' => $product ? $product->id : null,
                            'name' => $productName,
                            'quantity' => $quantity,
                            'price' => $price,
                            'image' => $this->processImagePath($image),
                        ]);
                    }
                }
                
                // Create tracking information if available
                $trackingId = $data[$headerMap['courier.trackingId']] ?? null;
                $partnerId = $data[$headerMap['courier.partnerId']] ?? null;
                $courierStatus = $data[$headerMap['courier.status']] ?? null;
                $courierDetails = null;
                
                // Collect courier details if available
                if (isset($headerMap['courier.details.consignmentId']) && $data[$headerMap['courier.details.consignmentId']]) {
                    $courierDetails = [
                        'consignmentId' => $data[$headerMap['courier.details.consignmentId']] ?? null,
                        'invoice' => $data[$headerMap['courier.details.invoice']] ?? null,
                        'status' => $data[$headerMap['courier.details.status']] ?? null,
                        'createdAt' => $data[$headerMap['courier.details.createdAt']] ?? null,
                    ];
                }
                
                if ($trackingId || $partnerId || $courierStatus) {
                    OrderTracking::create([
                        'order_id' => $order->id,
                        'tracking_id' => $trackingId,
                        'partner_id' => $partnerId,
                        'status' => $this->mapStatus($courierStatus ?? $order->status),
                        'details' => $courierDetails,
                        'created_at' => $data[$headerMap['courier.createdAt']] ? date('Y-m-d H:i:s', strtotime($data[$headerMap['courier.createdAt']])) : now(),
                        'updated_at' => $data[$headerMap['courier.updatedAt']] ? date('Y-m-d H:i:s', strtotime($data[$headerMap['courier.updatedAt']])) : now(),
                    ]);
                }
                
                $importedCount++;
            } catch (\Exception $e) {
                $failedCount++;
                Log::error('Failed to import order: ' . $e->getMessage(), [
                    'data' => $data,
                    'trace' => $e->getTraceAsString(),
                ]);
            }
        }
        
        fclose($csvFile);
        
        $this->command->info("Imported {$importedCount} orders successfully. Failed: {$failedCount}");
    }
    
    /**
     * Map status from CSV to our system status.
     */
    private function mapStatus(string $status): string
    {
        $status = ucfirst(strtolower($status));
        
        return match($status) {
            'Pending' => 'Pending',
            'Processing' => 'Processing',
            'Shipped' => 'Shipped',
            'Delivered' => 'Delivered',
            'Cancelled' => 'Cancelled',
            default => 'Pending',
        };
    }
    
    /**
     * Process image path from CSV to our system format.
     */
    private function processImagePath(?string $imagePath): ?string
    {
        if (!$imagePath) {
            return null;
        }
        
        // If the path starts with /uploads/, keep it as is
        if (strpos($imagePath, '/uploads/') === 0) {
            return str_replace('/uploads/', 'uploads/', $imagePath);
        }
        
        return $imagePath;
    }
} 