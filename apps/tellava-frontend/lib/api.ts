const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://tellava.onrender.com';

export function getApiBaseUrl() {
  return API_URL.replace(/\/$/, '');
}

export async function getHealth() {
  const response = await fetch(`${getApiBaseUrl()}/api/health`);
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }
  return response.json();
}
