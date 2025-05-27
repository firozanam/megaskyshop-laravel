<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Display the reports dashboard.
     */
    public function index(Request $request)
    {
        try {
            // Get time range from request (default to 30 days)
            $days = $request->input('days', 30);
            
            // Get summary statistics
            $totalUsers = User::count();
            $totalProducts = Product::count();
            
            // Get cutoff date
            $cutoffDate = Carbon::now()->subDays($days)->startOfDay();
            
            // Get stats for the specified time period
            $totalOrders = Order::where('created_at', '>=', $cutoffDate)->count();
            $totalRevenue = Order::where('created_at', '>=', $cutoffDate)->sum('total') ?? 0;
            
            // Get top selling products data for the specified time period
            $topSellingProducts = DB::table('order_items')
                ->select('products.name', DB::raw('SUM(order_items.quantity) as sales'))
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.created_at', '>=', $cutoffDate)
                ->groupBy('products.id', 'products.name')
                ->orderBy('sales', 'desc')
                ->limit(5)
                ->get();
            
            // Get order trend data
            $orderTrend = $this->getOrderTrend($days);
            
            // Get revenue trend data
            $revenueTrend = $this->getRevenueTrend($days);
            
            return Inertia::render('admin/reports', [
                'totalUsers' => $totalUsers,
                'totalProducts' => $totalProducts,
                'totalOrders' => $totalOrders,
                'totalRevenue' => $totalRevenue,
                'topSellingProducts' => $topSellingProducts,
                'orderTrend' => $orderTrend,
                'revenueTrend' => $revenueTrend,
                'timeRange' => (string) $days,
            ]);
        } catch (\Exception $e) {
            // Log the exception
            \Log::error('Reports error: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            
            // Return empty data with error message
            return Inertia::render('admin/reports', [
                'totalUsers' => 0,
                'totalProducts' => 0,
                'totalOrders' => 0,
                'totalRevenue' => 0,
                'topSellingProducts' => [],
                'orderTrend' => [],
                'revenueTrend' => [],
                'timeRange' => (string) $days,
                'error' => $e->getMessage(),
            ]);
        }
    }
    
    /**
     * Get order trend data for the specified number of days.
     */
    public function getOrderTrend($days = 30)
    {
        // For 'This Day', show hourly data
        if ($days == 1) {
            return $this->getHourlyOrderTrend();
        }
        
        // Replace daysUntil with a manual date generation approach
        $cutoffDate = Carbon::now()->subDays($days)->startOfDay();
        $endDate = Carbon::now();
        
        // Generate date range manually
        $period = [];
        for ($date = clone $cutoffDate; $date->lte($endDate); $date->addDay()) {
            $period[] = clone $date;
        }
        
        // Get orders grouped by date
        $ordersByDate = Order::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count')
            )
            ->where('created_at', '>=', $cutoffDate)
            ->groupBy('date')
            ->pluck('count', 'date')
            ->toArray();
        
        $result = [];
        foreach ($period as $date) {
            $dateString = $date->toDateString();
            $result[] = [
                'name' => $dateString,
                'orders' => $ordersByDate[$dateString] ?? 0,
            ];
        }
        
        return $result;
    }
    
    /**
     * Get revenue trend data for the specified number of days.
     */
    public function getRevenueTrend($days = 30)
    {
        // For 'This Day', show hourly data
        if ($days == 1) {
            return $this->getHourlyRevenueTrend();
        }
        
        // Replace daysUntil with a manual date generation approach
        $cutoffDate = Carbon::now()->subDays($days)->startOfDay();
        $endDate = Carbon::now();
        
        // Generate date range manually
        $period = [];
        for ($date = clone $cutoffDate; $date->lte($endDate); $date->addDay()) {
            $period[] = clone $date;
        }
        
        // Get revenue grouped by date
        $revenueByDate = Order::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total) as sum')
            )
            ->where('created_at', '>=', $cutoffDate)
            ->groupBy('date')
            ->pluck('sum', 'date')
            ->toArray();
        
        $result = [];
        foreach ($period as $date) {
            $dateString = $date->toDateString();
            $result[] = [
                'name' => $dateString,
                'revenue' => $revenueByDate[$dateString] ?? 0,
            ];
        }
        
        return $result;
    }
    
    /**
     * Get hourly order trend data for the current day.
     */
    public function getHourlyOrderTrend()
    {
        $today = now()->startOfDay();
        $hours = range(0, 23);
        
        // Get orders grouped by hour for today
        $ordersByHour = Order::select(
                DB::raw('HOUR(created_at) as hour'),
                DB::raw('COUNT(*) as count')
            )
            ->whereDate('created_at', $today->toDateString())
            ->groupBy('hour')
            ->pluck('count', 'hour')
            ->toArray();
        
        $result = [];
        foreach ($hours as $hour) {
            $hourDisplay = str_pad($hour, 2, '0', STR_PAD_LEFT) . ':00';
            $result[] = [
                'name' => $hourDisplay,
                'orders' => $ordersByHour[$hour] ?? 0,
            ];
        }
        
        return $result;
    }
    
    /**
     * Get hourly revenue trend data for the current day.
     */
    public function getHourlyRevenueTrend()
    {
        $today = now()->startOfDay();
        $hours = range(0, 23);
        
        // Get revenue grouped by hour for today
        $revenueByHour = Order::select(
                DB::raw('HOUR(created_at) as hour'),
                DB::raw('SUM(total) as sum')
            )
            ->whereDate('created_at', $today->toDateString())
            ->groupBy('hour')
            ->pluck('sum', 'hour')
            ->toArray();
        
        $result = [];
        foreach ($hours as $hour) {
            $hourDisplay = str_pad($hour, 2, '0', STR_PAD_LEFT) . ':00';
            $result[] = [
                'name' => $hourDisplay,
                'revenue' => $revenueByHour[$hour] ?? 0,
            ];
        }
        
        return $result;
    }
} 