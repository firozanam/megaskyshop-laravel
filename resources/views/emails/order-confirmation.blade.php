<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #eee;
        }
        .header h1 {
            color: #333;
            margin: 0;
        }
        .content {
            padding: 20px 0;
        }
        .order-info {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .order-details {
            margin-bottom: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        table th, table td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        table th {
            background-color: #f5f5f5;
        }
        .footer {
            padding: 20px 0;
            text-align: center;
            color: #777;
            font-size: 14px;
            border-top: 1px solid #eee;
        }
        .total {
            font-weight: bold;
            text-align: right;
            padding: 10px;
            background-color: #f5f5f5;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Order Received</h1>
            <p>Order #{{ $order->id }}</p>
        </div>
        
        <div class="content">
            <h2>Order Information</h2>
            
            <div class="order-info">
                <p><strong>Order Date:</strong> {{ $order->created_at->format('F j, Y, g:i a') }}</p>
                <p><strong>Customer Name:</strong> {{ $order->name }}</p>
                <p><strong>Email:</strong> {{ $order->email ?? 'N/A' }}</p>
                <p><strong>Phone:</strong> {{ $order->mobile }}</p>
                <p><strong>Shipping Address:</strong> {{ $order->shipping_address }}</p>
                <p><strong>Status:</strong> {{ $order->status }}</p>
            </div>
            
            <div class="order-details">
                <h3>Order Items</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($order->items as $item)
                        <tr>
                            <td>{{ $item->name }}</td>
                            <td>{{ $item->quantity }}</td>
                            <td>৳{{ number_format($item->price, 2) }}</td>
                            <td>৳{{ number_format($item->price * $item->quantity, 2) }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
                
                <div class="total">
                    <p>Total: ৳{{ number_format($order->total, 2) }}</p>
                </div>
            </div>
            
            <p>Please log in to your admin panel to manage this order.</p>
        </div>
        
        <div class="footer">
            <p>Thank you for using MegaSkyShop. This is an automated email, please do not reply.</p>
        </div>
    </div>
</body>
</html> 