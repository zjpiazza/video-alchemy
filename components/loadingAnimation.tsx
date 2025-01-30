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
      // Animate bubbles with more pronounced movement
      anime({
        targets: '.bubble',
        translateY: function(el: Element) {
          const baseDistance = -25  // Increased distance
          const scale = parseFloat(el.getAttribute('data-scale') || '1')
          return [0, baseDistance * scale]
        },
        opacity: [0.8, 0],  // Start more visible
        easing: 'easeInOutSine',
        duration: function() { return anime.random(1000, 1600) },  // Slower bubbles
        delay: anime.stagger(150),  // Faster stagger
        loop: true
      })

      // Enhanced liquid sloshing effect
      const liquidTimeline = anime.timeline({
        loop: true,
        direction: 'alternate',
        easing: 'easeInOutSine',
        duration: 1000  // Consistent timing
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
          endDelay: index === liquidPaths.length - 1 ? 200 : 0
        })
      })

      // Enhanced flask movement with more pronounced swaying
      const flaskTimeline = anime.timeline({
        loop: true,
        easing: 'easeInOutQuad'
      })

      flaskTimeline
        .add({
          targets: '.flask-container',
          rotate: [-4, 4],  // More rotation
          translateX: [-4, 4],  // More movement
          duration: 1200,
          delay: 200
        })
        .add({
          targets: '.flask-container',
          rotate: [4, -4],
          translateX: [4, -4],
          duration: 1200
        })
        .add({
          targets: '.flask-container',
          rotate: 0,
          translateX: 0,
          duration: 1000
        })

      // Add sparkle animation
      anime({
        targets: '.fill-primary\\/30',  // Target sparkles
        opacity: [0.2, 0.6],
        scale: [1, 1.2],
        easing: 'easeInOutSine',
        duration: 1500,
        delay: anime.stagger(200),
        direction: 'alternate',
        loop: true
      })
    }
  }, [])

  return (
    <div className="aspect-video w-full bg-card/50 rounded-lg flex items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        {/* Animation */}
        <div className="w-40 md:w-48">
          <svg
            ref={svgRef}
            className="w-full h-full"
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

        {/* Text */}
        {showText && (
          <div className="text-center space-y-2">
            <p className="text-xl font-medium text-foreground/80 animate-pulse">
              {loadingMessages[messageIndex]}
            </p>
            <p className="text-sm text-muted-foreground">
              This might take a moment...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Add this to your globals.css
/*
@keyframes progress {
  0% {
    width: 0%;
    opacity: 1;
  }
  50% {
    width: 100%;
    opacity: 0.5;
  }
  100% {
    width: 0%;
    opacity: 1;
  }
}
*/