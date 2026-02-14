export interface Product {
  name: string;
  price?: string;
  category?: string;
}

export interface BusinessData {
  businessName: string;
  detectedLanguage: string;
  confidence: number;
  category: string;
  products: Product[];
  addressContext: string;
  transliteration?: string;
  summary: string;
}

export interface GeoLocation {
  lat: number;
  lng: number;
  city?: string;
  error?: string;
}

export enum AnalysisStage {
  IDLE = 'IDLE',
  CAPTURING = 'CAPTURING',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface AgentStatus {
  id: string;
  name: string;
  status: 'pending' | 'working' | 'done';
  progress: number;
  message: string;
  icon?: any;
}