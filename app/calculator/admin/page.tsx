'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Hangul from 'hangul-js';
import AuthGuard from '@/components/calculator/admin/AuthGuard';
import PartForm from '@/components/calculator/admin/PartForm';
import PartsList from '@/components/calculator/admin/PartsList';
import CategoryManager from '@/components/calculator/admin/CategoryManager';
import SearchBar from '@/components/calculator/SearchBar';
import type { Part } from '@/types/calculator';

// 한글 초성 검색 헬퍼 함수
function matchesKoreanSearch(text: string, query: string): boolean {
  if (!query) return true;
  const normalMatch = text.toLowerCase().includes(query.toLowerCase());
  if (normalMatch) return true;
  const searcher = new Hangul.Searcher(query);
  return searcher.search(text) >= 0;
}

function AdminContent() {
  const [parts, setParts] = useState<Part[]>([]);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('전체');
  const [allCategories, setAllCategories] = useState<string[]>(['전체']);
  const router = useRouter();

  const filteredParts = useMemo(() => {
    return parts.filter(part => {
      const matchSearch = matchesKoreanSearch(part.name, search);
      const matchCategory = category === '전체' || part.category === category;
      return matchSearch && matchCategory;
    });
  }, [parts, search, category]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/calculator/categories');
      if (res.ok) {
        const data = await res.json();
        const names = (data.categories || []).map((c: { name: string }) => c.name);
        setAllCategories(['전체', ...names]);
      }
    } catch (error) {
      console.error('카테고리 로드 실패:', error);
    }
  };

  useEffect(() => {
    fetchParts();
    fetchCategories();
    window.addEventListener('categoryUpdated', fetchCategories);
    return () => window.removeEventListener('categoryUpdated', fetchCategories);
  }, []);

  const fetchParts = async () => {
    try {
      const response = await fetch('/api/calculator/parts');
      if (response.ok) {
        const data = await response.json();
        setParts(data.parts || []);
      }
    } catch (error) {
      console.error('파츠 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPart = async (partData: Part | Omit<Part, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('/api/calculator/parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partData),
      });

      if (response.ok) {
        const data = await response.json();
        setParts([data.part, ...parts]);
        alert('파츠가 등록되었습니다.');
      } else {
        throw new Error('파츠 등록 실패');
      }
    } catch (error) {
      console.error('파츠 등록 실패:', error);
      alert('파츠 등록에 실패했습니다.');
    }
  };

  const handleUpdatePart = async (partData: Part | Omit<Part, 'id' | 'created_at' | 'updated_at'>) => {
    if (!('id' in partData)) return;
    try {
      const response = await fetch(`/api/calculator/parts/${partData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partData),
      });

      if (response.ok) {
        const data = await response.json();
        setParts(parts.map(p => p.id === data.part.id ? data.part : p));
        setEditingPart(null);
        alert('파츠가 수정되었습니다.');
      } else {
        throw new Error('파츠 수정 실패');
      }
    } catch (error) {
      console.error('파츠 수정 실패:', error);
      alert('파츠 수정에 실패했습니다.');
    }
  };

  const handleDeletePart = async (id: number) => {
    try {
      const response = await fetch(`/api/calculator/parts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setParts(parts.filter(p => p.id !== id));
        alert('파츠가 삭제되었습니다.');
      } else {
        throw new Error('파츠 삭제 실패');
      }
    } catch (error) {
      console.error('파츠 삭제 실패:', error);
      alert('파츠 삭제에 실패했습니다.');
    }
  };

  const handleEdit = (part: Part) => {
    setEditingPart(part);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReorder = (reorderedParts: Part[]) => {
    setParts(reorderedParts);
    // 선택사항: 서버에 순서 저장 (향후 구현)
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/calculator/auth/logout', { method: 'POST' });
      router.push('/calculator/admin/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 
                    flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600 dark:text-gray-300">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/calculator"
              className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
            >
              ← 계산기
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              로그아웃
            </button>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            🔧 파츠 관리
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            볼꾸 파츠를 등록하고 관리하세요
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            v{process.env.NEXT_PUBLIC_BUILD_DATE}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <PartForm
              editingPart={editingPart}
              onSubmit={editingPart ? handleUpdatePart : handleAddPart}
              onCancel={() => setEditingPart(null)}
            />
            <CategoryManager />
          </div>
          <div className="lg:col-span-8">
            <div className="flex flex-wrap gap-1 mb-3">
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                    ${category === cat
                      ? 'bg-green-500 text-white shadow-sm'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <SearchBar search={search} onSearchChange={setSearch} />
            <PartsList
              parts={filteredParts}
              onEdit={handleEdit}
              onDelete={handleDeletePart}
              onReorder={handleReorder}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthGuard>
      <AdminContent />
    </AuthGuard>
  );
}
