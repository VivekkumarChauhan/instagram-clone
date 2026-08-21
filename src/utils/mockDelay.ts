export function mockDelay(minMs = 300, maxMs = 800): Promise<void> {
  const delay = Math.random() * (maxMs - minMs) + minMs;
  return new Promise(resolve => setTimeout(resolve, delay));
}

export function mockNetworkDelay(): Promise<void> {
  return mockDelay(200, 600);
}

export function mockSlowDelay(): Promise<void> {
  return mockDelay(1000, 2000);
}

export function mockFailWithProbability(probability: number): boolean {
  return Math.random() < probability;
}
