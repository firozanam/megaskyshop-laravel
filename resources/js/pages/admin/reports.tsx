import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DollarSign, 
  ShoppingCart, 
  ShoppingBag, 
  Users, 
  RefreshCw,
  Download
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, AreaChart, Area } from 'recharts';

interface TopSellingProduct {
  name: string;
  sales: number | string;
}

interface TrendDataPoint {
  name: string;
  orders?: number;
  revenue?: number | string;
}

interface ReportsProps {
  totalUsers?: number;
  totalProducts?: number;
  totalOrders?: number;
  totalRevenue?: number | string;
  topSellingProducts?: TopSellingProduct[];
  orderTrend?: TrendDataPoint[];
  revenueTrend?: TrendDataPoint[];
  timeRange?: string;
  error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Admin',
    href: '/admin',
  },
  {
    title: 'Reports',
    href: '/admin/reports',
  },
];

// Helper function to ensure numeric data
const ensureNumeric = (value: number | string | undefined): number => {
  if (value === undefined) return 0;
  if (typeof value === 'string') return parseFloat(value) || 0;
  return value;
};

export default function Reports({ 
  totalUsers = 0, 
  totalProducts = 0, 
  totalOrders = 0, 
  totalRevenue = 0,
  topSellingProducts = [],
  orderTrend = [],
  revenueTrend = [],
  timeRange: initialTimeRange = '30',
  error
}: ReportsProps) {
  const [timeRange, setTimeRange] = useState(initialTimeRange);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Process data to ensure all values are numeric
  const processedTopProducts = topSellingProducts.map(product => ({
    ...product,
    sales: ensureNumeric(product.sales)
  }));

  const processedOrderTrend = orderTrend.map(item => ({
    ...item,
    orders: ensureNumeric(item.orders)
  }));

  const processedRevenueTrend = revenueTrend.map(item => ({
    ...item,
    revenue: ensureNumeric(item.revenue)
  }));

  const numericTotalRevenue = ensureNumeric(totalRevenue);

  // Update data when time range changes
  useEffect(() => {
    if (timeRange !== initialTimeRange) {
      router.get('/admin/reports', { days: timeRange }, {
        preserveState: true,
        replace: true,
        onStart: () => setIsRefreshing(true),
        onFinish: () => setIsRefreshing(false)
      });
    }
  }, [timeRange]);

  // Handle refresh button click
  const handleRefresh = () => {
    setIsRefreshing(true);
    router.reload({ 
      only: ['totalUsers', 'totalProducts', 'totalOrders', 'totalRevenue', 'topSellingProducts', 'orderTrend', 'revenueTrend'],
      onFinish: () => setIsRefreshing(false)
    });
  };

  // Handle export button click
  const handleExport = () => {
    // Create CSV content
    const generateCSV = () => {
      // Header row
      let csv = 'Type,Date,Value\n';
      
      // Add order trend data
      processedOrderTrend.forEach(item => {
        csv += `Order,${item.name},${item.orders}\n`;
      });
      
      // Add revenue trend data
      processedRevenueTrend.forEach(item => {
        csv += `Revenue,${item.name},${item.revenue}\n`;
      });
      
      // Add top selling products
      processedTopProducts.forEach(item => {
        csv += `Product,"${item.name}",${item.sales}\n`;
      });
      
      // Add summary data
      csv += `Summary,Total Users,${totalUsers}\n`;
      csv += `Summary,Total Products,${totalProducts}\n`;
      csv += `Summary,Total Orders,${totalOrders}\n`;
      csv += `Summary,Total Revenue,${numericTotalRevenue}\n`;
      
      return csv;
    };
    
    // Create and download the CSV file
    const csv = generateCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    
    link.setAttribute('href', url);
    link.setAttribute('download', `megaskyshop-report-${date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <Head title="Admin Reports" />

      <div className="flex flex-1 flex-col gap-3 sm:gap-4 p-3 sm:p-4 md:p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded relative mb-3 sm:mb-4 text-sm sm:text-base" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Reports</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              View sales, orders, and customer reports for your store
            </p>
          </div>
          
          <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full xs:w-[150px] sm:w-[180px] text-xs sm:text-sm h-8 sm:h-10">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">This Day</SelectItem>
                <SelectItem value="3">Last 3 Days</SelectItem>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="365">Last Year</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-2 w-full xs:w-auto">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-xs sm:text-sm h-8 sm:h-10 flex-1 xs:flex-none"
              >
                <RefreshCw className={`mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleExport}
                className="text-xs sm:text-sm h-8 sm:h-10 flex-1 xs:flex-none"
              >
                <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Users</CardTitle>
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <div className="text-lg sm:text-2xl font-bold">{totalUsers}</div>
              <p className="text-[10px] sm:text-xs text-emerald-500">+0.00% from last period</p>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Products</CardTitle>
              <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <div className="text-lg sm:text-2xl font-bold">{totalProducts}</div>
              <p className="text-[10px] sm:text-xs text-emerald-500">+38.46% from last period</p>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <div className="text-lg sm:text-2xl font-bold">{totalOrders}</div>
              <p className="text-[10px] sm:text-xs text-emerald-500">+66.67% from last period</p>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <div className="text-lg sm:text-2xl font-bold">৳{numericTotalRevenue.toFixed(2)}</div>
              <p className="text-[10px] sm:text-xs text-emerald-500">+199.03% from last period</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
          <Card className="overflow-hidden">
            <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
              <CardTitle className="text-base sm:text-lg">Order Trend</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Number of orders placed over time
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-4 pb-3 sm:pb-6">
              <div className="h-[200px] xs:h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={processedOrderTrend}
                    margin={{
                      top: 5,
                      right: 10,
                      left: 0,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 10}} />
                    <YAxis tick={{fontSize: 10}} width={30} />
                    <Tooltip contentStyle={{fontSize: '12px'}} />
                    <Legend wrapperStyle={{fontSize: '10px', marginTop: '10px'}} />
                    <Line 
                      type="monotone" 
                      dataKey="orders" 
                      stroke="#8884d8" 
                      activeDot={{ r: 6 }} 
                      strokeWidth={2}
                      name="orders"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
              <CardTitle className="text-base sm:text-lg">Revenue Trend</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Revenue generated over time
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-4 pb-3 sm:pb-6">
              <div className="h-[200px] xs:h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={processedRevenueTrend}
                    margin={{
                      top: 5,
                      right: 10,
                      left: 0,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 10}} />
                    <YAxis tick={{fontSize: 10}} width={30} />
                    <Tooltip contentStyle={{fontSize: '12px'}} />
                    <Legend wrapperStyle={{fontSize: '10px', marginTop: '10px'}} />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#4ade80" 
                      fill="#4ade8080" 
                      strokeWidth={2}
                      name="revenue"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Selling Products */}
        <Card className="overflow-hidden">
          <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-base sm:text-lg">Top Selling Products</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Products with the highest sales volume
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-4 pb-3 sm:pb-6">
            <div className="h-[200px] xs:h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={processedTopProducts}
                  margin={{
                    top: 5,
                    right: 10,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 10}} />
                  <YAxis tick={{fontSize: 10}} width={30} />
                  <Tooltip contentStyle={{fontSize: '12px'}} />
                  <Legend wrapperStyle={{fontSize: '10px', marginTop: '10px'}} />
                  <Bar dataKey="sales" fill="#8884d8" name="sales" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 