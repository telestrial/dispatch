import DOMPurify from 'dompurify'
import { marked } from 'marked'

export function renderMarkdown(text: string): string {
  const rawHTML = marked.parse(text, { async: false }) as string
  return DOMPurify.sanitize(rawHTML)
}
