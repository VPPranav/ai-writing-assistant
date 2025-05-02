"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, Menu, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Header() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Handle hydration issues by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block text-xl">AI Writing Assistant</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="mr-2"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          <div className="hidden md:flex md:items-center md:gap-4">
            <Link href="https://github.com/VPPranav" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">GitHub</Button>
            </Link>
            <Link href="https://platform.openai.com/docs" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">API Docs</Button>
            </Link>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      {mobileMenuOpen && (
        <div className="md:hidden border-t p-4 bg-background animate-fade-in">
          <div className="flex flex-col space-y-3">
            <Link href="https://github.com/VPPranav" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" className="w-full justify-start">GitHub</Button>
            </Link>
            <Link href="https://platform.openai.com/docs" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" className="w-full justify-start">API Docs</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
