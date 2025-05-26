import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShoppingBagIcon, 
  EyeIcon, 
  TruckIcon, 
  CalendarIcon, 
  ArrowLeftIcon, 
  ArrowRightIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: string;
}

interface Order {
  id: number;
  name: string;
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
  };
}

export default function OrdersIndex({ orders }: OrdersIndexProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Pending':
        return (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-yellow-500"></span>
            </span>
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
          </div>
        );
      case 'Processing':
        return (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
            </span>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">Processing</Badge>
          </div>
        );
      case 'Shipped':
        return (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-500"></span>
            </span>
            <Badge className="bg-purple-100 text-purple-800 border-purple-200">Shipped</Badge>
          </div>
        );
      case 'Delivered':
        return (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            <Badge className="bg-green-100 text-green-800 border-green-200">Delivered</Badge>
          </div>
        );
      case 'Cancelled':
        return (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
            </span>
            <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>
          </div>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Pending':
        return <CalendarIcon className="h-5 w-5 text-yellow-500" />;
      case 'Processing':
        return <CubeIcon className="h-5 w-5 text-blue-500" />;
      case 'Shipped':
        return <TruckIcon className="h-5 w-5 text-purple-500" />;
      case 'Delivered':
        return <ShoppingBagIcon className="h-5 w-5 text-green-500" />;
      case 'Cancelled':
        return <ShoppingBagIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ShoppingBagIcon className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <AppLayout>
      <Head title="My Orders" />
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-1">View and track your order history</p>
          </div>
          <Link href="/products">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Continue Shopping
            </Button>
          </Link>
        </div>
        
        {orders.data.length === 0 ? (
          <Card className="border border-dashed border-gray-300 bg-white shadow-sm">
            <CardContent className="py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 mb-4">
                <ShoppingBagIcon className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
              <p className="mb-6 text-gray-600 max-w-md mx-auto">You haven't placed any orders yet. Browse our products and start shopping!</p>
              <Link href="/products">
                <Button className="bg-blue-600 hover:bg-blue-700">Browse Products</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.data.map((order) => (
              <Card key={order.id} className="overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-gray-50 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                          {formatDate(order.created_at)}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="mb-6">
                    <div className="mb-3 text-sm font-medium text-gray-700 flex items-center gap-1.5">
                      <CubeIcon className="h-4 w-4 text-gray-500" />
                      Order Items:
                    </div>
                    <div className="space-y-2 text-sm">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-md">
                          <div className="flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                              {item.quantity}x
                            </span>
                            <span className="font-medium text-gray-900">{item.name}</span>
                          </div>
                          <span className="text-gray-700">${item.price} each</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-gray-50 flex items-center justify-between pt-4">
                  <div className="font-semibold text-gray-900">Total: <span className="text-blue-700">${order.total}</span></div>
                  <Link href={`/user/orders/${order.id}`}>
                    <Button variant="outline" className="border-blue-200 hover:border-blue-300 hover:bg-blue-50">
                      <EyeIcon className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
            
            {/* Pagination */}
            {orders.last_page > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {orders.current_page > 1 && (
                  <Link href={`/user/orders?page=${orders.current_page - 1}`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <ArrowLeftIcon className="h-4 w-4" />
                      Previous
                    </Button>
                  </Link>
                )}
                
                <div className="flex items-center gap-1 px-3 py-1 bg-white border rounded-md">
                  <span className="text-sm text-gray-600">
                    Page {orders.current_page} of {orders.last_page}
                  </span>
                </div>
                
                {orders.current_page < orders.last_page && (
                  <Link href={`/user/orders?page=${orders.current_page + 1}`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      Next
                      <ArrowRightIcon className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
} 