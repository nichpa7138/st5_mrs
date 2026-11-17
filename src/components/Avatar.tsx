import { useState } from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  lname: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZE_CLASSES: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'w-9 h-9 text-xs',
  md: 'w-11 h-11 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-20 h-20 text-xl',
};

export function Avatar({ src, name, lname, size = 'md' }: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  const initials = `${name.trim().charAt(0)}${lname.trim().charAt(0)}` || 'นศ';
  const sizeClass = SIZE_CLASSES[size];

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={`รูปโปรไฟล์ของ ${name} ${lname}`}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={`${sizeClass} rounded-full object-cover border border-pink-200 bg-pink-50 shrink-0`}
      />
    );
  }

  return (
    <div
      aria-label={`อักษรย่อโปรไฟล์ของ ${name} ${lname}`}
      className={`${sizeClass} rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white font-semibold flex items-center justify-center border border-pink-200 shrink-0 select-none`}
    >
      {initials}
    </div>
  );
}
