import { sleep } from 'k6';
import exec from 'k6/execution';

// Generate random data for test payloads
export function generateRandomEmail(): string {
  return `user_${Math.floor(Math.random() * 10000000)}@example.com`;
}

export function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Random sleep between min and max seconds to simulate real user behavior
export function randomSleep(min: number, max: number) {
  const sleepTime = (Math.random() * (max - min)) + min;
  sleep(sleepTime);
}

// Log performance stats at intervals during the test
export function logStats(interval = 10) {
  if (exec.scenario.iterationInTest % interval === 0) {
    console.log(`VU: ${exec.vu.idInInstance}, Iteration: ${exec.scenario.iterationInTest}`);
  }
}
