import type { Announcement } from './useAnnouncer'

export function LiveRegion({ message }: { readonly message: Announcement | null }) {
  return (
    <div role="status" className="visually-hidden">
      {/* A new key replaces the node, so the same text twice in a row is still read out. */}
      {message && <span key={message.id}>{message.text}</span>}
    </div>
  )
}
