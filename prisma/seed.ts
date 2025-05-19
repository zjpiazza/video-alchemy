import { PrismaClient, EffectCategory } from '@prisma/client'

const prisma = new PrismaClient()

const effects = [
  {
    id: "sepia",
    name: "Sepia",
    description: "Apply a warm, old-photo sepia tone",
    icon: "sepia",
    category: "FILTER",
    clientSupported: false,
    serverSupported: true,
    defaultParams: {},
  },
  {
    id: "invert",
    name: "Invert Colors",
    description: "Invert all colors for a negative effect",
    icon: "invert",
    category: "FILTER",
    clientSupported: false,
    serverSupported: true,
    defaultParams: {},
  },
  {
    id: "blur",
    name: "Blur",
    description: "Soften the image with a blur effect",
    icon: "blur",
    category: "FILTER",
    clientSupported: false,
    serverSupported: true,
    defaultParams: {
      strength: 10, // boxblur=10:1
    },
  },
  {
    id: "sharpen",
    name: "Sharpen",
    description: "Make the image crisper",
    icon: "sharpen",
    category: "FILTER",
    clientSupported: false,
    serverSupported: true,
    defaultParams: {
      strength: 1.0, // unsharp=5:5:1.0:5:5:0.0
    },
  },
  {
    id: "vignette",
    name: "Vignette",
    description: "Add a dark border around the video",
    icon: "vignette",
    category: "FILTER",
    clientSupported: false,
    serverSupported: true,
    defaultParams: {},
  },
  {
    id: "oldfilm",
    name: "Old Film",
    description: "Simulate old, scratched film",
    icon: "film",
    category: "FILTER",
    clientSupported: false,
    serverSupported: true,
    defaultParams: {
      strength: 0.5,
    },
  },
  {
    id: "glitch",
    name: "Glitch (RGB Split)",
    description: "Shift color channels for a glitchy look",
    icon: "glitch",
    category: "FILTER",
    clientSupported: false,
    serverSupported: true,
    defaultParams: {
      rh: 10,
      bv: 10,
    },
  },
  {
    id: "sketch",
    name: "Edge Detect (Sketch)",
    description: "Turn video into a line drawing",
    icon: "sketch",
    category: "FILTER",
    clientSupported: false,
    serverSupported: true,
    defaultParams: {
      low: 0.1,
      high: 0.4,
    },
  },
  {
    id: "mirror",
    name: "Mirror",
    description: "Flip video horizontally or vertically",
    icon: "mirror",
    category: "FILTER",
    clientSupported: false,
    serverSupported: true,
    defaultParams: {
      direction: "horizontal", // or "vertical"
    },
  },
  {
    id: "wave",
    name: "Wave",
    description: "Add a wavy distortion to your video",
    icon: "wave",
    category: "FILTER",
    clientSupported: false,
    serverSupported: true,
    defaultParams: {
      amplitude: 10,
      frequency: 2,
    },
  },
  {
    id: "pixelate",
    name: "Pixelate",
    description: "Make your video look blocky and pixelated",
    icon: "pixelate",
    category: "FILTER",
    clientSupported: false,
    serverSupported: true,
    defaultParams: {
      pixelSize: 20, // scale=iw/20:ih/20
    },
  },
  {
    id: "fade",
    name: "Fade In/Out",
    description: "Fade video in or out",
    icon: "fade",
    category: "FILTER",
    clientSupported: false,
    serverSupported: true,
    defaultParams: {
      type: "in", // or "out"
      duration: 2,
      start: 0,
    },
  },
  {
    id: "kenburns",
    name: "Ken Burns (Zoom & Pan)",
    description: "Pan and zoom across your video",
    icon: "zoompan",
    category: "FILTER",
    clientSupported: false,
    serverSupported: true,
    defaultParams: {
      zoom: 1.5,
      speed: 0.0015,
    },
  },
  {
    id: "posterize",
    name: "Posterize",
    description: "Reduce the number of colors for a cartoon look",
    icon: "posterize",
    category: "FILTER",
    clientSupported: false,
    serverSupported: true,
    defaultParams: {
      levels: 4,
    },
  },
  {
    id: "tint",
    name: "Color Tint",
    description: "Tint your video with a color",
    icon: "tint",
    category: "FILTER",
    clientSupported: false,
    serverSupported: true,
    defaultParams: {
      color: "red", // or any color
      amount: 0.5,
    },
  },
  {
    id: "motionblur",
    name: "Motion Blur",
    description: "Blend frames for a motion blur effect",
    icon: "motion-blur",
    category: "FILTER",
    clientSupported: false,
    serverSupported: true,
    defaultParams: {
      mode: "average",
      step: 2,
    },
  },
  {
    id: "fisheye",
    name: "Lens Distortion (Fisheye)",
    description: "Warp the image like a fisheye lens",
    icon: "fisheye",
    category: "FILTER",
    clientSupported: false,
    serverSupported: true,
    defaultParams: {
      k1: 0.5,
      k2: 0.5,
    },
  },
  {
    id: "text",
    name: "Text Overlay",
    description: "Add text to your video",
    icon: "text",
    category: "FILTER",
    clientSupported: false,
    serverSupported: true,
    defaultParams: {
      text: "Hello World",
      fontSize: 48,
      color: "white",
      x: 10,
      y: 10,
    },
  },
  {
    id: "freeze",
    name: "Freeze Frame",
    description: "Freeze a frame for a set duration",
    icon: "freeze",
    category: "FILTER",
    clientSupported: false,
    serverSupported: true,
    defaultParams: {
      time: 3,
      duration: 2,
    },
  },
]

async function main() {
  for (const effect of effects) {
    await prisma.effect.upsert({
      where: { id: effect.id },
      update: {
        name: effect.name,
        description: effect.description,
        icon: effect.icon,
        category: effect.category as EffectCategory,
        clientSupported: effect.clientSupported,
        serverSupported: effect.serverSupported,
        defaultParams: effect.defaultParams,
      },
      create: {
        id: effect.id,
        name: effect.name,
        description: effect.description,
        icon: effect.icon,
        category: effect.category as EffectCategory,
        clientSupported: effect.clientSupported,
        serverSupported: effect.serverSupported,
        defaultParams: effect.defaultParams,
      },
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
