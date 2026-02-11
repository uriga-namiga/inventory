'use client';

import type { Product } from '@/types/product';

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export default function ProductList({ products, onEdit, onDelete }: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          등록된 제품이 없습니다
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          왼쪽 폼에서 제품을 등록해주세요
        </p>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          제품 목록 ({products.length})
        </h2>
      </div>

      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200"
        >
          <div className="md:flex">
            {/* 이미지 */}
            <div className="md:w-48 h-48 bg-gray-100 dark:bg-gray-700 flex-shrink-0">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl">
                  📦
                </div>
              )}
            </div>

            {/* 정보 */}
            <div className="flex-1 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    등록일: {formatDate(product.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(product)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition duration-200"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => onDelete(product.id)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition duration-200"
                  >
                    삭제
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">구입가</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {formatPrice(product.purchasePrice)}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">판매가</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatPrice(product.salePrice)}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">마진율</p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {product.marginRate.toFixed(2)}%
                  </p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">마진액</p>
                  <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {formatPrice(product.salePrice - product.purchasePrice)}
                  </p>
                </div>
              </div>

              {product.link && (
                <a
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  <span>🔗</span>
                  <span className="truncate max-w-md">{product.link}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
