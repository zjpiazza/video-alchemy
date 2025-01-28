'use client'

import dynamic from 'next/dynamic'
import React from 'react'

function NoSSRWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return <>{children}</>
}

export default dynamic(() => Promise.resolve(NoSSRWrapper), {
  ssr: false
})
