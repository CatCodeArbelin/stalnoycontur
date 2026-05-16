import type { CSSProperties, ReactNode } from "react";

type MotionRevealDirection = "up" | "down" | "left" | "right";

type MotionRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: MotionRevealDirection;
};

type RevealStyle = CSSProperties & {
  "--reveal-delay"?: string;
};

export function MotionReveal({ children, className, delay = 0, direction = "up" }: MotionRevealProps) {
  const revealClassName = className ? `motion-reveal ${className}` : "motion-reveal";
  const revealStyle: RevealStyle = {
    "--reveal-delay": `${delay}s`,
  };

  return (
    <div className={revealClassName} data-reveal-direction={direction} style={revealStyle}>
      {children}
    </div>
  );
}
