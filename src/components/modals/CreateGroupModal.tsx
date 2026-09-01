import React, { useState } from 'react';
import {
  X,
  Users,
  Compass,
  Home,
  Briefcase,
  Check,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CreateGroupModal: React.FC = () => {
  const {
    isCreateGroupModalOpen,
    closeCreateGroupModal,
    createGroup,
    users,
    currentUser,
    setCurrentView,
  } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'trip' | 'home' | 'friends' | 'work' | 'other'>('trip');
  const [color, setColor] = useState('#1E88E5');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([currentUser.id]);

  if (!isCreateGroupModalOpen) return null;

  const colorOptions = [
    '#1E88E5', // Blue
    '#22C55E', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
  ];

  const toggleMember = (id: string) => {
    if (id === currentUser.id) return; // Keep current user
    if (selectedMemberIds.includes(id)) {
      setSelectedMemberIds(prev => prev.filter(mId => mId !== id));
    } else {
      setSelectedMemberIds(prev => [...prev, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newGroup = createGroup({
      name: name.trim(),
      description: description.trim() || 'Shared expense group',
      category,
      color,
      iconName: category === 'trip' ? 'Compass' : category === 'home' ? 'Home' : 'Users',
      members: selectedMemberIds,
    });

    closeCreateGroupModal();
    setCurrentView('group-details', newGroup.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#145DA0] to-[#1E88E5] text-white flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-lg tracking-tight">Create New Group</h3>
            <p className="text-xs text-white/80">Add friends, roommates, or travel companions.</p>
          </div>
          <button
            onClick={closeCreateGroupModal}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Group Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Manali Roadtrip 2026"
              required
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Flight tickets, homestay, food and rentals"
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:bg-white focus:outline-none"
              >
                <option value="trip">Trip & Vacation</option>
                <option value="home">Home & Flatmates</option>
                <option value="friends">Friends & Outing</option>
                <option value="work">Work & Team</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Theme Color
              </label>
              <div className="flex items-center gap-1.5 pt-1">
                {colorOptions.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      color === c ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Member Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Initial Members
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {users.map(u => {
                const isSelected = selectedMemberIds.includes(u.id);
                return (
                  <div
                    key={u.id}
                    onClick={() => toggleMember(u.id)}
                    className={`p-2 rounded-xl border flex items-center justify-between gap-2 cursor-pointer text-xs font-semibold ${
                      isSelected
                        ? 'bg-blue-50 border-[#1E88E5] text-[#145DA0]'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover" />
                      <span className="truncate">{u.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#1E88E5] shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeCreateGroupModal}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#1E88E5] hover:bg-[#145DA0] text-white font-extrabold text-xs shadow-md transition-all"
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
