# 🔄 Project Connector Instructions

## 📋 Overview

This document provides detailed instructions for implementing the Project Connector in your external project to receive real-time data from the farm management application.

## 🚀 Quick Start

### 1. Copy Required Files

Copy these files from the farm management app to your project:
```
src/services/projectConnector.ts
src/components/ProjectConnector.tsx
```

### 2. Install Dependencies

Make sure you have these dependencies in your project:
```bash
npm install react react-dom @types/react @types/react-dom
```

### 3. Basic Implementation

```typescript
import { useEffect } from "react";
import { getProjectConnector, CONNECTOR_EVENTS } from "@/services/projectConnector";

function YourComponent() {
  useEffect(() => {
    // Initialize connector
    const connector = getProjectConnector("your-project-id", "farm-management-app");
    
    // Handle incoming data
    const handleDataReceived = (event: any) => {
      const data = event.detail;
      console.log("Received data:", data);
      
      // Process based on data type
      switch(data.type) {
        case "stock_item":
          handleStockItem(data.data);
          break;
        case "production_data":
          handleProductionData(data.data);
          break;
        case "kandang_data":
          handleKandangData(data.data);
          break;
      }
    };
    
    // Add event listener
    window.addEventListener(CONNECTOR_EVENTS.DATA_RECEIVED, handleDataReceived);
    
    // Cleanup
    return () => {
      window.removeEventListener(CONNECTOR_EVENTS.DATA_RECEIVED, handleDataReceived);
    };
  }, []);
  
  return (
    <div>
      {/* Your component JSX */}
    </div>
  );
}
```

## 📊 Data Structures

### Stock Item Data
```typescript
{
  productName: string;     // "Pakan Starter"
  quantity: number;        // 100
  unit: string;           // "kg", "pcs", "liter", "sack"
  category: string;       // "pakan", "obat", "vitamin", "other"
  timestamp: number;      // Unix timestamp
  source: string;         // Source identifier
}
```

### Production Data
```typescript
{
  eggCount: number;       // Number of eggs collected
  feedConsumption: number; // Feed consumed in kg
  mortality: number;      // Number of deaths
  kandang: string;        // Kandang name/ID
  actionType: string;     // Type of action performed
  notes: string;          // Additional notes
  timestamp: number;      // Unix timestamp
}
```

### Kandang Data
```typescript
{
  name: string;           // Kandang name
  location: string;       // Location description
  capacity: number;       // Maximum capacity
  currentStock: number;   // Current stock count
  metadata: any;          // Additional metadata
  timestamp: number;      // Unix timestamp
}
```

## 🔧 Advanced Configuration

### Custom ProjectConnector Component
```typescript
import { ProjectConnector } from "@/components/ProjectConnector";

function YourApp() {
  return (
    <div>
      <ProjectConnector 
        projectId="your-project-id"
        targetProjectId="farm-management-app"
        showStatus={true}
        autoSync={true}
        className="mb-6"
      />
      {/* Rest of your app */}
    </div>
  );
}
```

### Manual Data Processing
```typescript
useEffect(() => {
  const connector = getProjectConnector("your-project-id", "farm-management-app");
  
  const handleDataReceived = (event: any) => {
    const sharedData = event.detail;
    
    // Process the data
    processIncomingData(sharedData.data);
    
    // Mark as processed (optional)
    connector.markAsProcessed(sharedData.id);
  };
  
  window.addEventListener(CONNECTOR_EVENTS.DATA_RECEIVED, handleDataReceived);
  
  return () => {
    window.removeEventListener(CONNECTOR_EVENTS.DATA_RECEIVED, handleDataReceived);
  };
}, []);
```

## 📈 Monitoring and Debugging

### View Connector Status
```typescript
const connector = getProjectConnector("your-project-id", "farm-management-app");

// Get current status
const status = connector.getStatus();
console.log("Connector Status:", status);

// View all stored data
const allData = connector.getStoredData();
console.log("All Data:", allData);

// View specific data types
const stockItems = connector.getDataByType("stock_item");
const productionData = connector.getDataByType("production_data");
```

### Enable Debug Mode
In `projectConnector.ts`, set:
```typescript
const DEBUG_MODE = true;
```

### Storage Management
```typescript
// Clean up old processed data (older than 24 hours)
const cleanedCount = connector.cleanupProcessedData(24);
console.log(`Cleaned ${cleanedCount} old items`);

// Get pending data
const pendingData = connector.getPendingData();
console.log("Pending:", pendingData);

// Get received data
const receivedData = connector.getReceivedData();
console.log("Received:", receivedData);
```

## 🛠️ Error Handling

### Robust Data Processing
```typescript
const handleDataReceived = (event: any) => {
  try {
    const sharedData = event.detail;
    
    // Validate data structure
    if (!sharedData || !sharedData.data) {
      console.error("Invalid data received:", sharedData);
      return;
    }
    
    // Process based on type
    switch(sharedData.type) {
      case "stock_item":
        validateAndProcessStockItem(sharedData.data);
        break;
      case "production_data":
        validateAndProcessProductionData(sharedData.data);
        break;
      default:
        console.warn("Unknown data type:", sharedData.type);
    }
    
    // Mark as processed
    connector.markAsProcessed(sharedData.id);
    
  } catch (error) {
    console.error("Error processing data:", error);
    // Handle error appropriately
  }
};
```

