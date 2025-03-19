// Environment configuration interface
export interface EnvironmentConfig {
  baseUrl: string;
  sleepDuration: string;
  [key: string]: any;
}

// User data interfaces
export interface User {
  id: number;
  username: string;
  password: string;
  role: string;
}

export interface UserProfile {
  name: string;
  email: string;
  preferences: {
    notifications: boolean;
    newsletter: boolean;
    theme: string;
  };
  address: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// API response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    total?: number;
    limit?: number;
  };
}

export interface OrderResponse {
  orderId: string;
  status: string;
  total: number;
  createdAt: string;
}

export interface SearchResponse<T> {
  results: T[];
  total: number;
  page: number;
  limit: number;
}

// Product interfaces
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  inStock: boolean;
}

// Test data interfaces
export interface TestData {
  users: {
    regularUsers: User[];
    adminUsers: User[];
    testUsers: User[];
    generatedUsers: {
      prefix: string;
      domain: string;
      password: string;
      count: number;
    };
  };
  payloads: {
    orderTemplates: OrderTemplate[];
    userProfiles: UserProfile[];
    searchQueries: string[];
    reviewTemplates: ReviewTemplate[];
  };
}

export interface OrderTemplate {
  template: string;
  payload: {
    items: Array<{
      productId: string;
      quantity: string | number;
      price: string | number;
      isDigital?: boolean;
    }>;
    shippingAddress?: Address;
    paymentMethod: {
      type: string;
      [key: string]: any;
    };
  };
}

export interface ReviewTemplate {
  rating: string | number;
  title: string;
  comment: string;
  productId: string;
  userId: string;
  verified: boolean;
}

// K6 metric types
export interface CustomMetric {
  name: string;
  type: 'counter' | 'gauge' | 'rate' | 'trend';
  description?: string;
}
