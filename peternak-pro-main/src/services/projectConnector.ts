// Project Connector Service
// Enables real-time data sharing between browser tabs/windows without backend

// Import Redis connector for persistence
import { initRedisConnector } from './redisProjectConnector';

const DEBUG_MODE = true;
const STORAGE_KEY_PREFIX = 'project_connector_';
const EVENT_PREFIX = 'project_connector_';

// Event names
export const CONNECTOR_EVENTS = {
  DATA_SENT: `${EVENT_PREFIX}data_sent`,
  DATA_RECEIVED: `${EVENT_PREFIX}data_received`,
  CONNECTED: `${EVENT_PREFIX}connected`,
  DISCONNECTED: `${EVENT_PREFIX}disconnected`,
  ERROR: `${EVENT_PREFIX}error`
};

// Data types that can be shared
export type SharedDataType = 
  | "stock_item"
  | "production_data" 
  | "kandang_data"
  | "notification";

// Structure of shared data
export interface SharedData {
  id: string;
  type: SharedDataType;
  data: any;
  timestamp: number;
  sourceProjectId: string;
  targetProjectId: string;
  processed: boolean;
}

// Connector configuration
export interface ConnectorConfig {
  projectId: string;
  targetProjectId: string;
  autoSync?: boolean;
  debug?: boolean;
}

// Statistics for monitoring
export interface ConnectorStats {
  pendingCount: number;
  sentCount: number;
  receivedCount: number;
  processedCount: number;
  connectedProjects: number;
}

class ProjectConnector {
  private config: ConnectorConfig;
  private isInitialized: boolean = false;
  private stats: ConnectorStats = {
    pendingCount: 0,
    sentCount: 0,
    receivedCount: 0,
    processedCount: 0,
    connectedProjects: 0
  };

  constructor(config: ConnectorConfig) {
    this.config = { autoSync: true, debug: DEBUG_MODE, ...config };
    this.initialize();
  }

  private initialize() {
    if (this.isInitialized) return;
    
    // Initialize Redis connector for persistence
    initRedisConnector(this.config.projectId, this.config.targetProjectId);
    
    // Listen for incoming data
    window.addEventListener(CONNECTOR_EVENTS.DATA_SENT, this.handleIncomingData.bind(this));
    
    // Listen for storage changes (cross-tab communication)
    window.addEventListener('storage', this.handleStorageChange.bind(this));
    
    // Send connection event
    this.dispatchEvent(CONNECTOR_EVENTS.CONNECTED, {
      projectId: this.config.projectId,
      timestamp: Date.now()
    });
    
    if (this.config.autoSync) {
      this.syncPendingData();
    }
    
    this.isInitialized = true;
    this.log('Connector initialized', this.config);
  }

