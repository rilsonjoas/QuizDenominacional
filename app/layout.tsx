import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeContext'
import ThemeToggle from '@/components/ThemeToggle'

// Configuração da fonte Inter
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Quiz Denominacional - Descubra sua Afinidade Teológica',
  description: 'Um quiz interativo e moderno que ajuda você a descobrir qual denominação cristã está mais alinhada com suas crenças e valores teológicos.',
  keywords: 'quiz, denominação, cristão, teologia, igreja, crenças, religião',
  authors: [{ name: 'Rilson Joás' }],
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        <ThemeProvider>
          <ThemeToggle />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}