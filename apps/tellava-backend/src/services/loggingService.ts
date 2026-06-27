export async function logTriggerEvent(payload: Record<string, unknown>) { return { ok: true, receivedAt: new Date().toISOString(), payload }; }
