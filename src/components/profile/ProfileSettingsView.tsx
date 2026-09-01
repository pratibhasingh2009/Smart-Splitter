import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Settings,
  Globe,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Mail,
  UserCheck,
  Check,
  GitBranch,
  Target,
  QrCode,
  UserPlus,
  Plus,
  CreditCard,
  Trash2,
  Camera,
  Image as ImageIcon,
  UploadCloud,
  FolderOpen,
  Link as LinkIcon,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CurrencyCode } from '../../types';
import { formatCurrency } from '../../utils/settlementCalculator';
import { QRCodeCanvas } from '../common/QRCodeCanvas';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
];

export const ProfileSettingsView: React.FC = () => {
  const {
    currentUser,
    users,
    switchUser,
    currency,
    setCurrency,
    monthlyBudget,
    setMonthlyBudget,
    updateUserProfile,
    addNewFriend,
    importData,
    resetData,
    exportData,
    openFlowModal,
  } = useApp();

  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [upiId, setUpiId] = useState(currentUser.upiId || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [budgetInput, setBudgetInput] = useState((currentUser.monthlyBudget || monthlyBudget || 25000).toString());
  const [isSaved, setIsSaved] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync inputs whenever the active user or perspective is switched
  useEffect(() => {
    setName(currentUser.name || '');
    setEmail(currentUser.email || '');
    setPhone(currentUser.phone || '');
    setUpiId(currentUser.upiId || '');
    setAvatar(currentUser.avatar || '');
    setBudgetInput((currentUser.monthlyBudget || monthlyBudget || 25000).toString());
    setUploadError(null);
  }, [currentUser, monthlyBudget]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Optimized client-side scaling for crisp avatar and fast cloud sync
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 256;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setAvatar(dataUrl);
          setUploadError(null);
          setShowAvatarPicker(true);
        }
      };
      img.onerror = () => {
        setUploadError('Could not process this image. Please try another photo.');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    // Reset file input so user can re-upload same file if desired
    e.target.value = '';
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrlInput.trim().startsWith('http')) {
      setAvatar(customUrlInput.trim());
      setCustomUrlInput('');
      setShowUrlInput(false);
      setUploadError(null);
    } else {
      setUploadError('Please enter a valid image URL starting with http:// or https://');
    }
  };

  // New friend creator
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [newFriendName, setNewFriendName] = useState('');
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [newFriendPhone, setNewFriendPhone] = useState('');
  const [newFriendUpi, setNewFriendUpi] = useState('');
  const [friendCreatedToast, setFriendCreatedToast] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const b = parseFloat(budgetInput);
    const budgetVal = !isNaN(b) && b > 0 ? b : 25000;

    // Correctly pass current user's ID as 1st argument, and updated object as 2nd argument
    updateUserProfile(currentUser.id, {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      upiId: upiId.trim(),
      avatar,
      monthlyBudget: budgetVal,
    });

    setMonthlyBudget(budgetVal);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleCreateFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFriendName && newFriendEmail) {
      addNewFriend(newFriendName, newFriendEmail, newFriendPhone, newFriendUpi);
      setNewFriendName('');
      setNewFriendEmail('');
      setNewFriendPhone('');
      setNewFriendUpi('');
      setIsAddFriendOpen(false);
      setFriendCreatedToast(true);
      setTimeout(() => setFriendCreatedToast(false), 2500);
    }
  };

  const [dataActionToast, setDataActionToast] = useState<string | null>(null);

  const showDataToast = (msg: string) => {
    setDataActionToast(msg);
    setTimeout(() => setDataActionToast(null), 3000);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const success = importData(text);
          if (success) {
            showDataToast('✅ Data backup imported successfully!');
          } else {
            showDataToast('❌ Invalid backup file format. Please provide a valid JSON file.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const currencies: { code: CurrencyCode; label: string; symbol: string }[] = [
    { code: 'INR', label: 'Indian Rupee (₹)', symbol: '₹' },
    { code: 'USD', label: 'US Dollar ($)', symbol: '$' },
    { code: 'EUR', label: 'Euro (€)', symbol: '€' },
    { code: 'GBP', label: 'British Pound (£)', symbol: '£' },
    { code: 'AED', label: 'UAE Dirham (AED)', symbol: 'AED' },
    { code: 'CAD', label: 'Canadian Dollar (CA$)', symbol: 'CA$' },
  ];

  return (
    <div id="profile-settings-view" className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
          Account & Preferences
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Manage individual profile details, private phone & UPI IDs, personal budget limits, and member accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card Form */}
        <div className="lg:col-span-2 p-6 md:p-8 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <img
                  src={avatar || currentUser.avatar}
                  alt={currentUser.name}
                  className="w-16 h-16 rounded-3xl object-cover ring-4 ring-blue-100 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#1E88E5] text-white hover:bg-[#145DA0] transition-colors shadow-sm cursor-pointer"
                  title="Change Avatar"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">{currentUser.name}</h3>
                <p className="text-xs text-slate-400">{currentUser.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#145DA0] text-[10px] font-extrabold uppercase">
                    Editing: {currentUser.name.split(' ')[0]}
                  </span>
                  <span className="text-[11px] text-slate-500 font-bold">
                    UPI: <span className="text-[#1E88E5]">{currentUser.upiId || 'Not set'}</span>
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className="text-xs font-bold text-[#1E88E5] hover:text-[#145DA0] flex items-center gap-1 self-start sm:self-auto"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              {showAvatarPicker ? 'Hide Avatars' : 'Change Avatar'}
            </button>
          </div>

          {/* Hidden File Input for Device Gallery / Photos */}
          <input
            type="file"
            ref={galleryInputRef}
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />

          {/* Avatar Preset & Gallery Picker */}
          {showAvatarPicker && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 animate-in fade-in space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-800">
                  Select or Upload Profile Picture:
                </span>
                
                {/* Upload Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl bg-[#1E88E5] hover:bg-[#145DA0] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Upload from Gallery / Photos
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
                    {showUrlInput ? 'Cancel URL' : 'Image Link'}
                  </button>
                </div>
              </div>

              {/* Upload Error Notice */}
              {uploadError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <X className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Custom Image URL Input Box */}
              {showUrlInput && (
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 block">
                    Paste Direct Image Web Link (URL):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/my-photo.jpg"
                      value={customUrlInput}
                      onChange={e => setCustomUrlInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCustomUrl}
                      className="px-3 py-1.5 bg-[#1E88E5] hover:bg-[#145DA0] text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}

              {/* Presets Grid */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Or pick from avatars:
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAvatar(preset);
                        setUploadError(null);
                      }}
                      className={`relative rounded-2xl overflow-hidden ring-2 transition-all cursor-pointer ${
                        avatar === preset ? 'ring-[#1E88E5] scale-105 shadow-md' : 'ring-transparent hover:ring-slate-300'
                      }`}
                    >
                      <img src={preset} alt={`Avatar ${idx}`} className="w-12 h-12 object-cover" />
                      {avatar === preset && (
                        <div className="absolute inset-0 bg-[#1E88E5]/30 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            {isSaved && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Profile, UPI ID & Budget targets for {currentUser.name} updated successfully!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-slate-400" />
                  UPI ID (for receiving payments & QR)
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  placeholder="e.g. yourname@oksbi, yourname@paytm"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
                />
              </div>
            </div>

            {/* Monthly Budget Target Setting */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[#1E88E5]" />
                Personal Monthly Spending Target ({currency})
              </label>
              <p className="text-[11px] text-slate-500 mb-2">
                Used in your personal dashboard progress ring to track individual spending limits.
              </p>
              <input
                type="number"
                value={budgetInput}
                onChange={e => setBudgetInput(e.target.value)}
                className="w-full sm:w-48 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
                placeholder="25000"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#1E88E5] hover:bg-[#145DA0] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Save {currentUser.name.split(' ')[0]}'s Settings
              </button>
            </div>
          </form>

          {/* Currency Configuration */}
          <div className="pt-6 border-t border-slate-100">
            <h4 className="font-extrabold text-sm text-slate-800 mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#1E88E5]" />
              Base Display Currency
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              All dashboard metrics, split shares, and settlements will format in this currency.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {currencies.map(c => (
                <button
                  key={c.code}
                  onClick={() => {
                    setCurrency(c.code);
                    updateUserProfile(currentUser.id, { currency: c.code });
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    currency === c.code
                      ? 'bg-blue-50 border-[#1E88E5] text-[#145DA0] font-black ring-1 ring-[#1E88E5]'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-bold'
                  }`}
                >
                  <span className="text-xs block">{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Multi-User Switcher & Data Management */}
        <div className="space-y-6">
          {/* Active User Switcher Box */}
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#1E88E5]" />
                  Perspective Switcher
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select any member to view & customize their individual profile & balances.
                </p>
              </div>
              <button
                onClick={() => setIsAddFriendOpen(true)}
                className="p-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#145DA0] transition-colors cursor-pointer"
                title="Add New Friend"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>

            {friendCreatedToast && (
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Friend added to app!</span>
              </div>
            )}

            {/* Add Friend Form */}
            {isAddFriendOpen && (
              <form onSubmit={handleCreateFriend} className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2.5 animate-in fade-in">
                <span className="text-xs font-bold text-slate-700 block">Add Friend / Roommate:</span>
                <input
                  type="text"
                  placeholder="Friend Name (e.g. Rohan Das)"
                  value={newFriendName}
                  onChange={e => setNewFriendName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 font-semibold"
                  required
                />
                <input
                  type="email"
                  placeholder="Email (e.g. rohan@gmail.com)"
                  value={newFriendEmail}
                  onChange={e => setNewFriendEmail(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 font-semibold"
                  required
                />
                <input
                  type="text"
                  placeholder="Phone (optional, e.g. +91 99887 76655)"
                  value={newFriendPhone}
                  onChange={e => setNewFriendPhone(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 font-semibold"
                />
                <input
                  type="text"
                  placeholder="UPI ID (optional, e.g. rohan@paytm)"
                  value={newFriendUpi}
                  onChange={e => setNewFriendUpi(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 font-semibold"
                />
                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddFriendOpen(false)}
                    className="px-2.5 py-1 text-xs text-slate-500 font-bold hover:bg-slate-200/60 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-xs bg-[#1E88E5] text-white font-bold rounded-lg shadow-sm cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {users.map(u => (
                <button
                  key={u.id}
                  onClick={() => switchUser(u.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer ${
                    currentUser.id === u.id
                      ? 'bg-blue-50 border-[#1E88E5] text-[#145DA0] font-black ring-1 ring-[#1E88E5]'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                    <div className="text-left min-w-0">
                      <span className="text-xs font-bold text-slate-800 block truncate">{u.name}</span>
                      <span className="text-[10px] text-slate-400 truncate block">{u.upiId || u.email}</span>
                    </div>
                  </div>
                  {currentUser.id === u.id && (
                    <span className="text-[10px] bg-[#1E88E5] text-white px-2 py-0.5 rounded-full font-bold">
                      Active
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* My Login QR Code Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4 text-center">
            <div className="flex items-center justify-between text-left">
              <div>
                <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#1E88E5]" />
                  Your Instant Login QR
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Scan this code from any phone/camera to log in instantly.
                </p>
              </div>
            </div>

            <div className="py-2 flex flex-col items-center justify-center">
              <QRCodeCanvas
                value={JSON.stringify({ id: currentUser.id, email: currentUser.email })}
                size={140}
              />
              <div className="mt-3">
                <span className="text-xs font-black text-slate-800 block">{currentUser.name}</span>
                <span className="text-[11px] font-semibold text-slate-400">{currentUser.email}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2">
              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                  JSON.stringify({ id: currentUser.id, email: currentUser.email })
                )}`}
                target="_blank"
                rel="noreferrer"
                download={`QR_Login_${currentUser.name.replace(/\s+/g, '_')}.png`}
                className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#145DA0] text-xs font-extrabold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download QR Code
              </a>
            </div>
          </div>

          {/* Backup & System Reset Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
            <h4 className="font-extrabold text-sm text-slate-800">Data & Backup Center</h4>

            <div className="space-y-2">
              <button
                onClick={() => exportData('json')}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#1E88E5]" />
                Export Full Backup (JSON)
              </button>

              <button
                onClick={() => exportData('csv')}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                Export Expenses (CSV)
              </button>

              {/* Import Backup */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-amber-600" />
                Restore / Import Backup (JSON)
              </button>

              <button
                onClick={openFlowModal}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#145DA0] text-xs font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <GitBranch className="w-4 h-4 text-[#F5B942]" />
                View Page Flow & Architecture
              </button>

              {dataActionToast && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{dataActionToast}</span>
                </div>
              )}

              <button
                onClick={() => {
                  resetData();
                  showDataToast('🔄 Reset back to clean sample dataset!');
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center justify-center gap-2 transition-colors mt-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Sample Dataset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

