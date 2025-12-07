"use client";
import styles from "./sacred-geometry.module.css";

interface SacredGeometryProps {
  variant?: "flower-of-life" | "circles" | "minimal";
  opacity?: number;
}

export default function SacredGeometry({
  variant = "minimal",
  opacity = 0.15,
}: SacredGeometryProps) {
  return (
    <div className={styles.container} style={{ opacity }}>
      {variant === "flower-of-life" && (
        <svg className={styles.svg} viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="purpleGlow">
              <stop offset="0%" stopColor="#9333EA" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#5D3FD3" stopOpacity="0.1" />
            </radialGradient>
          </defs>
          {/* Flower of Life Pattern */}
          <circle cx="200" cy="200" r="50" fill="none" stroke="url(#purpleGlow)" strokeWidth="1" />
          <circle cx="200" cy="150" r="50" fill="none" stroke="url(#purpleGlow)" strokeWidth="1" />
          <circle cx="200" cy="250" r="50" fill="none" stroke="url(#purpleGlow)" strokeWidth="1" />
          <circle cx="243.3" cy="175" r="50" fill="none" stroke="url(#purpleGlow)" strokeWidth="1" />
          <circle cx="243.3" cy="225" r="50" fill="none" stroke="url(#purpleGlow)" strokeWidth="1" />
          <circle cx="156.7" cy="175" r="50" fill="none" stroke="url(#purpleGlow)" strokeWidth="1" />
          <circle cx="156.7" cy="225" r="50" fill="none" stroke="url(#purpleGlow)" strokeWidth="1" />
        </svg>
      )}

      {variant === "circles" && (
        <svg className={styles.svg} viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="purpleCircle">
              <stop offset="0%" stopColor="#5D3FD3" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#9333EA" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="200" cy="200" r="150" fill="url(#purpleCircle)" />
          <circle cx="200" cy="200" r="100" fill="none" stroke="#9686D6" strokeWidth="0.5" />
          <circle cx="200" cy="200" r="75" fill="none" stroke="#B399FF" strokeWidth="0.5" />
          <circle cx="200" cy="200" r="50" fill="none" stroke="#CEBEFF" strokeWidth="0.5" />
        </svg>
      )}

      {variant === "minimal" && (
        <svg className={styles.svg} viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5D3FD3" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#9333EA" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="80" fill="url(#purpleGradient)" />
          <circle cx="300" cy="300" r="100" fill="url(#purpleGradient)" />
          <circle cx="350" cy="100" r="60" fill="url(#purpleGradient)" />
        </svg>
      )}
    </div>
  );
}
