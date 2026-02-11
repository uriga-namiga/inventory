'use client';

import { useState, useEffect } from 'react';
import type { Product } from '@/types/product';

interface ProductFormProps {
  onSubmit: (product: Product | Omit<Product, 'id' | 'created_at' | 'updated_at'>) => void;
  editingProduct?: Product | null;
  onCancel?: () => void;
}

export default function ProductForm({ onSubmit, editingProduct, onCancel }: ProductFormProps) {
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [marginRate, setMarginRate] = useState('0');
  const [link, setLink] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setImage(editingProduct.image_url);
      setImagePreview(editingProduct.image_url);
      setPurchasePrice(editingProduct.purchase_price.toString());
      setSalePrice(editingProduct.sale_price.toString());
      setMarginRate(editingProduct.margin_rate.toString());
      setLink(editingProduct.link);
    }
  }, [editingProduct]);

  // 마진율 자동 계산
  useEffect(() => {
    const purchase = parseFloat(purchasePrice) || 0;
    const sale = parseFloat(salePrice) || 0;
    if (purchase > 0 && sale > 0) {
      const margin = ((sale - purchase) / purchase * 100).toFixed(2);
      setMarginRate(margin);
    }
  }, [purchasePrice, salePrice]);

  // 이미지 압축 함수
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // 최대 크기 설정 (800px)
          const maxSize = 800;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          // 압축 품질 0.7로 설정
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // 1. 이미지 압축
        const compressed = await compressImage(file);
        
        // 2. Base64를 Blob으로 변환
        const response = await fetch(compressed);
        const blob = await response.blob();
        const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
        
        // 3. Cloudinary에 업로드
        const formData = new FormData();
        formData.append('file', compressedFile);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('업로드 실패');
        }
        
        const { url } = await uploadResponse.json();
        
        // 4. URL 저장
        setImage(url);
        setImagePreview(url);
      } catch (error) {
        console.error('이미지 업로드 실패:', error);
        alert('이미지 업로드에 실패했습니다.');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name,
      image_url: image || imagePreview,
      purchase_price: parseFloat(purchasePrice) || 0,
      sale_price: parseFloat(salePrice) || 0,
      margin_rate: parseFloat(marginRate) || 0,
      link,
    };

    if (editingProduct) {
      onSubmit({ ...productData, id: editingProduct.id, created_at: editingProduct.created_at, updated_at: new Date().toISOString() });
    } else {
      onSubmit(productData);
    }

    // 폼 초기화
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setImage('');
    setImagePreview('');
    setPurchasePrice('');
    setSalePrice('');
    setMarginRate('0');
    setLink('');
  };

  const handleCancel = () => {
    resetForm();
    onCancel?.();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        {editingProduct ? '제품 수정' : '제품 등록'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 제품명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            제품명 *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="제품명을 입력하세요"
          />
        </div>

        {/* 사진 등록 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            제품 사진
          </label>
          
          {/* 숨겨진 파일 인풋 */}
          <input
            id="camera-input"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageChange}
            className="hidden"
          />
          <input
            id="gallery-input"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          
          {/* 카메라/갤러리 버튼 */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              type="button"
              onClick={() => document.getElementById('camera-input')?.click()}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition duration-200 shadow-md hover:shadow-lg"
            >
              <span className="text-xl">📷</span>
              <span>카메라</span>
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('gallery-input')?.click()}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition duration-200 shadow-md hover:shadow-lg"
            >
              <span className="text-xl">🖼️</span>
              <span>갤러리</span>
            </button>
          </div>
          
          {imagePreview && (
            <div className="mt-3 relative w-full h-48 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
              <img
                src={imagePreview}
                alt="미리보기"
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={() => {
                  setImage('');
                  setImagePreview('');
                }}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition duration-200"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* 구입가 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            구입가 *
          </label>
          <input
            type="number"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            required
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="0"
          />
        </div>

        {/* 판매가 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            판매가 *
          </label>
          <input
            type="number"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            required
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="0"
          />
        </div>

        {/* 마진율 (자동 계산) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            마진율 (자동 계산)
          </label>
          <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-white font-semibold">
            {marginRate}%
          </div>
        </div>

        {/* 링크 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            링크
          </label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="https://..."
          />
        </div>

        {/* 버튼 */}
        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            {editingProduct ? '수정하기' : '등록하기'}
          </button>
          {editingProduct && (
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
            >
              취소
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
