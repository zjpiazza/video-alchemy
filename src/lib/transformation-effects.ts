import type { TransformationEffect } from "~/types/video"

export const transformationEffects: TransformationEffect[] = [
  {
    id: "resize",
    name: "Resize",
    description: "Change the dimensions of your video",
    icon: "resize",
    category: "resize",
    clientSupported: true,
    serverSupported: true,
    defaultParams: {
      width: 1280,
      height: 720,
      maintainAspectRatio: true,
    },
  },
  {
    id: "compress",
    name: "Compress",
    description: "Reduce file size while maintaining quality",
    icon: "compress",
    category: "convert",
    clientSupported: true,
    serverSupported: true,
    defaultParams: {
      quality: "medium", // low, medium, high
      format: "mp4",
    },
  },
  {
    id: "trim",
    name: "Trim",
    description: "Cut your video to a specific length",
    icon: "scissors",
    category: "trim",
    clientSupported: true,
    serverSupported: true,
    defaultParams: {
      start: 0,
      end: 0, // Will be set to video duration when selected
    },
  },
  {
    id: "convert",
    name: "Convert Format",
    description: "Change the video format",
    icon: "file-type",
    category: "convert",
    clientSupported: true,
    serverSupported: true,
    defaultParams: {
      format: "mp4", // mp4, webm, gif
    },
  },
  {
    id: "grayscale",
    name: "Grayscale",
    description: "Convert video to black and white",
    icon: "grayscale",
    category: "filter",
    clientSupported: true,
    serverSupported: true,
    defaultParams: {},
  },
  {
    id: "rotate",
    name: "Rotate",
    description: "Rotate your video",
    icon: "rotate",
    category: "resize",
    clientSupported: true,
    serverSupported: true,
    defaultParams: {
      angle: 90, // 90, 180, 270
    },
  },
  {
    id: "speed",
    name: "Change Speed",
    description: "Speed up or slow down your video",
    icon: "fast-forward",
    category: "advanced",
    clientSupported: false,
    serverSupported: true,
    defaultParams: {
      factor: 1.5, // 0.5 = half speed, 2 = double speed
    },
  },
  {
    id: "watermark",
    name: "Add Watermark",
    description: "Add a watermark to your video",
    icon: "watermark",
    category: "advanced",
    clientSupported: false,
    serverSupported: true,
    defaultParams: {
      position: "bottom-right", // top-left, top-right, bottom-left, bottom-right, center
      opacity: 0.7,
    },
  },
]

export function getEffectById(id: string): TransformationEffect | undefined {
  return transformationEffects.find((effect) => effect.id === id)
}

export function getClientSupportedEffects(): TransformationEffect[] {
  return transformationEffects.filter((effect) => effect.clientSupported)
}

export function getServerSupportedEffects(): TransformationEffect[] {
  return transformationEffects.filter((effect) => effect.serverSupported)
}
