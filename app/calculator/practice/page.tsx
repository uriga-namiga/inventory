'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Part } from '@/types/calculator';

export default function PracticePage() {
  const [allParts, setAllParts] = useState<Part[]>([]);
  const [selectedParts, setSelectedParts] = useState<Part[]>([]);
  const [guesses, setGuesses] = useState<Record<number, string>>({});
  const [result, setResult] = useState<Record<number, boolean> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      const response = await fetch('/api/calculator/parts');
      if (response.ok) {
        const data = await response.json();
        const parts: Part[] = data.parts || data;
        const partsWithImage = parts.filter((p) => p.image_url);
        setAllParts(partsWithImage);
        pickRandomParts(partsWithImage);
      }
    } catch (error) {
      console.error('파츠 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickRandomParts = useCallback((parts: Part[]) => {
    if (parts.length === 0) return;
    const count = Math.floor(Math.random() * 4) + 4; // 4~7개
    const shuffled = [...parts].sort(() => Math.random() - 0.5);
    setSelectedParts(shuffled.slice(0, Math.min(count, shuffled.length)));
    setGuesses({});
    setResult(null);
  }, []);

  const formatNumber = (value: string) => {
    const num = value.replace(/[^0-9]/g, '');
    return num ? parseInt(num, 10).toLocaleString() : '';
  };

  const handleGuessChange = (partId: number, value: string) => {
    setGuesses((prev) => ({ ...prev, [partId]: formatNumber(value) }));
  };

  const allFilled = selectedParts.every((p) => guesses[p.id]?.length > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const results: Record<number, boolean> = {};
    selectedParts.forEach((part) => {
      const guessNum = parseInt((guesses[part.id] || '').replace(/,/g, ''), 10);
      results[part.id] = guessNum === part.price;
    });
    setResult(results);
  };

  const correctCount = result ? Object.values(result).filter(Boolean).length : 0;

  const handleRetry = () => {
    pickRandomParts(allParts);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">로딩 중...</p>
      </div>
    );
  }

  if (allParts.length < 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600 dark:text-gray-300">이미지가 있는 파츠가 4개 이상 필요합니다.</p>
        <Link href="/calculator" className="text-purple-600 dark:text-purple-400 hover:underline">
          ← 계산기로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/calculator"
            className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
          >
            ← 계산기로 돌아가기
          </Link>
        </div>

        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              볼꾸 가격 맞추기
            </h1>
            <button
              type="button"
              onClick={handleRetry}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-full transition-colors"
              title="새 문제"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            각 파츠의 가격을 맞춰보세요!
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          {/* 파츠 그리드 */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-4 mb-8">
            {selectedParts.map((part) => {
              const isCorrect = result?.[part.id];
              const isWrong = result && !result[part.id];

              return (
                <div
                  key={part.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border-2 transition-colors ${
                    isCorrect
                      ? 'border-green-400'
                      : isWrong
                        ? 'border-red-400'
                        : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-700">
                    <Image
                      src={part.image_url}
                      alt={part.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                  <div className="p-2 text-center space-y-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-xs line-clamp-1">
                      {part.name}
                    </h3>
                    {result ? (
                      <div>
                        <p className={`text-sm font-bold ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                          {isCorrect ? '정답!' : `오답 (₩${guesses[part.id]})`}
                        </p>
                        <p className="text-sm font-bold text-green-600 dark:text-green-400">
                          ₩{part.price.toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <div className="relative">
                        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">₩</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={guesses[part.id] || ''}
                          onChange={(e) => handleGuessChange(part.id, e.target.value)}
                          placeholder="가격"
                          className="w-full pl-5 pr-1 py-1 rounded border border-gray-300 dark:border-gray-600
                                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs text-center
                                   focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 제출 & 결과 */}
          <div className="text-center">
            {!result ? (
              <button
                type="submit"
                disabled={!allFilled}
                className="px-8 py-3 bg-purple-500 text-white rounded-lg font-semibold text-lg
                         hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors"
              >
                정답 확인
              </button>
            ) : (
              <div className="space-y-4">
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {correctCount === selectedParts.length
                    ? '&#127881; 전부 정답!'
                    : `${correctCount} / ${selectedParts.length} 정답`}
                </p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="px-8 py-3 bg-purple-500 text-white rounded-lg font-semibold text-lg
                           hover:bg-purple-600 transition-colors"
                >
                  다시 하기
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
