"use client"

import React, { useEffect, useRef, useState } from 'react'
import anime from 'animejs'
import { Card } from '@/components/ui/card'
interface LoadingAnimationProps {
  showText?: boolean
}

const loadingMessages = [
  "Brewing your video transformation...",
  "Distilling pixels into magic...",
  "Adding a splash of digital alchemy...",
  "Stirring the visual elements...",
  "Mixing special effects...",
  "Concocting your masterpiece..."
]

export function LoadingAnimation({ showText = true }: LoadingAnimationProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    if (showText) {
      const interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % loadingMessages.length)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [showText])

  useEffect(() => {
    if (svgRef.current) {
      // Animate bubbles with varying sizes and speeds
      anime({
        targets: '.bubble',
        translateY: function(el: Element) {
          const baseDistance = -15
          const scale = parseFloat(el.getAttribute('data-scale') || '1')
          return [0, baseDistance * scale]
        },
        opacity: [1, 0],
        easing: 'easeInOutSine',
        duration: function() { return anime.random(800, 1400) },
        delay: anime.stagger(200),
        loop: true
      })

      // Enhanced liquid sloshing effect
      const liquidTimeline = anime.timeline({
        loop: true,
        direction: 'alternate',
        easing: 'easeInOutSine'
      })

      const liquidPaths = [
        'M20,85 C20,85 25,60 40,60 C55,60 60,85 60,85 Q60,90 40,90 Q20,90 20,85 Z',
        'M20,85 C20,85 30,62 40,58 C50,55 60,82 60,85 Q60,90 40,90 Q20,90 20,85 Z',
        'M20,85 C20,82 30,55 40,58 C50,62 60,85 60,85 Q60,90 40,90 Q20,90 20,85 Z',
        'M20,85 C20,85 25,63 40,65 C55,63 60,85 60,85 Q60,90 40,90 Q20,90 20,85 Z'
      ]

      liquidPaths.forEach((path, index) => {
        liquidTimeline.add({
          targets: '.liquid',
          d: path,
          duration: 800,
          endDelay: index === liquidPaths.length - 1 ? 400 : 0
        })
      })

      // Enhanced flask movement
      const flaskTimeline = anime.timeline({
        loop: true,
        easing: 'easeInOutQuad'
      })

      flaskTimeline
        .add({
          targets: '.flask-container',
          rotate: [-3, 3],
          translateX: [-3, 3],
          duration: 1000,
          delay: 200
        })
        .add({
          targets: '.flask-container',
          rotate: [3, -3],
          translateX: [3, -3],
          duration: 1000
        })
        .add({
          targets: '.flask-container',
          rotate: 0,
          translateX: 0,
          duration: 800
        })
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[300px]">
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full py-12 px-6">
        <div className="flex-shrink-0">
          <svg
            ref={svgRef}
            className="w-40 h-40 md:w-48 md:h-48"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g className="flask-container" style={{ transformOrigin: 'center' }}>
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

              {/* Liquid mask */}
              <clipPath id="liquidMask">
                <path d="M20,85 C20,85 25,60 40,60 C55,60 60,85 60,85 Q60,90 40,90 Q20,90 20,85 Z" />
              </clipPath>

              {/* Liquid and bubbles */}
              <g clipPath="url(#liquidMask)">
                <path
                  className="liquid fill-primary/50"
                  d="M20,85 C20,85 25,60 40,60 C55,60 60,85 60,85 Q60,90 40,90 Q20,90 20,85 Z"
                />
                
                {/* Bubbles with varying sizes */}
                <circle className="bubble fill-primary" cx="30" cy="70" r="2.5" data-scale="1.2" />
                <circle className="bubble fill-primary" cx="45" cy="65" r="2" data-scale="0.9" />
                <circle className="bubble fill-primary" cx="35" cy="75" r="1.5" data-scale="1.1" />
                <circle className="bubble fill-primary" cx="47" cy="72" r="1.8" data-scale="1" />
                <circle className="bubble fill-primary" cx="40" cy="68" r="1.2" data-scale="0.8" />
              </g>

              {/* Sparkles */}
              <circle cx="48" cy="45" r="1" className="fill-primary/30" />
              <circle cx="53" cy="50" r="0.8" className="fill-primary/30" />
              <circle cx="46" cy="55" r="1.2" className="fill-primary/30" />
            </g>
          </svg>
        </div>
        {showText && (
          <div className="flex-grow text-center md:text-left">
            <p className="text-xl md:text-2xl font-medium text-muted-foreground animate-pulse">
              {loadingMessages[messageIndex]}
            </p>
            <p className="text-base md:text-lg text-muted-foreground/60 mt-3">
              This might take a moment...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}