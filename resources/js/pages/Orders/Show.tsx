import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Truck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: string;
  image: string | null;
}

interface OrderTracking {
  id: number;
  tracking_id: string | null;
  partner_id: string | null;
  status: string;
  details: any | null;
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
  tracking: OrderTracking | null;
}

interface OrderShowProps {
  order: Order;
}

export default function OrderShow({ order }: OrderShowProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'Processing':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'Shipped':
        return <Badge className="bg-purple-100 text-purple-800">Shipped</Badge>;
      case 'Delivered':
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>;
      case 'Cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <AppLayout>
      <Head title={`Order #${order.id}`} />
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center gap-2">
          <Link href="/user/orders">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Order #{order.id}</h1>
          <div className="ml-auto">{getStatusBadge(order.status)}</div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Order Summary */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>
                Placed on {formatDate(order.created_at)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 font-medium">Items</h3>
                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="px-4 py-2 text-left font-medium">Item</th>
                          <th className="px-4 py-2 text-center font-medium">Qty</th>
                          <th className="px-4 py-2 text-right font-medium">Price</th>
                          <th className="px-4 py-2 text-right font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item) => (
                          <tr key={item.id} className="border-b">
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-3">
                                {item.image && (
                                  <img 
                                    src={item.image.startsWith('/') ? item.image : `/${item.image}`} 
                                    alt={item.name}
                                    className="h-12 w-12 rounded object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src = '/uploads/placeholder.jpg';
                                    }}
                                  />
                                )}
                                <div className="font-medium">{item.name}</div>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-center">{item.quantity}</td>
                            <td className="px-4 py-2 text-right">${item.price}</td>
                            <td className="px-4 py-2 text-right">
                              ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t">
                          <td colSpan={3} className="px-4 py-2 text-right font-medium">
                            Total
                          </td>
                          <td className="px-4 py-2 text-right font-bold">
                            ${order.total}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
                
                {order.tracking && order.tracking.tracking_id && (
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 font-medium">
                      <Truck className="h-4 w-4" />
                      Tracking Information
                    </h3>
                    <div className="rounded-md border p-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <div className="text-sm text-muted-foreground">Tracking Number</div>
                          <div className="font-medium">{order.tracking.tracking_id}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Status</div>
                          <div>{getStatusBadge(order.tracking.status)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Customer Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-medium">{order.name}</div>
                  {order.email && <div>{order.email}</div>}
                  <div>{order.mobile}</div>
                  <Separator className="my-2" />
                  <div className="whitespace-pre-line">{order.shipping_address}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Current Status:</span>
                    {getStatusBadge(order.status)}
                  </div>
                  
                  {order.status === 'Pending' && (
                    <div className="text-sm text-muted-foreground">
                      Your order has been received and is being processed.
                    </div>
                  )}
                  
                  {order.status === 'Processing' && (
                    <div className="text-sm text-muted-foreground">
                      Your order is being prepared for shipping.
                    </div>
                  )}
                  
                  {order.status === 'Shipped' && (
                    <div className="text-sm text-muted-foreground">
                      Your order has been shipped and is on its way to you.
                    </div>
                  )}
                  
                  {order.status === 'Delivered' && (
                    <div className="text-sm text-muted-foreground">
                      Your order has been delivered. Thank you for shopping with us!
                    </div>
                  )}
                  
                  {order.status === 'Cancelled' && (
                    <div className="text-sm text-muted-foreground">
                      This order has been cancelled. Please contact customer support if you have any questions.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-center">
              <Link href="/products">
                <Button variant="outline">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 