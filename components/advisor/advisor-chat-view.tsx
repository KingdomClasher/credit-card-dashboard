"use client"

import * as React from "react"
import Link from "next/link"
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from "@/components/ui/message-scroller"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
} from "@/components/ui/message"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FinancialTrace, FinancialTraceData } from "./financial-trace"
import { PromptSuggestions } from "./prompt-suggestions"
import { AdvisorMarkdown } from "./advisor-markdown"
import {
  Bot,
  User,
  Send,
  Square,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  isStreaming?: boolean
}

function parseMessageContent(raw: string): {
  trace?: FinancialTraceData
  displayContent: string
  isTraceRunning: boolean
} {
  const traceMatch = raw.match(/<trace>([\s\S]*?)<\/trace>/)
  if (traceMatch) {
    let trace: FinancialTraceData | undefined
    try {
      trace = JSON.parse(traceMatch[1].trim())
    } catch {
      // In case of any parsing hiccup
    }
    const displayContent = raw.replace(/<trace>[\s\S]*?<\/trace>/, "").trim()
    return { trace, displayContent, isTraceRunning: false }
  }

  if (raw.includes("<trace>")) {
    return {
      trace: undefined,
      displayContent: "",
      isTraceRunning: true,
    }
  }

  return {
    trace: undefined,
    displayContent: raw,
    isTraceRunning: false,
  }
}

