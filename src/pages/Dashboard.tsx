import React from 'react';
import { useApp } from '../context/AppContext';
import { StatCard, Badge } from '../components/UI';
import { DollarSign, ShoppingBag, Users, AlertTriangle, TrendingUp, BarChart2, Calendar, Coffee, FileText } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { getDashboardStats, inventory, orders } = useApp();
  const stats = getDashboardStats();

  // Low stock calculation
  const lowStockItems = inventory.filter(i => i.status === 'low_stock' || i.status === 'critical' || i.status === 'out_of_stock');

  // Static list of best sellers according to requirements
  const bestSellers = [
    { name: 'Ethiopian Macchiato', count: 184, percent: 100, price: '90 ETB' },
    { name: 'Cappuccino', count: 142, percent: 77, price: '110 ETB' },
    { name: 'Premium Chicken Club', count: 98, percent: 53, price: '240 ETB' },
    { name: 'Avocado & Mango (Spis)', count: 75, percent: 40, price: '140 ETB' },
    { name: 'Spiced Tea (Shai)', count: 64, percent: 34, price: '60 ETB' }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Upper Title Row */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-stone-900">Aesthetic Dashboard</h1>
          <p className="text-xs text-stone-400 mt-1">Real-time overview of your café's sales, kitchen volume, and inventory status</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-white border border-stone-200/60 p-2.5 rounded-xl self-start sm:self-auto font-bold text-stone-600">
          <Calendar size={14} className="text-[#D4A373]" />
          <span>August 28, 2026 • Live Terminal</span>
        </div>
      </div>

      {/* Stats Summary Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Sales"
          value={`ETB ${stats.todaySales.toLocaleString()}`}
          trend={{ value: '+14.2%', isPositive: true }}
          icon={<DollarSign size={20} />}
          colorClass="bg-emerald-50 text-emerald-800"
        />
        <StatCard
          title="Daily Orders"
          value={stats.dailyOrdersCount}
          trend={{ value: '+8.4%', isPositive: true }}
          icon={<ShoppingBag size={20} />}
          colorClass="bg-sky-50 text-sky-800"
        />
        <StatCard
          title="Monthly Revenue"
          value={`ETB ${stats.monthlySales.toLocaleString()}`}
          trend={{ value: '+18.1%', isPositive: true }}
          icon={<TrendingUp size={20} />}
          colorClass="bg-[#D4A373]/10 text-[#1A120B]"
        />
        <StatCard
          title="Active Customers"
          value={stats.customersCount}
          trend={{ value: '+4.5%', isPositive: true }}
          icon={<Users size={20} />}
          colorClass="bg-stone-100 text-stone-800"
        />
      </div>

      {/* Visual Report & Multi-Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Sales Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-100 p-6 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-display text-lg font-bold text-stone-900">Revenue & Profit Stream</h3>
              <p className="text-[11px] text-stone-400">Weekly comparison of net intake and overhead cost</p>
            </div>
            <div className="flex gap-4 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-stone-800">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4A373]" /> Revenue
              </span>
              <span className="flex items-center gap-1 text-stone-400">
                <span className="w-2.5 h-2.5 rounded-full bg-stone-300" /> Expenses
              </span>
            </div>
          </div>

          {/* Elegant Custom SVG Line Chart */}
          <div className="w-full h-56 flex items-end">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              {/* Horizontal helper lines */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="#f5f5f4" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="70" x2="500" y2="70" stroke="#f5f5f4" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#f5f5f4" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="170" x2="500" y2="170" stroke="#f5f5f4" strokeWidth="1" strokeDasharray="4 4" />

              {/* Grid Label */}
              <text x="495" y="15" fill="#a8a29e" fontSize="8" textAnchor="end" fontWeight="bold">ETB 100K</text>
              <text x="495" y="65" fill="#a8a29e" fontSize="8" textAnchor="end" fontWeight="bold">ETB 60K</text>
              <text x="495" y="115" fill="#a8a29e" fontSize="8" textAnchor="end" fontWeight="bold">ETB 30K</text>
              
              {/* Revenue fill area */}
              <path
                d="M 10 160 Q 90 90, 170 120 T 330 50 T 490 30 L 490 190 L 10 190 Z"
                fill="url(#revGrad)"
                opacity="0.15"
              />

              {/* Revenue Line */}
              <path
                d="M 10 160 Q 90 90, 170 120 T 330 50 T 490 30"
                fill="none"
                stroke="#D4A373"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Expenses Line */}
              <path
                d="M 10 180 Q 90 150, 170 160 T 330 110 T 490 120"
                fill="none"
                stroke="#d6d3d1"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="4 4"
              />

              {/* Data points */}
              <circle cx="170" cy="120" r="5" fill="#D4A373" stroke="#fff" strokeWidth="2" />
              <circle cx="330" cy="50" r="5" fill="#D4A373" stroke="#fff" strokeWidth="2" />
              <circle cx="490" cy="30" r="5" fill="#D4A373" stroke="#fff" strokeWidth="2" />

              {/* Day Labels */}
              <text x="10" y="195" fill="#78716c" fontSize="9" fontWeight="bold">Mon</text>
              <text x="90" y="195" fill="#78716c" fontSize="9" fontWeight="bold">Tue</text>
              <text x="170" y="195" fill="#78716c" fontSize="9" fontWeight="bold">Wed</text>
              <text x="250" y="195" fill="#78716c" fontSize="9" fontWeight="bold">Thu</text>
              <text x="330" y="195" fill="#78716c" fontSize="9" fontWeight="bold">Fri</text>
              <text x="410" y="195" fill="#78716c" fontSize="9" fontWeight="bold">Sat</text>
              <text x="490" y="195" fill="#78716c" fontSize="9" fontWeight="bold" textAnchor="end">Sun</text>

              {/* Gradients definitions */}
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4A373" />
                  <stop offset="100%" stopColor="#D4A373" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="w-full h-px bg-stone-100 my-4" />

          {/* Financial summary metrics */}
          <div className="grid grid-cols-3 text-center gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase font-bold text-stone-400">Operating Budget</span>
              <span className="text-sm font-bold text-stone-800">ETB {stats.monthlySales.toLocaleString()}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase font-bold text-stone-400">Total Expenses</span>
              <span className="text-sm font-bold text-red-600">ETB {stats.expensesTotal.toLocaleString()}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase font-bold text-stone-400">Net Profit</span>
              <span className="text-sm font-bold text-emerald-600">ETB {stats.netProfit.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Best-selling Ranked List */}
        <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1 text-[#D4A373]">
              <Coffee size={18} />
              <h3 className="font-display text-lg font-bold text-stone-900">Bestselling Recipes</h3>
            </div>
            <p className="text-[11px] text-stone-400 mb-5">Ranked by weekly orders and customer popularity surveys</p>

            {/* Ranking Progress bars */}
            <div className="flex flex-col gap-4">
              {bestSellers.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-stone-800 truncate flex items-center gap-2">
                      <span className="text-[10px] font-black text-[#1A120B] bg-[#D4A373]/20 rounded-full w-5 h-5 flex items-center justify-center">
                        {idx + 1}
                      </span>
                      {item.name}
                    </span>
                    <span className="text-stone-400 font-medium">{item.count} orders</span>
                  </div>
                  {/* Outer Bar */}
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#D4A373] h-full rounded-full transition-all duration-500" 
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 text-center">
            <span className="text-[10px] font-semibold text-stone-400 italic">
              * Synchronized automatically from checkout terminal sales
            </span>
          </div>
        </div>
      </div>

      {/* Row 3: Alerts and Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Stock Alerts Column */}
        <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-50">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="text-amber-600" size={18} />
              <h3 className="font-display text-base font-bold text-stone-900">Low Stock Indicators</h3>
            </div>
            <span className="text-xs font-bold text-[#1A120B] bg-[#D4A373]/20 px-2.5 py-0.5 rounded-full">
              {lowStockItems.length} alerts
            </span>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs font-semibold text-stone-500">All ingredients are fully stocked!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-stone-800">{item.name}</span>
                    <span className="text-[10px] text-stone-400 font-medium">Min Threshold: {item.minStock} {item.unit}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-stone-700">{item.currentStock} {item.unit}</span>
                    <Badge status={item.status === 'critical' ? 'critical' : item.status === 'out_of_stock' ? 'out_of_stock' : 'low_stock'} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real-time Order Simulator Feed */}
        <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-50">
            <div className="flex items-center gap-1.5">
              <FileText className="text-sky-600" size={18} />
              <h3 className="font-display text-base font-bold text-stone-900">Recent Transactions</h3>
            </div>
            <span className="text-xs text-stone-400 font-medium">{orders.slice(0, 5).length} shown</span>
          </div>

          <div className="flex flex-col gap-3">
            {orders.slice(0, 4).map((ord) => (
              <div key={ord.id} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-stone-900">#{ord.id}</span>
                  <div className="flex flex-col">
                    <span className="font-semibold text-stone-800">{ord.tableNumber}</span>
                    <span className="text-[10px] text-stone-400">{ord.createdAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#1A120B]">{ord.total} ETB</span>
                  <Badge status={ord.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
