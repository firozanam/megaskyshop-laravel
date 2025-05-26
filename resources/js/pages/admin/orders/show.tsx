import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Truck, AlertCircle, CheckCircle, Package, UserCircle, MapPin, Calendar, Phone, Mail, Info, Clock, CreditCard, ShoppingBag, ExternalLink } from 'lucide-react';
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
import { Progress } from '@/components/ui/progress';

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

  const getProgressValue = (status: string) => {
    switch(status) {
      case 'Pending': return 25;
      case 'Processing': return 50;
      case 'Shipped': return 75;
      case 'Delivered': return 100;
      case 'Cancelled': return 0;
      default: return 0;
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

  // Fix image path function
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
  
  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <Head title={`Order #${order.id}`} />
      <div className="flex h-full flex-1 flex-col gap-6 p-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">Order #{order.id}</h1>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {getStatusIcon(order.status)}
            {getStatusBadge(order.status)}
          </div>
        </div>
        
        {success && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Order status progress bar */}
        {order.status !== 'Cancelled' && (
          <div className="bg-white rounded-lg border p-4 shadow-sm">
            <div className="flex justify-between mb-2">
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-1 text-yellow-600" />
                <span className={order.status === 'Pending' ? 'font-medium' : 'text-gray-500'}>Pending</span>
              </div>
              <div className="flex items-center text-sm">
                <Package className="h-4 w-4 mr-1 text-blue-600" />
                <span className={order.status === 'Processing' ? 'font-medium' : 'text-gray-500'}>Processing</span>
              </div>
              <div className="flex items-center text-sm">
                <Truck className="h-4 w-4 mr-1 text-purple-600" />
                <span className={order.status === 'Shipped' ? 'font-medium' : 'text-gray-500'}>Shipped</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                <span className={order.status === 'Delivered' ? 'font-medium' : 'text-gray-500'}>Delivered</span>
              </div>
            </div>
            <Progress value={getProgressValue(order.status)} className="h-2" />
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-1 order-2 lg:order-1">
            {/* Customer Information */}
            <Card className="shadow-sm">
              <CardHeader className="bg-gray-50 border-b pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <UserCircle className="h-5 w-5 text-gray-700" />
                    Customer Details
                  </CardTitle>
                  {order.user ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Registered User</Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Guest User</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400">
                    <UserCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{order.name}</div>
                    {order.user && (
                      <Link 
                        href={`/admin/users/${order.user.id}/edit`}
                        className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Manage Customer
                      </Link>
                    )}
                  </div>
                </div>
                
                {order.email && (
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="text-gray-700">{order.email}</div>
                  </div>
                )}
                
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="text-gray-700">
                    <a href={`tel:${order.mobile}`} className="hover:underline text-blue-600 flex items-center gap-1 font-bold">
                      {order.mobile}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Shipping Address */}
            <Card className="shadow-sm">
              <CardHeader className="bg-gray-50 border-b pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-5 w-5 text-gray-700" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="whitespace-pre-line text-gray-700 flex items-start gap-3">
                  <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0 text-gray-400" />
                  <div>{order.shipping_address}</div>
                </div>
              </CardContent>
            </Card>
            
            {/* Order Status - Moved to the left side */}
            <Card className="shadow-sm">
              <CardHeader className="bg-gray-50 border-b pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="h-5 w-5 text-gray-700" />
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-gray-700 flex items-center gap-1">
                    <Package className="h-4 w-4" /> Update Status
                  </Label>
                  <Select 
                    value={status} 
                    onValueChange={(value: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled') => setStatus(value)}
                  >
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
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
                </div>
                
                <Button 
                  onClick={handleStatusUpdate} 
                  disabled={isUpdatingStatus || status === order.status}
                  className="w-full"
                >
                  {isUpdatingStatus ? 'Updating...' : 'Update Status'}
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            {/* Order Summary */}
            <Card className="shadow-sm">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-gray-700" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Item</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-700">Qty</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-700">Price</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {order.items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-16 w-16 rounded-md border border-gray-200 overflow-hidden bg-gray-100 flex-shrink-0">
                                <img 
                                  src={getImagePath(item.image)}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = '/images/placeholder.jpg';
                                  }}
                                />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{item.name}</div>
                                {item.product_id && (
                                  <Link 
                                    href={`/admin/products/${item.product_id}/edit`}
                                    className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mt-1"
                                  >
                                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                    Edit Product
                                  </Link>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center font-medium">{item.quantity}</td>
                          <td className="px-4 py-4 text-right">৳{parseFloat(item.price).toFixed(2)}</td>
                          <td className="px-4 py-4 text-right font-medium">
                            ৳{(parseFloat(item.price) * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t bg-gray-50">
                        <td colSpan={3} className="px-4 py-3 text-right font-medium text-gray-700">
                          Order Total
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">
                          ৳{order.total}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CreditCard className="h-4 w-4" />
                  <span>Payment received</span>
                </div>
              </CardFooter>
            </Card>
            
            {/* Tracking Information - Moved to the right side */}
            <Card className="shadow-sm mt-6">
              <CardHeader className="bg-gray-50 border-b pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Truck className="h-5 w-5 text-gray-700" />
                  Tracking Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {order.tracking && order.tracking.tracking_id && (
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-md text-sm space-y-2">
                    <div className="font-medium mb-1 flex items-center gap-1">
                      <Info className="h-4 w-4" />
                      Current Tracking Information
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-white p-2 rounded border border-gray-200 flex-1 text-center">
                        <div className="text-xs text-gray-500">Tracking Number</div>
                        <div className="font-medium">{order.tracking.tracking_id}</div>
                      </div>
                      {order.tracking.partner_id && (
                        <div className="bg-white p-2 rounded border border-gray-200 flex-1 text-center">
                          <div className="text-xs text-gray-500">Courier</div>
                          <div className="font-medium">{order.tracking.partner_id}</div>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                      <div className="text-xs text-gray-500 mr-2">Status:</div>
                      {getStatusBadge(order.tracking.status)}
                    </div>
                    
                    {/* Track button for the courier */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 w-full"
                      onClick={() => window.open(`https://example.com/track?id=${order.tracking?.tracking_id}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Track Package
                    </Button>
                  </div>
                )}

                {/* Horizontal row of input fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="tracking_id" className="text-gray-700 text-xs flex items-center gap-1">
                      <Truck className="h-3 w-3" /> Tracking #
                    </Label>
                    <Input
                      id="tracking_id"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      placeholder="Enter tracking number"
                      className="w-full text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="partner_id" className="text-gray-700 text-xs flex items-center gap-1">
                      <Package className="h-3 w-3" /> Courier
                    </Label>
                    <Input
                      id="partner_id"
                      value={partnerId}
                      onChange={(e) => setPartnerId(e.target.value)}
                      placeholder="Enter courier name"
                      className="w-full text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tracking_status" className="text-gray-700 text-xs flex items-center gap-1">
                      <Info className="h-3 w-3" /> Status
                    </Label>
                    <Select 
                      value={trackingStatus} 
                      onValueChange={(value: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled') => setTrackingStatus(value)}
                    >
                      <SelectTrigger id="tracking_status" className="w-full text-sm">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
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
                  </div>
                </div>
                
                <Button 
                  onClick={handleTrackingUpdate} 
                  disabled={isUpdatingTracking}
                  className="w-full"
                >
                  {isUpdatingTracking ? 'Updating...' : 'Update Tracking'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 