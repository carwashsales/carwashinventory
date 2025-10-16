'use client';

import { useState } from 'react';
import { useApp } from '@/hooks/use-app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2 } from 'lucide-react';

export function ExpenseManagement() {
  const { t, expenses, addExpense, removeExpense } = useApp();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const handleAddExpense = async () => {
    if (description && amount) {
      await addExpense({ description, amount: parseFloat(amount) });
      setDescription('');
      setAmount('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('expense-management-title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold mb-2">{t('add-expense-title')}</h3>
            <div className="space-y-4">
              <Input
                placeholder={t('expense-description-placeholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Input
                type="number"
                placeholder={t('expense-amount-placeholder')}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Button onClick={handleAddExpense}>{t('add-expense-btn')}</Button>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">{t('expenses-list-title')}</h3>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('table-header-date')}</TableHead>
                            <TableHead>{t('table-header-description')}</TableHead>
                            <TableHead className="text-right">{t('table-header-amount')}</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {expenses.length > 0 ? (
                            expenses.map((expense) => (
                                <TableRow key={expense.id}>
                                    <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{expense.description}</TableCell>
                                    <TableCell className="text-right">{expense.amount.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => removeExpense(expense.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">{t('no-expenses-text')}</TableCell>
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
