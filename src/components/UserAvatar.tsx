'use client';

import { User } from 'lucide-react';
import { useState } from 'react';

interface UserAvatarProps {
  name: string;
  email: string;
  photo?: string;
  source: 'self' | 'shared' | 'organization';
  size?: 'sm' | 'md' | 'lg';
}

export default function UserAvatar({ 
  name, 
  email, 
  photo, 
  source, 
  size = 'md' 
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  // サイズクラス
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  };

  // ソースに応じた背景色
  const getBackgroundColor = () => {
    switch (source) {
      case 'self':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400';
      case 'organization':
        return 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400';
      case 'shared':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400';
    }
  };

  // 画像が利用可能で、エラーがない場合は画像を表示
  if (photo && !imageError) {
    return (
      <img
        src={photo}
        alt={`${name}のアバター`}
        className={`${sizeClasses[size]} rounded-full object-cover`}
        onError={() => setImageError(true)}
        title={`${name} (${email})`}
      />
    );
  }

  // 画像がない場合は、名前の頭文字を表示
  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center ${getBackgroundColor()}`}
      title={`${name} (${email})`}
    >
      {initials ? (
        <span className={`font-medium ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}`}>
          {initials}
        </span>
      ) : (
        <User className={iconSizes[size]} />
      )}
    </div>
  );
}