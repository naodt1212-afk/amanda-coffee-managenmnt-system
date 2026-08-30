import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button, Input } from '../components/UI';
import { Settings as SettingsIcon, Coffee, Sparkles, Printer, Globe } from 'lucide-react';

export const Settings: React.FC = () => {
  const { showToast } = useApp();

  const [shopName, setShopName] = useState('AMANDA COFFEE');
  const [address, setAddress] = useState('Bole Road, Addis Ababa, Ethiopia');
  const [tablesCount, setTablesCount] = useState(8);
  const [taxPercent, setTaxPercent] = useState(15);
  const [servicePercent, setServicePercent] = useState(5);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Café settings updated successfully!', 'success');
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-stone-900">Café Settings</h1>
        <p className="text-xs text-stone-400 mt-1">Configure business titles, receipt headers, taxation ratios, and print preferences</p>
      </div>

      <div className="max-w-xl bg-white border border-stone-100 rounded-2xl p-6 shadow-xs">
        <form onSubmit={handleSaveSettings} className="flex flex-col gap-5">
          <div className="flex items-center gap-2 border-b border-stone-50 pb-3 mb-1">
            <SettingsIcon className="text-amber-900" size={18} />
            <h3 className="font-display text-base font-bold text-stone-900">Global POS Configurations</h3>
          </div>

          <Input
            label="Shop Branded Title"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            required
            icon={<Coffee size={14} />}
          />

          <Input
            label="Fiscal Address (Receipt Footer)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            icon={<Globe size={14} />}
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Configured Tables"
              type="number"
              value={tablesCount}
              onChange={(e) => setTablesCount(Number(e.target.value))}
              required
              min={1}
            />
            <Input
              label="VAT Ratio (%)"
              type="number"
              value={taxPercent}
              onChange={(e) => setTaxPercent(Number(e.target.value))}
              required
              min={0}
            />
            <Input
              label="Service charge (%)"
              type="number"
              value={servicePercent}
              onChange={(e) => setServicePercent(Number(e.target.value))}
              required
              min={0}
            />
          </div>

          <div className="w-full h-px bg-stone-100 my-1" />

          <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
            <span className="flex items-center gap-1"><Printer size={14} /> Enable automatic receipt printing</span>
            <input type="checkbox" defaultChecked className="rounded text-amber-950 focus:ring-amber-900 border-stone-300 w-4 h-4" />
          </div>

          <Button type="submit" variant="primary" className="w-full mt-2">
            Save Café Configuration
          </Button>
        </form>
      </div>
    </div>
  );
};
