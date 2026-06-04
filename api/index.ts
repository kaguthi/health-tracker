import { deleteToken } from "@/api/client";
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
if (!apiUrl) throw new Error("EXPO_PUBLIC_API_URL is not set");

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  ms = 10_000,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timeout),
  );
}

async function authorizedFetch(
  token: string,
  url: string,
  options: RequestInit = {},
) {
  if (!token) {
    await deleteToken();
    throw new Error("No token provided");
  }

  const response = await fetchWithTimeout(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (response.status === 401) {
    await deleteToken();
    throw new Error("SESSION_EXPIRED");
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message ?? `Request failed: ${response.status}`);
  }

  return response;
}

export async function login(email: string, password: string) {
  const response = await fetchWithTimeout(`${apiUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message ?? `Request failed: ${response.status}`);
  }
  return response.json();
}

export async function addUser(name: string, email: string, password: string) {
  const response = await fetchWithTimeout(`${apiUrl}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message ?? `Request failed: ${response.status}`);
  }
  const data = await response.json();
  return data.message;
}

export async function initiateDonation(amount: number, phone: string) {
  const response = await fetchWithTimeout(`${apiUrl}/donate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, phone }),
  });
  return response.json();
}