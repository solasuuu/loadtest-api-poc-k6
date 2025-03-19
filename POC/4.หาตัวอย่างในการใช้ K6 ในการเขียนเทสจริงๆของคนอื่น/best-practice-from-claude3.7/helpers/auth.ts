import http from 'k6/http';
import { check } from 'k6';
import { currentEnv } from '../config/environments';

// Cache for auth tokens to avoid repeated login requests
const tokenCache = new Map();

export function getAuthToken(username: string, password: string): string {
  // Check if we already have a token for this user
  const cacheKey = `${username}:${password}`;
  if (tokenCache.has(cacheKey)) {
    return tokenCache.get(cacheKey);
  }
  
  // Otherwise, perform login and cache the token
  const loginPayload = JSON.stringify({
    username: username,
    password: password,
  });
  
  const loginHeaders = {
    'Content-Type': 'application/json',
  };
  
  const loginRes = http.post(
    `${currentEnv.baseUrl}/auth/login`,
    loginPayload,
    { headers: loginHeaders, tags: { name: 'login' } }
  );
  
  check(loginRes, {
    'login successful': (r) => r.status === 200,
    'has token': (r) => JSON.parse(r.body).token !== undefined,
  });
  
  const token = JSON.parse(loginRes.body).token;
  tokenCache.set(cacheKey, token);
  
  return token;
}

export function getAuthHeaders(username: string, password: string) {
  const token = getAuthToken(username, password);
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}
