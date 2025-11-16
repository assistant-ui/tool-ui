const sleep = (latencyMs: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, latencyMs);
  });

export function mockTool<TResult>(
  result: TResult,
  latencyMs: number = 0,
): (args: unknown) => Promise<TResult> {
  return async () => {
    if (latencyMs > 0) {
      await sleep(latencyMs);
    }
    return result;
  };
}
