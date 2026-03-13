export const routes = {
  manufacturing: {
    base: '/api/manufacturing',
    service: 'http://manufacturing-service:3002',
    routes: {
      production: '/production',
      machines: '/machines',
      maintenance: '/maintenance',
      analytics: '/analytics'
    }
  },
  finance: {
    base: '/api/finance',
    service: 'http://finance-service:3003',
    routes: {
      transactions: '/transactions',
      reports: '/reports',
      analytics: '/analytics'
    }
  },
  inventory: {
    base: '/api/inventory',
    service: 'http://inventory-service:3004',
    routes: {
      items: '/items',
      stock: '/stock',
      orders: '/orders'
    }
  },
  supplyChain: {
    base: '/api/supply-chain',
    service: 'http://supply-chain-service:3005',
    routes: {
      suppliers: '/suppliers',
      orders: '/orders',
      tracking: '/tracking',
      blockchain: '/blockchain'
    }
  },
  iot: {
    base: '/api/iot',
    service: 'http://iot-service:3006',
    routes: {
      devices: '/devices',
      data: '/data',
      analytics: '/analytics'
    }
  }
};
