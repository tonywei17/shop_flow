"use client";

import * as React from "react";

interface HighlightTextProps {
  text: string;
  searchTerm: string;
  className?: string;
}

/**
 * 高亮显示搜索词的组件
 * 将匹配的文本用黄色背景标记
 */
export function HighlightText({ text, searchTerm, className }: HighlightTextProps) {
  if (!searchTerm || !text) {
    return <span className={className}>{text}</span>;
  }

  const lowerText = text.toLowerCase();
  const lowerSearch = searchTerm.toLowerCase();
  const index = lowerText.indexOf(lowerSearch);

  if (index === -1) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {text.slice(0, index)}
      <mark className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
        {text.slice(index, index + searchTerm.length)}
      </mark>
      {text.slice(index + searchTerm.length)}
    </span>
  );
}

/**
 * 高亮显示多个匹配项的组件
 * 支持全局匹配所有出现的搜索词
 */
export function HighlightTextAll({ text, searchTerm, className }: HighlightTextProps) {
  if (!searchTerm || !text) {
    return <span className={className}>{text}</span>;
  }

  const parts: React.ReactNode[] = [];
  const lowerText = text.toLowerCase();
  const lowerSearch = searchTerm.toLowerCase();
  let lastIndex = 0;
  let index = lowerText.indexOf(lowerSearch);
  let key = 0;

  while (index !== -1) {
    // Add text before match
    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }
    // Add highlighted match
    parts.push(
      <mark key={key++} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
        {text.slice(index, index + searchTerm.length)}
      </mark>
    );
    lastIndex = index + searchTerm.length;
    index = lowerText.indexOf(lowerSearch, lastIndex);
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <span className={className}>{parts}</span>;
}
