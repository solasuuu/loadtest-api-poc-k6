export const environments = {
  dev: {
    baseUrl: 'https://dev-api.example.com',
    sleepDuration: '0.5s',
  },
  staging: {
    baseUrl: 'https://staging-api.example.com',
    sleepDuration: '0.3s',
  },
  production: {
    baseUrl: 'https://api.example.com',
    sleepDuration: '0.1s',
  },
};

// Get the environment from the k6 options or default to staging
export function getEnvironmentConfig() {
  const env = __ENV.ENVIRONMENT || 'staging';
  return environments[env];
}

// Export current environment config based on the K6 runtime environment variable
export const currentEnv = getEnvironmentConfig();
