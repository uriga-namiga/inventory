import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '파일이 없습니다.' },
        { status: 400 }
      );
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Cloudinary 설정이 없습니다.' },
        { status: 500 }
      );
    }

    // 파일을 Buffer로 변환
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64File = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Cloudinary 업로드 (Signed upload)
    const timestamp = Math.round(new Date().getTime() / 1000);
    const crypto = require('crypto');
    
    const signature = crypto
      .createHash('sha256')
      .update(`timestamp=${timestamp}${apiSecret}`)
      .digest('hex');

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', base64File);
    cloudinaryFormData.append('timestamp', timestamp.toString());
    cloudinaryFormData.append('api_key', apiKey);
    cloudinaryFormData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary 에러:', errorData);
      throw new Error('Cloudinary 업로드 실패');
    }

    const data = await response.json();

    return NextResponse.json({
      url: data.secure_url,
      publicId: data.public_id,
    });
  } catch (error) {
    console.error('업로드 에러:', error);
    return NextResponse.json(
      { error: '이미지 업로드에 실패했습니다.' },
      { status: 500 }
    );
  }
}
