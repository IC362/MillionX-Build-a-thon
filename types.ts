
export type Language = 'en' | 'bn';
export type TimeGranularity = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  isNew?: boolean;
  demandLevel: 'Low' | 'Medium' | 'High';
  purchaseFrequency?: number;
}

export interface Transaction {
  id: string;
  productId: string;
  date: string; // ISO string
  quantity: number;
  price: number;
}

export interface Notification {
  id: string;
  type: 'low_stock' | 'insight' | 'trend';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
  productId?: string;
}

export interface ChatAction {
  label: string;
  type: 'order' | 'view_supplier' | 'navigate';
  payload: {
    productId?: string;
    productName?: string;
    quantity?: number;
    url?: string;
    tab?: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  actions?: ChatAction[];
  dataCard?: Product;
  isGreeting?: boolean;
}

export interface TranslationSchema {
  dashboard: string;
  aiInsights: string;
  productInventory: string;
  manageProducts: string;
  alertCenter: string;
  businessOverview: string;
  salesTrend: string;
  productInsights: string;
  lowStock: string;
  highDemand: string;
  getAiInsights: string;
  addProductName: string;
  addCategory: string;
  addPrice: string;
  addStock: string;
  addNewProduct: string;
  inventoryStatus: string;
  actions: string;
  remove: string;
  uploadInvoice: string;
  processingInvoice: string;
  chatbotPlaceholder: string;
  stockLevel: string;
  weeklySales: string;
  stockTurnover: string;
  lowStockRisk: string;
  selectProductToView: string;
  stockLevelHelp: string;
  weeklySalesHelp: string;
  stockTurnoverHelp: string;
  lowStockRiskHelp: string;
  notifications: string;
  markAsRead: string;
  noNotifications: string;
  totalStockValue: string;
  totalProducts: string;
  atRiskItems: string;
  recentSales: string;
  takeAction: string;
  importCsv: string;
  exportReport: string;
  exportJson: string;
  sampleData: string;
  close: string;
  analysisResults: string;
  pricingControl: string;
  currentPrice: string;
  demand: string;
  aiRecommendation: string;
  applyRecommendation: string;
  saveChanges: string;
  increasePriceDesc: string;
  decreasePriceDesc: string;
  maintainPriceDesc: string;
  priceUpdated: string;
  daily: string;
  weekly: string;
  monthly: string;
  yearly: string;
  revenueTrend: string;
  aiGranularityNote: string;
  csvImportSuccess: string;
  csvInvalidHeader: string;
  csvParseError: string;
  importedProduct: string;
}

export interface AIInsight {
  title: string;
  description: string;
  actionLabel: string;
  actionUrl: string;
  type: 'pricing' | 'inventory' | 'trend';
}
