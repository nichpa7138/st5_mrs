export function getGasWebAppUrl(): string {
  return (process.env.GAS_WEBAPP_URL ?? '').trim();
}

export function isGasEnabled(): boolean {
  return getGasWebAppUrl().startsWith('https://script.google.com/');
}

export async function callGasGet<T>(params: Record<string, string>): Promise<T> {
  const baseUrl = getGasWebAppUrl();
  const url = new URL(baseUrl);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    method: 'GET',
    redirect: 'follow',
  });
  if (!res.ok) {
    throw new Error(`GAS GET failed with status ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function callGasPost<T>(payload: Record<string, unknown>): Promise<T> {
  const baseUrl = getGasWebAppUrl();
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
    redirect: 'follow',
  });
  if (!res.ok) {
    throw new Error(`GAS POST failed with status ${res.status}`);
  }
  return (await res.json()) as T;
}
