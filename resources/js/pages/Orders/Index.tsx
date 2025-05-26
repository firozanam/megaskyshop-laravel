import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

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
      <Head title="My Orders" />
      <div className="container mx-auto py-8">
        <h1 className="mb-6 text-2xl font-bold">My Orders</h1>
        
        {orders.data.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="mb-4 text-muted-foreground">You haven't placed any orders yet.</p>
              <Link href="/products">
                <Button>Browse Products</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.data.map((order) => (
              <Card key={order.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Order #{order.id}</CardTitle>
                      <CardDescription>Placed on {formatDate(order.created_at)}</CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="mb-2 text-sm font-medium">Items:</div>
                    <div className="space-y-1 text-sm">
                      {order.items.map((item) => (
                        <div key={item.id}>
                          {item.quantity}x {item.name} - ${item.price} each
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Total: ${order.total}</div>
                    <Link href={`/user/orders/${order.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Pagination */}
            {orders.last_page > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                {orders.current_page > 1 && (
                  <Link href={`/user/orders?page=${orders.current_page - 1}`}>
                    <Button variant="outline" size="sm">
                      Previous
                    </Button>
                  </Link>
                )}
                {orders.current_page < orders.last_page && (
                  <Link href={`/user/orders?page=${orders.current_page + 1}`}>
                    <Button variant="outline" size="sm">
                      Next
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