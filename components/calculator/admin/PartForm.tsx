'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Part } from '@/types/calculator';
import CategoryInput from '../CategoryInput';

interface PartFormProps {
  editingPart: Part | null;
  onSubmit: (part: Omit<Part, 'id' | 'created_at' | 'updated_at'> | Part) => Promise<void>;
  onCancel: () => void;
}

export default function PartForm({ editingPart, onSubmit, onCancel }: PartFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingPart) {
      setName(editingPart.name);
      setCategory(editingPart.category);
      setPrice(editingPart.price.toString());
      setImageUrl(editingPart.image_url || '');
      setImagePreview(editingPart.image_url || '');
    } else {
      resetForm();
    }
  }, [editingPart]);

  const resetForm = () => {
    setName('');
    setCategory('');
    setPrice('');
    setImageUrl('');
    setImageFile(null);
    setImagePreview('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return imageUrl;

    const formData = new FormData();
    formData.append('file', imageFile);

    setUploading(true);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('이미지 업로드 실패');

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price) {
      alert('필수 항목을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      let finalImageUrl = imageUrl;
      if (imageFile) {
        finalImageUrl = await uploadImage();
      }

      const partData = {
        name,
        category,
        price: parseInt(price),
        image_url: finalImageUrl,
      };

      if (editingPart) {
        await onSubmit({ ...partData, id: editingPart.id } as Part);
      } else {
        await onSubmit(partData);
      }

      resetForm();
    } catch (error) {
      console.error('파츠 저장 실패:', error);
      alert('파츠 저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {editingPart ? '파츠 수정' : '파츠 등록'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            파츠명 *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            카테고리 *
          </label>
          <CategoryInput
            value={category}
            onChange={setCategory}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            가격 (원) *
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            이미지
          </label>
          
          {/* 숨겨진 파일 인풋 */}
          <input
            id="part-camera-input"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageChange}
            className="hidden"
          />
          <input
            id="part-gallery-input"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          
          {/* 카메라/갤러리 버튼 */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              type="button"
              onClick={() => document.getElementById('part-camera-input')?.click()}
              className="flex items-center justify-center px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition duration-200 shadow-md hover:shadow-lg"
            >
              <span className="text-2xl mr-2">📷</span>
              <span className="text-sm">카메라</span>
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('part-gallery-input')?.click()}
              className="flex items-center justify-center px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition duration-200 shadow-md hover:shadow-lg"
            >
              <span className="text-2xl mr-2">🖼️</span>
              <span className="text-sm">갤러리</span>
            </button>
          </div>
          
          {imagePreview && (
            <div className="mt-2 relative w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="object-cover rounded"
              />
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={uploading || submitting}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? '업로드 중...' : submitting ? '저장 중...' : editingPart ? '수정' : '등록'}
          </button>
          {editingPart && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              취소
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
