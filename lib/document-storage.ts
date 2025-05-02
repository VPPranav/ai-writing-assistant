export interface Document {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
}

const STORAGE_KEY = "ai-writing-assistant-documents"

// Helper to check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

export function saveDocument(document: Omit<Document, "id" | "createdAt" | "updatedAt">): Document {
  if (!isBrowser) {
    throw new Error("Document storage is only available in browser environments")
  }

  const documents = getAllDocuments()

  const newDocument: Document = {
    id: generateId(),
    title: document.title,
    content: document.content,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  documents.push(newDocument)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents))

  return newDocument
}

export function updateDocument(document: Pick<Document, "id"> & Partial<Omit<Document, "id" | "createdAt">>): Document {
  if (!isBrowser) {
    throw new Error("Document storage is only available in browser environments")
  }

  const documents = getAllDocuments()
  const index = documents.findIndex((doc) => doc.id === document.id)

  if (index === -1) {
    throw new Error(`Document with id ${document.id} not found`)
  }

  const updatedDocument = {
    ...documents[index],
    ...document,
    updatedAt: Date.now(),
  }

  documents[index] = updatedDocument
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents))

  return updatedDocument
}

export function deleteDocument(id: string): void {
  if (!isBrowser) {
    throw new Error("Document storage is only available in browser environments")
  }

  const documents = getAllDocuments()
  const filteredDocuments = documents.filter((doc) => doc.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredDocuments))
}

export function getDocument(id: string): Document | null {
  if (!isBrowser) {
    return null
  }

  const documents = getAllDocuments()
  return documents.find((doc) => doc.id === id) || null
}

export function getAllDocuments(): Document[] {
  if (!isBrowser) {
    return []
  }

  try {
    const storedDocuments = localStorage.getItem(STORAGE_KEY)
    return storedDocuments ? JSON.parse(storedDocuments) : []
  } catch (error) {
    console.error("Error retrieving documents from localStorage:", error)
    return []
  }
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
