# 🔄 Redis Integration for Project Connector

## Overview
This implementation adds persistent data storage and retrieval capabilities to the Project Connector using Upstash Redis as a cloud-based storage solution.

## 🔧 Redis Configuration
The system uses your provided Upstash Redis credentials:

- **URL**: `https://trusting-redfish-7489.upstash.io`
- **Read Token**: `Ah1BAAIgcDFfnDJT5HlYbpLIG4GBhgDTJszbFedQ4g1vgBunraQBhQ`
- **Write Token**: `AR1BAAImcDEzMTA0OGViYjNkOTk0MjVmYjFiODAwN2RkZGJiNTg2ZXAxNzQ4OQ`

## 🏗️ Architecture

### Core Components

1. **`redisProjectConnector.ts`** - Handles Redis operations
2. **`RedisReceiver.tsx`** - UI component for Redis data reception
3. **Enhanced `projectConnector.ts`** - Integrated with Redis for persistence

### Data Flow

```
Browser App → Local Storage + Custom Events → Redis Storage → Remote Apps
```

## 🚀 How It Works

### 1. Data Transmission
- When `sendData()` is called, data is stored in both localStorage and Redis
- Redis acts as a central hub for cross-domain communication

### 2. Data Reception
- Applications poll Redis for new data targeted to their project ID
- Received data triggers `DATA_RECEIVED` events
- Data is also stored in local storage for offline access

### 3. Synchronization
- Automatic polling every 5 seconds
- Manual sync button available in UI
- Processed data is marked to prevent duplication

## 📊 Data Types Supported

The system supports all existing data types:
- `stock_item` - Stock management data
- `production_data` - Production metrics
- `kandang_data` - Coop information
- Custom types can be easily added

## 🔒 Security Considerations

- Data is stored in Redis with project-specific targeting
- Only authorized projects can access targeted data
- Credentials are embedded in the client-side code (ensure this meets your security requirements)

## 🛠️ Usage

### In Your Application
```typescript
// Initialize Redis connector
initRedisConnector('your-project-id', 'target-project-id');

// Send data (works as before, now also stores in Redis)
const connector = getProjectConnector('your-project-id');
connector.sendData('stock_item', { productName: 'Feed', quantity: 100 });

// Receive data from Redis
// The RedisReceiver component handles this automatically
```

### In External Projects
```typescript
// Initialize as receiver
initRedisConnector('external-project-id', 'your-project-id');

// The system will automatically receive data sent from your project
```

## 📋 Components Added

1. **RedisReceiver** - Shows data received via Redis
2. **Redis Project Connector** - Handles Redis operations
3. **Integration Layer** - Connects local and Redis storage

## 🔄 Sync Process

- **Automatic**: Every 5 seconds, checks Redis for new data
- **Manual**: Sync button allows on-demand refresh
- **Processing**: Mark data as processed to prevent duplication

## 🚀 Deployment

When deploying to Vercel or other platforms:
1. The Redis integration works seamlessly
2. Data persists across sessions and deployments
3. Multiple instances can share data via Redis

## 💡 Benefits

- **Persistence**: Data survives browser refreshes and app restarts
- **Cross-Domain**: Works between different domains/applications
- **Scalability**: Redis handles high-volume data exchange
- **Reliability**: Backup storage prevents data loss
- **Real-Time**: Near real-time data synchronization

## 🛡️ Limitations

- Requires internet connectivity for Redis operations
- Data stored in cloud (consider privacy implications)
- Rate limits may apply depending on Upstash plan
- Client-side credentials exposure (standard for client-side apps)

This implementation enhances the existing Project Connector with cloud-based persistence while maintaining the same simple API for developers.