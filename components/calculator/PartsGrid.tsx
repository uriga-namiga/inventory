'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Part, ImageSize } from '@/types/calculator';
import PartCard from './PartCard';
import SearchBar from './SearchBar';
import { useCart } from '@/lib/calculator/CartContext';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name' | 'category';

interface PartsGridProps {
  imageSize: ImageSize;
  sortBy: SortOption;
}

export default function PartsGrid({ imageSize, sortBy }: PartsGridProps) {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('전체');
  const { addToCart } = useCart();

  useEffect(() => {
    fetchParts();
  }, [search, category]);

  const fetchParts = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category !== '전체') params.append('category', category);

      const response = await fetch(`/api/calculator/parts?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setParts(data.parts || []);
      }
    } catch (error) {
      console.error('파츠 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 정렬된 파츠 목록
  const sortedParts = useMemo(() => {
    const sorted = [...parts];
    
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
      case 'category':
        return sorted.sort((a, b) => {
          const categoryCompare = a.category.localeCompare(b.category, 'ko');
          if (categoryCompare !== 0) return categoryCompare;
          return a.name.localeCompare(b.name, 'ko');
        });
      case 'default':
      default:
        return sorted.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }
  }, [parts, sortBy]);

  // 카테고리별 그룹화
  const groupedByCategory = useMemo(() => {
    if (sortBy !== 'category') return null;
    const groups: Record<string, Part[]> = {};
    for (const part of sortedParts) {
      if (!groups[part.category]) groups[part.category] = [];
      groups[part.category].push(part);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b, 'ko'));
  }, [sortedParts, sortBy]);

  const handleAddToCart = (part: Part) => {
    addToCart(part);
  };

  // 이미지 크기에 따른 그리드 클래스
  const gridClasses = {
    small: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-9 2xl:grid-cols-10',
    medium: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7',
    large: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600 dark:text-gray-300">파츠 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SearchBar
        search={search}
        category={category}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
      />

      {sortedParts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            파츠가 없습니다
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            관리자 페이지에서 파츠를 등록해주세요
          </p>
        </div>
      ) : groupedByCategory ? (
        <div className="space-y-6">
          {groupedByCategory.map(([categoryName, categoryParts]) => (
            <div key={categoryName}>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  {categoryName}
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {categoryParts.length}개
                </span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className={`grid ${gridClasses[imageSize]} gap-2`}>
                {categoryParts.map((part) => (
                  <PartCard
                    key={part.id}
                    part={part}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`grid ${gridClasses[imageSize]} gap-2`}>
          {sortedParts.map((part) => (
            <PartCard
              key={part.id}
              part={part}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}
