'use client';

import { useState } from 'react';
import Link from 'next/link';
import PartsGrid from '@/components/calculator/PartsGrid';
import Cart from '@/components/calculator/Cart';
import ImageSizeSelector from '@/components/calculator/ImageSizeSelector';
import { CartProvider } from '@/lib/calculator/CartContext';
import type { ImageSize } from '@/types/calculator';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name' | 'category';

export default function CalculatorPage() {
  const [imageSize, setImageSize] = useState<ImageSize>('medium');
  const [sortBy, setSortBy] = useState<SortOption>('default');

  return (
    <CartProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-900 dark:to-gray-800">
        {/* 왼쪽: 메인 콘텐츠 */}
        <div className="lg:mr-[320px] py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <header className="text-center mb-8">
              <div className="flex items-center justify-between mb-4">
                <Link
                  href="/"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                >
                  ← 재고관리
                </Link>
                <Link
                  href="/calculator/admin"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                >
                  관리자 →
                </Link>
              </div>
              <div className="flex items-center justify-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
                  볼꾸 파츠 계산기
                </h1>
                <Link
                  href="/calculator/practice"
                  className="text-sm px-3 py-1 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
                >
                  게임 연습
                </Link>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                원하는 파츠를 클릭하여 장바구니에 담아보세요
              </p>
            </header>
            <PartsGrid imageSize={imageSize} sortBy={sortBy} />
          </div>
        </div>

        {/* 오른쪽: 장바구니 사이드바 - 화면 고정 */}
        <div className="hidden lg:flex lg:flex-col lg:fixed lg:top-0 lg:right-0 lg:bottom-0 lg:w-[320px] bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 border-l border-gray-200 dark:border-gray-700 p-3">
          <div className="mb-2 flex gap-2 justify-end flex-shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="default">최신순</option>
              <option value="price-asc">가격 낮은순</option>
              <option value="price-desc">가격 높은순</option>
              <option value="name">이름순</option>
              <option value="category">카테고리별</option>
            </select>
            <ImageSizeSelector size={imageSize} onSizeChange={setImageSize} />
          </div>
          <Cart />
        </div>

        {/* 모바일: 하단 고정 장바구니 */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
          <div className="flex gap-2 justify-end p-2 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="default">최신순</option>
              <option value="price-asc">가격 낮은순</option>
              <option value="price-desc">가격 높은순</option>
              <option value="name">이름순</option>
              <option value="category">카테고리별</option>
            </select>
            <ImageSizeSelector size={imageSize} onSizeChange={setImageSize} />
          </div>
        </div>
      </div>
    </CartProvider>
  );
}
