import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';

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
  status: string;
  items: OrderItem[];
}

interface OrderSuccessProps {
  order: Order;
  success?: string;
}

export default function OrderSuccess({ order, success }: OrderSuccessProps) {
  return (
    <AppLayout>
      <Head title="Order Placed Successfully" />
      <div className="container mx-auto py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="mb-2 text-3xl font-bold">Thank You for Your Order!</h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Your order has been placed successfully and is being processed.
          </p>
          
          <Card>
            <CardHeader>
              <CardTitle>Order #{order.id}</CardTitle>
              <CardDescription>Order Summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border p-4">
                  <h3 className="mb-2 font-medium">Items</h3>
                  <ul className="space-y-2">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex justify-between">
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-medium">
                          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 border-t pt-2 text-right">
                    <span className="font-bold">Total: ${order.total}</span>
                  </div>
                </div>
                
                <div className="rounded-md border p-4">
                  <h3 className="mb-2 font-medium">Shipping Information</h3>
                  <p>{order.name}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href="/products">
                <Button variant="outline">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Button>
              </Link>
              <Link href={`/user/orders/${order.id}`}>
                <Button>
                  View Order Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          <div className="mt-8">
            <p className="text-muted-foreground">
              A confirmation email has been sent to your email address.
              If you have any questions about your order, please contact our customer support.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 