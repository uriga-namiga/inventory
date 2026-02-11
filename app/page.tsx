'use client';

import { useState, useEffect } from 'react';
import ProductForm from '@/components/ProductForm';
import ProductList from '@/components/ProductList';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // 로컬스토리지에서 데이터 로드
  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  // 로컬스토리지에 데이터 저장 (에러 핸들링 추가)
  useEffect(() => {
    if (products.length > 0) {
      try {
        localStorage.setItem('products', JSON.stringify(products));
      } catch (error) {
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          alert('저장 공간이 부족합니다. 일부 제품을 삭제해주세요.');
          console.error('LocalStorage 용량 초과:', error);
        }
      }
    }
  }, [products]);

  const handleAddProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
    };
    setProducts([...products, newProduct]);
  };

  const handleUpdateProduct = (product: Product) => {
    setProducts(products.map(p => p.id === product.id ? product : p));
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            📦 재고관리 시스템
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            제품 등록 및 관리를 간편하게
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ProductForm
              onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
              editingProduct={editingProduct}
              onCancel={handleCancelEdit}
            />
          </div>

          <div className="lg:col-span-2">
            <ProductList
              products={products}
              onEdit={handleEdit}
              onDelete={handleDeleteProduct}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
