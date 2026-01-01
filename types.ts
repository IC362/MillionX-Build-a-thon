
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

export interface SaleRecord {
  id: string;
  date: string;
  amount: number;
  category: string;
  customerId: string;
  productId: string; // Linked to Product.id
}

export interface InteractionRecord {
  id: string;
  timestamp: string;
  type: 'chat' | 'email' | 'search';
  sentiment: 'positive' | 'neutral' | 'negative';
  query: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  conversionRate: number;
}

export interface AIAnalysisResult {
  summary: string;
  anomalies: string[];
  recommendations: string[];
  forecast: {
    date: string;
    predictedValue: number;
  }[];
}

export interface Alert {
  id: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
}
