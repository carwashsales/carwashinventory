'use client';

import { useState } from 'react';
import { useApp } from '@/hooks/use-app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Save } from 'lucide-react';
import type { InventoryItem } from '@/types';

export function InventoryManagement() {
  const { t, inventoryItems, addInventoryItem, updateInventoryItem, removeInventoryItem } = useApp();
  
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editedItemName, setEditedItemName] = useState('');
  const [editedItemQuantity, setEditedItemQuantity] = useState('');
  const [editedItemPrice, setEditedItemPrice] = useState('');

  const handleAddItem = async () => {
    if (newItemName && newItemQuantity && newItemPrice) {
      await addInventoryItem({
        name: newItemName,
        quantity: parseInt(newItemQuantity, 10),
        price: parseFloat(newItemPrice),
      });
      setNewItemName('');
      setNewItemQuantity('');
      setNewItemPrice('');
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItemId(item.id);
    setEditedItemName(item.name);
    setEditedItemQuantity(item.quantity.toString());
    setEditedItemPrice(item.price.toString());
  };

  const handleSave = async (id: string) => {
    await updateInventoryItem(id, {
      name: editedItemName,
      quantity: parseInt(editedItemQuantity, 10),
      price: parseFloat(editedItemPrice),
    });
    setEditingItemId(null);
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
            <div className="flex flex-col md:flex-row gap-2 mb-4">
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
              <Button onClick={handleAddItem} className="md:w-auto">{t('add-item-btn')}</Button>
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
                    <TableHead className="text-right">{t('table-header-price')}</TableHead>
                    <TableHead className="w-[100px]">{t('actions-label')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryItems.length > 0 ? (
                    inventoryItems.map((item) => (
                      <TableRow key={item.id}>
                        {editingItemId === item.id ? (
                          <>
                            <TableCell><Input value={editedItemName} onChange={(e) => setEditedItemName(e.target.value)} /></TableCell>
                            <TableCell><Input type="number" value={editedItemQuantity} onChange={(e) => setEditedItemQuantity(e.target.value)} /></TableCell>
                            <TableCell className="text-right"><Input type="number" value={editedItemPrice} onChange={(e) => setEditedItemPrice(e.target.value)} /></TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" onClick={() => handleSave(item.id)}><Save className="h-4 w-4" /></Button>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell className="text-right">{item.price.toFixed(2)}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => removeInventoryItem(item.id)}><Trash2 className="h-4 w-4" /></Button>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">{t('no-inventory-items-text')}</TableCell>
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
