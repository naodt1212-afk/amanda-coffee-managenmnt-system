import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { MenuItem, Category } from '../types';
import { Button, Input, Badge, Modal, EmptyState } from '../components/UI';
import { Plus, Search, Edit2, Trash2, Check, X, Camera, Clock } from 'lucide-react';

export const MenuManagement: React.FC = () => {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'sold_out'>('all');

  // Modal control
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formCategory, setFormCategory] = useState<Category>('Coffee');
  const [formImage, setFormImage] = useState('');
  const [formAvailable, setFormAvailable] = useState(true);
  const [formPrepTime, setFormPrepTime] = useState<number>(5);

  // Filter list
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesAvail = availabilityFilter === 'all' || 
                           (availabilityFilter === 'available' ? item.availability : !item.availability);
      return matchesSearch && matchesCategory && matchesAvail;
    });
  }, [menuItems, searchQuery, categoryFilter, availabilityFilter]);

  const handleOpenAdd = () => {
    setFormName('');
    setFormDesc('');
    setFormPrice(90);
    setFormCategory('Coffee');
    setFormImage('https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400');
    setFormAvailable(true);
    setFormPrepTime(4);
    setIsAddOpen(true);
  };

  const handleConfirmAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || formPrice <= 0) {
      showToast('Please specify a valid name and price', 'error');
      return;
    }
    addMenuItem({
      name: formName,
      description: formDesc,
      price: formPrice,
      category: formCategory,
      image: formImage || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400',
      availability: formAvailable,
      preparationTime: formPrepTime
    });
    setIsAddOpen(false);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setSelectedItem(item);
    setFormName(item.name);
    setFormDesc(item.description);
    setFormPrice(item.price);
    setFormCategory(item.category);
    setFormImage(item.image);
    setFormAvailable(item.availability);
    setFormPrepTime(item.preparationTime || 5);
    setIsEditOpen(true);
  };

  const handleConfirmEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    updateMenuItem(selectedItem.id, {
      name: formName,
      description: formDesc,
      price: formPrice,
      category: formCategory,
      image: formImage,
      availability: formAvailable,
      preparationTime: formPrepTime
    });
    setIsEditOpen(false);
    setSelectedItem(null);
  };

  const handleOpenDelete = (item: MenuItem) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedItem) {
      deleteMenuItem(selectedItem.id);
      setIsDeleteOpen(false);
      setSelectedItem(null);
    }
  };

  const handleToggleAvailability = (item: MenuItem) => {
    updateMenuItem(item.id, { availability: !item.availability });
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-stone-900">Menu Management</h1>
          <p className="text-xs text-stone-400 mt-1">Configure item pricing, descriptions, categorizations, and real-time stocks</p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenAdd}
          icon={<Plus size={16} />}
          className="self-start sm:self-auto"
        >
          Add New Recipe
        </Button>
      </div>

      {/* POS Filter Controls */}
      <div className="bg-white border border-stone-100 p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center">
        <div className="w-full md:flex-1">
          <Input
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search size={16} />}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* Category Select */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="bg-stone-50 border border-stone-200 text-stone-700 text-xs rounded-lg p-2 focus:outline-none focus:ring-1.5 focus:ring-amber-900"
          >
            <option value="all">All Categories</option>
            <option value="Coffee">Coffee</option>
            <option value="Tea">Tea</option>
            <option value="Juice">Juice</option>
            <option value="Food">Food</option>
            <option value="Soft Drinks">Soft Drinks</option>
          </select>

          {/* Availability Select */}
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value as any)}
            className="bg-stone-50 border border-stone-200 text-stone-700 text-xs rounded-lg p-2 focus:outline-none focus:ring-1.5 focus:ring-amber-900"
          >
            <option value="all">All Stocks</option>
            <option value="available">Available Only</option>
            <option value="sold_out">Sold Out Only</option>
          </select>
        </div>
      </div>

      {/* Table grid of elements */}
      {filteredItems.length === 0 ? (
        <EmptyState
          title="No Recipe Found"
          description="Try clearing your search query or selecting another menu category filter."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100 text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Item Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4 text-center">Prep Time</th>
                  <th className="py-3 px-4 text-center">Availability</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/50 transition">
                    <td className="py-3 px-4">
                      <div className="flex gap-3 items-center">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 relative">
                          <img 
                            src={item.image} 
                            alt="" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              console.error(`Admin menu list image failed to load: ${item.name}`, item.image);
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                if (!parent.querySelector('.image-fallback')) {
                                  const fallback = document.createElement('div');
                                  fallback.className = 'image-fallback absolute inset-0 flex flex-col items-center justify-center bg-stone-100 text-stone-400 text-center';
                                  fallback.innerHTML = `
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-coffee"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h12Z"/><path d="M6 2v2"/><path d="M17 14h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-2"/></svg>
                                  `;
                                  parent.appendChild(fallback);
                                }
                              }
                            }}
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-stone-900 truncate max-w-sm">{item.name}</span>
                          <span className="text-[10px] text-stone-400 font-normal line-clamp-1 mt-0.5">{item.description}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-stone-100 text-stone-600 px-2.5 py-1 rounded-md font-bold">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-amber-900">
                      {item.price} ETB
                    </td>
                    <td className="py-3 px-4 text-center text-stone-500 font-semibold">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} /> {item.preparationTime || 5} mins
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition ${
                          item.availability 
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                      >
                        {item.availability ? 'Available' : 'Sold Out'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 hover:bg-stone-100 text-stone-500 hover:text-stone-800 rounded-lg transition"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(item)}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create New Menu Recipe"
      >
        <form onSubmit={handleConfirmAdd} className="flex flex-col gap-4">
          <Input
            label="Recipe Title"
            placeholder="e.g. Traditional Ginger Coffee"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">Description</label>
            <textarea
              placeholder="Write a tasty item descriptions..."
              rows={2}
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              className="w-full border border-stone-200 rounded-lg p-2.5 text-xs bg-white text-stone-900 focus:outline-none focus:ring-1.5 focus:ring-amber-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (ETB)"
              type="number"
              value={formPrice}
              onChange={(e) => setFormPrice(Number(e.target.value))}
              required
            />
            <Input
              label="Prep Time (mins)"
              type="number"
              value={formPrepTime}
              onChange={(e) => setFormPrepTime(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as Category)}
                className="w-full bg-white text-stone-900 border border-stone-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1.5 focus:ring-amber-900"
              >
                <option value="Coffee">Coffee</option>
                <option value="Tea">Tea</option>
                <option value="Juice">Juice</option>
                <option value="Food">Food</option>
                <option value="Soft Drinks">Soft Drinks</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">Initial Stock Status</label>
              <select
                value={formAvailable ? 'yes' : 'no'}
                onChange={(e) => setFormAvailable(e.target.value === 'yes')}
                className="w-full bg-white text-stone-900 border border-stone-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1.5 focus:ring-amber-900"
              >
                <option value="yes">Available</option>
                <option value="no">Out of stock</option>
              </select>
            </div>
          </div>

          <Input
            label="Display Image URL"
            value={formImage}
            onChange={(e) => setFormImage(e.target.value)}
            icon={<Camera size={14} />}
          />

          <Button type="submit" variant="primary" className="w-full mt-2">
            Confirm & Add to Menu
          </Button>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Modify Menu Recipe"
      >
        <form onSubmit={handleConfirmEdit} className="flex flex-col gap-4">
          <Input
            label="Recipe Title"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">Description</label>
            <textarea
              rows={2}
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              className="w-full border border-stone-200 rounded-lg p-2.5 text-xs bg-white text-stone-900 focus:outline-none focus:ring-1.5 focus:ring-amber-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (ETB)"
              type="number"
              value={formPrice}
              onChange={(e) => setFormPrice(Number(e.target.value))}
              required
            />
            <Input
              label="Prep Time (mins)"
              type="number"
              value={formPrepTime}
              onChange={(e) => setFormPrepTime(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as Category)}
                className="w-full bg-white text-stone-900 border border-stone-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1.5 focus:ring-amber-900"
              >
                <option value="Coffee">Coffee</option>
                <option value="Tea">Tea</option>
                <option value="Juice">Juice</option>
                <option value="Food">Food</option>
                <option value="Soft Drinks">Soft Drinks</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">Availability Status</label>
              <select
                value={formAvailable ? 'yes' : 'no'}
                onChange={(e) => setFormAvailable(e.target.value === 'yes')}
                className="w-full bg-white text-stone-900 border border-stone-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1.5 focus:ring-amber-900"
              >
                <option value="yes">Available</option>
                <option value="no">Out of stock</option>
              </select>
            </div>
          </div>

          <Input
            label="Display Image URL"
            value={formImage}
            onChange={(e) => setFormImage(e.target.value)}
            icon={<Camera size={14} />}
          />

          <Button type="submit" variant="primary" className="w-full mt-2">
            Save Changes
          </Button>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Recipe Removal"
      >
        <div className="flex flex-col gap-4 text-center items-center py-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-full mb-1">
            <Trash2 size={24} />
          </div>
          <p className="text-sm font-semibold text-stone-900">
            Are you sure you want to remove <span className="text-red-600">"{selectedItem?.name}"</span>?
          </p>
          <p className="text-xs text-stone-400 max-w-xs mt-0.5">
            This action is irreversible and will remove this dish from customer-facing QR menu boards immediately.
          </p>
          
          <div className="flex gap-2.5 w-full mt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete} className="flex-1">
              Remove Item
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
