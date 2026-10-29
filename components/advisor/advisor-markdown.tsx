"use client"

import * as React from "react"
import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockTitle,
  CodeBlockActions,
  CodeBlockCopyButton,
  CodeBlockContent,
  CodeBlockLine,
} from "@/components/ui/code-block"
import { useHighlightedCode } from "@/hooks/use-highlighted-code"
import { FileCode2, Scale } from "lucide-react"

interface HighlightedCodeProps {
  code: string
  language?: string
  title?: string
}

export function HighlightedCode({
  code,
  language = "markdown",
  title,
}: HighlightedCodeProps) {
  const normalizedLang = language || "markdown"
  const lines = useHighlightedCode(code, normalizedLang)

  const isComparison =
    normalizedLang === "diff" ||
    code.toLowerCase().includes("vs") ||
    (title && title.toLowerCase().includes("comparison"))

  return (
    <CodeBlock className="my-3 overflow-hidden border border-border/70 bg-card/60 shadow-xs">
      <CodeBlockHeader className="border-b border-border/40 bg-muted/40 px-3 py-2">
        <CodeBlockTitle className="flex items-center gap-1.5 font-mono text-xs font-medium text-foreground">
          {isComparison ? (
            <Scale className="size-3.5 text-primary" />
          ) : (
            <FileCode2 className="size-3.5 text-muted-foreground" />
          )}
          <span>{title || `${normalizedLang.toUpperCase()} Comparison`}</span>
        </CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={code} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent className="max-h-96 overflow-x-auto p-3 font-mono text-xs">
        {lines.map((line, idx) => (
          <CodeBlockLine key={idx}>{line}</CodeBlockLine>
        ))}
      </CodeBlockContent>
    </CodeBlock>
  )
}

