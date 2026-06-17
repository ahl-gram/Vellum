import { defaultRecipe } from "../world/generate.ts";
import type { WorldRecipe } from "../world/types.ts";

/**
 * The world recipe a CLI command renders. World identity (terrain, realms,
 * names, rivers) is derived from the simulation grid, so it must not depend on
 * which command is drawing it: `poster`, `chart`, and `atlas` of one seed have
 * to be the same world. The command only chooses render options (output size,
 * PNG), never the grid.
 */
export function recipeForCommand(
  command: string,
  seed: number,
  overrides: Partial<WorldRecipe> = {},
): WorldRecipe {
  void command;
  return defaultRecipe(seed, overrides);
}
