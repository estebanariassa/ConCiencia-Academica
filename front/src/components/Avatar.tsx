// components/Avatar.tsx
import { HTMLAttributes } from "react";
import { User } from "lucide-react";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  src?: string;
  alt?: string;
  fallbackText?: string; // opcional: iniciales o texto
}

export function Avatar({
  className = "",
  src,
  alt,
  fallbackText,
  ...props
}: AvatarProps) {
  return (
    <div
      className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100 ${className}`}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-gray-500">
          {fallbackText ? (
            <span className="font-medium">{fallbackText}</span>
          ) : (
            <User className="h-5 w-5" />
          )}
        </div>
      )}
    </div>
  );
}
