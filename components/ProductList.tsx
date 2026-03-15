'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Hangul from 'hangul-js';
import type { Product } from '@/types/product';

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  viewMode: 'grid' | 'list' | 'table';
  onViewModeChange: (mode: 'grid' | 'list' | 'table') => void;
  isFormExpanded?: boolean;
  onToggleForm?: (expanded: boolean) => void;
}

type SortField = 'name' | 'quantity' | 'purchase_price' | 'sale_price' | 'margin_rate';
type SortDirection = 'asc' | 'desc';

// 한글 초성 검색 헬퍼 함수
function matchesKoreanSearch(text: string, query: string): boolean {
  if (!query) return true;
  
  // 일반 검색 (대소문자 무시)
  const normalMatch = text.toLowerCase().includes(query.toLowerCase());
  if (normalMatch) return true;
  
  // 초성 검색
  const searcher = new Hangul.Searcher(query);
  return searcher.search(text) >= 0;
}

export default function ProductList({ 
  products, 
  onEdit, 
  onDelete, 
  viewMode, 
  onViewModeChange, 
  isFormExpanded = true,
  onToggleForm
}: ProductListProps) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');
  const [isSupplierDropdownOpen, setIsSupplierDropdownOpen] = useState(false);
  const [expandedProductId, setExpandedProductId] = useState<number | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  
  const supplierRef = useRef<HTMLDivElement>(null);

  // Extract unique suppliers from products
  const suppliers = useMemo(() => {
    const uniqueSuppliers = new Set<string>();
    products.forEach(product => {
      if (product.supplier) {
        uniqueSuppliers.add(product.supplier);
      }
    });
    return Array.from(uniqueSuppliers).sort();
  }, [products]);

  // Filter suppliers based on search query (초성 검색 지원)
  const filteredSuppliers = useMemo(() => {
    if (!supplierSearchQuery) return suppliers;
    return suppliers.filter(s => matchesKoreanSearch(s, supplierSearchQuery));
  }, [suppliers, supplierSearchQuery]);

  // Filter products based on search queries (초성 검색 지원)
  const getFilteredProducts = useMemo(() => {
    return products.filter(product => {
      // Product name search (초성 검색 지원)
      const matchesSearch = matchesKoreanSearch(product.name, searchQuery);
      
      // Supplier filter
      const matchesSupplier = !selectedSupplier || 
        product.supplier === selectedSupplier;
      
      return matchesSearch && matchesSupplier;
    });
  }, [products, searchQuery, selectedSupplier]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedProducts = () => {
    const productsToSort = getFilteredProducts;
    if (viewMode !== 'table') return productsToSort;
    
    const sorted = [...productsToSort].sort((a, b) => {
      let aValue: string | number = a[sortField];
      let bValue: string | number = b[sortField];
      
      if (sortField === 'name') {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        aValue = Number(aValue);
        bValue = Number(bValue);
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });
    
    return sorted;
  };

  const handleSupplierSelect = (supplier: string | null) => {
    setSelectedSupplier(supplier);
    setSupplierSearchQuery(supplier || '');
    setIsSupplierDropdownOpen(false);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSupplier(null);
    setSupplierSearchQuery('');
  };

  // 롱프레스 핸들러
  const handleLongPressStart = (productId: number) => {
    const timer = setTimeout(() => {
      setExpandedProductId(productId);
    }, 500); // 0.5초 롱프레스
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleCloseExpanded = () => {
    setExpandedProductId(null);
  };

  // 제품명 축약 함수
  const truncateProductName = (name: string, maxLength: number = 7) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  const hasActiveFilters = searchQuery || selectedSupplier;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (supplierRef.current && !supplierRef.current.contains(e.target as Node)) {
        setIsSupplierDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // 그리드 카드 컴포넌트
  const ProductCardGrid = ({ product }: { product: Product }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200">
      {/* 이미지 (4:3 비율) */}
      <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-700">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl">
            📦
          </div>
        )}
        {/* 재고 배지 (이미지 위) */}
        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold shadow-lg ${
          product.quantity === 0 
            ? 'bg-red-500 text-white' 
            : product.quantity < 10
            ? 'bg-yellow-500 text-white'
            : 'bg-green-500 text-white'
        }`}>
          {product.quantity}개
        </span>
      </div>
      
      {/* 정보 */}
      <div className="p-4">
        <h3 className="text-base font-bold text-gray-800 dark:text-white mb-3 truncate" title={product.name}>
          {product.name}
        </h3>
        
        {/* 가격 정보 (2x2 그리드) */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <p className="text-[10px] text-gray-600 dark:text-gray-400 mb-0.5">구입가</p>
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {formatPrice(Number(product.purchase_price))}
            </p>
          </div>
          <div className="text-center p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
            <p className="text-[10px] text-gray-600 dark:text-gray-400 mb-0.5">판매가</p>
            <p className="text-sm font-bold text-green-600 dark:text-green-400">
              {formatPrice(Number(product.sale_price))}
            </p>
          </div>
          <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
            <p className="text-[10px] text-gray-600 dark:text-gray-400 mb-0.5">마진율</p>
            <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
              {Number(product.margin_rate).toFixed(2)}%
            </p>
          </div>
          <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
            <p className="text-[10px] text-gray-600 dark:text-gray-400 mb-0.5">마진액</p>
            <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
              {formatPrice(Number(product.sale_price) - Number(product.purchase_price))}
            </p>
          </div>
        </div>
        
        {/* 버튼 */}
        <div className="flex gap-2">
          <button 
            onClick={() => onEdit(product)} 
            className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition"
          >
            수정
          </button>
          <button 
            onClick={() => onDelete(product.id)} 
            className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );

  // 리스트 카드 컴포넌트
  const ProductCardList = ({ product }: { product: Product }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
      <div className="sm:flex">
        {/* 이미지 */}
        <div className="sm:w-48 h-48 bg-gray-100 dark:bg-gray-700 flex-shrink-0">
          {product.image_url ? (
            <img
              src={product.image_url}
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
            <div className="flex items-center gap-3">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  등록일: {formatDate(product.created_at)}
                </p>
              </div>
              {/* 재고 배지 */}
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                product.quantity === 0 
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                  : product.quantity < 10
                  ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                  : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
              }`}>
                재고: {product.quantity}개
              </span>
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

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">구입가</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {formatPrice(Number(product.purchase_price))}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">판매가</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatPrice(Number(product.sale_price))}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">마진율</p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {Number(product.margin_rate).toFixed(2)}%
              </p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">마진액</p>
              <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {formatPrice(Number(product.sale_price) - Number(product.purchase_price))}
              </p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">재고</p>
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {product.quantity}개
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
  );

  // 테이블 뷰 컴포넌트
  const ProductTableView = () => {
    const sortedProducts = getSortedProducts();
    
    // 롱프레스 상태 관리
    const [expandedNameId, setExpandedNameId] = useState<number | null>(null);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);

    const handleMouseDown = (productId: number) => {
      longPressTimer.current = setTimeout(() => {
        setExpandedNameId(productId);
      }, 500); // 500ms 롱프레스
    };

    const handleMouseUp = () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    };

    const handleMouseLeave = () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    };

    // 제품명 자르기 함수
    const truncateName = (name: string, id: number) => {
      if (expandedNameId === id) return name;
      return name.length > 5 ? name.substring(0, 5) + '...' : name;
    };

    const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
      <th 
        className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition select-none"
        onClick={() => handleSort(field)}
      >
        <div className="flex items-center gap-1">
          {children}
          {sortField === field && (
            <span className="text-blue-500">
              {sortDirection === 'asc' ? '↑' : '↓'}
            </span>
          )}
        </div>
      </th>
    );

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* 모바일: 카드 형태 */}
        <div className="sm:hidden">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedProducts.map((product) => {
              const marginAmount = Number(product.sale_price) - Number(product.purchase_price);
              const isLowStock = product.quantity < 10 && product.quantity > 0;
              const isOutOfStock = product.quantity === 0;
              
              return (
                <div 
                  key={product.id} 
                  className={`p-4 ${isOutOfStock ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}
                >
                  <div className="flex gap-3">
                    {/* 이미지 */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                          📦
                        </div>
                      )}
                    </div>
                    
                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-1">
                        {product.name}
                      </h3>
                      
                      {/* 구매처와 구매날짜 */}
                      {(product.supplier || product.purchase_date) && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {product.supplier && <span>구매처: {product.supplier}</span>}
                          {product.supplier && product.purchase_date && <span> • </span>}
                          {product.purchase_date && <span>{formatDate(product.purchase_date)}</span>}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          isOutOfStock
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : isLowStock
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          재고 {product.quantity}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">구입:</span>
                          <span className="ml-1 font-medium text-blue-600 dark:text-blue-400">
                            {formatPrice(Number(product.purchase_price))}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">판매:</span>
                          <span className="ml-1 font-medium text-green-600 dark:text-green-400">
                            {formatPrice(Number(product.sale_price))}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">마진율:</span>
                          <span className="ml-1 font-semibold text-purple-600 dark:text-purple-400">
                            {Number(product.margin_rate).toFixed(2)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">마진액:</span>
                          <span className="ml-1 font-semibold text-orange-600 dark:text-orange-400">
                            {formatPrice(marginAmount)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEdit(product)}
                          className="flex-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-semibold transition"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => onDelete(product.id)}
                          className="flex-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold transition"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 데스크톱: 테이블 형태 */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 border-b-2 border-gray-200 dark:border-gray-600">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  이미지
                </th>
                <SortableHeader field="name">제품명</SortableHeader>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  구매처
                </th>
                <SortableHeader field="quantity">재고</SortableHeader>
                <SortableHeader field="purchase_price">구입가</SortableHeader>
                <SortableHeader field="sale_price">판매가</SortableHeader>
                <SortableHeader field="margin_rate">마진율</SortableHeader>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  마진액
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedProducts.map((product, index) => {
                const marginAmount = Number(product.sale_price) - Number(product.purchase_price);
                const isLowStock = product.quantity < 10 && product.quantity > 0;
                const isOutOfStock = product.quantity === 0;
                
                return (
                  <tr 
                    key={product.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition ${
                      index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'
                    } ${isOutOfStock ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}
                  >
                    {/* 이미지 */}
                    <td className="px-4 py-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
                            📦
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 제품명 */}
                    <td className="px-4 py-3" style={{ minWidth: '150px' }}>
                      <div>
                        <p 
                          className="font-medium text-gray-900 dark:text-white cursor-pointer select-none"
                          onMouseDown={() => handleLongPressStart(product.id)}
                          onMouseUp={handleLongPressEnd}
                          onMouseLeave={handleLongPressEnd}
                          onTouchStart={() => handleLongPressStart(product.id)}
                          onTouchEnd={handleLongPressEnd}
                          title="길게 눌러서 전체 보기"
                        >
                          {truncateProductName(product.name)}
                        </p>
                        {product.purchase_date && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            구매: {formatDate(product.purchase_date)}
                          </p>
                        )}
                        {product.link && (
                          <a
                            href={product.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate block"
                            title={product.link}
                          >
                            🔗 링크
                          </a>
                        )}
                      </div>
                    </td>

                    {/* 구매처 */}
                    <td className="px-2 py-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {product.supplier || '-'}
                      </span>
                    </td>

                    {/* 재고 */}
                    <td className="px-2 py-2 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isOutOfStock
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : isLowStock
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {product.quantity}
                      </span>
                    </td>

                    {/* 구입가 */}
                    <td className="px-2 py-2 text-right">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {formatPrice(Number(product.purchase_price))}
                      </span>
                    </td>

                    {/* 판매가 */}
                    <td className="px-2 py-2 text-right">
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {formatPrice(Number(product.sale_price))}
                      </span>
                    </td>

                    {/* 마진율 */}
                    <td className="px-2 py-2 text-right">
                      <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                        {Number(product.margin_rate).toFixed(2)}%
                      </span>
                    </td>

                    {/* 마진액 */}
                    <td className="px-2 py-2 text-right">
                      <span className={`text-sm font-semibold ${
                        marginAmount > 0 
                          ? 'text-orange-600 dark:text-orange-400' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {formatPrice(marginAmount)}
                      </span>
                    </td>

                    {/* 액션 */}
                    <td className="px-2 py-2">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEdit(product)}
                          className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition"
                          title="수정"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDelete(product.id)}
                          className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md transition"
                          title="삭제"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const displayedProducts = viewMode === 'table' ? getSortedProducts() : getFilteredProducts;

  // Empty state when no products exist at all
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

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            {/* 패널 확대 버튼 (폼이 축소되었을 때만 표시) */}
            {!isFormExpanded && onToggleForm && (
              <button
                type="button"
                onClick={() => onToggleForm(true)}
                className="flex items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition justify-center p-1 rounded"
                title="패널 펼치기"
              >
                <span className="text-base">
                  <span className="sm:hidden">▲</span>
                  <span className="hidden sm:inline">▶</span>
                </span>
              </button>
            )}
            <h2 className="font-bold text-gray-800 dark:text-white text-lg">
              제품 목록 ({getFilteredProducts.length}{getFilteredProducts.length !== products.length && `/${products.length}`})
            </h2>
          </div>
          
          {/* 뷰 전환 버튼 */}
          <div className="flex gap-1.5">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`rounded-lg transition p-1.5 ${
                viewMode === 'grid'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              title="그리드 뷰"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`rounded-lg transition p-1.5 ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              title="리스트 뷰"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`rounded-lg transition p-1.5 ${
                viewMode === 'table'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              title="테이블 뷰"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="flex gap-2 flex-col sm:flex-row mb-4">
          {/* Product Name Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="제품명 검색..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                       dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          {/* Supplier Combobox */}
          <div className="relative sm:w-48" ref={supplierRef}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <span className="text-sm">📦</span>
              </div>
              <input
                type="text"
                value={supplierSearchQuery}
                onChange={(e) => {
                  setSupplierSearchQuery(e.target.value);
                  setIsSupplierDropdownOpen(true);
                }}
                onFocus={() => setIsSupplierDropdownOpen(true)}
                placeholder="구매처"
                className="w-full pl-8 pr-8 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                         dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setIsSupplierDropdownOpen(!isSupplierDropdownOpen)}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className={`h-4 w-4 transition-transform ${isSupplierDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Dropdown */}
            {isSupplierDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-auto text-sm">
                <button
                  onClick={() => handleSupplierSelect(null)}
                  className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 transition ${
                    !selectedSupplier ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  모든 구매처
                </button>
                {filteredSuppliers.length > 0 ? (
                  filteredSuppliers.map((supplier) => (
                    <button
                      key={supplier}
                      onClick={() => handleSupplierSelect(supplier)}
                      className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 transition ${
                        selectedSupplier === supplier ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {supplier}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400">
                    일치하는 구매처가 없습니다
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reset Button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-3 py-1.5 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition 
                       flex items-center gap-1.5 whitespace-nowrap"
              title="필터 초기화"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="hidden sm:inline">초기화</span>
            </button>
          )}
        </div>
      </div>

      {displayedProducts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            검색 결과가 없습니다
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            다른 검색어로 시도해보세요
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
            >
              필터 초기화
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        // 그리드 뷰
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayedProducts.map(product => (
            <ProductCardGrid key={product.id} product={product} />
          ))}
        </div>
      ) : viewMode === 'list' ? (
        // 리스트 뷰
        <div className="space-y-4">
          {displayedProducts.map(product => (
            <ProductCardList key={product.id} product={product} />
          ))}
        </div>
      ) : (
        // 테이블 뷰
        <ProductTableView />
      )}

      {/* 제품명 전체 보기 모달 */}
      {expandedProductId && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCloseExpanded}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">제품명</h3>
              <button
                onClick={handleCloseExpanded}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-900 dark:text-white break-words">
              {products.find(p => p.id === expandedProductId)?.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
