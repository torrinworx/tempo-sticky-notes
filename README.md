# Sticky Notes

A sticky notes board in React and TypeScript, built for Tempo's front-end take-home. Drag on the board to draw a note at any size and position. Move a note by its header, resize it from the corner, and delete it by dropping it on the trash. Notes also hold text and get a random pastel colour.

## Running it

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev    # http://localhost:5173
npm test
```

## Approach and architecture

All notes live in one array, and a reducer is the only code that changes it. Each change returns a new object only for the note it touched, so memoized note components skip re-rendering. The types are strict throughout. Note ids are branded, actions are discriminated unions, and the colour palette is keyed by a union type, so a missing case fails to compile.

Pointer input goes through one hook, `useBoardInteraction`, which runs one gesture at a time. While you drag, the notes stay unchanged. The hook computes a preview with pure geometry functions and saves the change once, when you let go. Clicking a header or corner without dragging picks the note up instead, and it follows the pointer until the next click. That gives every drag a non-drag alternative, which WCAG 2.2 requires.

`NotesBoard` connects the state, the gestures, keyboard focus and screen reader announcements, and `NoteCard` renders one note. Every note has labelled buttons. The arrow keys move or resize a note, Delete removes it, and a live region announces each change.

## Assumptions

The app targets desktop screens at 1024x768 or larger. Notes live in memory, so reloading clears the board. A note comes to the front only while it's being dragged. I tested in the latest Chrome and Firefox. Edge uses Chrome's engine, so I didn't test it separately.

## How I used AI tools

I built this with Claude Code, which Tempo confirmed was fine. I set the scope and the bar: the features, keyboard and WCAG 2.2 AA support, and strict typing. Claude Code wrote the code and tests. I reviewed the UX, how the interface behaves, and the look and feel, and checked that everything works as expected and as I specified.
