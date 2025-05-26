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
  sales: number;
}

interface TrendDataPoint {
  name: string;
  orders?: number;
  revenue?: number;
}

interface ReportsProps {
  totalUsers?: number;
  totalProducts?: number;
  totalOrders?: number;
  totalRevenue?: number;
  topSellingProducts?: TopSellingProduct[];
  orderTrend?: TrendDataPoint[];
  revenueTrend?: TrendDataPoint[];
  timeRange?: string;
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

export default function Reports({ 
  totalUsers = 0, 
  totalProducts = 18, 
  totalOrders = 5, 
  totalRevenue = 6459.00,
  topSellingProducts = [],
  orderTrend = [],
  revenueTrend = [],
  timeRange: initialTimeRange = '30'
}: ReportsProps) {
  const [timeRange, setTimeRange] = useState(initialTimeRange);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      orderTrend.forEach(item => {
        csv += `Order,${item.name},${item.orders}\n`;
      });
      
      // Add revenue trend data
      revenueTrend.forEach(item => {
        csv += `Revenue,${item.name},${item.revenue}\n`;
      });
      
      // Add top selling products
      topSellingProducts.forEach(item => {
        csv += `Product,"${item.name}",${item.sales}\n`;
      });
      
      // Add summary data
      csv += `Summary,Total Users,${totalUsers}\n`;
      csv += `Summary,Total Products,${totalProducts}\n`;
      csv += `Summary,Total Orders,${totalOrders}\n`;
      csv += `Summary,Total Revenue,${totalRevenue}\n`;
      
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

      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">
              View sales, orders, and customer reports for your store
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
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
            
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleExport}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-emerald-500">+0.00% from last period</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-emerald-500">+38.46% from last period</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-emerald-500">+66.67% from last period</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-emerald-500">+199.03% from last period</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Trend</CardTitle>
              <CardDescription>
                Number of orders placed over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={orderTrend}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="orders" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>
                Revenue generated over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={revenueTrend}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#4ade80" 
                      fill="#4ade8080" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>
              Products with the highest sales volume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topSellingProducts}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 