export function AdvisorChatView() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const abortControllerRef = React.useRef<AbortController | null>(null)

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input
    if (!textToSend.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: textToSend.trim(),
    }

    const assistantPlaceholderId = `assistant-${Date.now()}`
    const assistantMessage: ChatMessage = {
      id: assistantPlaceholderId,
      role: "assistant",
      content: "",
      isStreaming: true,
    }

    const updatedMessages = [...messages, userMessage]
    setMessages([...updatedMessages, assistantMessage])
    setInput("")
    setIsLoading(true)

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`)
      }

      if (!response.body) {
        throw new Error("No response body available")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        accumulatedContent += decoder.decode(value, { stream: true })
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantPlaceholderId
              ? { ...msg, content: accumulatedContent, isStreaming: true }
              : msg
          )
        )
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantPlaceholderId
            ? { ...msg, isStreaming: false }
            : msg
        )
      )
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantPlaceholderId
              ? { ...msg, isStreaming: false }
              : msg
          )
        )
      } else {
        console.error("Chat streaming error:", err)
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantPlaceholderId
              ? {
                  ...msg,
                  content:
                    "Sorry, I encountered an issue generating that response. Please try asking again.",
                  isStreaming: false,
                }
              : msg
          )
        )
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setMessages([])
    setIsLoading(false)
  }

  return (
    <div className="flex h-[calc(100dvh-8rem)] w-full flex-col bg-background md:h-[calc(100vh-4rem)]">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            <span className="hidden sm:inline">Back to Catalog</span>
          </Link>
          <div className="flex size-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
            <Bot className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-sm font-semibold text-foreground sm:text-base">
                AI Card Advisor
              </h1>
              <Badge
                variant="outline"
                className="hidden border-primary/30 py-0 font-mono text-[10px] text-primary sm:inline-flex"
              >
                llama-3.3-70b-versatile
              </Badge>
            </div>
            <p className="hidden text-[11px] text-muted-foreground sm:block">
              Friendly guidance on card perks, rewards, and smart card choices
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          )}
          <Badge
            variant="secondary"
            className="flex items-center gap-1 text-[11px] font-normal"
          >
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            35-Card Catalog Live
          </Badge>
        </div>
      </div>

      {/* Main chat viewport with virtualized message scroller */}
      <MessageScrollerProvider autoScroll defaultScrollPosition="end">
        <MessageScroller className="min-h-0 w-full flex-1">
          <MessageScrollerViewport className="p-4 sm:p-6">
            <MessageScrollerContent className="mx-auto max-w-4xl space-y-6">
              {/* Empty state / Welcome screen */}
              {messages.length === 0 && (
                <div className="my-auto flex flex-col items-center justify-center space-y-6 py-8 text-center">
                  <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-sm">
                    <Sparkles className="size-7" />
                  </div>

                  <div className="max-w-lg space-y-2">
                    <h2 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                      Welcome! I&apos;m your AI Card Advisor.
                    </h2>
                    <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      Ask me anything about card perks, maximizing rewards, or
                      which card fits your spending habits next.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-3 py-1">
                      <Sparkles className="size-3.5 text-amber-500" />
                      Perks &amp; Rewards
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-3 py-1">
                      <CheckCircle2 className="size-3.5 text-blue-500" />
                      Application &amp; 5/24 Rules
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-3 py-1">
                      <ShieldCheck className="size-3.5 text-emerald-500" />
                      Zero-PAN Secure
                    </span>
                  </div>

                  {/* Starter Chips */}
                  <PromptSuggestions onSelectPrompt={handleSend} />
                </div>
              )}

              {/* Message list */}
              {messages.map((message, index) => {
                const isUser = message.role === "user"
                const isLast = index === messages.length - 1

                if (isUser) {
                  return (
                    <MessageScrollerItem
                      key={message.id}
                      messageId={message.id}
                      scrollAnchor={isLast}
                    >
                      <Message align="end" className="gap-3">
                        <MessageContent>
                          <Bubble variant="default" align="end">
                            <BubbleContent className="bg-primary text-sm font-medium text-primary-foreground shadow-xs">
                              {message.content}
                            </BubbleContent>
                          </Bubble>
                        </MessageContent>
                        <MessageAvatar className="size-8 rounded-full bg-primary text-primary-foreground">
                          <User className="size-4" />
                        </MessageAvatar>
                      </Message>
                    </MessageScrollerItem>
                  )
                }

                // Assistant message
                const parsed = parseMessageContent(message.content)

                return (
                  <MessageScrollerItem
                    key={message.id}
                    messageId={message.id}
                    scrollAnchor={isLast}
                  >
                    <Message align="start" className="gap-3">
                      <MessageAvatar className="size-8 shrink-0 rounded-full border border-primary/20 bg-primary/10 text-primary">
                        <Bot className="size-4" />
                      </MessageAvatar>

                      <MessageContent className="min-w-0 flex-1">
                        <MessageHeader className="mb-1">
                          <span className="font-semibold text-foreground">
                            AI Card Advisor
                          </span>
                          <span className="ml-2 text-[10px] text-muted-foreground">
                            Groq Llama-3.3-70B
                          </span>
                        </MessageHeader>

                        {/* Financial Reasoning Trace Toggle */}
                        {(parsed.trace || parsed.isTraceRunning) && (
                          <FinancialTrace
                            trace={parsed.trace || {}}
                            isRunning={parsed.isTraceRunning}
                            defaultOpen={false}
                          />
                        )}

                        {/* Conversational Markdown and Code Comparison Blocks */}
                        <Bubble
                          variant="ghost"
                          align="start"
                          className="w-full max-w-none"
                        >
                          <BubbleContent className="w-full p-0 text-foreground">
                            {parsed.displayContent ? (
                              <AdvisorMarkdown
                                content={parsed.displayContent}
                              />
                            ) : parsed.isTraceRunning ? (
                              <div className="flex animate-pulse items-center gap-2 py-2 text-xs text-muted-foreground">
                                <span>
                                  Thinking through card options &amp; perks...
                                </span>
                              </div>
                            ) : null}
                          </BubbleContent>
                        </Bubble>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                )
              })}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton direction="end" />
        </MessageScroller>
      </MessageScrollerProvider>

      {/* Input area */}
      <div className="border-t bg-background/95 p-3 backdrop-blur-md sm:p-4">
        <div className="mx-auto max-w-4xl space-y-2.5">
          {/* Quick starter chips visible while chatting */}
          {messages.length > 0 && (
            <div className="overflow-x-auto pb-1">
              <PromptSuggestions layout="compact" onSelectPrompt={handleSend} />
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
          >
            <InputGroup className="min-h-12 border-border/80 bg-background shadow-xs focus-within:border-primary">
              <InputGroupTextarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Ask anything about card perks, 5/24 rules, annual fee value, or recommendations..."
                className="py-3 text-sm placeholder:text-muted-foreground"
                rows={1}
                disabled={isLoading}
              />
              <InputGroupAddon
                align="inline-end"
                className="self-end pr-2 pb-2"
              >
                {isLoading ? (
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="outline"
                    onClick={handleStop}
                    className="size-7 rounded-md"
                    title="Stop generating"
                  >
                    <Square className="size-3 fill-destructive text-destructive" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="icon-xs"
                    variant="default"
                    disabled={!input.trim()}
                    className="size-7 rounded-md"
                    title="Send message"
                  >
                    <Send className="size-3" />
                  </Button>
                )}
              </InputGroupAddon>
            </InputGroup>
          </form>

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between px-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3 text-emerald-500" />
              <span>
                Zero-PAN Security: No real card numbers or sensitive account details are ever requested or stored.
              </span>
            </span>
            <span className="hidden sm:inline">
              Press{" "}
              <kbd className="rounded border bg-muted px-1 font-mono text-[10px]">
                Enter
              </kbd>{" "}
              to send,{" "}
              <kbd className="rounded border bg-muted px-1 font-mono text-[10px]">
                Shift+Enter
              </kbd>{" "}
              for newline
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