### Storage Quota Management
```typescript
const handleStorageError = () => {
  try {
    // Clean up old data first
    const cleaned = connector.cleanupProcessedData(12); // Clean 12 hours old
    
    if (cleaned > 0) {
      console.log(`Cleaned ${cleaned} items, retrying operation`);
      // Retry the operation that failed
    } else {
      // If still no space, notify user
      alert("Storage limit reached. Please process some data.");
    }
  } catch (error) {
    console.error("Storage cleanup failed:", error);
  }
};
```

## 🎯 Best Practices

### 1. Data Validation
Always validate incoming data before processing:
```typescript
const validateStockItem = (data: any) => {
  return data.productName && 
         typeof data.quantity === 'number' && 
         data.quantity > 0;
};
```

### 2. Error Recovery
Implement retry mechanisms for failed operations:
```typescript
const processDataWithRetry = async (data: any, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await processYourData(data);
      return true;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

### 3. Performance Optimization
- Process data in batches when possible
- Use debouncing for frequent updates
- Implement lazy loading for large datasets

### 4. User Feedback
```typescript
const showUserFeedback = (data: any) => {
  // Show notifications
  toast.success(`New ${data.type} received from farm management app`);
  
  // Update UI indicators
  setHasNewData(true);
  
  // Log for analytics
  logDataReceived(data);
};
```

## 🔌 Integration Examples

### Example 1: Simple Stock Management
```typescript
function StockManager() {
  const [stockItems, setStockItems] = useState<any[]>([]);
  
  useEffect(() => {
    const connector = getProjectConnector("stock-manager", "farm-management-app");
    
    const handleStockData = (event: any) => {
      const data = event.detail;
      if (data.type === "stock_item") {
        setStockItems(prev => [...prev, data.data]);
        toast.success(`New stock item: ${data.data.productName}`);
      }
    };
    
    window.addEventListener(CONNECTOR_EVENTS.DATA_RECEIVED, handleStockData);
    
    return () => {
      window.removeEventListener(CONNECTOR_EVENTS.DATA_RECEIVED, handleStockData);
    };
  }, []);
  
  return (
    <div>
      <h2>Stock Items</h2>
      {stockItems.map((item, index) => (
        <div key={index}>
          {item.productName} - {item.quantity} {item.unit}
        </div>
      ))}
    </div>
  );
}
```

### Example 2: Production Dashboard
```typescript
function ProductionDashboard() {
  const [productionData, setProductionData] = useState<any[]>([]);
  
  useEffect(() => {
    const connector = getProjectConnector("production-dashboard", "farm-management-app");
    
    const handleProductionData = (event: any) => {
      const data = event.detail;
      if (data.type === "production_data") {
        setProductionData(prev => [...prev, data.data]);
        updateCharts(data.data);
      }
    };
    
    window.addEventListener(CONNECTOR_EVENTS.DATA_RECEIVED, handleProductionData);
    
    return () => {
      window.removeEventListener(CONNECTOR_EVENTS.DATA_RECEIVED, handleProductionData);
    };
  }, []);
  
  return (
    <div>
      <ProjectConnector 
        projectId="production-dashboard"
        targetProjectId="farm-management-app"
      />
      {/* Your dashboard components */}
    </div>
  );
}
```

## 🧪 Testing

### Test Data Generation
```typescript
// Generate test data
const generateTestData = () => {
  const connector = getProjectConnector("test-sender", "farm-management-app");
  
  const testData = {
    productName: "Test Product",
    quantity: Math.floor(Math.random() * 100) + 1,
    unit: "kg",
    category: "pakan",
    timestamp: Date.now(),
    source: "test-generator"
  };
  
  connector.sendData("stock_item", testData);
};
```

### Test Multiple Projects
Open your app in multiple browser tabs with different project IDs to test cross-project communication.

## 📞 Troubleshooting

### Common Issues

1. **Data not receiving**
   - Check project IDs match between sender and receiver
   - Verify both apps are running in the same browser
   - Check browser console for errors

2. **Storage limits exceeded**
   - Regularly clean processed data
   - Implement data archiving strategy
   - Use `cleanupProcessedData()` method

3. **Performance issues**
   - Process data in batches
   - Implement virtual scrolling for large lists
   - Use React.memo for components

4. **Cross-browser compatibility**
   - Test in target browsers
   - Handle storage API differences
   - Implement fallback mechanisms

### Debug Checklist
- [ ] Project IDs match between apps
- [ ] Both apps running in same browser
- [ ] No console errors
- [ ] localStorage accessible
- [ ] CustomEvents supported
- [ ] Sufficient storage space

## 🚀 Production Ready Checklist

- [ ] Implement proper error handling
- [ ] Add user notifications
- [ ] Set up monitoring and logging
- [ ] Implement data validation
- [ ] Add storage cleanup routines
- [ ] Test with realistic data volumes
- [ ] Document integration for team
- [ ] Set up backup/recovery procedures
- [ ] Implement security measures
- [ ] Performance testing completed

## 📚 Additional Resources

- [MDN Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [MDN CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)
- [React useEffect Hook](https://reactjs.org/docs/hooks-effect.html)

For support, check the browser console for detailed logs and error messages.