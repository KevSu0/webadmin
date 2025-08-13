import express, { type Request, type Response, type NextFunction } from 'express';
import admin from 'firebase-admin';

interface Order {
    id: string;
    userId: string;
    items: {
        productId: string;
        productName: string;
        productImage: string;
        price: number;
        quantity: number;
        subtotal: number;
    }[];
    total: number;
    status: string;
    shippingAddress: {
        name: string;
        address: string;
        city: string;
        state: string;
        zip: string;
        country: string;
        phone: string;
        email: string;
    };
}

const router = express.Router();

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
    const { term } = req.query;

    if (!term) {
        return res.status(400).json({
            success: false,
            error: 'Search term is required'
        });
    }

    try {
        const ordersRef = db.collection('orders');
        // This is a simple search. For more complex scenarios, a dedicated search service is recommended.
        const snapshot = await ordersRef
            .where('shippingAddress.email', '==', term)
            .get();

        if (snapshot.empty) {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        const orders: Order[] = [];
        snapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() } as Order);
        });

        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        next(error);
    }
});

router.get('/statistics', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ordersRef = db.collection('orders');
        const snapshot = await ordersRef.get();

        if (snapshot.empty) {
            return res.status(200).json({
                success: true,
                data: {
                    totalOrders: 0,
                    pendingOrders: 0,
                    processingOrders: 0,
                    shippedOrders: 0,
                    deliveredOrders: 0,
                    cancelledOrders: 0,
                    totalRevenue: 0
                }
            });
        }

        let totalOrders = 0;
        let pendingOrders = 0;
        let processingOrders = 0;
        let shippedOrders = 0;
        let deliveredOrders = 0;
        let cancelledOrders = 0;
        let totalRevenue = 0;

        snapshot.forEach(doc => {
            const order = doc.data();
            totalOrders++;
            switch (order.status) {
                case 'pending':
                    pendingOrders++;
                    break;
                case 'processing':
                    processingOrders++;
                    break;
                case 'shipped':
                    shippedOrders++;
                    break;
                case 'delivered':
                    deliveredOrders++;
                    totalRevenue += order.total;
                    break;
                case 'cancelled':
                    cancelledOrders++;
                    break;
            }
        });

        res.status(200).json({
            success: true,
            data: {
                totalOrders,
                pendingOrders,
                processingOrders,
                shippedOrders,
                deliveredOrders,
                cancelledOrders,
                totalRevenue
            }
        });
    } catch (error) {
        next(error);
    }
});

export default router;
