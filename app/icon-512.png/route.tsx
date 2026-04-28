import { ImageResponse } from 'next/og';
import { HookIconImage } from '@/app/_icon/HookIconImage';

export const runtime = 'edge';

export async function GET() {
  const size = 512;
  return new ImageResponse(<HookIconImage size={size} />, {
    width: size,
    height: size,
  });
}
