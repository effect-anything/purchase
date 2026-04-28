import { requireSession } from "@/lib/auth-session"

import { WorkspaceClient } from "./workspace-client.tsx"

const notes = [
  {
    id: "n1",
    title: "Weekly product memo",
    label: "Product",
    updated: "Today",
    body: "Summarize launch risks, onboarding feedback, and the next activation experiments."
  },
  {
    id: "n2",
    title: "Customer call notes",
    label: "Research",
    updated: "Yesterday",
    body: "Teams want quicker upgrade paths, clearer role boundaries, and fewer context switches."
  },
  {
    id: "n3",
    title: "Release checklist",
    label: "Ops",
    updated: "Mon",
    body: "Verify auth redirects, smoke test the release flow, review docs, and prepare the demo workspace."
  }
] as const

export default async function WorkspacePage() {
  const session = await requireSession()

  return (
    <main className="app-page workspace-app-page">
      <section className="workspace-app-header">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>{session.user.workspaceSlug}</h1>
          <p className="lede">Write, organize, and act on team notes from one focused workspace.</p>
        </div>
        <WorkspaceClient />
      </section>

      <section className="workspace-layout">
        <aside className="workspace-sidebar">
          <p className="section-label">Views</p>
          <nav className="workspace-view-list" aria-label="Workspace views">
            <span className="workspace-view-active">All notes</span>
            <span>Product</span>
            <span>Research</span>
            <span>Operations</span>
          </nav>
        </aside>

        <section className="workspace-main-panel">
          <div className="workspace-panel-header">
            <div>
              <p className="section-label">Notes</p>
              <h2>Recent work</h2>
            </div>
            <span>{notes.length} notes</span>
          </div>
          <div className="workspace-grid">
            {notes.map((note) => (
              <article key={note.id} className="note-card">
                <div className="offer-header">
                  <span className="offer-type">{note.label}</span>
                  <span className="offer-badge">{note.updated}</span>
                </div>
                <h3>{note.title}</h3>
                <p className="offer-copy">{note.body}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}
