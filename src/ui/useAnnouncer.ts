import { useCallback, useState } from 'react'

export interface Announcement {
  readonly text: string
  readonly id: number
}

/** Holds the latest message for a screen reader live region (see LiveRegion). */
export function useAnnouncer() {
  const [message, setMessage] = useState<Announcement | null>(null)
  const announce = useCallback((text: string) => {
    setMessage((previous) => ({ text, id: (previous?.id ?? 0) + 1 }))
  }, [])
  return { message, announce }
}
