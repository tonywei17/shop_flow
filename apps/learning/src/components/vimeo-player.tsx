"use client";

import { useEffect, useRef } from 'react';
import Player from '@vimeo/player';

interface VimeoPlayerProps {
  videoId: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

export function VimeoPlayer({
  videoId,
  autoplay = false,
  loop = false,
  muted = false,
  className,
  onPlay,
  onPause,
  onEnded
}: VimeoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Use a specific public Vimeo video if the provided ID is a placeholder
    // 76979871 is a classic "The Vimeo Player" intro video often used for testing
    // Or use a known public video like 824804225 (nature)
    const validVideoId = /^\d+$/.test(videoId) ? videoId : '76979871';

    playerRef.current = new Player(containerRef.current, {
      id: Number(validVideoId),
      autoplay,
      loop,
      muted,
      responsive: true,
      width: 640
    });

    if (onPlay) playerRef.current.on('play', onPlay);
    if (onPause) playerRef.current.on('pause', onPause);
    if (onEnded) playerRef.current.on('ended', onEnded);

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId, autoplay, loop, muted, onPlay, onPause, onEnded]);

  return (
    <div ref={containerRef} className={`w-full aspect-video rounded-lg overflow-hidden bg-black ${className}`} />
  );
}
