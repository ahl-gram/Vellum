import { El } from "./element-shim.ts";

export const press = (offsetTop: number): El =>
  Object.assign(new El("button"), { offsetTop, rect: { left: 0, top: 0, right: 80, bottom: 32 } });
