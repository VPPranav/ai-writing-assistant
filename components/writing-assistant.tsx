"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { Loader2, Sun, Moon, Save, FileText, Trash, Send, AlertCircle, ExternalLink, Key, Sparkles, Pencil, Maximize2, Minimize2, ChevronDown, RotateCcw, Copy, CheckCircle2, Wand2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import {
  saveDocument,
  updateDocument,
  getAllDocuments,
  getDocument,
  deleteDocument,
  type Document,
} from "@/lib/document-storage"

type ToneType = "formal" | "casual" | "persuasive" | "informative" | "creative"
type ActionType = "continue" | "rewrite" | "expand" | "summarize"

export default function WritingAssistant() {
  const [text, setText] = useState("")
  const [wordCount, setWordCount] = useState(0)
  const [characterCount, setCharacterCount] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [tone, setTone] = useState<ToneType>("casual")
  const [action, setAction] = useState<ActionType>("continue")
  const [documents, setDocuments] = useState<Document[]>([])
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null)
  const [documentTitle, setDocumentTitle] = useState("")
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [demoModeMessage, setDemoModeMessage] = useState<string | null>(null)
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [mounted, setMounted] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showPlaceholder, setShowPlaceholder] = useState(true)
  const editorRef = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()

  // Handle hydration issues by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load documents and check for stored API key on mount
  useEffect(() => {
    if (!mounted) return

    try {
      setDocuments(getAllDocuments())

      // Check for stored API key
      const storedApiKey = localStorage.getItem("openai_api_key")
      if (storedApiKey) {
        setApiKey(storedApiKey)
      }
    } catch (err) {
      console.error("Error loading documents:", err)
    }
  }, [mounted])

  // Update word and character count
  useEffect(() => {
    if (text) {
      setWordCount(text.trim().split(/\s+/).length)
      setCharacterCount(text.length)
      setShowPlaceholder(false)
    } else {
      setWordCount(0)
      setCharacterCount(0)
      setShowPlaceholder(true)
    }
  }, [text])

  const handleTextChange = (e: React.FormEvent<HTMLDivElement>) => {
    if (e.currentTarget) {
      setText(e.currentTarget.innerText)
    }
  }

  const handleSaveApiKey = () => {
    try {
      localStorage.setItem("openai_api_key", apiKey)
      setShowApiKeyDialog(false)
      setError(null)
      setIsDemoMode(false)
      setIsQuotaExceeded(false)
    } catch (err) {
      console.error("Error saving API key:", err)
      setError("Failed to save API key")
    }
  }

  const handleGenerateText = async () => {
    // Clear any previous errors
    setError(null)
    setIsGenerating(true)
    setIsDemoMode(false)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          text,
          tone,
          action,
          apiKey, // Send the API key from state if available
        }),
      })

      // Parse the JSON response
      const data = await response.json()

      // Check if we're in demo mode
      if (data.isDemoMode || data.quotaExceeded) {
        setIsDemoMode(true)
        setDemoModeMessage(data.details || "Using demo mode due to API limitations")

        if (data.quotaExceeded) {
          setIsQuotaExceeded(true)
        }
      } else {
        // Reset demo mode and quota exceeded flags if successful
        setIsDemoMode(false)
        setIsQuotaExceeded(false)
      }

      // Handle the result
      if (data.result) {
        if (action === "continue") {
          const newText = text ? `${text} ${data.result}` : data.result
          setText(newText)
          if (editorRef.current) {
            editorRef.current.innerText = newText
          }
        } else {
          setText(data.result)
          if (editorRef.current) {
            editorRef.current.innerText = data.result
          }
        }
      } else if (data.error) {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Error generating text:", error)
      setError(error instanceof Error ? error.message : String(error))
      setIsDemoMode(true)
      setDemoModeMessage("Failed to generate text. Running in demo mode.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveDocument = () => {
    if (!documentTitle.trim()) {
      setError("Please enter a document title")
      return
    }

    try {
      if (currentDocument) {
        // Update existing document
        const updated = updateDocument({
          id: currentDocument.id,
          title: documentTitle,
          content: text,
        })
        setCurrentDocument(updated)
      } else {
        // Create new document
        const newDoc = saveDocument({
          title: documentTitle,
          content: text,
        })
        setCurrentDocument(newDoc)
      }

      // Refresh documents list
      setDocuments(getAllDocuments())
      setShowSaveDialog(false)
      setError(null)
    } catch (error) {
      console.error("Error saving document:", error)
      setError(error instanceof Error ? error.message : String(error))
    }
  }

  const handleLoadDocument = (id: string) => {
    try {
      const doc = getDocument(id)
      if (doc) {
        setCurrentDocument(doc)
        setText(doc.content)
        setDocumentTitle(doc.title)

        if (editorRef.current) {
          editorRef.current.innerText = doc.content
        }
      }
    } catch (error) {
      console.error("Error loading document:", error)
      setError(error instanceof Error ? error.message : String(error))
    }
  }

  const handleDeleteDocument = (id: string) => {
    try {
      deleteDocument(id)
      setDocuments(getAllDocuments())

      if (currentDocument && currentDocument.id === id) {
        setCurrentDocument(null)
        setText("")
        setDocumentTitle("")

        if (editorRef.current) {
          editorRef.current.innerText = ""
        }
      }
    } catch (error) {
      console.error("Error deleting document:", error)
      setError(error instanceof Error ? error.message : String(error))
    }
  }

  const handleNewDocument = () => {
    setCurrentDocument(null)
    setText("")
    setDocumentTitle("")
    setError(null)

    if (editorRef.current) {
      editorRef.current.innerText = ""
    }
  }

  const handleCopyText = () => {
    if (text) {
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Don't render until after hydration to avoid mismatch
  if (!mounted) {
    return null
  }

  return (
    <div className={`transition-all duration-300 ${fullscreen ? 'fixed inset-0 z-50 p-4 bg-background' : ''}`}>
      <Card className={`w-full border shadow-lg ${fullscreen ? 'h-full flex flex-col' : ''}`}>
        <CardHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Pencil className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">
                {currentDocument ? currentDocument.title : "New Document"}
              </CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFullscreen(!fullscreen)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <CardDescription>
            {currentDocument 
              ? `Last edited on ${new Date(currentDocument.updatedAt).toLocaleDateString()}`
              : "Start writing or generate content with AI"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className={`p-0 ${fullscreen ? 'flex-grow overflow-hidden' : ''}`}>
          <Tabs defaultValue="editor" className={`${fullscreen ? 'h-full flex flex-col' : ''}`}>
            <div className="border-b px-6">
              <TabsList className="h-12">
                <TabsTrigger value="editor" className="tab-highlight">
                  <FileText className="h-4 w-4 mr-2" />
                  Editor
                </TabsTrigger>
                <TabsTrigger value="documents" className="tab-highlight">
                  <FileText className="h-4 w-4 mr-2" />
                  Documents
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center space-x-2 absolute right-6 top-[5.5rem]">
                <Button variant="outline" size="sm" onClick={handleNewDocument} className="h-8">
                  <FileText className="h-3.5 w-3.5 mr-1" />
                  New
                </Button>
                
                <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      <Save className="h-3.5 w-3.5 mr-1" />
                      Save
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save Document</DialogTitle>
                      <DialogDescription>
                        Enter a title for your document to save it to your collection.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Input
                          placeholder="Document title"
                          value={documentTitle}
                          onChange={(e) => setDocumentTitle(e.target.value)}
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
                        <Button onClick={handleSaveDocument}>Save Document</Button>
                      </DialogFooter>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      <Key className="h-3.5 w-3.5 mr-1" />
                      API Key
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Set OpenAI API Key</DialogTitle>
                      <DialogDescription>
                        Enter your OpenAI API key to enable AI text generation. Your key is stored locally in your browser.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Input
                          type="password"
                          placeholder="sk-..."
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowApiKeyDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveApiKey}>Save API Key</Button>
                      </DialogFooter>
                      <p className="text-xs text-muted-foreground mt-2">
                        Don't have an API key?{" "}
                        <a
                          href="https://platform.openai.com/account/api-keys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          Get one from OpenAI
                        </a>
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {isQuotaExceeded && (
              <div className="bg-amber-500/15 text-amber-700 dark:text-amber-400 p-4 rounded-md mx-6 mt-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <p className="font-medium">OpenAI API quota exceeded</p>
                    <p className="text-sm">
                      Your OpenAI API key has exceeded its quota or has billing issues. Please check your billing details on
                      the OpenAI platform.
                    </p>
                    <p className="text-sm">The application is now running in demo mode with limited functionality.</p>
                    <div className="flex space-x-4">
                      <a
                        href="https://platform.openai.com/account/billing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm font-medium text-amber-700 dark:text-amber-400 hover:underline"
                      >
                        Check billing details
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                      <button
                        onClick={() => setShowApiKeyDialog(true)}
                        className="inline-flex items-center text-sm font-medium text-amber-700 dark:text-amber-400 hover:underline"
                      >
                        Update API key
                        <Key className="ml-1 h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && !isQuotaExceeded && (
              <div className="bg-destructive/15 text-destructive p-3 rounded-md mx-6 mt-4 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>{error}</span>
              </div>
            )}

            {isDemoMode && !isQuotaExceeded && (
              <div className="bg-blue-500/15 text-blue-700 dark:text-blue-400 p-3 rounded-md mx-6 mt-4 flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span>Running in demo mode with limited functionality. {demoModeMessage}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowApiKeyDialog(true)}>
                  <Key className="h-4 w-4 mr-1" />
                  Set API Key
                </Button>
              </div>
            )}

            <TabsContent 
              value="editor" 
              className={`p-0 mt-0 ${fullscreen ? 'flex-grow overflow-hidden' : ''}`}
            >
              <div className={`space-y-4 ${fullscreen ? 'h-full flex flex-col' : ''}`}>
                <div className="editor-container mx-6 mt-6 mb-4 relative flex-grow">
                  <div className="editor-toolbar">
                    <div className="toolbar-button-group">
                      <button className="toolbar-button" onClick={handleCopyText} title="Copy text">
                        {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                      <button className="toolbar-button" onClick={handleNewDocument} title="Clear text">
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Select value={tone} onValueChange={(value) => setTone(value as ToneType)}>
                        <SelectTrigger className="w-[130px] h-8">
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="persuasive">Persuasive</SelectItem>
                          <SelectItem value="informative">Informative</SelectItem>
                          <SelectItem value="creative">Creative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div
                    ref={editorRef}
                    className="editor-content"
                    contentEditable
                    onInput={handleTextChange}
                    suppressContentEditableWarning
                  />
                  
                  {showPlaceholder && (
                    <div className="editor-placeholder">
                      Start typing or generate content with AI...
                    </div>
                  )}

                  <div className="editor-statusbar">
                    <div>
                      {wordCount} words | {characterCount} characters
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {currentDocument ? `Editing: ${currentDocument.title}` : "New document"}
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Select value={action} onValueChange={(value) => setAction(value as ActionType)}>
                      <SelectTrigger className="w-full sm:w-[150px]">
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="continue">Continue</SelectItem>
                        <SelectItem value="rewrite">Rewrite</SelectItem>
                        <SelectItem value="expand">Expand</SelectItem>
                        <SelectItem value="summarize">Summarize</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex-1 flex gap-2">
                      <Input
                        placeholder="Additional instructions (optional)"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="flex-1"
                      />

                      <Button 
                        onClick={handleGenerateText} 
                        disabled={isGenerating || (action !== "continue" && !text)}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Wand2 className="mr-2 h-4 w-4" />
                            Generate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="p-0 mt-0">
              <div className="p-6">
                {documents.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {documents.map((doc) => (
                      <Card 
                        key={doc.id} 
                        className="document-card overflow-hidden border hover:border-primary/50 cursor-pointer"
                        onClick={() => handleLoadDocument(doc.id)}
                      >
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-lg truncate">{doc.title}</CardTitle>
                          <CardDescription className="text-xs">
                            {new Date(doc.updatedAt).toLocaleDateString()} • {doc.content.split(/\s+/).length} words
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {doc.content}
                          </p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDocument(doc.id);
                            }}
                            aria-label="Delete document"
                            className="h-8 w-8"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg bg-muted/20">
                    <FileText className="mx-auto h-12 w-12 mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No documents saved yet</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Your saved documents will appear here
                    </p>
                    <Button onClick={handleNewDocument}>
                      <FileText className="mr-2 h-4 w-4" />
                      Create New Document
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