function renderFormattedText(text: string): React.ReactNode {
  // Simple inline parser for bold, italic, inline code, and links
  const parts: React.ReactNode[] = []
  let cursor = 0

  // Regex matches bold (**bold**), code (`code`), or italic (*italic*)
  const inlineRegex = /(\*\*([^*]+)\*\*)|(`([^`]+)`)|(\*([^*]+)\*)/g
  let match: RegExpExecArray | null

  while ((match = inlineRegex.exec(text)) !== null) {
    if (match.index > cursor) {
      parts.push(text.slice(cursor, match.index))
    }

    if (match[1]) {
      // Bold
      parts.push(
        <strong key={match.index} className="font-semibold text-foreground">
          {match[2]}
        </strong>
      )
    } else if (match[3]) {
      // Inline code
      parts.push(
        <code
          key={match.index}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-primary"
        >
          {match[4]}
        </code>
      )
    } else if (match[5]) {
      // Italic
      parts.push(
        <em key={match.index} className="text-foreground/90 italic">
          {match[6]}
        </em>
      )
    }

    cursor = inlineRegex.lastIndex
  }

  if (cursor < text.length) {
    parts.push(text.slice(cursor))
  }

  return parts.length > 0 ? parts : text
}

export function AdvisorMarkdown({ content }: { content: string }) {
  // Split content by code blocks: ```lang ... ```
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g
  const blocks: Array<
    | { type: "text"; text: string }
    | { type: "code"; code: string; language: string; title?: string }
  > = []

  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({
        type: "text",
        text: content.slice(lastIndex, match.index),
      })
    }

    const language = match[1] || "markdown"
    const code = match[2]
    let title: string | undefined

    if (code.includes("Venture X") || code.includes("Sapphire")) {
      title = "Card Comparison Matrix"
    } else if (code.includes("+") && code.includes("-")) {
      title = "Reward Delta & Fee Variance"
    }

    blocks.push({
      type: "code",
      language,
      code,
      title,
    })

    lastIndex = codeBlockRegex.lastIndex
  }

  if (lastIndex < content.length) {
    blocks.push({
      type: "text",
      text: content.slice(lastIndex),
    })
  }

  return (
    <div className="space-y-3 text-sm leading-relaxed text-foreground/90">
      {blocks.map((block, idx) => {
        if (block.type === "code") {
          return (
            <HighlightedCode
              key={idx}
              code={block.code}
              language={block.language}
              title={block.title}
            />
          )
        }

        // Render text lines and simple markdown tables or lists
        const lines = block.text.split("\n")
        const elements: React.ReactNode[] = []
        let inList = false
        let listItems: React.ReactNode[] = []
        let tableRows: string[] = []

        const flushList = () => {
          if (inList && listItems.length > 0) {
            elements.push(
              <ul
                key={`ul-${elements.length}`}
                className="my-2 ml-4 list-disc space-y-1"
              >
                {listItems}
              </ul>
            )
            listItems = []
            inList = false
          }
        }

        const flushTable = () => {
          if (tableRows.length > 0) {
            const parsedRows = tableRows
              .filter((r) => !r.trim().match(/^\|?[- :|]+\|?$/)) // filter separator row
              .map((r) =>
                r
                  .split("|")
                  .map((c) => c.trim())
                  .filter(
                    (c, i, a) =>
                      (i > 0 && i < a.length - 1) || (a.length === 1 && c)
                  )
              )

            if (parsedRows.length > 0) {
              const headers = parsedRows[0]
              const body = parsedRows.slice(1)
              elements.push(
                <div
                  key={`table-${elements.length}`}
                  className="my-3 overflow-x-auto rounded-lg border border-border/70"
                >
                  <table className="w-full text-xs">
                    <thead className="border-b bg-muted/60 text-muted-foreground">
                      <tr>
                        {headers.map((h, i) => (
                          <th key={i} className="p-2.5 text-left font-semibold">
                            {renderFormattedText(h)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {body.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-muted/30">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-2.5">
                              {renderFormattedText(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
            tableRows = []
          }
        }

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]
          const trimmed = line.trim()

          // Table line
          if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
            flushList()
            tableRows.push(trimmed)
            continue
          } else {
            flushTable()
          }

          // Headers
          if (trimmed.startsWith("### ")) {
            flushList()
            elements.push(
              <h4
                key={i}
                className="mt-4 mb-1.5 font-heading text-sm font-semibold text-foreground"
              >
                {renderFormattedText(trimmed.slice(4))}
              </h4>
            )
            continue
          }
          if (trimmed.startsWith("## ")) {
            flushList()
            elements.push(
              <h3
                key={i}
                className="mt-4 mb-2 font-heading text-base font-bold text-foreground"
              >
                {renderFormattedText(trimmed.slice(3))}
              </h3>
            )
            continue
          }
          if (trimmed.startsWith("# ")) {
            flushList()
            elements.push(
              <h2
                key={i}
                className="mt-5 mb-2 font-heading text-lg font-bold text-foreground"
              >
                {renderFormattedText(trimmed.slice(2))}
              </h2>
            )
            continue
          }

          // Bullet list items
          if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            inList = true
            listItems.push(
              <li key={i} className="leading-relaxed text-foreground/90">
                {renderFormattedText(trimmed.slice(2))}
              </li>
            )
            continue
          }

          // Numbered list items
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/)
          if (numMatch) {
            flushList()
            elements.push(
              <div
                key={i}
                className="my-1.5 flex items-start gap-2 text-foreground/90"
              >
                <span className="shrink-0 font-semibold text-primary">
                  {numMatch[1]}.
                </span>
                <span>{renderFormattedText(numMatch[2])}</span>
              </div>
            )
            continue
          }

          // Empty lines
          if (!trimmed) {
            flushList()
            continue
          }

          // Paragraph
          flushList()
          elements.push(
            <p key={i} className="my-1.5 leading-relaxed text-foreground/90">
              {renderFormattedText(line)}
            </p>
          )
        }

        flushList()
        flushTable()

        return <React.Fragment key={idx}>{elements}</React.Fragment>
      })}
    </div>
  )
}
