<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Display the reports dashboard.
     */
    public function index(Request $request)
    {
        // Get time range from request (default to 30 days)
        $days = $request->input('days', 30);
        
        // Get summary statistics
        $totalUsers = User::count();
        $totalProducts = Product::count();
        
        // Get stats for the specified time period
        $totalOrders = Order::whereRaw("date(created_at) >= date('now', '-{$days} days')")->count();
        $totalRevenue = Order::whereRaw("date(created_at) >= date('now', '-{$days} days')")->sum('total') ?? 0;
        
        // Get top selling products data for the specified time period
        $topSellingProducts = DB::table('order_items')
            ->select('products.name', DB::raw('SUM(order_items.quantity) as sales'))
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereRaw("date(orders.created_at) >= date('now', '-{$days} days')")
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
    }
    
    /**
     * Get order trend data for the specified number of days.
     */
    private function getOrderTrend($days = 30)
    {
        // For 'This Day', show hourly data
        if ($days == 1) {
            return $this->getHourlyOrderTrend();
        }
        
        $period = now()->subDays($days)->daysUntil(now());
        
        $ordersByDate = Order::selectRaw('date(created_at) as date, COUNT(*) as count')
            ->whereRaw("date(created_at) >= date('now', '-{$days} days')")
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
    private function getRevenueTrend($days = 30)
    {
        // For 'This Day', show hourly data
        if ($days == 1) {
            return $this->getHourlyRevenueTrend();
        }
        
        $period = now()->subDays($days)->daysUntil(now());
        
        $revenueByDate = Order::selectRaw('date(created_at) as date, SUM(total) as sum')
            ->whereRaw("date(created_at) >= date('now', '-{$days} days')")
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
    private function getHourlyOrderTrend()
    {
        $today = now()->startOfDay()->toDateString();
        $hours = range(0, 23);
        
        $ordersByHour = Order::selectRaw("strftime('%H', created_at) as hour, COUNT(*) as count")
            ->whereRaw("date(created_at) = ?", [$today])
            ->groupBy('hour')
            ->pluck('count', 'hour')
            ->toArray();
        
        $result = [];
        foreach ($hours as $hour) {
            $hourDisplay = str_pad($hour, 2, '0', STR_PAD_LEFT) . ':00';
            $result[] = [
                'name' => $hourDisplay,
                'orders' => $ordersByHour[str_pad($hour, 2, '0', STR_PAD_LEFT)] ?? 0,
            ];
        }
        
        return $result;
    }
    
    /**
     * Get hourly revenue trend data for the current day.
     */
    private function getHourlyRevenueTrend()
    {
        $today = now()->startOfDay()->toDateString();
        $hours = range(0, 23);
        
        $revenueByHour = Order::selectRaw("strftime('%H', created_at) as hour, SUM(total) as sum")
            ->whereRaw("date(created_at) = ?", [$today])
            ->groupBy('hour')
            ->pluck('sum', 'hour')
            ->toArray();
        
        $result = [];
        foreach ($hours as $hour) {
            $hourDisplay = str_pad($hour, 2, '0', STR_PAD_LEFT) . ':00';
            $result[] = [
                'name' => $hourDisplay,
                'revenue' => $revenueByHour[str_pad($hour, 2, '0', STR_PAD_LEFT)] ?? 0,
            ];
        }
        
        return $result;
    }
} 