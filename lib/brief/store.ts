"use client"
import type { ExportItem } from "@/types/citation"

const KEY = "brief_items_v1"

function load(): ExportItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]")
  } catch {
    return []
  }
}
function save(items: ExportItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items))
}

export function listBrief(): ExportItem[] {
  return load()
}

export function addToBrief(items: ExportItem[]) {
  const now = load()
  const map = new Map(now.map((i) => [i.id, i]))
  for (const it of items) map.set(it.id, { ...map.get(it.id), ...it })
  save(Array.from(map.values()))
}

export function removeFromBrief(id: string) {
  save(load().filter((i) => i.id !== id))
}

export function clearBrief() {
  save([])
}
