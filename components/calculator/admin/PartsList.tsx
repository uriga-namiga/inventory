'use client';

import Image from 'next/image';
import type { Part } from '@/types/calculator';

interface PartsListProps {
  parts: Part[];
  onEdit: (part: Part) => void;
  onDelete: (id: number) => void;
}

function PartRow({ part, index, onEdit, onDelete }: { part: Part; index: number; onEdit: (part: Part) => void; onDelete: (part: Part) => void }) {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="py-3 px-2 text-center text-sm text-gray-500 dark:text-gray-400 font-medium">
        {index}
      </td>
      <td className="py-3 px-2">
        <div className="relative w-12 h-12 bg-gray-100 dark:bg-gray-600 rounded">
          {part.image_url ? (
            <Image
              src={part.image_url}
              alt={part.name}
              fill
              className="object-cover rounded"
              sizes="48px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span>📦</span>
            </div>
          )}
        </div>
      </td>
      <td className="py-3 px-2 text-gray-900 dark:text-white">
        {part.name}
      </td>
      <td className="py-3 px-2 text-gray-600 dark:text-gray-400">
        {part.category}
      </td>
      <td className="py-3 px-2 text-gray-900 dark:text-white font-semibold">
        ₩{part.price.toLocaleString()}
      </td>
      <td className="py-3 px-2">
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => onEdit(part)}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            수정
          </button>
          <button
            onClick={() => onDelete(part)}
            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
          >
            삭제
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function PartsList({ parts, onEdit, onDelete }: PartsListProps) {
  const handleDelete = (part: Part) => {
    if (confirm(`"${part.name}"을(를) 삭제하시겠습니까?`)) {
      onDelete(part.id);
    }
  };

  if (parts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          파츠 목록
        </h2>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">등록된 파츠가 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        파츠 목록 ({parts.length}개)
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300 w-10">
                No.
              </th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                이미지
              </th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                파츠명
              </th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                카테고리
              </th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                가격
              </th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                작업
              </th>
            </tr>
          </thead>
          <tbody>
            {parts.map((part, idx) => (
              <PartRow
                key={part.id}
                part={part}
                index={idx + 1}
                onEdit={onEdit}
                onDelete={handleDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
