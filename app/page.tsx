"use client"

import { Button } from "@/components/ui/button"
import QuickNote from "@/components/ui/quick-note"

export default function Page() {
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex w-full flex-col gap-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium">Ideas — Quick Notes</h1>
            <p className="text-sm text-muted-foreground">Jot ideas quickly. No folders, no friction.</p>
          </div>
          <div className="hidden sm:block">
            <Button>New</Button>
          </div>
        </header>

        <main>
          <QuickNote />
        </main>

        <footer className="text-xs text-muted-foreground">
          (Press <kbd>n</kbd> to focus the note box; ⌘/Ctrl+Enter to save)
        </footer>
      </div>
    </div>
  )
}
