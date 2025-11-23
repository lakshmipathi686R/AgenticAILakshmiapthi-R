import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Interview Practice Partner',
  description: 'AI-powered interview practice with voice and chat support',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}