  // Send data to target project
  sendData(type: SharedDataType, data: any): boolean {
    try {
      const sharedData: SharedData = {
        id: `${this.config.projectId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        data,
        timestamp: Date.now(),
        sourceProjectId: this.config.projectId,
        targetProjectId: this.config.targetProjectId,
        processed: false
      };

      // Store in localStorage for persistence
      const storageKey = `${STORAGE_KEY_PREFIX}${sharedData.id}`;
      localStorage.setItem(storageKey, JSON.stringify(sharedData));
      
      // Dispatch event for immediate notification
      this.dispatchEvent(CONNECTOR_EVENTS.DATA_SENT, sharedData);
      
      // Update stats
      this.stats.pendingCount++;
      this.updateStats();
      
      this.log('Data sent', sharedData);
      return true;
    } catch (error) {
      this.log('Error sending data', error);
      this.dispatchEvent(CONNECTOR_EVENTS.ERROR, { error, type, data });
      return false;
    }
  }

  // Handle incoming data
  private handleIncomingData(event: CustomEvent) {
    const sharedData: SharedData = event.detail;
    
    // Only process data intended for this project
    if (sharedData.targetProjectId !== this.config.projectId) {
      return;
    }
    
    try {
      // Store received data
      const storageKey = `${STORAGE_KEY_PREFIX}received_${sharedData.id}`;
      localStorage.setItem(storageKey, JSON.stringify(sharedData));
      
      // Dispatch received event
      this.dispatchEvent(CONNECTOR_EVENTS.DATA_RECEIVED, sharedData);
      
      // Update stats
      this.stats.receivedCount++;
      this.updateStats();
      
      this.log('Data received', sharedData);
    } catch (error) {
      this.log('Error handling incoming data', error);
    }
  }

  // Handle storage changes (cross-tab communication)
  private handleStorageChange(event: StorageEvent) {
    if (!event.key || !event.key.startsWith(STORAGE_KEY_PREFIX)) return;
    
    if (event.key.startsWith(`${STORAGE_KEY_PREFIX}received_`)) {
      // This is data we received
      try {
        const sharedData: SharedData = JSON.parse(event.newValue || '');
        if (sharedData.targetProjectId === this.config.projectId) {
          this.dispatchEvent(CONNECTOR_EVENTS.DATA_RECEIVED, sharedData);
          this.stats.receivedCount++;
          this.updateStats();
        }
      } catch (error) {
        this.log('Error parsing received data', error);
      }
    }
  }

  // Sync pending data that might have been missed
  private syncPendingData() {
    try {
      const keys = Object.keys(localStorage);
      const pendingKeys = keys.filter(key => 
        key.startsWith(STORAGE_KEY_PREFIX) && 
        !key.includes('received_') &&
        !key.includes('processed_')
      );
      
      this.stats.pendingCount = pendingKeys.length;
      this.updateStats();
      
      this.log(`Found ${pendingKeys.length} pending items to sync`);
    } catch (error) {
      this.log('Error syncing pending data', error);
    }
  }

  // Mark data as processed
  markAsProcessed(dataId: string): boolean {
    try {
      const storageKey = `${STORAGE_KEY_PREFIX}${dataId}`;
      const dataStr = localStorage.getItem(storageKey);
      
      if (dataStr) {
        const sharedData: SharedData = JSON.parse(dataStr);
        sharedData.processed = true;
        
        // Move to processed storage
        localStorage.setItem(`${STORAGE_KEY_PREFIX}processed_${dataId}`, JSON.stringify(sharedData));
        localStorage.removeItem(storageKey);
        
        this.stats.processedCount++;
        if (this.stats.pendingCount > 0) {
          this.stats.pendingCount--;
        }
        this.updateStats();
        
        this.log('Data marked as processed', dataId);
        return true;
      }
      return false;
    } catch (error) {
      this.log('Error marking data as processed', error);
      return false;
    }
  }

  // Get all stored data
  getStoredData(): SharedData[] {
    try {
      const keys = Object.keys(localStorage);
      const dataKeys = keys.filter(key => key.startsWith(STORAGE_KEY_PREFIX));
      
      return dataKeys.map(key => {
        try {
          return JSON.parse(localStorage.getItem(key) || '');
        } catch {
          return null;
        }
      }).filter(Boolean);
    } catch (error) {
      this.log('Error getting stored data', error);
      return [];
    }
  }

  // Get data by type
  getDataByType(type: SharedDataType): SharedData[] {
    return this.getStoredData().filter(data => data.type === type);
  }

  // Get pending data
  getPendingData(): SharedData[] {
    return this.getStoredData().filter(data => !data.processed && !data.targetProjectId.includes('received_'));
  }

  // Get received data
  getReceivedData(): SharedData[] {
    return this.getStoredData().filter(data => data.targetProjectId === this.config.projectId);
  }

  // Get connector status
  getStatus(): ConnectorStats {
    return { ...this.stats };
  }

  // Cleanup old processed data
  cleanupProcessedData(maxAgeHours: number = 24): number {
    try {
      const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);
      const keys = Object.keys(localStorage);
      const processedKeys = keys.filter(key => 
        key.startsWith(`${STORAGE_KEY_PREFIX}processed_`)
      );
      
      let cleanedCount = 0;
      processedKeys.forEach(key => {
        try {
          const data: SharedData = JSON.parse(localStorage.getItem(key) || '');
          if (data.timestamp < cutoffTime) {
            localStorage.removeItem(key);
            cleanedCount++;
          }
        } catch {
          localStorage.removeItem(key);
          cleanedCount++;
        }
      });
      
      this.log(`Cleaned up ${cleanedCount} old processed items`);
      return cleanedCount;
    } catch (error) {
      this.log('Error cleaning processed data', error);
      return 0;
    }
  }

  // Dispatch custom event
  private dispatchEvent(eventName: string, detail: any) {
    const event = new CustomEvent(eventName, { detail });
    window.dispatchEvent(event);
  }

  // Update stats and store them
  private updateStats() {
    const statsKey = `${STORAGE_KEY_PREFIX}stats_${this.config.projectId}`;
    localStorage.setItem(statsKey, JSON.stringify(this.stats));
  }

  // Logging utility
  private log(message: string, data?: any) {
    if (this.config.debug) {
      console.log(`[ProjectConnector:${this.config.projectId}] ${message}`, data || '');
    }
  }

  // Cleanup
  destroy() {
    window.removeEventListener(CONNECTOR_EVENTS.DATA_SENT, this.handleIncomingData.bind(this));
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
    this.dispatchEvent(CONNECTOR_EVENTS.DISCONNECTED, { projectId: this.config.projectId });
    this.isInitialized = false;
    this.log('Connector destroyed');
  }
}

// Singleton instance management
const connectors = new Map<string, ProjectConnector>();

export function getProjectConnector(projectId: string, targetProjectId: string = 'farm-hub-app'): ProjectConnector {
  const key = `${projectId}_${targetProjectId}`;
  
  if (!connectors.has(key)) {
    const connector = new ProjectConnector({ projectId, targetProjectId });
    connectors.set(key, connector);
  }
  
  return connectors.get(key)!;
}

export function destroyProjectConnector(projectId: string, targetProjectId: string = 'farm-hub-app') {
  const key = `${projectId}_${targetProjectId}`;
  const connector = connectors.get(key);
  
  if (connector) {
    connector.destroy();
    connectors.delete(key);
  }
}

// Utility functions
export function getAllConnectors(): ProjectConnector[] {
  return Array.from(connectors.values());
}

export function clearAllConnectors() {
  connectors.forEach(connector => connector.destroy());
  connectors.clear();
}