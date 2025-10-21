'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Reports</CardTitle>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Report Name</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>2024-07-28</TableCell>
                <TableCell>Daily Sales Summary</TableCell>
                <TableCell className="text-right">$5,432.10</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2024-07-28</TableCell>
                <TableCell>Staff Commission Report</TableCell>
                <TableCell className="text-right">$1,234.50</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2024-07-27</TableCell>
                <TableCell>Daily Sales Summary</TableCell>
                <TableCell className="text-right">$4,890.75</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
