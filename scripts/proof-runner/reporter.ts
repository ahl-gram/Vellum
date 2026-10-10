type TestEvent = { type: string; data: { name?: string; file?: string; nesting?: number } };

export default async function* reporter(source: AsyncIterable<TestEvent>): AsyncGenerator<string> {
  for await (const event of source) {
    if (event.type !== "test:pass" && event.type !== "test:fail") continue;
    const { name = "", file = "", nesting = 0 } = event.data;
    yield `${JSON.stringify({ pass: event.type === "test:pass", name, file, nesting })}\n`;
  }
}
