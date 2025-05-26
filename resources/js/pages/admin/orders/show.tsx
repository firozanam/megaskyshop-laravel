import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Truck, AlertCircle } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: string;
  image: string | null;
  product_id: number | null;
}

interface OrderTracking {
  id: number;
  tracking_id: string | null;
  partner_id: string | null;
  status: string;
  details: any | null;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Order {
  id: number;
  user_id: number | null;
  name: string;
  email: string | null;
  mobile: string;
  shipping_address: string;
  total: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  tracking: OrderTracking | null;
  user: User | null;
}

interface OrderShowProps {
  order: Order;
  errors?: Record<string, string>;
  success?: string;
}

export default function OrderShow({ order, errors = {}, success }: OrderShowProps) {
  const [status, setStatus] = useState<'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'>(order.status);
  const [trackingId, setTrackingId] = useState(order.tracking?.tracking_id || '');
  const [partnerId, setPartnerId] = useState(order.tracking?.partner_id || '');
  const [trackingStatus, setTrackingStatus] = useState<'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'>(
    (order.tracking?.status || order.status) as 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'
  );
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingTracking, setIsUpdatingTracking] = useState(false);
  
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Orders', href: '/admin/orders' },
    { title: `Order #${order.id}`, href: `/admin/orders/${order.id}` },
  ];
  
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
  
  const handleStatusUpdate = () => {
    setIsUpdatingStatus(true);
    
    router.put(`/admin/orders/${order.id}/status`, {
      status: status
    }, {
      onFinish: () => setIsUpdatingStatus(false),
      preserveScroll: true,
    });
  };
  
  const handleTrackingUpdate = () => {
    setIsUpdatingTracking(true);
    
    router.put(`/admin/orders/${order.id}/tracking`, {
      tracking_id: trackingId,
      partner_id: partnerId,
      status: trackingStatus,
    }, {
      onFinish: () => setIsUpdatingTracking(false),
      preserveScroll: true,
    });
  };
  
  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <Head title={`Order #${order.id}`} />
      <div className="flex h-full flex-1 flex-col gap-6 p-4">
        <div className="flex items-center gap-2">
          <Link href="/admin/orders">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Order #{order.id}</h1>
          <div className="ml-auto">{getStatusBadge(order.status)}</div>
        </div>
        
        {success && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
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
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Items</h3>
                  <div className="mt-2 rounded-md border">
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
                                <div>
                                  <div className="font-medium">{item.name}</div>
                                  {item.product_id && (
                                    <Link 
                                      href={`/admin/products/${item.product_id}/edit`}
                                      className="text-xs text-blue-600 hover:underline"
                                    >
                                      View Product
                                    </Link>
                                  )}
                                </div>
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
              </div>
            </CardContent>
          </Card>
          
          {/* Customer Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-medium">{order.name}</div>
                  {order.email && <div>{order.email}</div>}
                  <div>{order.mobile}</div>
                  {order.user && (
                    <div className="mt-2">
                      <Link 
                        href={`/admin/users/${order.user.id}/edit`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View Customer Account
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-line">{order.shipping_address}</div>
              </CardContent>
            </Card>
            
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={status} 
                    onValueChange={(value: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled') => setStatus(value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Processing">Processing</SelectItem>
                      <SelectItem value="Shipped">Shipped</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleStatusUpdate} 
                  disabled={isUpdatingStatus || status === order.status}
                >
                  {isUpdatingStatus ? 'Updating...' : 'Update Status'}
                </Button>
              </CardFooter>
            </Card>
            
            {/* Tracking Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Tracking Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tracking_id">Tracking ID</Label>
                  <Input
                    id="tracking_id"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    placeholder="Enter tracking number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="partner_id">Courier Partner ID</Label>
                  <Input
                    id="partner_id"
                    value={partnerId}
                    onChange={(e) => setPartnerId(e.target.value)}
                    placeholder="Enter courier partner ID"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tracking_status">Tracking Status</Label>
                  <Select 
                    value={trackingStatus} 
                    onValueChange={(value: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled') => setTrackingStatus(value)}
                  >
                    <SelectTrigger id="tracking_status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Processing">Processing</SelectItem>
                      <SelectItem value="Shipped">Shipped</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleTrackingUpdate} 
                  disabled={isUpdatingTracking}
                >
                  {isUpdatingTracking ? 'Updating...' : 'Update Tracking'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 