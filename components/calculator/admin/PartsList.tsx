'use client';

import Image from 'next/image';
import type { Part } from '@/types/calculator';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PartsListProps {
  parts: Part[];
  onEdit: (part: Part) => void;
  onDelete: (id: number) => void;
  onReorder: (parts: Part[]) => void;
}

interface SortableRowProps {
  part: Part;
  onEdit: (part: Part) => void;
  onDelete: (part: Part) => void;
}

function SortableRow({ part, onEdit, onDelete }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: part.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
    >
      <td className="py-3 px-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          title="드래그하여 순서 변경"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
          </svg>
        </button>
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

export default function PartsList({ parts, onEdit, onDelete, onReorder }: PartsListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = parts.findIndex((p) => p.id === active.id);
      const newIndex = parts.findIndex((p) => p.id === over.id);

      const newParts = arrayMove(parts, oldIndex, newIndex);
      onReorder(newParts);
    }
  };

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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          파츠 목록 ({parts.length}개)
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          ⋮⋮ 아이콘을 드래그하여 순서 변경
        </p>
      </div>

      <div className="overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300 w-12">
                  
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
              <SortableContext
                items={parts.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                {parts.map((part) => (
                  <SortableRow
                    key={part.id}
                    part={part}
                    onEdit={onEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </DndContext>
      </div>
    </div>
  );
}
