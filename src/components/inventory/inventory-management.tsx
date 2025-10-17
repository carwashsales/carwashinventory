
'use client';

import { useState } from 'react';
import { useApp } from '@/hooks/use-app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Save } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { InventoryItem, ProductType } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export function InventoryManagement() {
  const { t, language, inventoryItems, addInventoryItem, updateInventoryItem, removeInventoryItem, productTypes, addProductType, updateProductType, removeProductType } = useApp();
  
  const [newProductTypeId, setNewProductTypeId] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemLifespanDays, setNewItemLifespanDays] = useState('');

  const [newProductNameAr, setNewProductNameAr] = useState('');
  const [newProductNameEn, setNewProductNameEn] = useState('');
  
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editedItem, setEditedItem] = useState<InventoryItem | null>(null);

  const handleAddItem = async () => {
    if (newProductTypeId && newItemQuantity && newItemPrice) {
      await addInventoryItem({
        product_type_id: newProductTypeId,
        quantity: parseInt(newItemQuantity, 10),
        price: parseFloat(newItemPrice),
        purchaseDate: new Date().toISOString().split('T')[0], // Set current date
        lifespanDays: newItemLifespanDays ? parseInt(newItemLifespanDays, 10) : undefined,
      });
      setNewProductTypeId('');
      setNewItemQuantity('');
      setNewItemPrice('');
      setNewItemLifespanDays('');
    }
  };

  const handleAddProductType = async () => {
    if (newProductNameEn && newProductNameAr) {
      await addProductType(newProductNameEn, newProductNameAr);
      setNewProductNameEn('');
      setNewProductNameAr('');
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItemId(item.id);
    setEditedItem({ ...item });
  };

  const handleSave = async (id: string) => {
    if (!editedItem) return;

    await updateInventoryItem(id, {
      product_type_id: editedItem.product_type_id,
      quantity: editedItem.quantity,
      price: editedItem.price,
      purchaseDate: editedItem.purchaseDate,
      lifespanDays: editedItem.lifespanDays,
    });
    setEditingItemId(null);
    setEditedItem(null);
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
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('inventory-management-title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('add-inventory-item-title')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
                <Select onValueChange={setNewProductTypeId} value={newProductTypeId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('select-product-type')} />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypes.map((pt) => (
                      <SelectItem key={pt.id} value={pt.id}>
                        {language === 'ar' ? pt.name_ar : pt.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                            {editingItemId === item.id && editedItem ? (
                              <>
                                <TableCell>{language === 'ar' ? item.productType?.name_ar : item.productType?.name_en}</TableCell>
                                <TableCell><Input type="number" value={editedItem.quantity} onChange={(e) => setEditedItem({ ...editedItem, quantity: parseInt(e.target.value) })} /></TableCell>
                                <TableCell><Input type="number" value={editedItem.price} onChange={(e) => setEditedItem({ ...editedItem, price: parseFloat(e.target.value) })} /></TableCell>
                                <TableCell><Input type="date" value={editedItem.purchaseDate} onChange={(e) => setEditedItem({ ...editedItem, purchaseDate: e.target.value })} /></TableCell>
                                <TableCell><Input type="number" value={editedItem.lifespanDays} onChange={(e) => setEditedItem({ ...editedItem, lifespanDays: parseInt(e.target.value) })} /></TableCell>
                                <TableCell />
                                <TableCell>
                                  <Button variant="ghost" size="icon" onClick={() => handleSave(item.id)}><Save className="h-4 w-4" /></Button>
                                </TableCell>
                              </>
                            ) : (
                              <>
                                <TableCell>{language === 'ar' ? item.productType?.name_ar : item.productType?.name_en}</TableCell>
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
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>{t('delete-service-type-title')}</AlertDialogTitle>
                                        <AlertDialogDescription>{t('delete-service-type-description')}</AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>{t('cancel-btn')}</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => removeInventoryItem(item.id)}>{t('delete-btn')}</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
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

      <Card>
        <CardHeader>
          <CardTitle>{t('product-management-title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('add-product-type-title')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
                <Input
                  placeholder={t('product-name-en-label')}
                  value={newProductNameEn}
                  onChange={(e) => setNewProductNameEn(e.target.value)}
                />
                <Input
                  placeholder={t('product-name-ar-label')}
                  value={newProductNameAr}
                  onChange={(e) => setNewProductNameAr(e.target.value)}
                />
                <Button onClick={handleAddProductType} className="md:col-span-2 lg:col-span-1">{t('add-product-type-btn')}</Button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('product-types-list-title')}</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('product-name-en-label')}</TableHead>
                      <TableHead>{t('product-name-ar-label')}</TableHead>
                      <TableHead className="w-[100px]">{t('actions-label')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productTypes.map((pt) => (
                      <TableRow key={pt.id}>
                        <TableCell>{pt.name_en}</TableCell>
                        <TableCell>{pt.name_ar}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => updateProductType(pt.id, pt.name_en, pt.name_ar)}><Edit className="h-4 w-4" /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('delete-service-type-title')}</AlertDialogTitle>
                                <AlertDialogDescription>{t('delete-service-type-description')}</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('cancel-btn')}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => removeProductType(pt.id)}>{t('delete-btn')}</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
