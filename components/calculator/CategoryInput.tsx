'use client';

import { useState, useEffect, useRef } from 'react';

interface CategoryInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

interface Category {
  id: number;
  name: string;
  is_default: boolean;
}

export default function CategoryInput({ value, onChange, required = true }: CategoryInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // DB에서 카테고리 로드
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/calculator/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('카테고리 로드 실패:', error);
      }
    };

    fetchCategories();

    const handleUpdate = () => { fetchCategories(); };
    window.addEventListener('categoryUpdated', handleUpdate);
    return () => window.removeEventListener('categoryUpdated', handleUpdate);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
  };

  const handleSelectCategory = (category: string) => {
    onChange(category);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  // 필터링된 카테고리 목록
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
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
          {filteredCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleSelectCategory(category.name)}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700
                       text-gray-900 dark:text-white flex items-center justify-between"
            >
              <span>{category.name}</span>
              {!category.is_default && (
                <span className="text-xs text-gray-500 dark:text-gray-400">사용자 정의</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
