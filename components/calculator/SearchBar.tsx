'use client';

import { useState, useEffect } from 'react';

interface SearchBarProps {
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string) => void;
  search: string;
  category: string;
}

const STORAGE_KEY = 'calculator_category_history';
const DEFAULT_CATEGORIES = ['전체', '펜', '구슬', '캐릭터', '프리미엄'];

export default function SearchBar({ 
  onSearchChange, 
  onCategoryChange, 
  search, 
  category 
}: SearchBarProps) {
  const [localSearch, setLocalSearch] = useState(search);
  const [allCategories, setAllCategories] = useState<string[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  // LocalStorage에서 사용자 정의 카테고리 로드
  useEffect(() => {
    const loadCategories = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const customCategories = JSON.parse(stored);
          // 기본 카테고리 + 사용자 정의 카테고리 (중복 제거)
          const combined = Array.from(
            new Set([...DEFAULT_CATEGORIES, ...customCategories])
          );
          setAllCategories(combined);
        } catch (error) {
          console.error('카테고리 히스토리 로드 실패:', error);
        }
      }
    };

    // 초기 로드
    loadCategories();

    // 카테고리 업데이트 이벤트 리스너
    window.addEventListener('categoryUpdated', loadCategories);
    
    return () => {
      window.removeEventListener('categoryUpdated', loadCategories);
    };
  }, []);

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <input
        type="text"
        placeholder="파츠 검색..."
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        {allCategories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>
  );
}
