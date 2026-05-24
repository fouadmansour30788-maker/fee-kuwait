'use client'

import { Toaster } from 'sonner'
import { LangProvider } from '@/context/LangContext'
import ErrorBoundary from './ErrorBoundary'
import SmoothScrollProvider from './SmoothScrollProvider'
import ScrollProgressBar from './ScrollProgressBar'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <LangProvider>
        <SmoothScrollProvider>
          <ScrollProgressBar />
          {children}
        </SmoothScrollProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#fff',
              border: '1px solid #B7E4C7',
              color: '#1C1F1D',
            },
          }}
        />
      </LangProvider>
    </ErrorBoundary>
  )
}
