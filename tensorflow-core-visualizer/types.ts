export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  text: string;
  id: string;
  timestamp: number;
}

export enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  PROCESSING = 'PROCESSING'
}

export interface TensorState {
  dimension: number;
  complexity: number;
  flowRate: number;
  active: boolean;
}