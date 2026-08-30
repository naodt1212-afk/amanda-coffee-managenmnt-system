import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button, Input, Badge, StatCard } from '../components/UI';
import { BarChart2, Calendar, DollarSign, Download, Filter, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

export const Reports: React.FC = () => {
  const { expenses, getDashboardStats, orders } = useApp();
  const stats = getDashboardStats();

  const [dateFrom, setDateFrom] = useState('2026-08-01');
  const [dateTo, setDateTo] = useState('2026-08-28');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // SVG Data representations
  const categorySales = [
    { category: 'Coffee', sales: 245000, percent: 51, color: 'bg-amber-900' },
    { category: 'Food', sales: 110000, percent: 23, color: 'bg-amber-600' },
    { category: 'Juice', sales: 68000, percent: 14, color: 'bg-stone-800' },
    { category: 'Tea', sales: 38000, percent: 8, color: 'bg-stone-500' },
    { category: 'Soft Drinks', sales: 24200, percent: 4, color: 'bg-stone-300' }
  ];

  const handleExportCSV = () => {
    showToast('Exporting financial report CSV to downloads...', 'success');
  };

  const { showToast } = useApp();

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-stone-900">Financial Reports & Logs</h1>
          <p className="text-xs text-stone-400 mt-1">Audit overhead losses, review sales streams, and export official audits</p>
        </div>

        <Button
          variant="outline"
          onClick={handleExportCSV}
          icon={<Download size={16} />}
          className="self-start sm:self-auto bg-white border-stone-200"
        >
          Export CSV Spreadsheet
        </Button>
      </div>

      {/* Filter panel */}
      <div className="bg-white border border-stone-100 p-4 rounded-xl flex flex-col sm:flex-row gap-4 items-end">
        <div className="grid grid-cols-2 gap-3 flex-1 w-full">
          <Input
            label="From Date"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <Input
            label="To Date"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        <div className="flex gap-2.5 w-full sm:w-auto">
          <Button
            variant="primary"
            onClick={() => showToast('Filters applied to database queries!', 'success')}
            className="w-full sm:w-auto text-xs px-5 py-2.5"
            icon={<Filter size={14} />}
          >
            Apply Filters
          </Button>
        </div>
      </div>

      {/* Balanced Profit Statement breakout widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Gross Revenue */}
        <div className="bg-white border border-stone-100 p-6 rounded-2xl flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">
            <span>Gross Sales Intake</span>
            <TrendingUp size={16} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-stone-900">ETB {stats.monthlySales.toLocaleString()}</h2>
            <p className="text-[10px] text-emerald-600 font-bold mt-1">+14.2% increased growth since July</p>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white border border-stone-100 p-6 rounded-2xl flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">
            <span>Overhead Loss / Cost</span>
            <TrendingDown size={16} className="text-rose-600" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-stone-900 text-rose-600">ETB {stats.expensesTotal.toLocaleString()}</h2>
            <p className="text-[10px] text-rose-500 font-bold mt-1">Rent, supplies procurement, & weekly wages</p>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-amber-950 text-white p-6 rounded-2xl flex flex-col justify-between shadow-sm border border-amber-900">
          <div className="flex items-center justify-between text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">
            <span>Net Operating Margin</span>
            <DollarSign size={16} className="text-amber-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">ETB {stats.netProfit.toLocaleString()}</h2>
            <p className="text-[10px] text-amber-200/80 font-bold mt-1">Real profit after deducting raw ingredients</p>
          </div>
        </div>

      </div>

      {/* Grid of Report Visual Diagrams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category breakdown bar graphic */}
        <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-xs lg:col-span-1">
          <h3 className="font-display text-lg font-bold text-stone-900 mb-1">Category Distribution</h3>
          <p className="text-[11px] text-stone-400 mb-6">Percentage allocation of gross sales across menu sections</p>

          <div className="flex flex-col gap-4">
            {categorySales.map((item) => (
              <div key={item.category} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-stone-800">{item.category}</span>
                  <span className="text-stone-550">{item.percent}% (ETB {item.sales.toLocaleString()})</span>
                </div>
                {/* Bar */}
                <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses List spreadsheets */}
        <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-stone-900 mb-1">Overhead Expenses Audit Ledger</h3>
            <p className="text-[11px] text-stone-400 mb-4">Detailed listing of procurement, venue rentals, & operational outlays</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100 text-stone-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3">Memo notes</th>
                    <th className="py-2 px-3 text-right">Debit amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                  {expenses.map((exp) => (
                    <tr key={exp.id}>
                      <td className="py-2.5 px-3 font-semibold text-[11px] text-stone-500">{exp.date}</td>
                      <td className="py-2.5 px-3">
                        <span className="bg-stone-100 text-stone-600 px-2.5 py-0.5 rounded-sm font-bold text-[10px]">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 max-w-[200px] truncate text-stone-500">{exp.description}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-red-600">-{exp.amount} ETB</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-55 flex justify-between items-center text-xs font-bold text-stone-500 mt-4">
            <span>Logged overhead bills</span>
            <span>Total: ETB {expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}</span>
          </div>
        </div>

      </div>

    </div>
  );
};
