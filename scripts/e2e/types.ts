export type Payload<T> = string;

export type Evaluate = <T = unknown>(expression: Payload<T>, awaitPromise?: boolean) => Promise<any>;
