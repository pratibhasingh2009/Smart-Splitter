import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Utensils,
  Plane,
  Home,
  ShoppingBag,
  Film,
  Zap,
  ShoppingCart,
  HeartPulse,
  MoreHorizontal,
  Users,
  Check,
  Percent,
  Calculator,
  Calendar,
  FileText,
  Upload,
  Receipt,
  Sparkles,
  Camera,
  Image as ImageIcon,
  FileCode,
  Trash2,
  Eye,
  RefreshCw,
  Download,
  QrCode,
  CreditCard,
  ExternalLink,
  DollarSign,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  ExpenseCategory,
  SplitMode,
  SplitDetail,
  Expense,
} from '../../types';
import {
  CATEGORY_CONFIG,
  formatCurrency,
} from '../../utils/settlementCalculator';
import { QRCodeCanvas } from '../common/QRCodeCanvas';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialGroupId?: string | null;
  editingExpense?: Expense | null;
}

export const AddExpenseModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialGroupId,
  editingExpense,
}) => {
  const {
    groups,
    users,
    currentUser,
    currency,
    addExpense,
    updateExpense,
  } = useApp();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [groupId, setGroupId] = useState<string>('');
  const [paidBy, setPaidBy] = useState<string>(currentUser.id);
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [splitMode, setSplitMode] = useState<SplitMode>('EQUAL');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [customPercentages, setCustomPercentages] = useState<Record<string, number>>({});
  const [customAmounts, setCustomAmounts] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Item Breakdown list (Saman & Price itemization)
  const [itemsList, setItemsList] = useState<{ id: string; name: string; price: string }[]>([]);
  const [showItemizer, setShowItemizer] = useState<boolean>(false);
  const [showPaymentLink, setShowPaymentLink] = useState<boolean>(false);

  // Receipt Attachment States (Camera, Photo, PDF)
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [receiptType, setReceiptType] = useState<'image' | 'pdf'>('image');
  const [receiptName, setReceiptName] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Determine available group and members
  const activeGroup = groups.find(g => g.id === groupId);
  const availableMembers = activeGroup
    ? users.filter(u => activeGroup.members.includes(u.id))
    : users;

  // Initialize or reset form when modal opens or editingExpense changes
  useEffect(() => {
    if (isOpen) {
      if (editingExpense) {
        setTitle(editingExpense.title);
        setAmount(editingExpense.amount.toString());
        setDate(editingExpense.date);
        setGroupId(editingExpense.groupId);
        setPaidBy(editingExpense.paidBy);
        setCategory(editingExpense.category);
        setSplitMode(editingExpense.splitMode);
        setNotes(editingExpense.notes || '');
        setReceiptUrl(editingExpense.receiptUrl || '');
        setReceiptType(editingExpense.receiptType || 'image');
        setReceiptName(editingExpense.receiptName || (editingExpense.receiptUrl ? 'Attached Receipt' : ''));

        const memberIds = editingExpense.splits.map(s => s.memberId);
        setSelectedMembers(memberIds);

        const amounts: Record<string, number> = {};
        const percentages: Record<string, number> = {};
        editingExpense.splits.forEach(s => {
          amounts[s.memberId] = s.amount;
          if (s.percentage !== undefined) percentages[s.memberId] = s.percentage;
        });
        setCustomAmounts(amounts);
        setCustomPercentages(percentages);
      } else {
        const defaultGroupId = initialGroupId || (groups.length > 0 ? groups[0].id : '');
        setGroupId(defaultGroupId);
        const grp = groups.find(g => g.id === defaultGroupId);
        const members = grp ? grp.members : users.map(u => u.id);

        setTitle('');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setPaidBy(currentUser.id);
        setCategory('food');
        setSplitMode('EQUAL');
        setSelectedMembers(members);
        setCustomPercentages({});
        setCustomAmounts({});
        setNotes('');
        setReceiptUrl('');
        setReceiptType('image');
        setReceiptName('');
        setErrorMessage('');
      }
      setIsCameraActive(false);
      setCameraError('');
    }
  }, [isOpen, editingExpense, initialGroupId]);

  // Clean up camera stream if unmounted or closed
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera is not supported on this browser/device.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        video.muted = true;
        video.onloadedmetadata = () => {
          video.play().catch((err) => {
            if (err?.name !== 'AbortError') {
              console.warn('Expense camera playback notice:', err);
            }
          });
        };
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Could not access camera. Please allow camera permissions or upload a photo/PDF instead.');
    }
  };

  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setReceiptUrl(dataUrl);
      setReceiptType('image');
      setReceiptName(`Camera_Receipt_${new Date().toLocaleTimeString().replace(/:/g, '-')}.jpg`);
      stopCameraStream();
    }
  };

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 1200;
        let width = img.width;
        let height = img.height;
        if (width > height && width > MAX_SIZE) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setReceiptUrl(dataUrl);
          setReceiptType('image');
          setReceiptName(file.name);
          setErrorMessage('');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // PDF Document Upload Handler
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Please select a valid PDF document (.pdf).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setReceiptUrl(dataUrl);
      setReceiptType('pdf');
      setReceiptName(file.name);
      setErrorMessage('');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeReceipt = () => {
    setReceiptUrl('');
    setReceiptName('');
    stopCameraStream();
  };

  // Update selected members when group changes
  const handleGroupChange = (newGroupId: string) => {
    setGroupId(newGroupId);
    const grp = groups.find(g => g.id === newGroupId);
    if (grp) {
      setSelectedMembers(grp.members);
    }
  };

  const toggleMemberSelection = (memberId: string) => {
    if (selectedMembers.includes(memberId)) {
      if (selectedMembers.length === 1) {
        setErrorMessage('At least one member must participate in the split.');
        return;
      }
      setSelectedMembers(prev => prev.filter(id => id !== memberId));
    } else {
      setSelectedMembers(prev => [...prev, memberId]);
    }
    setErrorMessage('');
  };

  // Live calculation of splits
  const parsedAmount = parseFloat(amount) || 0;

  const calculateFinalSplits = (): { splits: SplitDetail[]; isValid: boolean; error?: string } => {
    if (parsedAmount <= 0) {
      return { splits: [], isValid: false, error: 'Please enter a valid expense amount.' };
    }
    if (selectedMembers.length === 0) {
      return { splits: [], isValid: false, error: 'Select at least one participant.' };
    }

    if (splitMode === 'EQUAL') {
      const splitCount = selectedMembers.length;
      const baseShare = Math.floor((parsedAmount / splitCount) * 100) / 100;
      const remainder = Math.round((parsedAmount - baseShare * splitCount) * 100) / 100;

      const splits: SplitDetail[] = selectedMembers.map((memberId, idx) => ({
        memberId,
        amount: idx === 0 ? baseShare + remainder : baseShare,
        percentage: Math.round((100 / splitCount) * 10) / 10,
      }));
      return { splits, isValid: true };
    }

    if (splitMode === 'PERCENTAGE') {
      let totalPercent = 0;
      selectedMembers.forEach(m => {
        totalPercent += customPercentages[m] || 0;
      });

      if (Math.abs(totalPercent - 100) > 0.5) {
        return {
          splits: [],
          isValid: false,
          error: `Percentages must add up to 100%. Current total: ${totalPercent}%`,
        };
      }

      const splits: SplitDetail[] = selectedMembers.map(memberId => {
        const p = customPercentages[memberId] || 0;
        const memberAmount = Math.round(((parsedAmount * p) / 100) * 100) / 100;
        return {
          memberId,
          amount: memberAmount,
          percentage: p,
        };
      });
      return { splits, isValid: true };
    }

    if (splitMode === 'CUSTOM') {
      let totalCustom = 0;
      selectedMembers.forEach(m => {
        totalCustom += customAmounts[m] || 0;
      });

      if (Math.abs(totalCustom - parsedAmount) > 1) {
        return {
          splits: [],
          isValid: false,
          error: `Custom amounts (${formatCurrency(totalCustom, currency)}) must equal total (${formatCurrency(parsedAmount, currency)})`,
        };
      }

      const splits: SplitDetail[] = selectedMembers.map(memberId => ({
        memberId,
        amount: customAmounts[memberId] || 0,
      }));
      return { splits, isValid: true };
    }

    return { splits: [], isValid: false, error: 'Unknown split mode' };
  };

  const handlePercentageChange = (memberId: string, val: string) => {
    const num = parseFloat(val) || 0;
    setCustomPercentages(prev => ({ ...prev, [memberId]: num }));
  };

  const handleCustomAmountChange = (memberId: string, val: string) => {
    const num = parseFloat(val) || 0;
    setCustomAmounts(prev => ({ ...prev, [memberId]: num }));
  };

  // Helper to autofill percentages or custom amounts equally
  const handleAutoDistribute = () => {
    if (splitMode === 'PERCENTAGE') {
      const perHead = Math.round(100 / selectedMembers.length);
      const newPerc: Record<string, number> = {};
      selectedMembers.forEach((m, idx) => {
        newPerc[m] = idx === 0 ? 100 - perHead * (selectedMembers.length - 1) : perHead;
      });
      setCustomPercentages(newPerc);
    } else if (splitMode === 'CUSTOM') {
      const base = Math.floor(parsedAmount / selectedMembers.length);
      const rem = parsedAmount - base * selectedMembers.length;
      const newAmts: Record<string, number> = {};
      selectedMembers.forEach((m, idx) => {
        newAmts[m] = idx === 0 ? base + rem : base;
      });
      setCustomAmounts(newAmts);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('Please enter an expense title.');
      return;
    }

    const { splits, isValid, error } = calculateFinalSplits();
    if (!isValid || !splits.length) {
      setErrorMessage(error || 'Invalid split distribution');
      return;
    }

    if (editingExpense) {
      updateExpense(editingExpense.id, {
        title: title.trim(),
        amount: parsedAmount,
        date,
        paidBy,
        groupId,
        category,
        splitMode,
        splits,
        notes: notes.trim(),
        receiptUrl: receiptUrl || undefined,
        receiptType: receiptUrl ? receiptType : undefined,
        receiptName: receiptUrl ? receiptName : undefined,
      });
    } else {
      addExpense({
        title: title.trim(),
        amount: parsedAmount,
        date,
        paidBy,
        groupId: groupId || (groups[0]?.id || 'general'),
        category,
        splitMode,
        splits,
        notes: notes.trim(),
        receiptUrl: receiptUrl || undefined,
        receiptType: receiptUrl ? receiptType : undefined,
        receiptName: receiptUrl ? receiptName : undefined,
      });
    }

    stopCameraStream();
    onClose();
  };

  if (!isOpen) return null;

  const categories: { id: ExpenseCategory; label: string; icon: any }[] = [
    { id: 'food', label: 'Food', icon: Utensils },
    { id: 'travel', label: 'Travel', icon: Plane },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
    { id: 'entertainment', label: 'Entertainment', icon: Film },
    { id: 'rent', label: 'Rent', icon: Home },
    { id: 'utilities', label: 'Utilities', icon: Zap },
    { id: 'groceries', label: 'Groceries', icon: ShoppingCart },
    { id: 'health', label: 'Health', icon: HeartPulse },
    { id: 'others', label: 'Others', icon: MoreHorizontal },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#145DA0] to-[#1E88E5] text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-extrabold text-lg tracking-tight">
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h3>
            <p className="text-xs text-white/80 font-medium">
              Record payments, select members, and split accurately.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 animate-in fade-in">
              {errorMessage}
            </div>
          )}

          {/* Row 1: Title & Amount (matching screenshot) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Expense Title
              </label>
              <input
                id="input-expense-title"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Dinner at Cafe"
                required
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-[#1E88E5] focus:border-[#1E88E5] focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Amount ({currency})
              </label>
              <input
                id="input-expense-amount"
                type="number"
                step="any"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="e.g. 1200"
                required
                min="1"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-[#1E88E5] focus:border-[#1E88E5] focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Row 2: Paid By & Category (matching screenshot) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Paid By
              </label>
              <select
                id="select-expense-payer"
                value={paidBy}
                onChange={e => setPaidBy(e.target.value)}
                className="w-full px-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-[#1E88E5] focus:outline-none"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.id === currentUser.id ? '(You)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Group
              </label>
              <select
                id="select-expense-group"
                value={groupId}
                onChange={e => handleGroupChange(e.target.value)}
                className="w-full px-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-[#1E88E5] focus:outline-none"
              >
                {groups.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.members.length} members)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                id="select-expense-category"
                value={category}
                onChange={e => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-[#1E88E5] focus:outline-none capitalize"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Date & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-[#1E88E5] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Notes / Memo (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Split equally for trip dinner"
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#1E88E5] focus:outline-none"
              />
            </div>
          </div>

          {/* Receipt & Bill Attachments (Camera, Gallery Photo, PDF Document) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#1E88E5]" />
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Receipt / Bill Attachment
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500">
                Camera • Photos • PDF
              </span>
            </div>

            {/* Hidden File Inputs */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <input
              type="file"
              ref={pdfInputRef}
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={handlePdfUpload}
            />

            {/* Camera Viewfinder Stream */}
            {isCameraActive && (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex flex-col items-center justify-center border-2 border-[#1E88E5] shadow-lg animate-in fade-in">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={stopCameraStream}
                    className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={captureCameraPhoto}
                    className="px-5 py-2.5 rounded-full bg-[#1E88E5] hover:bg-[#145DA0] text-white font-extrabold text-xs flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    Capture Snapshot
                  </button>
                  <button
                    type="button"
                    onClick={stopCameraStream}
                    className="px-4 py-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-sm transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {cameraError && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800">
                {cameraError}
              </div>
            )}

            {/* Attached Receipt Preview Card */}
            {receiptUrl ? (
              <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 animate-in fade-in shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  {receiptType === 'image' ? (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 cursor-pointer" onClick={() => setShowPreviewModal(true)}>
                      <img
                        src={receiptUrl}
                        alt="Receipt"
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0 text-rose-600 font-extrabold text-xs">
                      PDF
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {receiptName || (receiptType === 'pdf' ? 'Document.pdf' : 'Receipt Photo')}
                    </p>
                    <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Attached & ready to save
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(true)}
                    className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-[#1E88E5] transition-colors"
                    title="View Receipt"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={removeReceipt}
                    className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Remove Receipt"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Action Buttons: Camera, Gallery Photo, PDF */
              !isCameraActive && (
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-[#1E88E5] hover:bg-blue-50/50 flex flex-col items-center justify-center gap-1.5 transition-all text-slate-700 hover:text-[#1E88E5] group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-50 group-hover:bg-[#1E88E5] group-hover:text-white text-[#1E88E5] flex items-center justify-center transition-colors">
                      <Camera className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-extrabold">Camera Scan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-[#1E88E5] hover:bg-blue-50/50 flex flex-col items-center justify-center gap-1.5 transition-all text-slate-700 hover:text-[#1E88E5] group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white text-emerald-600 flex items-center justify-center transition-colors">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-extrabold">Photo / Gallery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-[#1E88E5] hover:bg-blue-50/50 flex flex-col items-center justify-center gap-1.5 transition-all text-slate-700 hover:text-[#1E88E5] group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-rose-50 group-hover:bg-rose-600 group-hover:text-white text-rose-600 flex items-center justify-center transition-colors">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-extrabold">PDF Document</span>
                  </button>
                </div>
              )
            )}
          </div>

          {/* Item Breakdown (Saman Wise Amount) & Direct Payment Link Section */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowItemizer(!showItemizer)}
                className="flex items-center gap-2 text-xs font-extrabold text-[#1E88E5] hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                {showItemizer ? 'Hide Item-wise Breakdown' : '+ Add Item-wise Breakdown (Saman / Bills)'}
              </button>

              <button
                type="button"
                onClick={() => setShowPaymentLink(!showPaymentLink)}
                className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 hover:underline"
              >
                <QrCode className="w-3.5 h-3.5" />
                {showPaymentLink ? 'Hide Payment Link & QR' : '⚡ Generate Instant UPI Pay Link'}
              </button>
            </div>

            {/* Itemizer Box */}
            {showItemizer && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 animate-in fade-in">
                <p className="text-[11px] font-semibold text-slate-500">
                  Add individual items and their prices. Total amount will auto-calculate:
                </p>

                {itemsList.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Item ${index + 1} (e.g. Groceries / Dinner)`}
                      value={item.name}
                      onChange={(e) => {
                        const updated = [...itemsList];
                        updated[index].name = e.target.value;
                        setItemsList(updated);
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#1E88E5]"
                    />
                    <div className="relative w-28">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                        ₹
                      </span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={item.price}
                        onChange={(e) => {
                          const updated = [...itemsList];
                          updated[index].price = e.target.value;
                          setItemsList(updated);
                          // Auto calculate total
                          const sum = updated.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0);
                          if (sum > 0) setAmount(sum.toString());
                        }}
                        className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-bold text-slate-800 focus:outline-none focus:border-[#1E88E5]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = itemsList.filter((_, i) => i !== index);
                        setItemsList(updated);
                        const sum = updated.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0);
                        if (sum > 0) setAmount(sum.toString());
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setItemsList([...itemsList, { id: Math.random().toString(), name: '', price: '' }]);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#145DA0] text-xs font-bold hover:bg-blue-100 flex items-center gap-1.5"
                  >
                    <Plus className="w-3 h-3" /> Add Another Item
                  </button>

                  {itemsList.length > 0 && (
                    <span className="text-xs font-extrabold text-slate-700">
                      Calculated Total: ₹{itemsList.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Instant Payment Link & QR Generator */}
            {showPaymentLink && (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-slate-800 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-emerald-700" />
                    Direct UPI Payment Link & QR Code
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                    Amount: ₹{amount || '0'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-xl border border-emerald-100">
                  <div className="shrink-0">
                    <QRCodeCanvas
                      value={`upi://pay?pa=hisabkitab@upi&pn=${encodeURIComponent(
                        users.find(u => u.id === paidBy)?.name || 'Payer'
                      )}&am=${amount || '0'}&cu=INR&tn=${encodeURIComponent(title || 'Expense Settlement')}`}
                      size={110}
                    />
                  </div>
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <p className="text-xs font-bold text-slate-800">
                      Scan or tap below to pay directly to {users.find(u => u.id === paidBy)?.name}:
                    </p>
                    <p className="text-[11px] text-slate-500">
                      GPay, PhonePe, Paytm, or BHIM scan karke direct payment kar sakte hain.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
                      <a
                        href={`upi://pay?pa=hisabkitab@upi&pn=${encodeURIComponent(
                          users.find(u => u.id === paidBy)?.name || 'Payer'
                        )}&am=${amount || '0'}&cu=INR`}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-xs"
                      >
                        <ExternalLink className="w-3 h-3" /> Direct Pay via UPI App
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(
                            `upi://pay?pa=hisabkitab@upi&pn=${encodeURIComponent(
                              users.find(u => u.id === paidBy)?.name || 'Payer'
                            )}&am=${amount || '0'}&cu=INR`
                          );
                          alert('UPI Payment Link copied to clipboard!');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                      >
                        Copy Pay Link
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Row 4: Split Between Members (Checkboxes matching screenshot) & Split Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
            {/* Left: Split Between Checkboxes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Split Between
                </label>
                <button
                  type="button"
                  onClick={() => setSelectedMembers(availableMembers.map(m => m.id))}
                  className="text-[11px] font-bold text-[#1E88E5] hover:underline"
                >
                  Select All
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {availableMembers.map(member => {
                  const isChecked = selectedMembers.includes(member.id);
                  return (
                    <div
                      key={member.id}
                      onClick={() => toggleMemberSelection(member.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-blue-50/60 border-[#1E88E5] text-slate-800'
                          : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent div
                          className="w-4 h-4 rounded text-[#1E88E5] focus:ring-[#1E88E5]"
                        />
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-xs font-bold truncate">{member.name}</span>
                      </div>

                      {/* Live Amount Share display */}
                      {isChecked && parsedAmount > 0 && splitMode === 'EQUAL' && (
                        <span className="text-xs font-extrabold text-[#145DA0]">
                          {formatCurrency(parsedAmount / selectedMembers.length, currency)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Split Type (Radio buttons matching screenshot) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Split Type
              </label>

              <div className="space-y-2.5">
                {[
                  { id: 'EQUAL', label: 'Equal Split', desc: 'Split evenly among members' },
                  { id: 'PERCENTAGE', label: 'Percentage Split', desc: 'Set custom percentages (%)' },
                  { id: 'CUSTOM', label: 'Custom Split', desc: 'Set exact exact amounts (₹)' },
                ].map(mode => (
                  <label
                    key={mode.id}
                    className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                      splitMode === mode.id
                        ? 'bg-blue-50 border-[#1E88E5] ring-1 ring-[#1E88E5]'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="splitMode"
                      value={mode.id}
                      checked={splitMode === mode.id}
                      onChange={() => {
                        setSplitMode(mode.id as SplitMode);
                        handleAutoDistribute();
                      }}
                      className="mt-0.5 text-[#1E88E5] focus:ring-[#1E88E5]"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block leading-tight">
                        {mode.label}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">{mode.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Sub-section for Custom / Percentage inputs if active */}
          {(splitMode === 'PERCENTAGE' || splitMode === 'CUSTOM') && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  {splitMode === 'PERCENTAGE' ? 'Enter Percentages (%)' : 'Enter Custom Amounts (₹)'}
                </span>
                <button
                  type="button"
                  onClick={handleAutoDistribute}
                  className="text-xs font-bold text-[#1E88E5] hover:underline"
                >
                  Auto Distribute
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedMembers.map(mId => {
                  const u = users.find(user => user.id === mId);
                  return (
                    <div key={mId} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-amber-200">
                      <span className="text-xs font-bold text-slate-700 truncate flex-1">{u?.name}</span>
                      {splitMode === 'PERCENTAGE' ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={customPercentages[mId] || ''}
                            onChange={e => handlePercentageChange(mId, e.target.value)}
                            placeholder="0"
                            className="w-16 px-2 py-1 text-xs font-bold text-right border rounded-lg"
                          />
                          <span className="text-xs font-bold text-slate-500">%</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-slate-500">{currency}</span>
                          <input
                            type="number"
                            min="0"
                            value={customAmounts[mId] || ''}
                            onChange={e => handleCustomAmountChange(mId, e.target.value)}
                            placeholder="0"
                            className="w-20 px-2 py-1 text-xs font-bold text-right border rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Modal Footer / Save Action (matching screenshot primary button) */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-save-expense"
              type="submit"
              className="px-8 py-3 rounded-2xl bg-[#1E88E5] hover:bg-[#145DA0] text-white font-extrabold text-sm shadow-md shadow-blue-500/25 transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
              {editingExpense ? 'Update Expense' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>

      {/* Full Preview Modal for Receipt */}
      {showPreviewModal && receiptUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">{receiptName || 'Attached Receipt'}</h4>
                <p className="text-[11px] text-slate-500 font-medium">Previewing attached document</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-auto rounded-2xl bg-slate-50 flex items-center justify-center p-2 border border-slate-200">
              {receiptType === 'image' ? (
                <img
                  src={receiptUrl}
                  alt="Receipt Preview"
                  className="max-w-full max-h-[50vh] object-contain rounded-xl shadow-sm"
                />
              ) : (
                <div className="p-8 text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">{receiptName || 'PDF Document'}</p>
                  <a
                    href={receiptUrl}
                    download={receiptName || 'receipt.pdf'}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E88E5] text-white text-xs font-bold shadow-md hover:bg-[#145DA0] transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download / Open PDF
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
