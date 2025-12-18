"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useMemo, useSyncExternalStore } from "react";

type Dot = {
  top: string;
  left: string;
  width: number;
  height: number;
  y: number;
  duration: number;
};

// Generate dots outside component to avoid hydration mismatch
function generateDots(): Dot[] {
  return Array.from({ length: 6 }).map(() => ({
    top: `${Math.random() * 80 + 10}%`,
    left: `${Math.random() * 90 + 5}%`,
    width: Math.random() * 15 + 5,
    height: Math.random() * 15 + 5,
    y: Math.random() * 30 - 15,
    duration: Math.random() * 3 + 3,
  }));
}

// Use useSyncExternalStore for hydration-safe mounting detection
const emptySubscribe = () => () => {};

export function HeroBackground() {
  // useSyncExternalStore is the recommended way to detect client-side mounting
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,  // Client: always true
    () => false  // Server: always false
  );
  const { theme } = useTheme();

  // Generate dots only on client-side using useMemo with mounted dependency
  const dots = useMemo(() => {
    if (!mounted) return [];
    return generateDots();
  }, [mounted]);

  if (!mounted) return null;

  // 使用当前主题色，亮色模式下使用橙色/黄色系，暗色模式下使用绿色/青色系
  const isDark = theme === "dark";
  
  // 颜色定义
  const colors = isDark 
    ? ["#34d399", "#2dd4bf", "#10b981", "#059669"] // Emerald/Teal for dark
    : ["#00AC4D", "#4ade80", "#22c55e", "#16a34a"]; // Brand Green for light

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* 左上角 - 音符 */}
      <motion.div
        className="absolute top-10 left-[10%] opacity-20"
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="60" height="60" viewBox="0 0 24 24" fill={colors[0]}>
          <path d="M9 18V5l12-2v13" stroke={colors[0]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <circle cx="6" cy="18" r="3" fill={colors[0]} />
          <circle cx="18" cy="16" r="3" fill={colors[0]} />
        </svg>
      </motion.div>

      {/* 右上角 - 书本 */}
      <motion.div
        className="absolute top-20 right-[15%] opacity-20"
        animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke={colors[3]} strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      </motion.div>

      {/* 左中 - 铅笔 */}
      <motion.div
        className="absolute top-[40%] left-[5%] opacity-15"
        animate={{ x: [0, 10, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={colors[1]} strokeWidth="2">
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
      </motion.div>

      {/* 右中 - 星星 */}
      <motion.div
        className="absolute top-[50%] right-[8%] opacity-25"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill={colors[0]}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </motion.div>

      {/* 底部 - 波浪线 */}
      <div className="absolute bottom-0 left-0 w-full opacity-10">
        <svg viewBox="0 0 1440 320" className="w-full h-auto">
          <path fill={colors[2]} fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      {/* 随机分布的小圆点 */}
      {dots.map((dot, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-20"
          style={{
            top: dot.top,
            left: dot.left,
            width: dot.width,
            height: dot.height,
            backgroundColor: colors[i % 4],
          }}
          animate={{
            y: [0, dot.y],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: dot.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

