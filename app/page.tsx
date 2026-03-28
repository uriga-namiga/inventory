'use client';

import { useState, useEffect } from 'react';
import ProductForm from '@/components/ProductForm';
import ProductList from '@/components/ProductList';
import AuthGuard from '@/components/calculator/admin/AuthGuard';
import type { Product } from '@/types/product';

function HomeContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('table');
  const [isFormExpanded, setIsFormExpanded] = useState(true);

  // 제품 목록 로드
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('제품 로드 실패:', error);
      alert('제품 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });

      if (response.ok) {
        const newProduct = await response.json();
        setProducts([newProduct, ...products]);
        alert('제품이 등록되었습니다.');
      } else {
        throw new Error('제품 등록 실패');
      }
    } catch (error) {
      console.error('제품 등록 실패:', error);
      alert('제품 등록에 실패했습니다.');
    }
  };

  const handleUpdateProduct = async (product: Product | Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    // Type guard to check if product has id
    if (!('id' in product)) {
      console.error('Product ID is required for update');
      return;
    }
    
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        setEditingProduct(null);
        alert('제품이 수정되었습니다.');
      } else {
        throw new Error('제품 수정 실패');
      }
    } catch (error) {
      console.error('제품 수정 실패:', error);
      alert('제품 수정에 실패했습니다.');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setProducts(products.filter(p => p.id !== id));
          alert('제품이 삭제되었습니다.');
        } else {
          throw new Error('제품 삭제 실패');
        }
      } catch (error) {
        console.error('제품 삭제 실패:', error);
        alert('제품 삭제에 실패했습니다.');
      }
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormExpanded(true); // 패널 열기
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600 dark:text-gray-300">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex justify-between mb-2">
            <button
              onClick={async () => {
                await fetch('/api/calculator/auth/logout', { method: 'POST' });
                window.location.href = '/calculator/admin/login';
              }}
              className="text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              로그아웃
            </button>
            <a
              href="/calculator"
              className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
            >
              볼꾸 계산기 →
            </a>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            📦 재고관리 시스템
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            제품 등록 및 관리를 간편하게
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
          {/* 폼이 펼쳐졌을 때만 표시 */}
          {isFormExpanded && (
            <div className="transition-all duration-300 sm:col-span-3">
              <ProductForm
                onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
                editingProduct={editingProduct}
                onCancel={handleCancelEdit}
                onExpandChange={setIsFormExpanded}
              />
            </div>
          )}

          <div className={`transition-all duration-300 ${isFormExpanded ? 'sm:col-span-9' : 'sm:col-span-12'}`}>
            <ProductList
              products={products}
              onEdit={handleEdit}
              onDelete={handleDeleteProduct}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              isFormExpanded={isFormExpanded}
              onToggleForm={setIsFormExpanded}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}
