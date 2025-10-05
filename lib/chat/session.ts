"use client"

import type { ChatSession, ChatMessage } from "@/types/chat"

const KEY = "aria_chat_sessions_v1"

function loadAll(): Record<string, ChatSession> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}")
  } catch {
    return {}
  }
}

function saveAll(map: Record<string, ChatSession>) {
  localStorage.setItem(KEY, JSON.stringify(map))
}

export function getOrCreateSession(id?: string): ChatSession {
  const map = loadAll()
  const now = new Date().toISOString()
  if (id && map[id]) return map[id]
  const newId = id || crypto.randomUUID()
  const session: ChatSession = {
    id: newId,
    title: "New conversation",
    messages: [],
    createdAt: now,
    updatedAt: now,
  }
  map[newId] = session
  saveAll(map)
  return session
}

export function appendMessage(sessionId: string, msg: ChatMessage) {
  const map = loadAll()
  const s = map[sessionId]
  if (!s) return
  s.messages.push(msg)
  s.updatedAt = new Date().toISOString()
  saveAll(map)
}

export function replaceAssistantMessage(sessionId: string, msgId: string, next: Partial<ChatMessage>) {
  const map = loadAll()
  const s = map[sessionId]
  if (!s) return
  const idx = s.messages.findIndex((m) => m.id === msgId)
  if (idx < 0) return
  s.messages[idx] = { ...s.messages[idx], ...next }
  s.updatedAt = new Date().toISOString()
  saveAll(map)
}

export function setSessionContext(sessionId: string, ctx: NonNullable<ChatSession["context"]>) {
  const map = loadAll()
  const s = map[sessionId]
  if (!s) return
  s.context = { ...s.context, ...ctx }
  s.updatedAt = new Date().toISOString()
  saveAll(map)
}

export function listSessions(): ChatSession[] {
  return Object.values(loadAll()).sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1))
}
