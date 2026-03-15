'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import Hangul from 'hangul-js';
import type { Part, ImageSize } from '@/types/calculator';
import PartCard from './PartCard';
import SearchBar from './SearchBar';
import { useCart } from '@/lib/calculator/CartContext';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name' | 'category';

interface PartsGridProps {
  imageSize: ImageSize;
  sortBy: SortOption;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

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

export default function PartsGrid({ imageSize, sortBy }: PartsGridProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('전체');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { addToCart } = useCart();

  // SWR로 전체 파츠 1회 로드 + 자동 캐싱
  const { data, error, isLoading, mutate } = useSWR(
    '/api/calculator/parts',
    fetcher,
    {
      revalidateOnFocus: true,    // 탭 전환 시 자동 갱신
      revalidateOnMount: true,    // 페이지 진입 시 자동 갱신
      dedupingInterval: 3000,     // 3초 내 중복 요청 방지
      refreshInterval: 0,         // 자동 폴링 끄기
    }
  );

  // 수동 새로고침 핸들러
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await mutate(); // 서버에서 최신 데이터 가져오기
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // 클라이언트 필터 (검색 + 카테고리)
  const filteredParts = useMemo(() => {
    if (!data?.parts) return [];
    
    return data.parts.filter((part: Part) => {
      // 초성 검색 지원
      const matchSearch = matchesKoreanSearch(part.name, search);
      const matchCategory = category === '전체' || part.category === category;
      return matchSearch && matchCategory;
    });
  }, [data?.parts, search, category]);

  // 정렬된 파츠 목록
  const sortedParts = useMemo(() => {
    const sorted = [...filteredParts];
    
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
  }, [filteredParts, sortBy]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600 dark:text-gray-300">파츠 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">파츠 로드 실패</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 상단 컨트롤 영역 */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            파츠 목록 ({sortedParts.length})
          </h2>
          {isRefreshing && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              갱신 중...
            </span>
          )}
        </div>
        
        {/* 새로고침 버튼 */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 
                     disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg 
                     transition-colors text-sm font-semibold"
          title="서버에서 최신 데이터 가져오기"
        >
          <svg 
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
          <span className="hidden sm:inline">새로고침</span>
        </button>
      </div>

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
