import { Suspense } from "react"
import dynamic from "next/dynamic"
import { Loader2, Sparkles, FileText, Zap, Lightbulb } from 'lucide-react'
import Header from "@/components/header"
import Footer from "@/components/footer"

// Dynamically import the WritingAssistant component with no SSR to avoid hydration issues
const WritingAssistant = dynamic(() => import("@/components/writing-assistant"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[400px]">
      <div className="flex flex-col items-center">
        <Loader2 className="h-12 w-12 animate-spin mb-2" />
        <p className="text-sm text-muted-foreground">Loading editor...</p>
      </div>
    </div>
  ),
})

// Dynamically import the Spline model with a fallback
const SplineModel = dynamic(
  () => import("@/components/spline-model").catch(() => import("@/components/fallback-3d-model")),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[600px]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin mb-2" />
          <p className="text-sm text-muted-foreground">Loading 3D visualization...</p>
        </div>
      </div>
    ),
  },
)

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-12 md:py-20 gradient-bg">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                  <Sparkles className="h-4 w-4 inline-block mr-1" />
                  AI-Powered Writing
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  AI Writing Assistant
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Enhance your writing with AI-powered suggestions, tone adjustments, and more. 
                  Create, edit, and refine your content with the help of advanced AI.
                </p>
              </div>
              <div className="hidden lg:flex items-center justify-center h-[400px] rounded-lg overflow-hidden">
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-12 w-12 animate-spin" />
                    </div>
                  }
                >
                  <SplineModel />
                </Suspense>
              </div>
            </div>
          </div>
        </section>
        
        {/* Editor Section */}
        <section className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <WritingAssistant />
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tighter">Key Features</h2>
              <p className="mt-2 text-muted-foreground">
                Powerful tools to enhance your writing experience
              </p>
            </div>
            
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-sm border">
                <div className="feature-icon mb-4">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">AI-Powered Generation</h3>
                <p className="text-muted-foreground">
                  Generate high-quality content with advanced AI models. Continue, rewrite, expand, or summarize your text.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-sm border">
                <div className="feature-icon mb-4">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Document Management</h3>
                <p className="text-muted-foreground">
                  Save, organize, and access your documents anytime. All documents are stored securely in your browser.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-sm border">
                <div className="feature-icon mb-4">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Tone Adjustment</h3>
                <p className="text-muted-foreground">
                  Adjust the tone of your writing to match your audience. Choose from formal, casual, persuasive, and more.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}
