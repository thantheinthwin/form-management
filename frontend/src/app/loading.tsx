"use client"

import React from 'react'
import Lottie from 'react-lottie'
import loadingAnimation from '../../public/lottie/loading.json'

export default function Loading() {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-64 h-64">
        <Lottie 
          options={defaultOptions}
          height="100%"
          width="100%"
        />
      </div>
      <h2 className="mt-4 text-xl font-medium text-center text-primary">
        Loading...
      </h2>
    </div>
  )
} 