import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Camera,
  Image as ImageIcon,
  FileText,
  Paperclip,
  Trash2,
  Smile,
  Users,
  Download,
  Eye,
  X,
  CheckCheck,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GroupChatMessage } from '../../types';

export const GroupChatView: React.FC = () => {
  const {
    groups,
    users,
    currentUser,
    groupMessages,
    sendGroupMessage,
    deleteGroupMessage,
    selectedGroupId,
    setCurrentView,
  } = useApp();

  const [activeGroupId, setActiveGroupId] = useState<string>(() => {
    return selectedGroupId || (groups.length > 0 ? groups[0].id : '');
  });

  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<{
    url: string;
    name: string;
    type: 'image' | 'pdf' | 'file';
  } | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [previewMedia, setPreviewMedia] = useState<{ url: string; name: string; type: 'image' | 'pdf' | 'file' } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const currentGroup = groups.find(g => g.id === activeGroupId) || groups[0];
  const groupMembers = currentGroup
    ? users.filter(u => currentGroup.members.includes(u.id))
    : [];

  const filteredMessages = groupMessages.filter(
    m => m.groupId === (currentGroup ? currentGroup.id : '')
  );

  useEffect(() => {
    if (selectedGroupId && groups.some(g => g.id === selectedGroupId)) {
      setActiveGroupId(selectedGroupId);
    }
  }, [selectedGroupId, groups]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages.length, activeGroupId]);

  // Camera stream cleanup
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
        setCameraError('Camera not supported on this device.');
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
              console.warn('Chat camera playback notice:', err);
            }
          });
        };
      }
      setIsCameraActive(true);
    } catch (err: any) {
      setCameraError('Camera access denied. You can upload photos/files instead.');
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
      setSelectedFile({
        url: dataUrl,
        name: `Camera_Photo_${new Date().toLocaleTimeString().replace(/:/g, '-')}.jpg`,
        type: 'image',
      });
      stopCameraStream();
    }
  };

  // Image Upload
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedFile({
        url: event.target?.result as string,
        name: file.name,
        type: 'image',
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // PDF / Document Upload
  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedFile({
        url: event.target?.result as string,
        name: file.name,
        type: file.type === 'application/pdf' ? 'pdf' : 'file',
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedFile) return;
    if (!currentGroup) return;

    sendGroupMessage(
      currentGroup.id,
      inputText.trim() || undefined,
      selectedFile || undefined
    );

    setInputText('');
    setSelectedFile(null);
  };

  const quickEmojis = ['👍', '🙌', '💰', '🏖️', '🍕', '🎉', '✈️'];

  return (
    <div id="group-chat-view" className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-4 animate-in fade-in duration-200">
      {/* Left Column: Group Selector */}
      <div className="w-full md:w-80 bg-white rounded-3xl border border-slate-100 shadow-sm p-4 flex flex-col shrink-0 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#1E88E5]" />
            <h3 className="font-black text-slate-800 text-base">Group Chats</h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#1E88E5] text-[11px] font-extrabold">
            {groups.length} Groups
          </span>
        </div>

        {/* Group List */}
        <div className="space-y-2 overflow-y-auto flex-1 pr-1">
          {groups.map(group => {
            const isSelected = group.id === activeGroupId;
            const lastMsg = groupMessages
              .filter(m => m.groupId === group.id)
              .slice(-1)[0];

            return (
              <button
                key={group.id}
                type="button"
                onClick={() => {
                  setActiveGroupId(group.id);
                  stopCameraStream();
                }}
                className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-center gap-3.5 border ${
                  isSelected
                    ? 'bg-blue-50/80 border-[#1E88E5] text-slate-900 shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-600'
                }`}
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm"
                  style={{ backgroundColor: group.color || '#1E88E5' }}
                >
                  {group.name.slice(0, 2).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black truncate text-slate-800">
                      {group.name}
                    </h4>
                    {lastMsg && (
                      <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                        {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {lastMsg ? (
                      <span>
                        <strong className="text-slate-700">{lastMsg.senderName.split(' ')[0]}:</strong>{' '}
                        {lastMsg.text || (lastMsg.fileType === 'image' ? '📷 Photo' : '📄 File')}
                      </span>
                    ) : (
                      'No messages yet. Start chat!'
                    )}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Chat Window */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
        {currentGroup ? (
          <>
            {/* Chat Top Header */}
            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm"
                  style={{ backgroundColor: currentGroup.color || '#1E88E5' }}
                >
                  {currentGroup.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm text-slate-800 tracking-tight truncate">
                    {currentGroup.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold truncate">
                    <Users className="w-3 h-3 text-slate-400" />
                    <span>{groupMembers.map(m => m.name.split(' ')[0]).join(', ')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentView('group-details', currentGroup.id)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-[#1E88E5] text-slate-700 hover:text-[#1E88E5] text-xs font-bold transition-all shadow-xs"
                >
                  Group Ledger & Splits
                </button>
              </div>
            </div>

            {/* Chat Messages Feed */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/40">
              {filteredMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 text-slate-400">
                  <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#1E88E5] flex items-center justify-center shadow-inner">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-700 text-sm">Welcome to {currentGroup.name} Chat!</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      Share bills, upload booking vouchers, discuss split expenses, and send camera receipts to everyone.
                    </p>
                  </div>
                </div>
              ) : (
                filteredMessages.map(msg => {
                  const isMe = msg.senderId === currentUser.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'} group`}
                    >
                      {!isMe && (
                        <img
                          src={msg.senderAvatar}
                          alt={msg.senderName}
                          className="w-7 h-7 rounded-full object-cover shrink-0 shadow-xs border border-white"
                        />
                      )}

                      <div className={`max-w-[78%] sm:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        {!isMe && (
                          <span className="text-[10px] font-bold text-slate-500 ml-1 mb-1">
                            {msg.senderName}
                          </span>
                        )}

                        <div
                          className={`p-3.5 rounded-3xl shadow-sm text-xs leading-relaxed space-y-2 relative ${
                            isMe
                              ? 'bg-gradient-to-r from-[#145DA0] to-[#1E88E5] text-white rounded-br-xs'
                              : 'bg-white border border-slate-100 text-slate-800 rounded-bl-xs'
                          }`}
                        >
                          {/* Attached Photo / PDF inside bubble */}
                          {msg.fileUrl && (
                            <div className="rounded-2xl overflow-hidden bg-black/5 p-1">
                              {msg.fileType === 'image' ? (
                                <img
                                  src={msg.fileUrl}
                                  alt={msg.fileName || 'Shared Image'}
                                  onClick={() => setPreviewMedia({ url: msg.fileUrl!, name: msg.fileName || 'Photo', type: 'image' })}
                                  className="max-h-60 rounded-xl w-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                />
                              ) : (
                                <div className="p-3 bg-white rounded-xl flex items-center justify-between gap-3 text-slate-800">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 font-bold text-[10px]">
                                      PDF
                                    </div>
                                    <span className="text-xs font-bold truncate">
                                      {msg.fileName || 'Attached Document.pdf'}
                                    </span>
                                  </div>
                                  <a
                                    href={msg.fileUrl}
                                    download={msg.fileName || 'document.pdf'}
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0"
                                    title="Download File"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </a>
                                </div>
                              )}
                            </div>
                          )}

                          {msg.text && (
                            <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                          )}

                          <div className={`flex items-center justify-end gap-1 text-[9px] ${isMe ? 'text-white/75' : 'text-slate-400'} pt-0.5`}>
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && <CheckCheck className="w-3 h-3 text-white/90" />}
                          </div>
                        </div>

                        {/* Delete message option for sender */}
                        {isMe && (
                          <button
                            type="button"
                            onClick={() => deleteGroupMessage(msg.id)}
                            className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-400 hover:text-red-600 transition-opacity mt-1 mr-1"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Live Camera Viewfinder Overlay */}
            {isCameraActive && (
              <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col items-center justify-center space-y-3 animate-in slide-in-from-bottom duration-150">
                <div className="relative rounded-2xl overflow-hidden aspect-video max-w-sm w-full bg-black border border-white/20">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={stopCameraStream}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={captureCameraPhoto}
                    className="px-5 py-2 rounded-full bg-[#1E88E5] text-white font-extrabold text-xs flex items-center gap-2 shadow-lg"
                  >
                    <Camera className="w-4 h-4" /> Snap & Attach Photo
                  </button>
                  <button
                    type="button"
                    onClick={stopCameraStream}
                    className="px-4 py-2 rounded-full bg-white/20 text-white font-bold text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Selected File Preview Badge */}
            {selectedFile && !isCameraActive && (
              <div className="px-6 py-2 bg-blue-50/90 border-t border-blue-100 flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2.5 min-w-0">
                  {selectedFile.type === 'image' ? (
                    <img
                      src={selectedFile.url}
                      alt="Attachment Preview"
                      className="w-8 h-8 rounded-lg object-cover border border-blue-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 font-extrabold text-[10px] flex items-center justify-center">
                      PDF
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{selectedFile.name}</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">Attached and ready to send</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Chat Input Bar */}
            <div className="p-4 bg-white border-t border-slate-100 space-y-2">
              {/* Quick Emojis */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {quickEmojis.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setInputText(prev => prev + emoji)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-sm transition-transform active:scale-125"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Hidden File Inputs */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
              <input
                type="file"
                ref={pdfInputRef}
                accept="application/pdf,.pdf,.doc,.docx"
                className="hidden"
                onChange={handlePdfSelect}
              />

              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                {/* Media Attachment Action Buttons */}
                <button
                  type="button"
                  onClick={startCamera}
                  title="Snap Camera Photo"
                  className="p-2.5 rounded-2xl bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-[#1E88E5] transition-colors"
                >
                  <Camera className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach Photo from Gallery"
                  className="p-2.5 rounded-2xl bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-[#1E88E5] transition-colors"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => pdfInputRef.current?.click()}
                  title="Attach PDF or Document"
                  className="p-2.5 rounded-2xl bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-[#1E88E5] transition-colors"
                >
                  <FileText className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder={`Message ${currentGroup.name}...`}
                  className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() && !selectedFile}
                  className="p-3 rounded-2xl bg-[#1E88E5] hover:bg-[#145DA0] disabled:opacity-40 disabled:hover:bg-[#1E88E5] text-white font-black shadow-md shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center p-8 text-center text-slate-400">
            Select a group on the left to start chatting!
          </div>
        )}
      </div>

      {/* Media Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">{previewMedia.name}</h4>
                <p className="text-[11px] text-slate-500 font-medium">Shared in Group Chat</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewMedia(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-auto rounded-2xl bg-slate-50 flex items-center justify-center p-2 border border-slate-200">
              {previewMedia.type === 'image' ? (
                <img
                  src={previewMedia.url}
                  alt={previewMedia.name}
                  className="max-w-full max-h-[55vh] object-contain rounded-xl"
                />
              ) : (
                <div className="p-8 text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">{previewMedia.name}</p>
                  <a
                    href={previewMedia.url}
                    download={previewMedia.name}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E88E5] text-white text-xs font-bold shadow-md hover:bg-[#145DA0] transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download Document
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewMedia(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
