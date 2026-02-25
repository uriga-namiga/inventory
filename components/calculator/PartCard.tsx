'use client';

import Image from 'next/image';
import type { Part } from '@/types/calculator';

interface PartCardProps {
  part: Part;
  onAddToCart: (part: Part) => void;
}

export default function PartCard({ part, onAddToCart }: PartCardProps) {
  const handleClick = () => {
    onAddToCart(part);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden 
               cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105
               border border-gray-200 dark:border-gray-700"
    >
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
        {part.image_url ? (
          <Image
            src={part.image_url}
            alt={part.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
            <span className="text-4xl">📦</span>
          </div>
        )}
      </div>
      <div className="p-2">
        <h3 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm mb-1 line-clamp-2 min-h-[2.5rem]">
          {part.name}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">
          {part.category}
        </p>
        <p className="text-sm sm:text-base font-bold text-green-600 dark:text-green-400">
          ₩{part.price.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
