// components/Avatar.tsx
import { HTMLAttributes } from 'react';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

interface AvatarImageProps extends HTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  className?: string;
}

interface AvatarFallbackProps extends HTMLAttributes<HTMLDivElement> {
  delayMs?: number;
  className?: string;
}

export function Avatar({ className = '', ...props }: AvatarProps) {
  return (
    <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`} {...props} />
  );
}

export function AvatarImage({ src, alt, className = '', ...props }: AvatarImageProps) {
  return (
    <img 
      src={src} 
      alt={alt} 
      className={`aspect-square h-full w-full ${className}`} 
      {...props} 
    />
  );
}

export function AvatarFallback({ className = '', ...props }: AvatarFallbackProps) {
  return (
    <div 
      className={`flex h-full w-full items-center justify-center rounded-full bg-gray-100 ${className}`} 
      {...props} 
    />
  );
}