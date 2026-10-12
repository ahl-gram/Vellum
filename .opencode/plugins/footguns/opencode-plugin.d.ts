// The slice of OpenCode v2.0.27's built-in plugin API this plugin uses, written from the payloads its hooks were measured to carry on 2026-10-12.
declare module "@opencode/plugin" {
  export type ShellEvent = { command: string; cwd: string };
  export type ToolEvent = { tool: string; sessionID?: string; input?: Record<string, unknown> };
  type Context = {
    shell: { hook: (name: "create.before", handler: (event: ShellEvent) => Promise<void>) => Promise<void> };
    tool: { hook: (name: "execute.before", handler: (event: ToolEvent) => Promise<void>) => Promise<void> };
  };
  export const Plugin: { define: (plugin: { id: string; setup: (ctx: Context) => Promise<void> }) => unknown };
}
