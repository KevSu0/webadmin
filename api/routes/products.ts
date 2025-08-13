import express, { type Request, type Response, type NextFunction } from 'express';
import admin from 'firebase-admin';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrls: string[];
    stock: number;
    categoryID: string;
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
        const productsRef = db.collection('products');
        const snapshot = await productsRef
            .where('name', '>=', term)
            .where('name', '<=', term + '\uf8ff')
            .get();

        if (snapshot.empty) {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        const products: Product[] = [];
        snapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() } as Product);
        });

        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        next(error);
    }
});

export default router;
