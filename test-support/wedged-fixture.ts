import { test } from "node:test";

test("wedged", () => new Promise<void>(() => {}));
