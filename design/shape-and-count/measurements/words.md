# The words Sub 5 would propose, and the kept-sample rows each would move (at 581a6de3)

Read through the founding's own cleanup (`displayForm` then `foundingWords`, src/world/founding/normalize.ts) over the 200 kept rows in test/world/founding-sample.json. A row is counted when it holds the phrase as consecutive words; a phrase that sets nothing alone ("round", "small", the bare forms) moves a row only through a rule that uses it, as its own line says. Every phrase is a proposal; the sitting names the words.

| phrase | would set | rule | rows holding it | the rows |
|---|---|---|---|---|
| in the shape of texas | outline: Texas | D5, a shape phrase | 0 | none |
| shaped like texas | outline: Texas | D5, a shape phrase | 0 | none |
| the shape of texas | outline: Texas | D5, a shape phrase | 0 | none |
| in the shape of japan | outline: Japan | D5; bare "japan" keeps only its naming tradition | 0 | none |
| shaped like japan | outline: Japan | D5 | 0 | none |
| crescent shaped | outline: the crescent | D5 (a hyphen reads as a space, so "crescent-shaped" matches) | 0 | none |
| shaped like a crescent | outline: the crescent | D5 | 0 | none |
| in the shape of a crescent | outline: the crescent | D5 | 0 | none |
| crescent | nothing alone (only a shape phrase sets an outline, D5) | listed here to count what a bare form word would move if the sitting lets one | 2 | "Amid the warm southern seas there lieth a crescent of green islands, home to a gentle and seafaring folk."; "Picture a crescent of land around a bright lagoon, the climate always spring, the people small and fond of kites." |
| shaped | nothing alone | the breakdown's note: "shaped a bit like a horseshoe" fires only if "shaped" alone is listed | 1 | "Can you make a world shaped a bit like a horseshoe with a warm bay inside?" |
| equal sized | sizes: alike | D6, a listed size word | 0 | none |
| even sized | sizes: alike | D6 | 0 | none |
| varied | sizes: of every size | D6 | 0 | none |
| of every size | sizes: of every size | D6 | 0 | none |
| round | nothing (the lobes are round already); may stand between a number and an island word | D6, a listed shape word | 0 | none |
| small | nothing; may stand between a number and an island word | D6 (the breakdown counted "a thousand small isles") | 7 | "Gentle shores, rolling green hills, a temperate land of many small kingdoms"; "Lots of small warring city states along a rocky coast, like ancient Greece but colder."; "The Aegean: a thousand small isles, olive groves, a warm wine-dark sea, and gods with Greek names."; "Picture a crescent of land around a bright lagoon, the climate always spring, the people small and fond of kites."; "Sundry small Islands, uninhabited save by Seals and Sea-Fowl."; "Black cliffs, a cold sea, and small harbor towns that obey a king nobody has ever seen."; "A small island where the water is so clear you can see fish from the boat and everyone eats dinner at ten." |
| few | islands: about 5 | D6, a band word | 5 | "Mostly ocean please, with a few warm atolls where navigators sing the names of stars."; "Mostly land, a few inland seas, and a dry heat that never breaks."; "Mostly ocean, just a few cold rocks where the clans of the north cling on."; "What if the sea swallowed almost everything and only a few jagged rocks stuck out?"; "Lo, the sea is wide and the islands few." |
| scattered | islands: about 20 | D6, a band word | 2 | "Scattered isles in a warm turquoise sea, with Polynesian names."; "When the moon fell into the ocean it broke the one continent into many, and the peoples scattered." |
| countless | islands: the ceiling (about 150, pending Sub 3) | D6, a band word | 0 | none |

**D6's number rule** (a number directly before an island word, listed size and shape words allowed between; number words through "thousand" and plain digits): 1 kept row would move: "The Aegean: a thousand small isles, olive groves, a warm wine-dark sea, and gods with Greek names." (thousand small isles).

## The epic's two sentences

- **"tropical island in the shape of Texas"**. Today: residual "in shape texas", chart number 2010822250, overrides {"mapType":"island","band":"tropical","culture":"oromi"}. Under the ruled rules: residual "", chart number 2166136261 (`hashString` of the residual, as `foundWorld` derives it), the same overrides, and outline: Texas (D5's phrase "in the shape of texas").
- **"exactly 100 equal sized round islands"**. Today: residual "exactly 100 equal sized round", chart number 116723379, overrides {"mapType":"archipelago"}. Under the ruled rules: residual "exactly", chart number 1524000883 (`hashString` of the residual, as `foundWorld` derives it), the same overrides, and islands: about 100, sizes alike (D6's number rule; "islands" still sets the archipelago).

The tropical band's naming tradition is `oromi` (`CLIMATE_TRADITION` in src/world/founding/lexicon.ts), which is why both of today's and the rule's Texas worlds take it.

Command: `node out/844/measure/words.ts` from the design-844 worktree at 581a6de3.
