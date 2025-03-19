# K6 Load Testing Examples

This repository contains a collection of load testing examples using K6 with TypeScript. These examples demonstrate various load testing types and follow best practices for real-world scenarios.

## Prerequisites

- [K6](https://k6.io/docs/getting-started/installation/)
- [Node.js](https://nodejs.org/) (for TypeScript compilation)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the project (converts TypeScript to JavaScript):
```bash
npm run build
```

## Running Tests

You can run individual tests with:

```bash
# Load test
npm run test:load

# Stress test
npm run test:stress

# Soak/Endurance test
npm run test:soak

# Spike test
npm run test:spike

# Scalability test
npm run test:scalability

# Concurrency test
npm run test:concurrency

# Performance test
npm run test:performance
```

Or run all tests in sequence:
```bash
npm run test:all
```

## Test Types Included

- **Load Testing**: Tests system behavior under expected load
- **Stress Testing**: Tests system limits under extreme load
- **Soak Testing**: Tests stability over extended periods
- **Spike Testing**: Tests response to sudden load spikes
- **Scalability Testing**: Tests ability to scale with increased load
- **Concurrency Testing**: Tests handling of simultaneous users
- **Performance Testing**: Tests response times and throughput

## Configuration

- Environment settings are in `config/environments.ts`
- Performance thresholds are in `config/thresholds.ts`
- Test data files are in the `data/` directory

## Customization

To customize these tests for your own API:

1. Update the base URLs in `config/environments.ts`
2. Modify the endpoints in the scenario files to match your API
3. Adjust thresholds in `config/thresholds.ts` to match your performance requirements
4. Update test data in the `data/` directory

## Best Practices Implemented

- Authentication token caching
- Response validation
- Custom metrics
- Realistic user behavior simulation
- Organized test scenarios
- Environment-specific configuration
- Proper error handling
- Clear test reporting
