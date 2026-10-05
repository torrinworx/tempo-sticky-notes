import type { Ref } from 'react'
import { TrashIcon } from '../ui/icons'
import styles from './TrashZone.module.css'

/** `ready` while a note is being moved, `over` while the pointer is on the zone. */
export type TrashState = 'idle' | 'ready' | 'over'

interface TrashZoneProps {
  readonly ref: Ref<HTMLDivElement>
  readonly state: TrashState
}

export function TrashZone({ ref, state }: TrashZoneProps) {
  return (
    <div ref={ref} className={styles.trash} data-state={state}>
      <TrashIcon />
      <span>{state === 'over' ? 'Drop to delete' : 'Drag a note here to delete it'}</span>
    </div>
  )
}
