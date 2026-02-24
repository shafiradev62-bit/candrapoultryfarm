import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export type Platform = 'web' | 'mobile';

export function usePlatform(): Platform {
  const [platform, setPlatform] = useState<Platform>('web');

  useEffect(() => {
    const isNative = Capacitor.isNativePlatform();
    setPlatform(isNative ? 'mobile' : 'web');
  }, []);

  return platform;
}

export function isMobilePlatform(): boolean {
  return Capacitor.isNativePlatform();
}
