import React from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/UI';
import { Shield, Key, Eye, HelpCircle, Check, Users, Mail, UserCheck } from 'lucide-react';
import { AmandaLogo } from '../components/AmandaLogo';

export const Employees: React.FC = () => {
  const { users } = useApp();

  const permissionList = [
    {
      role: 'Admin',
      desc: 'Owner level with full system administration',
      abilities: ['Full POS access', 'Modify recipe price/availability', 'Full inventory adjusting', 'Read financial report sheets', 'Add/remove staff profiles']
    },
    {
      role: 'Manager',
      desc: 'Oversees daily café floor operations',
      abilities: ['Read analytics metrics', 'Modify recipe price/availability', 'Track raw material stock levels', 'Edit tables layout statuses']
    },
    {
      role: 'Cashier',
      desc: 'Maintains bills checkout and receipts logs',
      abilities: ['View billing queues', 'Confirm custom discounts & cash', 'Print invoices', 'Set table seats occupied']
    },
    {
      role: 'Waiter',
      desc: 'Serves coffee dishes directly to table seats',
      abilities: ['Place customer orders', 'Set table status occupied', 'Get instant alerts when order is prepared']
    },
    {
      role: 'Kitchen (Aster)',
      desc: 'Prepares beverage/food recipe plates',
      abilities: ['Start preparing tickets', 'Mark recipe ready', 'Trigger system-wide server ready alert toasts']
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title */}
      <div>
        <h1 className="font-display text-3xl font-bold text-stone-900">Staff Credentials & Permissions</h1>
        <p className="text-xs text-stone-400 mt-1">Audit access lists, retrieve demo login emails, and inspect role capabilities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Directory columns */}
        <div className="lg:col-span-1 bg-white border border-stone-100 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-1.5 border-b border-stone-50 pb-3">
            <Users className="text-amber-900" size={18} />
            <h3 className="font-display text-base font-bold text-stone-900">Staff Directory ({users.length})</h3>
          </div>

          <div className="flex flex-col gap-4">
            {users.map((item) => (
              <div key={item.id} className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-stone-200 bg-[#2D1B14] flex items-center justify-center p-1.5 flex-shrink-0 shadow-inner">
                  <AmandaLogo variant="icon" className="w-full h-full" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs font-bold text-stone-900 truncate">{item.name}</span>
                    <Badge status={item.role} />
                  </div>
                  <span className="text-[10px] text-stone-400 font-semibold truncate flex items-center gap-1 mt-0.5">
                    <Mail size={10} /> {item.email}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Permissions guidelines */}
        <div className="lg:col-span-2 bg-white border border-stone-100 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-1.5 border-b border-stone-50 pb-3">
            <Shield className="text-sky-650" size={18} />
            <h3 className="font-display text-base font-bold text-stone-900">Role-Based Capabilities (RBAC)</h3>
          </div>

          <div className="flex flex-col gap-5">
            {permissionList.map((perm) => (
              <div key={perm.role} className="flex flex-col md:flex-row md:items-start gap-2.5 md:gap-6 border-b border-stone-50 pb-4 last:border-0 last:pb-0">
                <div className="md:w-1/4">
                  <h4 className="text-xs font-black text-stone-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <UserCheck size={14} className="text-amber-800" /> {perm.role}
                  </h4>
                  <p className="text-[10px] text-stone-400 font-medium mt-1 leading-relaxed">{perm.desc}</p>
                </div>
                
                <div className="md:w-3/4 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {perm.abilities.map((ab, idx) => (
                    <span key={idx} className="text-[11px] text-stone-600 flex items-center gap-1.5 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      {ab}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
