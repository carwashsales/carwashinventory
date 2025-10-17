
'use client';

import { useState } from 'react';
import { useApp } from '@/hooks/use-app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Save } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { InventoryItem } from '@/types';

export function InventoryManagement() {
  const { t, inventoryItems, addInventoryItem, updateInventoryItem, removeInventoryItem } = useApp();
  
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemLifespanDays, setNewItemLifespanDays] = useState('');
  
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editedItemName, setEditedItemName] = useState('');
  const [editedItemQuantity, setEditedItemQuantity] = useState('');
  const [editedItemPrice, setEditedItemPrice] = useState('');
  const [editedItemPurchaseDate, setEditedItemPurchaseDate] = useState('');
  const [editedItemLifespanDays, setEditedItemLifespanDays] = useState('');

  const handleAddItem = async () => {
    if (newItemName && newItemQuantity && newItemPrice) {
      await addInventoryItem({
        name: newItemName,
        quantity: parseInt(newItemQuantity, 10),
        price: parseFloat(newItemPrice),
        purchaseDate: new Date().toISOString().split('T')[0], // Set current date
        lifespanDays: newItemLifespanDays ? parseInt(newItemLifespanDays, 10) : undefined,
      });
      setNewItemName('');
      setNewItemQuantity('');
      setNewItemPrice('');
      setNewItemLifespanDays('');
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItemId(item.id);
    setEditedItemName(item.name);
    setEditedItemQuantity(item.quantity.toString());
    setEditedItemPrice(item.price.toString());
    setEditedItemPurchaseDate(item.purchaseDate || '');
    setEditedItemLifespanDays(item.lifespanDays?.toString() || '');
  };

  const handleSave = async (id: string) => {
    await updateInventoryItem(id, {
      name: editedItemName,
      quantity: parseInt(editedItemQuantity, 10),
      price: parseFloat(editedItemPrice),
      purchaseDate: editedItemPurchaseDate,
      lifespanDays: editedItemLifespanDays ? parseInt(editedItemLifespanDays, 10) : undefined,
    });
    setEditingItemId(null);
  };

  const calculateRemainingLifespan = (item: InventoryItem) => {
    if (!item.purchaseDate || !item.lifespanDays) {
      return null;
    }
    const purchaseDate = new Date(item.purchaseDate);
    const today = new Date();
    const daysPassed = (today.getTime() - purchaseDate.getTime()) / (1000 * 3600 * 24);
    const remainingPercentage = 100 - (daysPassed / item.lifespanDays) * 100;
    return Math.max(0, remainingPercentage);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage > 50) {
      return 'bg-green-500';
    }
    if (percentage > 25) {
      return 'bg-yellow-500';
    }
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('inventory-management-title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">{t('add-inventory-item-title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
              <Input
                placeholder={t('item-name-placeholder')}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
              />
              <Input
                type="number"
                placeholder={t('quantity-placeholder')}
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(e.target.value)}
              />
              <Input
                type="number"
                placeholder={t('price-placeholder')}
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
              />
              <Input
                type="number"
                placeholder={t('lifespan-days-placeholder')}
                value={newItemLifespanDays}
                onChange={(e) => setNewItemLifespanDays(e.target.value)}
              />
              <Button onClick={handleAddItem} className="md:col-span-3 lg:col-span-1">{t('add-item-btn')}</Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">{t('inventory-list-title')}</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('table-header-item')}</TableHead>
                    <TableHead>{t('table-header-quantity')}</TableHead>
                    <TableHead>{t('table-header-price')}</TableHead>
                    <TableHead>{t('purchase-date-placeholder')}</TableHead>
                    <TableHead>{t('lifespan-days-placeholder')}</TableHead>
                    <TableHead>{t('remaining-lifespan-label')}</TableHead>
                    <TableHead className="w-[100px]">{t('actions-label')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryItems.length > 0 ? (
                    inventoryItems.map((item) => {
                      const remainingLifespan = calculateRemainingLifespan(item);
                      return (
                        <TableRow key={item.id}>
                          {editingItemId === item.id ? (
                            <>
                              <TableCell><Input value={editedItemName} onChange={(e) => setEditedItemName(e.target.value)} /></TableCell>
                              <TableCell><Input type="number" value={editedItemQuantity} onChange={(e) => setEditedItemQuantity(e.target.value)} /></TableCell>
                              <TableCell><Input type="number" value={editedItemPrice} onChange={(e) => setEditedItemPrice(e.target.value)} /></TableCell>
                              <TableCell><Input type="date" value={editedItemPurchaseDate} onChange={(e) => setEditedItemPurchaseDate(e.target.value)} /></TableCell>
                              <TableCell><Input type="number" value={editedItemLifespanDays} onChange={(e) => setEditedItemLifespanDays(e.target.value)} /></TableCell>
                              <TableCell />
                              <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => handleSave(item.id)}><Save className="h-4 w-4" /></Button>
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell>{item.name}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>{item.price.toFixed(2)}</TableCell>
                              <TableCell>{item.purchaseDate}</TableCell>
                              <TableCell>{item.lifespanDays}</TableCell>
                              <TableCell>
                                {remainingLifespan !== null && (
                                  <Progress value={remainingLifespan} className={getProgressColor(remainingLifespan)} />
                                )}
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => removeInventoryItem(item.id)}><Trash2 className="h-4 w-4" /></Button>
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">{t('no-inventory-items-text')}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
