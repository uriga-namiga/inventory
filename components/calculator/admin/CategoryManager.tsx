'use client';

import { useState, useEffect } from 'react';

interface Category {
  id: number;
  name: string;
  is_default: boolean;
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/calculator/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('카테고리 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const notify = () => {
    window.dispatchEvent(new Event('categoryUpdated'));
  };

  const handleAdd = async () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;

    try {
      const res = await fetch('/api/calculator/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });

      if (res.ok) {
        const data = await res.json();
        setCategories([...categories, data.category]);
        setNewCategory('');
        notify();
      } else {
        const data = await res.json();
        alert(data.error || '카테고리 추가 실패');
      }
    } catch (error) {
      console.error('카테고리 추가 실패:', error);
      alert('카테고리 추가에 실패했습니다.');
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`"${cat.name}" 카테고리를 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch(`/api/calculator/categories/${cat.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setCategories(categories.filter((c) => c.id !== cat.id));
        notify();
      } else {
        const data = await res.json();
        alert(data.error || '카테고리 삭제 실패');
      }
    } catch (error) {
      console.error('카테고리 삭제 실패:', error);
      alert('카테고리 삭제에 실패했습니다.');
    }
  };

  const handleEditStart = (cat: Category) => {
    setEditingId(cat.id);
    setEditValue(cat.name);
  };

  const handleEditSave = async (cat: Category) => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === cat.name) {
      setEditingId(null);
      return;
    }

    try {
      const res = await fetch(`/api/calculator/categories/${cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });

      if (res.ok) {
        const data = await res.json();
        setCategories(categories.map((c) => (c.id === cat.id ? data.category : c)));
        setEditingId(null);
        notify();
      } else {
        const data = await res.json();
        alert(data.error || '카테고리 수정 실패');
      }
    } catch (error) {
      console.error('카테고리 수정 실패:', error);
      alert('카테고리 수정에 실패했습니다.');
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, cat: Category) => {
    if (e.key === 'Enter') handleEditSave(cat);
    if (e.key === 'Escape') setEditingId(null);
  };

  const defaultCategories = categories.filter((c) => c.is_default);
  const customCategories = categories.filter((c) => !c.is_default);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
        카테고리 관리
      </h2>

      {/* 새 카테고리 추가 */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="새 카테고리 이름"
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                   focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg
                   text-sm font-medium transition-colors flex-shrink-0"
        >
          추가
        </button>
      </div>

      {/* 카테고리 목록 */}
      {loading ? (
        <p className="text-sm text-gray-400 text-center py-2">로딩 중...</p>
      ) : (
        <div className="space-y-1">
          {/* 기본 카테고리 */}
          {defaultCategories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between px-3 py-2 rounded-lg
                       bg-gray-50 dark:bg-gray-750 dark:bg-opacity-50"
            >
              <span className="text-sm text-gray-800 dark:text-gray-200">{cat.name}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">기본</span>
            </div>
          ))}

          {/* 사용자 정의 카테고리 */}
          {customCategories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between px-3 py-2 rounded-lg
                       bg-gray-50 dark:bg-gray-750 dark:bg-opacity-50 group"
            >
              {editingId === cat.id ? (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => handleEditKeyDown(e, cat)}
                  onBlur={() => handleEditSave(cat)}
                  autoFocus
                  className="flex-1 px-2 py-0.5 rounded border border-green-400 dark:border-green-500
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                           focus:outline-none focus:ring-1 focus:ring-green-500 mr-2"
                />
              ) : (
                <span className="text-sm text-gray-800 dark:text-gray-200">{cat.name}</span>
              )}
              <div className="flex items-center gap-1">
                {editingId !== cat.id && (
                  <>
                    <button
                      onClick={() => handleEditStart(cat)}
                      className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                      title="수정"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      title="삭제"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {customCategories.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-2">
              사용자 정의 카테고리가 없습니다
            </p>
          )}
        </div>
      )}
    </div>
  );
}
