'use client';

import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '@/lib/calculator/CartContext';
import CartItem from './CartItem';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice, totalItems } = useCart();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearClick = useCallback(() => {
    setShowClearConfirm(true);
  }, []);

  const handleConfirmClear = useCallback(() => {
    clearCart();
    setShowClearConfirm(false);
  }, [clearCart]);

  const handleCancelClear = useCallback(() => {
    setShowClearConfirm(false);
  }, []);

  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>📦</span>
          장바구니
        </h2>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">장바구니가 비어있습니다</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            파츠를 클릭하여 추가해보세요
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 헤더 */}
      <div className="bg-white dark:bg-gray-800 rounded-t-lg shadow-lg p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>📦</span>
            장바구니
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              ({totalItems})
            </span>
          </h2>
          <button
            onClick={handleClearClick}
            className="text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            비우기
          </button>
        </div>
      </div>

      {/* 스크롤 리스트 */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 shadow-lg px-4">
        <div className="space-y-3 py-3">
          {items.map((item) => (
            <CartItem
              key={item.part.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
            />
          ))}
        </div>
      </div>

      {/* 총액 */}
      <div className="bg-white dark:bg-gray-800 rounded-b-lg shadow-lg p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400 font-medium">총액</span>
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            ₩{totalPrice.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 비우기 확인 팝업 */}
      {showClearConfirm && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={handleCancelClear}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-2xl"
            style={{ maxWidth: 360, margin: '0 16px', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              장바구니를 비우시겠습니까?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {totalItems}개 항목이 모두 삭제됩니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelClear}
                style={{ padding: '14px 24px' }}
                className="flex-1 rounded-lg bg-gray-200 dark:bg-gray-600 
                         text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 
                         font-semibold text-base"
              >
                취소
              </button>
              <button
                onClick={handleConfirmClear}
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
