import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Search, Info, AlertCircle, CheckCircle, Package, Truck, Clock, Filter, SlidersHorizontal, Calendar, Phone, Mail, UserCircle, ShoppingBag } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: string;
  image: string | null;
}

interface Order {
  id: number;
  name: string;
  email: string | null;
  mobile: string;
  shipping_address: string;
  total: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  created_at: string;
  items: OrderItem[];
}

interface OrdersIndexProps {
  orders: {
    data: Order[];
    links: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  filters: {
    status?: string;
    search?: string;
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Admin', href: '/admin' },
  { title: 'Orders', href: '/admin/orders' },
];

export default function OrdersIndex({ orders, filters }: OrdersIndexProps) {
  const [status, setStatus] = useState(filters.status || 'all');
  const [search, setSearch] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `/admin/orders?status=${status}&search=${search}`;
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
      case 'Processing':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Processing</Badge>;
      case 'Shipped':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Shipped</Badge>;
      case 'Delivered':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Delivered</Badge>;
      case 'Cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'Processing':
        return <Package className="h-4 w-4 text-blue-600" />;
      case 'Shipped':
        return <Truck className="h-4 w-4 text-purple-600" />;
      case 'Delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Cancelled':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Function to get proper image path
  const getImagePath = (imagePath: string | null) => {
    if (!imagePath) {
      return '/images/placeholder.jpg';
    }
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/storage/')) {
      return imagePath;
    }
    
    return `/storage/${imagePath}`;
  };

  // Calculate total items count for each order
  const getTotalItems = (items: OrderItem[]) => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };
  
  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <Head title="Order Management" />
      <div className="flex h-full flex-1 flex-col gap-6 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Order Management</h1>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
        
        <Card className="shadow-sm">
          <CardHeader className={showFilters ? '' : 'pb-0'}>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-gray-700" />
              Orders
            </CardTitle>
            <CardDescription>
              View and manage customer orders
            </CardDescription>
            <div className={`mt-4 flex flex-col gap-4 sm:flex-row ${showFilters ? 'block' : 'hidden'}`}>
              <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2 flex-wrap">
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 min-w-[200px]"
                />
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" /> All Statuses
                      </div>
                    </SelectItem>
                    <SelectItem value="Pending">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-600" /> Pending
                      </div>
                    </SelectItem>
                    <SelectItem value="Processing">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-blue-600" /> Processing
                      </div>
                    </SelectItem>
                    <SelectItem value="Shipped">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-purple-600" /> Shipped
                      </div>
                    </SelectItem>
                    <SelectItem value="Delivered">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" /> Delivered
                      </div>
                    </SelectItem>
                    <SelectItem value="Cancelled">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600" /> Cancelled
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit">
                  <Search className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </form>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.data.map((order) => (
                      <TableRow key={order.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <Link href={`/admin/orders/${order.id}`} className="hover:text-blue-600 transition-colors">
                            #{order.id}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {formatDate(order.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium flex items-center gap-1">
                              <UserCircle className="h-4 w-4 text-gray-400" />
                              {order.name}
                            </div>
                            {order.email && (
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {order.email}
                              </div>
                            )}
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {order.mobile}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {order.items.slice(0, 4).map((item) => (
                              <TooltipProvider key={item.id}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="relative inline-block">
                                      <div className="h-10 w-10 rounded-md bg-gray-100 border border-gray-200 overflow-hidden">
                                        <img 
                                          src={getImagePath(item.image)} 
                                          alt={item.name}
                                          className="h-full w-full object-cover"
                                          onError={(e) => {
                                            e.currentTarget.src = '/images/placeholder.jpg';
                                          }}
                                        />
                                      </div>
                                      <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {item.quantity}
                                      </div>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-xs text-gray-400">Price: ৳{parseFloat(item.price).toFixed(2)}</p>
                                    <p className="text-xs text-gray-400">Quantity: {item.quantity}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))}
                            {order.items.length > 4 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="h-10 w-10 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500">
                                      <div className="text-xs font-medium">+{order.items.length - 4}</div>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="font-medium">Total Items: {getTotalItems(order.items)}</p>
                                    <div className="max-h-40 overflow-y-auto text-xs">
                                      {order.items.map((item) => (
                                        <div key={item.id} className="py-1">
                                          <div className="font-medium">{item.quantity}x {item.name}</div>
                                          <div className="text-gray-400">৳{parseFloat(item.price).toFixed(2)} each</div>
                                        </div>
                                      ))}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">৳{order.total}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {getStatusIcon(order.status)}
                            {getStatusBadge(order.status)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {orders.data.length > 0 && (
              <div className="mt-4 flex items-center justify-between flex-wrap gap-4">
                <div className="text-sm text-muted-foreground">
                  Showing {orders.from} to {orders.to} of {orders.total} orders
                </div>
                <div className="flex gap-1">
                  {orders.current_page > 1 && (
                    <Link href={`/admin/orders?page=${orders.current_page - 1}&status=${status}&search=${search}`}>
                      <Button variant="outline" size="sm">
                        Previous
                      </Button>
                    </Link>
                  )}
                  {orders.current_page < orders.last_page && (
                    <Link href={`/admin/orders?page=${orders.current_page + 1}&status=${status}&search=${search}`}>
                      <Button variant="outline" size="sm">
                        Next
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </CardContent>
          {orders.data.length > 0 && (
            <CardFooter className="border-t bg-gray-50 py-2">
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <ShoppingBag className="h-4 w-4" />
                Total Orders: {orders.total}
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
} 