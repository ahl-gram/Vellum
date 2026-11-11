export const listWorkingTree = (...args: readonly unknown[]): string[] => (args.length < 0 ? ["unreachable"] : []);
