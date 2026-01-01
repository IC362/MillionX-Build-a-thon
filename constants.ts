
import { SaleRecord, InteractionRecord, Alert, Product } from './types';

export const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Smartwatch Pro', category: 'Electronics', price: 199, stock: 45 },
  { id: 'p2', name: 'Coffee Maker Elite', category: 'Home', price: 89, stock: 5 },
  { id: 'p3', name: 'Eco-Cotton T-Shirt', category: 'Apparel', price: 25, stock: 120 },
  { id: 'p4', name: 'Bluetooth Earbuds', category: 'Electronics', price: 59, stock: 12 },
  { id: 'p5', name: 'Ceramic Vase Set', category: 'Home', price: 45, stock: 30 },
];

export const MOCK_SALES: SaleRecord[] = Array.from({ length: 100 }).map((_, i) => {
  const product = MOCK_PRODUCTS[Math.floor(Math.random() * MOCK_PRODUCTS.length)];
  return {
    id: `sale-${i}`,
    date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amount: product.price,
    category: product.category,
    customerId: `cust-${Math.floor(Math.random() * 100)}`,
    productId: product.id,
  };
});

// Simulate an anomaly (huge spike) 3 days ago for a specific product
const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
for (let i = 0; i < 10; i++) {
  MOCK_SALES.push({
    id: `anomaly-${i}`,
    date: threeDaysAgo,
    amount: 199,
    category: 'Electronics',
    customerId: 'cust-vip',
    productId: 'p1'
  });
}

export const MOCK_INTERACTIONS: InteractionRecord[] = Array.from({ length: 50 }).map((_, i) => ({
  id: `int-${i}`,
  timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  type: (['chat', 'email', 'search'] as const)[Math.floor(Math.random() * 3)],
  sentiment: (['positive', 'neutral', 'negative'] as const)[Math.floor(Math.random() * 3)],
  query: 'Product availability check',
}));

export const INITIAL_ALERTS: Alert[] = [
  {
    id: '1',
    severity: 'high',
    title: 'Revenue Spike Detected',
    description: 'A 400% increase in daily revenue was detected in the Electronics category.',
    timestamp: new Date().toISOString(),
    isRead: false
  },
  {
    id: '2',
    severity: 'medium',
    title: 'Low Customer Sentiment',
    description: 'Average sentiment for "Shipping" related queries has dropped to negative.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isRead: false
  }
];
