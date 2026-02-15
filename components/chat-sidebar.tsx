"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { getUserChats } from "@/lib/actions/get-user-chats"
import { Button } from "./ui/button"
import { Plus } from "lucide-react"

type Chat = {
  id: string
  title: string
  createdAt: string
}

export function ChatSidebar() {
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    async function loadChats() {
      try {
        const response = await fetch('/api/chat/list')
        console.log("fetching chats response", response)
        if (!response.ok) throw new Error('Failed to load chats')
        const data = await response.json()
        console.log("fetching chats data", data)
        setChats(data)
      } catch (error) {
        console.error('Error loading chats:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadChats()
  }, [])

  // Create a new chat
  const createNewChat = async () => {
    // This will be handled by the parent component or page
    window.location.href = '/chat/new'
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background p-4">
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-lg font-semibold">Chats</h2>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={createNewChat}
          className="h-8 w-8"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        ) : chats.length === 0 ? (
          <p className="px-2 py-4 text-sm text-muted-foreground">
            No chats yet. Start a new conversation!
          </p>
        ) : (
          <div className="space-y-1">
            {chats.map((chat) => (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                  pathname === `/chat/${chat.id}`
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/50'
                }`}
              >
                <div className="truncate">{chat.title}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(chat.createdAt).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
