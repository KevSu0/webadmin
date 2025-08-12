// Product detail page
import React from 'react';
import { useParams } from 'react-router-dom';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📷</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Detail</h1>
        <p className="text-gray-600">Product ID: {id}</p>
        <p className="text-gray-600 mt-2">Product details will be displayed here.</p>
      </div>
    </div>
  );
};

export default ProductDetail;