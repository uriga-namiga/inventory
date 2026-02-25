'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Part, CartItem, StoredCart } from '@/types/calculator';

interface CartContextType {
  items: CartItem[];
  addToCart: (part: Part) => void;
  removeFromCart: (partId: number) => void;
  updateQuantity: (partId: number, quantity: number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'calculator_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // LocalStorage에서 장바구니 복원
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: StoredCart = JSON.parse(stored);
        // 파츠 정보를 서버에서 가져와야 하지만, 일단 빈 배열로 시작
        // 실제로는 part 정보를 다시 fetch해야 함
        setItems([]);
      }
    } catch (error) {
      console.error('장바구니 복원 실패:', error);
    }
    setIsInitialized(true);
  }, []);

  // LocalStorage에 장바구니 저장
  useEffect(() => {
    if (!isInitialized) return;

    try {
      const storedCart: StoredCart = {
        items: items.map(item => ({
          partId: item.part.id,
          quantity: item.quantity,
        })),
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedCart));
    } catch (error) {
      console.error('장바구니 저장 실패:', error);
    }
  }, [items, isInitialized]);

  const addToCart = useCallback((part: Part) => {
    setItems(prev => {
      const existingItem = prev.find(item => item.part.id === part.id);
      
      if (existingItem) {
        return prev.map(item =>
          item.part.id === part.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { part, quantity: 1 }];
      }
    });
  }, []);

  const removeFromCart = useCallback((partId: number) => {
    setItems(prev => prev.filter(item => item.part.id !== partId));
  }, []);

  const updateQuantity = useCallback((partId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(partId);
    } else {
      setItems(prev =>
        prev.map(item =>
          item.part.id === partId ? { ...item, quantity } : item
        )
      );
    }
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalPrice = items.reduce(
    (sum, item) => sum + item.part.price * item.quantity,
    0
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalPrice,
    totalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
