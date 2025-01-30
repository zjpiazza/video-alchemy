"use client"

import React from 'react'

interface LogoProps {
  className?: string
}


export function Logo({ className = "w-8 h-8" }: LogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cork stopper */}
      <path
        d="M36,15 L44,15 L44,20 Q40,22 36,20 Z"
        className="fill-primary"
      />
      <path
        d="M38,20 L42,20 L42,25 Q40,27 38,25 Z"
        className="fill-primary/80"
      />

      {/* Flask neck */}
      <path
        d="M35,25 L45,25 L45,35 Q40,37 35,35 Z"
        className="fill-background stroke-primary"
        strokeWidth="2"
      />

      {/* Conical Flask */}
      <path
        d="M35,35 L45,35 L60,85 Q60,95 40,95 Q20,95 20,85 L35,35"
        className="fill-background stroke-primary"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Static liquid */}
      <path
        d="M20,85 C20,85 25,63 40,65 C55,63 60,85 60,85 Q60,90 40,90 Q20,90 20,85 Z"
        className="fill-primary/50"
      />

      {/* Static bubbles */}
      <circle className="fill-primary/40" cx="30" cy="70" r="2.5" />
      <circle className="fill-primary/40" cx="45" cy="65" r="2" />
      <circle className="fill-primary/40" cx="35" cy="75" r="1.5" />

      {/* Static sparkles */}
      <circle cx="48" cy="45" r="1" className="fill-primary/30" />
      <circle cx="53" cy="50" r="0.8" className="fill-primary/30" />
      <circle cx="46" cy="55" r="1.2" className="fill-primary/30" />
    </svg>
  )
}