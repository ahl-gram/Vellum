# A press on the chart, and the page's own click handler

Each row lays the chart at the head of the sheet (answer A of question 1) at the returner's seals, clicks one link with a real bubbling click event, waits 900 ms, and reads where the page went. The last row is today's index slip link, the control.The same four shots were taken four times (`measure/links-shots.json`, results in `measure/links-results*.json`).

| run | click | went to | room open after | scrolled to | errors the page logged |
|---|---|---|---|---|---|
| first | svg-room-link-prospect | #prospect | prospect | 759 | EXCEPTION: TypeError: Cannot read properties of undefined (reading 'slice') |
| first | svg-lesson-link-print-room | #print-room-atlas | print-room | 2111 | EXCEPTION: TypeError: Cannot read properties of undefined (reading 'slice') |
| first | html-index-link-prospect | #prospect | prospect | 284 | none |
| -run1 | svg-room-link-prospect | #prospect | prospect | 759 | EXCEPTION: TypeError: Cannot read properties of undefined (reading 'slice') |
| -run1 | svg-lesson-link-print-room | #print-room-atlas | print-room | 2111 | EXCEPTION: TypeError: Cannot read properties of undefined (reading 'slice') |
| -run1 | html-index-link-prospect | #prospect | prospect | 284 | none |
| -run2 | svg-room-link-prospect | #prospect | prospect | 759 | EXCEPTION: TypeError: Cannot read properties of undefined (reading 'slice') |
| -run2 | svg-lesson-link-print-room | #print-room-atlas | print-room | 2111 | EXCEPTION: TypeError: Cannot read properties of undefined (reading 'slice') |
| -run2 | html-index-link-prospect | #prospect | prospect | 284 | none |
| -run3 | svg-room-link-prospect | #prospect | prospect | 759 | EXCEPTION: TypeError: Cannot read properties of undefined (reading 'slice') |
| -run3 | svg-lesson-link-print-room | #print-room-atlas | print-room | 0 | EXCEPTION: TypeError: Cannot read properties of undefined (reading 'slice') |
| -run3 | html-index-link-prospect | #prospect | prospect | 284 | none |

What it shows: the page's click handler (`bindPrimer` in `src/site/primer/bind.ts`) reads `link.hash`, which an SVG link does not have, so every press on the chart throws before the handler opens the room. The room still opens, on the hash change. A room's own head is never folded away, so a press on a room lands on it every time; a press on a lesson in a folded room depends on whether the browser looks for the lesson before or after the room is unfolded, and in these runs it sometimes stayed at the top of the page. Sub 11 owes the handler a read of the link's `href` attribute, which serves both kinds of link, or HTML links laid over the drawing.

Written by `node out/1256/mock/tables.ts`.
