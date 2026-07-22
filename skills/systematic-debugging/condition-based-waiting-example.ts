export interface Event {
  type: string;
  data?: unknown;
}

export class EventStore<TEvent extends Event> {
  private readonly streams = new Map<string, TEvent[]>();

  append(streamId: string, event: TEvent): void {
    const events = this.streams.get(streamId) ?? [];
    events.push(event);
    this.streams.set(streamId, events);
  }

  read(streamId: string): readonly TEvent[] {
    return [...(this.streams.get(streamId) ?? [])];
  }
}

async function waitFor<T>(
  condition: () => T | undefined,
  description: string,
  timeoutMs: number,
): Promise<T> {
  const startedAt = Date.now();
  while (true) {
    const result = condition();
    if (result !== undefined) return result;
    if (Date.now() - startedAt >= timeoutMs) {
      throw new Error(`Timeout waiting for ${description} after ${timeoutMs}ms`);
    }
    await new Promise<void>((resolveDelay) => setTimeout(resolveDelay, 10));
  }
}

export function waitForEvent<TEvent extends Event>(
  store: EventStore<TEvent>,
  streamId: string,
  eventType: TEvent['type'],
  timeoutMs = 5000,
): Promise<TEvent> {
  return waitFor(
    () => store.read(streamId).find((event) => event.type === eventType),
    `${eventType} event in stream ${streamId}`,
    timeoutMs,
  );
}

export function waitForEventCount<TEvent extends Event>(
  store: EventStore<TEvent>,
  streamId: string,
  eventType: TEvent['type'],
  count: number,
  timeoutMs = 5000,
): Promise<readonly TEvent[]> {
  return waitFor(
    () => {
      const matching = store.read(streamId).filter((event) => event.type === eventType);
      return matching.length >= count ? matching : undefined;
    },
    `${count} ${eventType} events in stream ${streamId}`,
    timeoutMs,
  );
}

export function waitForEventMatch<TEvent extends Event>(
  store: EventStore<TEvent>,
  streamId: string,
  predicate: (event: TEvent) => boolean,
  description: string,
  timeoutMs = 5000,
): Promise<TEvent> {
  return waitFor(
    () => store.read(streamId).find(predicate),
    description,
    timeoutMs,
  );
}

export async function waitForCompletedJob(store: EventStore<Event>, jobId: string): Promise<Event> {
  return waitForEventMatch(
    store,
    jobId,
    (event) => event.type === 'completed',
    `completed event for job ${jobId}`,
  );
}
