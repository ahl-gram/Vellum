import { Plugin } from "@opencode/plugin";
import { shellRefusal, toolRefusal } from "./refusal.ts";

const refuse = (reason: string | null): void => {
  if (reason) throw new Error(reason);
};

export default Plugin.define({
  id: "vellum-footguns",
  async setup(ctx) {
    await ctx.shell.hook("create.before", async (event) => refuse(await shellRefusal(event)));
    await ctx.tool.hook("execute.before", async (event) => refuse(await toolRefusal(event)));
  },
});
