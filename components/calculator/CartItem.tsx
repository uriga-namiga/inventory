'use client';

import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { CartItem as CartItemType } from '@/types/calculator';
import Image from 'next/image';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (partId: number, quantity: number) => void;
  onRemove: (partId: number) => void;
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const { part, quantity } = item;
  const subtotal = part.price * quantity;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    onRemove(part.id);
    setShowDeleteConfirm(false);
  }, [onRemove, part.id]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0 flex gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
          <div className="relative flex-shrink-0 bg-gray-100 dark:bg-gray-600 rounded" style={{ width: 56, height: 56 }}>
            {part.image_url ? (
              <Image
                src={part.image_url}
                alt={part.name}
                fill
                className="object-cover rounded"
                sizes="56px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-xl">📦</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <h4 className="font-semibold text-gray-900 dark:text-white text-xs truncate">
                {part.name}
              </h4>
              <p className="text-xs font-bold text-gray-900 dark:text-white flex-shrink-0">
                ₩{subtotal.toLocaleString()}
              </p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              ₩{part.price.toLocaleString()}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateQuantity(part.id, quantity - 1)}
                style={{ width: 36, height: 36, minWidth: 36 }}
                className="flex items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-600 
                         text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 font-bold text-xl"
              >
                −
              </button>
              <span className="text-base font-bold text-gray-900 dark:text-white min-w-[1.5rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(part.id, quantity + 1)}
                style={{ width: 36, height: 36, minWidth: 36 }}
                className="flex items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-600 
                         text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 font-bold text-xl"
              >
                +
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={handleDeleteClick}
          style={{ width: 32, height: 32, minWidth: 32 }}
          className="flex-shrink-0 flex items-center justify-center rounded-full bg-red-500 
                   text-white hover:bg-red-600 font-bold text-sm shadow-md"
        >
          ×
        </button>
      </div>

      {showDeleteConfirm && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={handleCancelDelete}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-2xl"
            style={{ maxWidth: 360, margin: '0 16px', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              삭제하시겠습니까?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              &quot;{part.name}&quot;을(를) 장바구니에서 제거합니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                style={{ padding: '14px 24px' }}
                className="flex-1 rounded-lg bg-gray-200 dark:bg-gray-600 
                         text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 
                         font-semibold text-base"
              >
                취소
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{ padding: '14px 24px' }}
                className="flex-1 rounded-lg bg-red-500 hover:bg-red-600 
                         text-white font-semibold text-base"
              >
                확인
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
