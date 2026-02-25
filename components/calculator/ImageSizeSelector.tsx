'use client';

import { useState, useEffect } from 'react';
import type { ImageSize } from '@/types/calculator';

interface ImageSizeSelectorProps {
  size: ImageSize;
  onSizeChange: (size: ImageSize) => void;
}

export default function ImageSizeSelector({ size, onSizeChange }: ImageSizeSelectorProps) {
  const sizes: { value: ImageSize; label: string }[] = [
    { value: 'small', label: '작게' },
    { value: 'medium', label: '중간' },
  ];

  // LocalStorage에서 이미지 크기 복원
  useEffect(() => {
    const saved = localStorage.getItem('calculator_image_size');
    if (saved && (saved === 'small' || saved === 'medium')) {
      onSizeChange(saved as ImageSize);
    }
  }, [onSizeChange]);

  // 이미지 크기 변경 시 LocalStorage에 저장
  useEffect(() => {
    localStorage.setItem('calculator_image_size', size);
  }, [size]);

  return (
    <div className="flex gap-2">
      {sizes.map((item) => (
        <button
          key={item.value}
          onClick={() => onSizeChange(item.value)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${
              size === item.value
                ? 'bg-green-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          title={item.label}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
