'use client'

import { Toaster } from 'sonner'
import { LangProvider } from '@/context/LangContext'
import ErrorBoundary from './ErrorBoundary'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <LangProvider>
        {children}
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
