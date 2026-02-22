import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getProjectConnector } from '@/services/projectConnector';
import { Package, Send } from 'lucide-react';
import { toast } from 'sonner';

export function TestStockForm() {
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [category, setCategory] = useState('pakan');
  const [isSharing, setIsSharing] = useState(false);

  const connector = getProjectConnector('farm-management-app', 'farm-hub-app');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productName || !quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSharing(true);
    
    try {
      const stockData = {
        productName,
        quantity: parseFloat(quantity),
        unit,
        category,
        timestamp: Date.now(),
        source: 'TestStockForm'
      };

      // Send data through connector
      const success = connector.sendData('stock_item', stockData);
      
      if (success) {
        toast.success(`Stock item shared successfully!`);
        // Reset form
        setProductName('');
        setQuantity('');
        setUnit('kg');
        setCategory('pakan');
      } else {
        toast.error('Failed to share stock item');
      }
    } catch (error) {
      console.error('Error sharing stock data:', error);
      toast.error('Error sharing stock data');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Test Stock Sharing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productName">Product Name *</Label>
            <Input
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter product name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="pcs">pcs</SelectItem>
                <SelectItem value="liter">liter</SelectItem>
                <SelectItem value="sack">sack</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pakan">Pakan</SelectItem>
                <SelectItem value="obat">Obat</SelectItem>
                <SelectItem value="vitamin">Vitamin</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSharing}
          >
            {isSharing ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                Sharing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Share Stock Item
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}