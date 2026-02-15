"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  HelpCircle,
  History,
  MessageSquare,
  Mic,
  LogOut,
  User,
  Plus,
  Trash2,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"

type Chat = {
  id: string
  title: string
  createdAt: string
}

export function AppSidebar() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [recentChats, setRecentChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRecentExpanded, setIsRecentExpanded] = useState(false)

  useEffect(() => {
    async function loadChats() {
      // Only load chats if user is authenticated
      if (!user) return
      
      try {
        setIsLoading(true)
        const response = await fetch('/api/chat/list')
        if (!response.ok) throw new Error('Failed to load chats')
        const data = await response.json()
        setRecentChats(data)
      } catch (error) {
        console.error('Error loading chats:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadChats()
  }, [user])

  const createNewChat = () => {
    window.location.href = '/'
  }

  const deleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete chat')
      }
      
      // Remove from local state
      setRecentChats(prev => prev.filter(chat => chat.id !== chatId))
      
      // Redirect to home if current chat is deleted
      if (pathname === `/recom/${chatId}`) {
        router.push('/')
      }
    } catch (error) {
      console.error('Error deleting chat:', error)
    }
  }

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-6 border-b">
        <div className="text-lg font-semibold tracking-tight">
          Mock Interviewer
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-y-4">
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Interview" className="text-xl [&>svg]:size-5">
                  <Link href="/">
                    <Mic />
                    <span>Interview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Questions" className="text-xl [&>svg]:size-5">
                  <Link href="/questions">
                    <HelpCircle />
                    <span>Mock Questions</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <div className="flex items-center justify-between w-full">
                  <SidebarMenuButton tooltip="Recent" className="font-medium text-xl [&>svg]:size-5">
                    <History />
                    <span>Recent</span>
                  </SidebarMenuButton>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={createNewChat}
                    className="h-6 w-6 opacity-60 hover:opacity-100"
                    title="New Chat"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <SidebarMenuSub>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-2">
                      <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent"></div>
                    </div>
                  ) : recentChats.length === 0 ? (
                    <div className="px-2 py-2 text-xs text-muted-foreground">
                      No chats yet
                    </div>
                  ) : (
                    recentChats.map((chat) => (
                      <SidebarMenuSubItem key={chat.id}>
                        <div className="flex items-center w-full group">
                          <SidebarMenuSubButton 
                            asChild 
                            className={`text-sm [&>svg]:size-5 flex-1 ${
                              pathname === `/recom/${chat.id}` ? 'bg-accent' : ''
                            }`}
                          >
                            <Link href={`/recom/${chat.id}`}>
                              <MessageSquare />
                              <div className="flex-1 truncate">
                                <div
                                  className="truncate"
                                  style={{ maxWidth: '100%' }}
                                >
                                  {chat.title.length > 20
                                    ? `${chat.title.slice(
                                        0,
                                        20
                                      )}...`
                                    : chat.title}
                                </div>
                              </div>
                            </Link>
                          </SidebarMenuSubButton>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => deleteChat(chat.id, e)}
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-destructive"
                            title="Delete chat"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </SidebarMenuSubItem>
                    ))
                  )}
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {user ? (
          <div className="flex items-center gap-3 px-4 py-3">
            <User className="size-5" />
            <div className="flex-1 text-sm">
              <div className="font-medium truncate">{user.email}</div>
            </div>
            <button
              className="text-muted-foreground hover:text-foreground"
              onClick={async () => {
                await signOut()
                router.push('/auth/signin')
              }}
              title="Sign out"
            >
              <LogOut />
            </button>
          </div>
        ) : (
          <div className="px-3 py-3">
            <Link href="/auth/signin" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <User />
              <span>Sign in</span>
            </Link>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}