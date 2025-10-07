"use client"

import type React from "react"

import * as RadixTabs from "@radix-ui/react-tabs"

interface Props {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}

export function Tabs({ value, onValueChange, children }: Props) {
  return (
    <RadixTabs.Root value={value} onValueChange={onValueChange} data-testid="aria-tabs">
      {children}
    </RadixTabs.Root>
  )
}

export function TabsList({ children }: { children: React.ReactNode }) {
  return (
    <RadixTabs.List className="flex gap-2 bg-white border-2 border-gray-200 rounded-t-xl p-1 w-full max-w-[680px]">
      {children}
    </RadixTabs.List>
  )
}

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
}

export function TabsTrigger({ value, children }: TabsTriggerProps) {
  return (
    <RadixTabs.Trigger
      value={value}
      className="px-6 py-3 text-[18px] font-semibold transition-all rounded-t-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:h-14 data-[state=inactive]:bg-gray-200 data-[state=inactive]:text-gray-800 data-[state=inactive]:h-12 hover:data-[state=inactive]:shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {children}
    </RadixTabs.Trigger>
  )
}

export function TabsContent({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <RadixTabs.Content value={value} className="focus:outline-none">
      {children}
    </RadixTabs.Content>
  )
}
