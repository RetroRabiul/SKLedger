export const PLANS = {
  free: {
    name: 'Free',
    limits: {
      clients: 5,
      projects: 10,
      exports: 0,
      imports: 0,
    },
  },
  pro: {
    name: 'Pro',
    limits: {
      clients: 100,
      projects: 500,
      exports: 10,
      imports: 10,
    },
  },
  business: {
    name: 'Business',
    limits: {
      clients: 1000,
      projects: 5000,
      exports: 100,
      imports: 100,
    },
  },
} as const

export type Plan = keyof typeof PLANS