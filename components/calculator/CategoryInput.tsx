'use client';

import { useState, useEffect, useRef } from 'react';

interface CategoryInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const DEFAULT_CATEGORIES = ['펜', '구슬', '캐릭터', '프리미엄'];
const STORAGE_KEY = 'calculator_category_history';

export default function CategoryInput({ value, onChange, required = true }: CategoryInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // LocalStorage에서 사용자 정의 카테고리 로드
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCustomCategories(parsed);
      } catch (error) {
        console.error('카테고리 히스토리 로드 실패:', error);
      }
    }
  }, []);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 모든 카테고리 (기본 + 커스텀, 중복 제거)
  const allCategories = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...customCategories])
  ).sort();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
  };

  const handleSelectCategory = (category: string) => {
    onChange(category);
    setIsOpen(false);

    // 새로운 카테고리면 히스토리에 추가
    if (!DEFAULT_CATEGORIES.includes(category) && !customCategories.includes(category)) {
      const updated = [category, ...customCategories].slice(0, 20); // 최대 20개
      setCustomCategories(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      
      // 다른 컴포넌트에 업데이트 알림
      window.dispatchEvent(new Event('categoryUpdated'));
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const newValue = e.target.value.trim();
    if (newValue) {
      // 새로운 카테고리면 히스토리에 추가
      if (!DEFAULT_CATEGORIES.includes(newValue) && !customCategories.includes(newValue)) {
        const updated = [newValue, ...customCategories].slice(0, 20);
        setCustomCategories(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        
        // 다른 컴포넌트에 업데이트 알림
        window.dispatchEvent(new Event('categoryUpdated'));
      }
    }
  };

  // 필터링된 카테고리 목록
  const filteredCategories = allCategories.filter((cat) =>
    cat.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder="카테고리 입력 또는 선택"
        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                 focus:outline-none focus:ring-2 focus:ring-green-500"
        required={required}
      />

      {isOpen && filteredCategories.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                   rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredCategories.map((category, index) => {
            const isDefault = DEFAULT_CATEGORIES.includes(category);
            return (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectCategory(category)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 
                         text-gray-900 dark:text-white flex items-center justify-between"
              >
                <span>{category}</span>
                {!isDefault && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">사용자 정의</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
