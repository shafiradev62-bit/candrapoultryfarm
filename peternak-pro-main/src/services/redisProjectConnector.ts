import { getProjectConnector, CONNECTOR_EVENTS, SharedData } from '@/services/projectConnector';

// Redis configuration from your credentials
const REDIS_CONFIG = {
  url: "https://trusting-redfish-7489.upstash.io",
  readOnlyToken: "Ah1BAAIgcDFfnDJT5HlYbpLIG4GBhgDTJszbFedQ4g1vgBunraQBhQ",
  writeToken: "AR1BAAImcDEzMTA0OGViYjNkOTk0MjVmYjFiODAwN2RkZGJiNTg2ZXAxNzQ4OQ"
};

class RedisProjectConnector {
  private readonly config: typeof REDIS_CONFIG;
  private readonly projectId: string;
  private readonly targetProjectId: string;
  private isInitialized: boolean = false;
  private pollInterval: number | null = null;

  constructor(projectId: string, targetProjectId: string) {
    this.config = REDIS_CONFIG;
    this.projectId = projectId;
    this.targetProjectId = targetProjectId;
    this.initialize();
  }

  private initialize() {
    if (this.isInitialized) return;

    // Listen for data from the local project connector
    window.addEventListener(CONNECTOR_EVENTS.DATA_SENT, this.handleLocalDataSent.bind(this));

    // Set up polling for Redis updates
    this.startPolling();

    this.isInitialized = true;
    console.log(`RedisProjectConnector initialized for ${this.projectId} -> ${this.targetProjectId}`);
  }

  private async handleLocalDataSent(event: CustomEvent) {
    const sharedData: SharedData = event.detail;
    
    // Only send data intended for the target project
    if (sharedData.targetProjectId === this.targetProjectId) {
      try {
        await this.saveToRedis(sharedData);
        console.log('Data saved to Redis:', sharedData);
      } catch (error) {
        console.error('Error saving data to Redis:', error);
      }
    }
  }

  private async executeRedisCommand(command: string, ...args: string[]): Promise<any> {
    try {
      const response = await fetch(this.config.url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.writeToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([command, ...args])
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.result;
    } catch (error) {
      console.error('Error executing Redis command:', error);
      return null;
    }
  }

  private async saveToRedis(data: SharedData): Promise<boolean> {
    try {
      // Serialize the data to JSON string
      const serializedData = JSON.stringify({
        ...data,
        storedAt: Date.now()
      });
      
      // Use SET command to store the data
      const result = await this.executeRedisCommand('SET', data.id, serializedData);
      
      if (result !== null) {
        // Also add to a list of pending items for this target project
        await this.executeRedisCommand('LPUSH', `pending:${data.targetProjectId}`, data.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving to Redis:', error);
      return false;
    }
  }

  private async getFromRedis(key: string): Promise<any> {
    try {
      // Use GET command to retrieve the data
      const result = await this.executeRedisCommand('GET', key);
      if (result) {
        return JSON.parse(result);
      }
      return null;
    } catch (error) {
      console.error('Error fetching from Redis:', error);
      return null;
    }
  }

  private async getPendingDataForProject(projectId: string): Promise<string[]> {
    try {
      // Get all pending data IDs for this project
      const result = await this.executeRedisCommand('LRANGE', `pending:${projectId}`, '0', '-1');
      return result || [];
    } catch (error) {
      console.error('Error fetching pending data from Redis:', error);
      return [];
    }
  }

  private async removeFromPendingList(projectId: string, dataId: string): Promise<boolean> {
    try {
      // Remove the processed item from the pending list
      const result = await this.executeRedisCommand('LREM', `pending:${projectId}`, '1', dataId);
      return result !== null;
    } catch (error) {
      console.error('Error removing from pending list:', error);
      return false;
    }
  }

  private async startPolling() {
    // Clear any existing interval
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }

    // Poll Redis for new data every 5 seconds
    this.pollInterval = window.setInterval(async () => {
      try {
        const pendingIds = await this.getPendingDataForProject(this.projectId);
        
        for (const dataId of pendingIds) {
          const data = await this.getFromRedis(dataId);
          
          if (data && data.targetProjectId === this.projectId && !data.processed) {
            // Dispatch the received event
            const receivedEvent = new CustomEvent(CONNECTOR_EVENTS.DATA_RECEIVED, {
              detail: data
            });
            window.dispatchEvent(receivedEvent);
            
            console.log('Data received from Redis:', data);
            
            // Mark as processed by updating the record
            const processedData = { ...data, processed: true };
            await this.executeRedisCommand('SET', dataId, JSON.stringify(processedData));
            
            // Remove from pending list
            await this.removeFromPendingList(this.projectId, dataId);
          }
        }
      } catch (error) {
        console.error('Error polling Redis:', error);
      }
    }, 5000); // Poll every 5 seconds
  }

  // Method to manually fetch and process new data
  async syncFromRedis(): Promise<void> {
    try {
      const pendingIds = await this.getPendingDataForProject(this.projectId);
      
      for (const dataId of pendingIds) {
        const data = await this.getFromRedis(dataId);
        
        if (data && data.targetProjectId === this.projectId && !data.processed) {
          // Dispatch the received event
          const receivedEvent = new CustomEvent(CONNECTOR_EVENTS.DATA_RECEIVED, {
            detail: data
          });
          window.dispatchEvent(receivedEvent);
          
          console.log('Synced data from Redis:', data);
          
          // Mark as processed
          const processedData = { ...data, processed: true };
          await this.executeRedisCommand('SET', dataId, JSON.stringify(processedData));
          
          // Remove from pending list
          await this.removeFromPendingList(this.projectId, dataId);
        }
      }
    } catch (error) {
      console.error('Error syncing from Redis:', error);
    }
  }

  // Method to mark data as processed in Redis
  async markAsProcessed(dataId: string): Promise<boolean> {
    try {
      const data = await this.getFromRedis(dataId);
      if (!data) {
        return false;
      }

      // Update the data to mark as processed
      const processedData = { ...data, processed: true };
      
      const result = await this.executeRedisCommand('SET', dataId, JSON.stringify(processedData));
      
      if (result !== null) {
        // Remove from pending list
        await this.removeFromPendingList(this.projectId, dataId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error marking as processed in Redis:', error);
      return false;
    }
  }

  // Cleanup method
  destroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.isInitialized = false;
  }
}

// Initialize the Redis connector when the module loads
let redisConnector: RedisProjectConnector | null = null;

export function initRedisConnector(projectId: string, targetProjectId: string = 'farm-hub-app'): RedisProjectConnector {
  if (!redisConnector) {
    redisConnector = new RedisProjectConnector(projectId, targetProjectId);
  }
  return redisConnector;
}

export function getRedisConnector(): RedisProjectConnector | null {
  return redisConnector;
}

// Export utility functions
export async function syncFromRedis(): Promise<void> {
  const connector = getRedisConnector();
  if (connector) {
    await connector.syncFromRedis();
  }
}

export async function markRedisDataAsProcessed(dataId: string): Promise<boolean> {
  const connector = getRedisConnector();
  if (connector) {
    return await connector.markAsProcessed(dataId);
  }
  return false;
}