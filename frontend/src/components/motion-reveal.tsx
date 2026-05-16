"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type MotionRevealDirection = "up" | "down" | "left" | "right";

type MotionRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: MotionRevealDirection;
};

const directionOffset: Record<MotionRevealDirection, { x: number; y: number }> = {
  up: { x: 0, y: 12 },
  down: { x: 0, y: -12 },
  left: { x: 12, y: 0 },
  right: { x: -12, y: 0 },
};

export function MotionReveal({ children, className, delay = 0, direction = "up" }: MotionRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const offset = directionOffset[direction];

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-48px" }}
      transition={{ duration: 0.35, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
