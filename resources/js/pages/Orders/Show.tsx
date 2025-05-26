import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Truck, 
  Package, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Calendar,
  ExternalLink
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
        return <Clock className="h-4 w-4" />;
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

  // Fix image path function
  const getImagePath = (imagePath: string | null) => {
    if (!imagePath) {
      return '/uploads/placeholder.jpg';
    }
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/storage/')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/')) {
      return imagePath;
    }
    
    return `/storage/${imagePath}`;
  };
  
  return (
    <AppLayout>
      <Head title={`Order #${order.id}`} />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/user/orders">
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
        
        {/* Order status progress bar */}
        {order.status !== 'Cancelled' && (
          <Card className="mb-6 shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between mb-2">
                <div className="flex flex-col items-center text-sm">
                  <Clock className={`h-5 w-5 mb-1 ${order.status === 'Pending' ? 'text-yellow-600' : 'text-gray-400'}`} />
                  <span className={order.status === 'Pending' ? 'font-medium' : 'text-gray-500'}>Pending</span>
                </div>
                <div className="flex flex-col items-center text-sm">
                  <Package className={`h-5 w-5 mb-1 ${order.status === 'Processing' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={order.status === 'Processing' ? 'font-medium' : 'text-gray-500'}>Processing</span>
                </div>
                <div className="flex flex-col items-center text-sm">
                  <Truck className={`h-5 w-5 mb-1 ${order.status === 'Shipped' ? 'text-purple-600' : 'text-gray-400'}`} />
                  <span className={order.status === 'Shipped' ? 'font-medium' : 'text-gray-500'}>Shipped</span>
                </div>
                <div className="flex flex-col items-center text-sm">
                  <CheckCircle className={`h-5 w-5 mb-1 ${order.status === 'Delivered' ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={order.status === 'Delivered' ? 'font-medium' : 'text-gray-500'}>Delivered</span>
                </div>
              </div>
              <Progress value={getProgressValue(order.status)} className="h-2" />
            </CardContent>
          </Card>
        )}
        
        {order.status === 'Cancelled' && (
          <Card className="mb-6 bg-red-50 border-red-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <p>This order has been cancelled. Please contact customer support if you have any questions.</p>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Order Summary */}
          <Card className="lg:col-span-2 shadow-sm">
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
                                  e.currentTarget.src = '/uploads/placeholder.jpg';
                                }}
                              />
                            </div>
                            <div className="font-medium text-gray-900">{item.name}</div>
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
          </Card>
          
          {/* Right Column */}
          <div className="space-y-6">
            {/* Shipping Information */}
            <Card className="shadow-sm">
              <CardHeader className="bg-gray-50 border-b pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-5 w-5 text-gray-700" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="font-medium text-gray-900">{order.name}</div>
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
                  <div className="text-gray-700">{order.mobile}</div>
                </div>
                
                <Separator />
                
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="whitespace-pre-line text-gray-700">{order.shipping_address}</div>
                </div>
              </CardContent>
            </Card>
            
            {/* Tracking Information */}
            {order.tracking && order.tracking.tracking_id && (
              <Card className="shadow-sm">
                <CardHeader className="bg-gray-50 border-b pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Truck className="h-5 w-5 text-gray-700" />
                    Tracking Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500">Tracking Number</div>
                        <div className="font-medium flex items-center gap-1">
                          {order.tracking?.tracking_id}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="ml-1 text-blue-600" onClick={() => navigator.clipboard.writeText(order.tracking?.tracking_id || '')}>
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy tracking number</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      
                      {order.tracking.partner_id && (
                        <div>
                          <div className="text-xs text-gray-500">Courier</div>
                          <div className="font-medium">{order.tracking.partner_id}</div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-500">Status</div>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(order.tracking.status)}
                        {getStatusBadge(order.tracking.status)}
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => window.open(`https://example.com/track?id=${order.tracking?.tracking_id}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Track Package
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="flex justify-center mt-4">
              <Link href="/products">
                <Button className="w-full">
                  <ShoppingBag className="h-4 w-4 mr-2" />
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