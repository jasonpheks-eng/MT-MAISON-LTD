import React, { useState } from 'react';
import { useBoutique } from '../context/BoutiqueContext';
import {
  X,
  Lock,
  Calendar,
  MessageCircle,
  Image as ImageIcon,
  DollarSign,
  Clock,
  Settings,
  Database,
  CheckCircle,
  AlertCircle,
  Upload,
  RefreshCw,
  LogOut,
  ExternalLink,
  Phone,
  Trash2,
  Plus,
  ShieldCheck,
  FlipHorizontal,
  FlipVertical,
  Sliders,
  Layers,
  RotateCcw,
  Palette,
  Save,
} from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Appointment, ServiceItem, ImageSlots, CalendarTimeSlot, SingleImageConfig } from '../types';
import { processImageFile, removeImageBackground } from '../lib/imageUpload';
import { getImageStyleAndClasses } from '../lib/imageStyle';
import { ExperienceGalleryEditor } from './ExperienceGallery';
import { authenticateCEOForCalendar, syncAppointmentToGoogleCalendar, getCachedCalendarToken } from '../lib/googleCalendar';

export const AdminModal: React.FC = () => {
  const {
    isAdminModalOpen,
    closeAdmin,
    isAdmin,
    verifyPin,
    logoutAdmin,
    appointments,
    updateAppointmentStatus,
    settings,
    updateSettings,
    imageSlots,
    updateImageSlots,
    services,
    updateServices,
    calendarSlots,
    updateCalendarSlots,
    testSupabase,
    isSupabaseActive,
    isConnected,
    adminInitialTab,
    canUndo,
    undoLastChange,
  } = useBoutique();

  // Pin entry state
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<
    'info' | 'colors' | 'images' | 'services' | 'slots' | 'supabase' | 'calendar'
  >('info');

  // Appointments filter
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  // Local state for forms
  const [settingsForm, setSettingsForm] = useState(settings);
  const [imageSlotsForm, setImageSlotsForm] = useState(imageSlots);
  const [servicesList, setServicesList] = useState(services);
  const [slotsList, setSlotsList] = useState<CalendarTimeSlot[]>(calendarSlots);
  const [newSlotTime, setNewSlotTime] = useState('');
  const [newSlotPeriod, setNewSlotPeriod] = useState<'morning' | 'afternoon' | 'evening'>('afternoon');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [supabaseTestResult, setSupabaseTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);

  // Google Calendar Auth State for CEO
  const [isConnectingCalendar, setIsConnectingCalendar] = useState(false);
  const [calendarConnectMsg, setCalendarConnectMsg] = useState('');

  const handleConnectCalendar = async () => {
    setIsConnectingCalendar(true);
    setCalendarConnectMsg('');
    try {
      const result = await authenticateCEOForCalendar();
      if (result) {
        setCalendarConnectMsg('Google Calendar connected successfully!');
        setSettingsForm({ 
          ...settingsForm, 
          calendar_sync_enabled: true,
          ceo_google_email: result.user.email || settingsForm.ceo_google_email
        });
      }
    } catch (err: any) {
      setCalendarConnectMsg(err.message || 'Google Calendar connection failed');
    } finally {
      setIsConnectingCalendar(false);
    }
  };

  // New Treatment Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'nails' | 'lashes' | 'hair'>('nails');
  const [newPrice, setNewPrice] = useState<number>(75);
  const [newDuration, setNewDuration] = useState<number>(60);
  const [newDescription, setNewDescription] = useState('');

  // Sync state when props change (only if modal just opened or settings changed from outside)
  React.useEffect(() => {
    if (isAdminModalOpen) {
      setSettingsForm(settings);
    }
  }, [settings, isAdminModalOpen]);

  React.useEffect(() => {
    setImageSlotsForm(imageSlots);
  }, [imageSlots]);

  React.useEffect(() => {
    setServicesList(services);
  }, [services]);

  React.useEffect(() => {
    setSlotsList(calendarSlots);
  }, [calendarSlots]);

  React.useEffect(() => {
    if (adminInitialTab) {
      setActiveTab(adminInitialTab);
    }
  }, [adminInitialTab, isAdminModalOpen]);

  if (!isAdminModalOpen) return null;

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setPinError('');
    const valid = await verifyPin(pinInput);
    setIsVerifying(false);
    if (!valid) {
      setPinError('Incorrect PIN. (Hint: Love123)');
    } else {
      setPinInput('');
    }
  };

  const handleSaveSettings = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      await updateSettings(settingsForm);
      showSuccessNotice('Boutique & WhatsApp settings updated across all live sessions!');
    } catch {
      alert('Failed to update settings');
    }
  };

  const handleSaveImageSlots = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      await updateImageSlots(imageSlotsForm);
      showSuccessNotice('Image slots updated live!');
    } catch {
      alert('Failed to update images');
    }
  };

  const handleFileUpload = async (slotKey: keyof ImageSlots, file: File) => {
    try {
      const optimized = await processImageFile(file);
      setImageSlotsForm((prev) => ({
        ...prev,
        [slotKey]: optimized,
      }));
      showSuccessNotice(`Slot "${slotKey}" loaded locally. Click "Save & Broadcast" to apply live.`);
    } catch (err) {
      console.error('File upload error:', err);
      alert('Failed to process image file');
    }
  };

  const handleUpdateImageConfig = (
    slotKey: string,
    partialConfig: Partial<SingleImageConfig>
  ) => {
    const currentConfigs = imageSlotsForm.configs || {};
    const updatedSlotConfig = {
      ...(currentConfigs[slotKey] || {}),
      ...partialConfig,
    };
    const newConfigs = {
      ...currentConfigs,
      [slotKey]: updatedSlotConfig,
    };
    const updatedForm = {
      ...imageSlotsForm,
      configs: newConfigs,
    };
    setImageSlotsForm(updatedForm);
  };

  const ImageSlotEditor: React.FC<{
    slotKey: keyof Omit<ImageSlots, 'configs'>;
    label: string;
    defaultAspect: string;
  }> = ({ slotKey, label, defaultAspect }) => {
    const currentUrl = imageSlotsForm[slotKey] as string;
    const config = imageSlotsForm.configs?.[slotKey] || {};
    const previewStyle = getImageStyleAndClasses(slotKey, imageSlotsForm.configs, defaultAspect, 'object-cover');
    const [isDragOver, setIsDragOver] = useState(false);

    const handleAutoEraseBg = async () => {
      try {
        showSuccessNotice(`Keying out background for ${label}...`);
        const transparentPng = await removeImageBackground(currentUrl);
        setImageSlotsForm((prev) => ({
          ...prev,
          [slotKey]: transparentPng,
        }));
        handleUpdateImageConfig(slotKey, { removeBg: true });
        showSuccessNotice(`Background removed locally for ${label}! Click Save to apply.`);
      } catch (err) {
        console.error('BG removal failed:', err);
      }
    };

    return (
      <div
        key={slotKey}
        className={`p-5 rounded-2xl bg-black/40 border transition-all space-y-4 ${isDragOver ? 'border-rose-400 bg-rose-950/20' : 'border-white/10 hover:border-rose-400/30'}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file && file.type.startsWith('image/')) handleFileUpload(slotKey, file);
        }}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-rose-200 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-rose-400" />
            <span>{label}</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800/40">
              Border: {config.borderStyle || 'None'}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800/40">
              Aspect: {config.aspectRatio || 'Default (' + defaultAspect + ')'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
          <div className="sm:col-span-4 flex flex-col items-center gap-2">
            <label className={`w-full max-h-[190px] relative flex items-center justify-center cursor-pointer group/upload overflow-hidden ${previewStyle.containerClasses}`}>
              <img
                src={currentUrl}
                alt={label}
                className={previewStyle.combinedClasses}
                style={previewStyle.style}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/65 opacity-0 group-hover/upload:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 p-2 text-center rounded-2xl backdrop-blur-[2px]">
                <Upload className="w-6 h-6 text-rose-300 animate-bounce" />
                <span className="text-[11px] font-semibold tracking-wide">Click to Upload Image</span>
                <span className="text-[9px] text-rose-200/80">Or drop photo file here</span>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(slotKey, e.target.files[0])}
              />
            </label>
            <span className="text-[10px] text-rose-300/60 font-mono">Live Preview (Click or drop to upload)</span>
          </div>

          <div className="sm:col-span-8 space-y-3">
            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-wider text-rose-200/70">
                Image Source URL / Upload or Drop
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentUrl}
                  onChange={(e) => setImageSlotsForm({ ...imageSlotsForm, [slotKey]: e.target.value })}
                  placeholder="Image URL or path..."
                  className="flex-1 bg-black/50 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white placeholder-rose-200/30 focus:outline-none focus:border-rose-400 font-mono"
                />
                <label className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 shrink-0 text-white">
                  <Upload className="w-3.5 h-3.5 text-rose-300" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(slotKey, e.target.files[0])}
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] uppercase font-mono text-rose-300/70 mb-1">
                  Aspect Ratio
                </label>
                <select
                  value={config.aspectRatio || 'auto'}
                  onChange={(e) => handleUpdateImageConfig(slotKey, { aspectRatio: e.target.value as any })}
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-rose-400 font-mono"
                >
                  <option value="4/5">4:5 (Portrait)</option>
                  <option value="1/1">1:1 (Square)</option>
                  <option value="4/3">4:3 (Landscape)</option>
                  <option value="16/9">16:9 (Wide)</option>
                  <option value="3/4">3:4 (Tall)</option>
                  <option value="auto">Auto / Natural</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-rose-300/70 mb-1">
                  Positioning
                </label>
                <select
                  value={config.position || 'center'}
                  onChange={(e) => handleUpdateImageConfig(slotKey, { position: e.target.value as any })}
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-rose-400 font-mono"
                >
                  <option value="center">Center</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-rose-300/70 mb-1">
                  Object Fit
                </label>
                <select
                  value={config.objectFit || 'cover'}
                  onChange={(e) => handleUpdateImageConfig(slotKey, { objectFit: e.target.value as any })}
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-rose-400 font-mono"
                >
                  <option value="cover">Cover (Fill)</option>
                  <option value="contain">Contain (Fit)</option>
                  <option value="fill">Stretch</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
              <div>
                <label className="block text-[10px] uppercase font-mono text-rose-300/70 mb-1">
                  Border Style (Theme Blended)
                </label>
                <select
                  value={config.borderStyle || 'none'}
                  onChange={(e) => handleUpdateImageConfig(slotKey, { borderStyle: e.target.value as any })}
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-rose-400 font-mono"
                >
                  <option value="none">No Border (Clean)</option>
                  <option value="soft-translucent">Soft Translucent Edges</option>
                  <option value="blend-in">Blend-In Effect Option</option>
                  <option value="ambient-glow">Ambient Rose Glow</option>
                  <option value="glass-card">Frosted Glass Border</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-rose-300/70 mb-1">
                  Corner Shape
                </label>
                <select
                  value={config.cornerStyle || 'rounded'}
                  onChange={(e) => handleUpdateImageConfig(slotKey, { cornerStyle: e.target.value as any })}
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-rose-400 font-mono"
                >
                  <option value="rounded">Rounded Corners (2xl)</option>
                  <option value="pill">Deep Pill Curve (3xl)</option>
                  <option value="full">Circular / Oval (Full)</option>
                  <option value="sharp">Sharp Rectangular (None)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono text-rose-300/70">Zoom Size:</span>
                <input
                  type="range"
                  min="0.8"
                  max="2.2"
                  step="0.1"
                  value={config.scale || 1.0}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    const currentConfigs = imageSlotsForm.configs || {};
                    const updatedSlotConfig = { ...(currentConfigs[slotKey] || {}), scale: val };
                    setImageSlotsForm({
                      ...imageSlotsForm,
                      configs: { ...currentConfigs, [slotKey]: updatedSlotConfig }
                    });
                  }}
                  onMouseUp={(e) => {
                    const val = parseFloat((e.target as HTMLInputElement).value);
                    handleUpdateImageConfig(slotKey, { scale: val });
                  }}
                  onTouchEnd={(e) => {
                    const val = parseFloat((e.target as HTMLInputElement).value);
                    handleUpdateImageConfig(slotKey, { scale: val });
                  }}
                  className="w-20 sm:w-28 accent-[#C45266] cursor-pointer"
                />
                <span className="text-[11px] font-mono text-white font-bold">{Math.round((config.scale || 1.0) * 100)}%</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleUpdateImageConfig(slotKey, { flipH: !config.flipH })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1 transition-all ${
                    config.flipH
                      ? 'bg-[#C45266] text-white font-semibold shadow'
                      : 'bg-white/10 hover:bg-white/20 text-rose-200'
                  }`}
                  title="Flip image horizontally"
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span>Flip H</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateImageConfig(slotKey, { flipV: !config.flipV })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1 transition-all ${
                    config.flipV
                      ? 'bg-[#C45266] text-white font-semibold shadow'
                      : 'bg-white/10 hover:bg-white/20 text-rose-200'
                  }`}
                  title="Flip image vertically"
                >
                  <FlipVertical className="w-3.5 h-3.5" />
                  <span>Flip V</span>
                </button>

                <button
                  type="button"
                  onClick={handleAutoEraseBg}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono bg-emerald-700 hover:bg-emerald-600 text-white font-semibold shadow flex items-center gap-1 transition-all"
                  title="Automatically key out white/light background to transparent PNG"
                >
                  <span>Auto Erase BG</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleSaveServices = async () => {
    try {
      await updateServices(servicesList);
      showSuccessNotice('Service catalog updated across all sessions!');
    } catch {
      alert('Failed to update services');
    }
  };

  const handleAddSlot = async () => {
    if (!newSlotTime.trim()) {
      alert('Please enter a time slot, e.g. 03:30 PM');
      return;
    }
    const cleanTime = newSlotTime.trim();
    if (slotsList.some((s) => s.time.toLowerCase() === cleanTime.toLowerCase())) {
      alert(`A time slot for "${cleanTime}" already exists.`);
      return;
    }
    const newSlot: CalendarTimeSlot = {
      time: cleanTime,
      period: newSlotPeriod,
      is_available: true,
    };
    const updated = [...slotsList, newSlot];
    setSlotsList(updated);
    try {
      await updateCalendarSlots(updated);
      setNewSlotTime('');
      showSuccessNotice(`Added new time slot "${newSlot.time}"!`);
    } catch {
      alert('Failed to save new time slot');
    }
  };

  const handleDeleteSlot = async (index: number) => {
    const slotToDelete = slotsList[index];
    const updated = slotsList.filter((_, i) => i !== index);
    setSlotsList(updated);
    try {
      await updateCalendarSlots(updated);
      showSuccessNotice(`Removed time slot "${slotToDelete.time}"`);
    } catch {
      console.error('Failed to delete time slot');
    }
  };

  const handleUpdateSlotField = (index: number, partial: Partial<CalendarTimeSlot>) => {
    const updated = [...slotsList];
    updated[index] = { ...updated[index], ...partial };
    setSlotsList(updated);
  };

  const handleSaveAllSlots = async () => {
    try {
      await updateCalendarSlots(slotsList);
      showSuccessNotice('All time slots updated and synchronized live!');
    } catch {
      console.error('Failed to update calendar slots');
    }
  };

  const handleResetDefaultSlots = async () => {
    const defaultSlots: CalendarTimeSlot[] = [
      { time: '10:00 AM', period: 'morning', is_available: true },
      { time: '11:30 AM', period: 'morning', is_available: true },
      { time: '01:00 PM', period: 'afternoon', is_available: true },
      { time: '02:30 PM', period: 'afternoon', is_available: true },
      { time: '04:00 PM', period: 'afternoon', is_available: true },
      { time: '05:30 PM', period: 'evening', is_available: true },
      { time: '07:00 PM', period: 'evening', is_available: true },
    ];
    setSlotsList(defaultSlots);
    try {
      await updateCalendarSlots(defaultSlots);
      showSuccessNotice('Reset slots to standard boutique schedule!');
    } catch {
      console.error('Failed to reset time slots');
    }
  };

  const showSuccessNotice = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const handleGlobalSave = () => {
    switch (activeTab) {
      case 'info':
      case 'colors':
      case 'calendar':
      case 'supabase':
        handleSaveSettings();
        break;
      case 'images':
        handleSaveImageSlots();
        break;
      case 'services':
        handleSaveServices();
        break;
      case 'slots':
        handleSaveAllSlots();
        break;
      default:
        break;
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (statusFilter === 'all') return true;
    return apt.status === statusFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#220B19] text-white rounded-3xl border border-rose-400/30 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-rose-950/60 bg-[#1B0813] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C45266] text-white flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[11px] text-rose-300">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>{isConnected ? 'Real-Time Sync Active' : 'Offline'}</span>
                {isSupabaseActive && (
                  <span className="text-emerald-300 font-mono">· Supabase Postgres Changes Connected</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <button
                  onClick={handleGlobalSave}
                  className="px-3 py-1.5 rounded-full bg-[#C45266] hover:bg-[#b04356] text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow cursor-pointer border border-white/10"
                  title="Save changes in current tab"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Save Changes</span>
                </button>

                <button
                  onClick={async () => {
                    const undone = await undoLastChange();
                    if (undone) {
                      showSuccessNotice('Reverted last admin change!');
                    }
                  }}
                  disabled={!canUndo}
                  className={`px-3 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-all ${
                    canUndo
                      ? 'bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 border-amber-400/40 cursor-pointer shadow'
                      : 'bg-white/5 text-white/30 border-white/10 cursor-not-allowed opacity-50'
                  }`}
                  title="Undo previous admin action"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Undo Last Change</span>
                </button>

                <button
                  onClick={logoutAdmin}
                  className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs text-rose-200 flex items-center gap-1.5 transition-colors"
                  title="Lock Session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
            <button
              onClick={closeAdmin}
              className="p-2 text-rose-300 hover:text-white bg-white/10 rounded-full transition-colors"
              aria-label="Close portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {!isAdmin ? (
          /* PIN Verification Gate */
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto my-auto space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#C45266]/20 text-rose-300 border border-rose-400/40 flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-editorial text-3xl text-white">Staff Authentication</h3>
              <p className="text-xs text-rose-200/80 mt-1">
                Enter your boutique security PIN to access appointment bookings and live settings.
              </p>
            </div>

            {pinError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{pinError}</span>
              </div>
            )}

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <input
                type="password"
                required
                autoFocus
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter PIN (Love123)"
                className="w-full text-center tracking-[0.4em] font-mono text-xl bg-black/40 border border-white/20 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
              />

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3.5 rounded-full bg-[#C45266] hover:bg-[#b04356] text-white font-medium text-sm transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>{isVerifying ? 'Checking...' : 'Unlock Management Panel'}</span>
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Tabs */}
            {/* Mobile Tab Selector */}
            <div className="md:hidden px-4 py-3 border-b border-rose-950/60 bg-[#180711] shrink-0">
              <label className="block text-[10px] uppercase tracking-widest text-rose-300/50 mb-1.5 px-1 font-semibold">
                Management Section
              </label>
              <select 
                value={activeTab} 
                onChange={(e) => setActiveTab(e.target.value as any)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-400 font-medium appearance-none shadow-inner"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23ea297e\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25rem' }}
              >
                <option value="info">Boutique Information</option>
                <option value="colors">Theme & Colors</option>
                <option value="images">Logo & Boutique Images</option>
                <option value="services">Services & Prices</option>
                <option value="slots">Calendar Slots</option>
                <option value="calendar">Google Calendar</option>
                <option value="supabase">Supabase Sync</option>
              </select>
            </div>

            {/* Desktop Sidebar Tabs */}
            <div className="hidden md:flex w-56 bg-[#180711] border-r border-rose-950/60 p-4 flex-col gap-1 shrink-0">

              <button
                onClick={() => setActiveTab('info')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all ${
                  activeTab === 'info'
                    ? 'bg-[#C45266] text-white shadow-md'
                    : 'text-rose-200/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Boutique Info</span>
              </button>

              <button
                onClick={() => setActiveTab('colors')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all ${
                  activeTab === 'colors'
                    ? 'bg-[#C45266] text-white shadow-md'
                    : 'text-rose-200/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Palette className="w-4 h-4" />
                <span>Theme & Colors</span>
              </button>

              <button
                onClick={() => setActiveTab('images')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all ${
                  activeTab === 'images'
                    ? 'bg-[#C45266] text-white shadow-md'
                    : 'text-rose-200/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Logo & Images</span>
              </button>

              <button
                onClick={() => setActiveTab('services')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all ${
                  activeTab === 'services'
                    ? 'bg-[#C45266] text-white shadow-md'
                    : 'text-rose-200/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Services & Prices</span>
              </button>

              <button
                onClick={() => setActiveTab('slots')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all ${
                  activeTab === 'slots'
                    ? 'bg-[#C45266] text-white shadow-md'
                    : 'text-rose-200/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Calendar Slots</span>
              </button>

              <button
                onClick={() => setActiveTab('calendar')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all ${
                  activeTab === 'calendar'
                    ? 'bg-[#C45266] text-white shadow-md'
                    : 'text-rose-200/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Google Calendar</span>
              </button>

              <button
                onClick={() => setActiveTab('supabase')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all ${
                  activeTab === 'supabase'
                    ? 'bg-[#C45266] text-white shadow-md'
                    : 'text-rose-200/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Supabase Sync</span>
              </button>
            </div>

            {/* Main Panel Content */}
            <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
              
              {saveSuccessMsg && (
                <div className="mb-6 p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}



              {/* TAB 1: BOUTIQUE INFO & CONTACT */}
              {activeTab === 'info' && (
                <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
                  <div>
                    <h3 className="font-editorial text-2xl text-white">Boutique Information</h3>
                    <p className="text-xs text-rose-200/60 mt-0.5">Manage your public contact details, hours, and default WhatsApp messaging.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-rose-200 mb-1 font-medium">
                        Boutique WhatsApp Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={settingsForm.whatsapp_number}
                        onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_number: e.target.value })}
                        placeholder="+1 (555) 382-9014"
                        className="w-full bg-black/40 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-rose-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-rose-200 mb-1 font-medium">
                        Boutique Name
                      </label>
                      <input
                        type="text"
                        value={settingsForm.boutique_name}
                        onChange={(e) => setSettingsForm({ ...settingsForm, boutique_name: e.target.value })}
                        className="w-full bg-black/40 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-rose-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-rose-200 mb-1 font-medium">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={settingsForm.address}
                        onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                        className="w-full bg-black/40 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-rose-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-rose-200 mb-1 font-medium">
                        City / Region
                      </label>
                      <input
                        type="text"
                        value={settingsForm.city_region}
                        onChange={(e) => setSettingsForm({ ...settingsForm, city_region: e.target.value })}
                        className="w-full bg-black/40 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-rose-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-rose-200 mb-1 font-medium">
                        Currency Symbol
                      </label>
                      <input
                        type="text"
                        value={settingsForm.currency_symbol || 'MWK'}
                        onChange={(e) => setSettingsForm({ ...settingsForm, currency_symbol: e.target.value })}
                        placeholder="MWK"
                        className="w-full bg-black/40 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-rose-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-rose-200 mb-1 font-medium">
                        Currency Code
                      </label>
                      <input
                        type="text"
                        value={settingsForm.currency_code || 'MWK'}
                        onChange={(e) => setSettingsForm({ ...settingsForm, currency_code: e.target.value.toUpperCase() })}
                        placeholder="MWK"
                        className="w-full bg-black/40 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-rose-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-rose-200 mb-1 font-medium">
                      Opening Hours
                    </label>
                    <input
                      type="text"
                      value={settingsForm.opening_hours}
                      onChange={(e) => setSettingsForm({ ...settingsForm, opening_hours: e.target.value })}
                      className="w-full bg-black/40 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-rose-200 mb-1 font-medium">
                      Default WhatsApp Message
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.whatsapp_default_message}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_default_message: e.target.value })}
                      className="w-full bg-black/40 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  <div className="pt-2 border-t border-white/10 space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-300">
                      Social Presence
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-rose-200/80 mb-1">
                          Instagram
                        </label>
                        <input
                          type="url"
                          value={settingsForm.instagram_url}
                          onChange={(e) => setSettingsForm({ ...settingsForm, instagram_url: e.target.value })}
                          className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-rose-200/80 mb-1">
                          TikTok
                        </label>
                        <input
                          type="url"
                          value={settingsForm.tiktok_url}
                          onChange={(e) => setSettingsForm({ ...settingsForm, tiktok_url: e.target.value })}
                          className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-rose-200/80 mb-1">
                          Pinterest
                        </label>
                        <input
                          type="url"
                          value={settingsForm.pinterest_url}
                          onChange={(e) => setSettingsForm({ ...settingsForm, pinterest_url: e.target.value })}
                          className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {/* TAB: THEME & SECTION COLORS */}
              {activeTab === 'colors' && (
                <form onSubmit={handleSaveSettings} className="space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-editorial text-2xl sm:text-3xl text-white flex items-center gap-2">
                        <Palette className="w-6 h-6 text-rose-400" />
                        <span>Section & Page Color Customizer</span>
                      </h3>
                      <p className="text-xs text-rose-200/70 mt-1">
                        Change background and text colors for each individual section on your site. Broadcasts live across all open visitor sessions.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setSettingsForm({
                            ...settingsForm,
                            hero_bg_color: '#701932',
                            hero_accent_color: '#ea297e',
                            navbar_bg_color: '#000000',
                            navbar_text_color: '#ea297e',
                            details_bg_color: '#501D2C',
                            details_text_color: '#E5B8C0',
                            services_bg_color: '#501D2C',
                            services_card_bg_color: '#3B1622',
                            booking_bg_color: '#5b0827',
                            booking_card_bg_color: '#2E1222',
                            booking_accent_color: '#C45266',
                            about_bg_color: '#240F1B',
                            about_text_color: '#FBF8F6',
                            experiences_bg_color: '#180711',
                            footer_bg_color: '#1A0A13',
                            footer_text_color: '#FBF8F6',
                          });
                          showSuccessNotice('Reset all section colors to signature luxury defaults!');
                        }}
                        className="px-3.5 py-2 rounded-xl border border-white/20 hover:bg-white/10 text-rose-200 text-xs font-medium transition-all"
                        title="Reset to default theme palette"
                      >
                        Reset Defaults
                      </button>
                    </div>
                  </div>

                  {/* Preset Theme Quick Switcher */}
                  <div className="p-5 rounded-2xl bg-black/40 border border-rose-400/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-rose-200 font-semibold flex items-center gap-2">
                        <Palette className="w-4 h-4 text-rose-400" />
                        <span>One-Click Curated Theme Palettes</span>
                      </span>
                      <span className="text-[11px] text-rose-300/60 font-mono">Select a preset to update all sections</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      {[
                        {
                          name: 'Signature Burgundy',
                          heroBg: '#701932',
                          heroAccent: '#ea297e',
                          navBg: '#000000',
                          navText: '#ea297e',
                          detailsBg: '#501D2C',
                          detailsText: '#E5B8C0',
                          servicesBg: '#501D2C',
                          servicesCard: '#3B1622',
                          bookingBg: '#5b0827',
                          bookingCard: '#2E1222',
                          bookingAccent: '#C45266',
                          aboutBg: '#240F1B',
                          aboutText: '#FBF8F6',
                          expBg: '#180711',
                          footerBg: '#1A0A13',
                          footerText: '#FBF8F6',
                        },
                        {
                          name: 'Midnight Noir',
                          heroBg: '#0A0A0A',
                          heroAccent: '#D4AF37',
                          navBg: '#000000',
                          navText: '#D4AF37',
                          detailsBg: '#141414',
                          detailsText: '#F3E5AB',
                          servicesBg: '#141414',
                          servicesCard: '#222222',
                          bookingBg: '#1A1A1A',
                          bookingCard: '#2B2B2B',
                          bookingAccent: '#D4AF37',
                          aboutBg: '#111111',
                          aboutText: '#F5F5F5',
                          expBg: '#0A0A0A',
                          footerBg: '#050505',
                          footerText: '#CCCCCC',
                        },
                        {
                          name: 'Velvet Rose',
                          heroBg: '#4A1525',
                          heroAccent: '#F49AC2',
                          navBg: '#1F0710',
                          navText: '#F49AC2',
                          detailsBg: '#38101C',
                          detailsText: '#FFC0CB',
                          servicesBg: '#38101C',
                          servicesCard: '#471524',
                          bookingBg: '#471524',
                          bookingCard: '#5A1B2E',
                          bookingAccent: '#F49AC2',
                          aboutBg: '#2A0A14',
                          aboutText: '#FFF0F5',
                          expBg: '#220710',
                          footerBg: '#1A050D',
                          footerText: '#FFC0CB',
                        },
                        {
                          name: 'Emerald Atelier',
                          heroBg: '#0D2B22',
                          heroAccent: '#50E3C2',
                          navBg: '#051410',
                          navText: '#50E3C2',
                          detailsBg: '#0A241C',
                          detailsText: '#A8F0E0',
                          servicesBg: '#0A241C',
                          servicesCard: '#133D30',
                          bookingBg: '#0F3329',
                          bookingCard: '#17473A',
                          bookingAccent: '#50E3C2',
                          aboutBg: '#071C16',
                          aboutText: '#F0FFF8',
                          expBg: '#051410',
                          footerBg: '#030C0A',
                          footerText: '#A8F0E0',
                        },
                        {
                          name: 'Deep Plum & Gold',
                          heroBg: '#2D122D',
                          heroAccent: '#FFD700',
                          navBg: '#170717',
                          navText: '#FFD700',
                          detailsBg: '#260E26',
                          detailsText: '#FFE87C',
                          servicesBg: '#260E26',
                          servicesCard: '#3A183A',
                          bookingBg: '#331433',
                          bookingCard: '#451D45',
                          bookingAccent: '#FFD700',
                          aboutBg: '#1F0A1F',
                          aboutText: '#FFF5FF',
                          expBg: '#150515',
                          footerBg: '#0F030F',
                          footerText: '#FFE87C',
                        },
                        {
                          name: 'Ocean Noir',
                          heroBg: '#0D1B2A',
                          heroAccent: '#48CAE4',
                          navBg: '#050C14',
                          navText: '#48CAE4',
                          detailsBg: '#0B1724',
                          detailsText: '#90E0EF',
                          servicesBg: '#0B1724',
                          servicesCard: '#1B263B',
                          bookingBg: '#1B263B',
                          bookingCard: '#293B57',
                          bookingAccent: '#48CAE4',
                          aboutBg: '#08101A',
                          aboutText: '#EDF6F9',
                          expBg: '#04080D',
                          footerBg: '#020406',
                          footerText: '#90E0EF',
                        },
                        {
                          name: 'Champagne & Pearl',
                          heroBg: '#F5F1E9',
                          heroAccent: '#D4AF37',
                          navBg: '#FFFFFF',
                          navText: '#D4AF37',
                          detailsBg: '#E9E4D9',
                          detailsText: '#A68B31',
                          servicesBg: '#E9E4D9',
                          servicesCard: '#F5F1E9',
                          bookingBg: '#F5F1E9',
                          bookingCard: '#FFFFFF',
                          bookingAccent: '#D4AF37',
                          aboutBg: '#F5F1E9',
                          aboutText: '#8C7326',
                          expBg: '#F5F1E9',
                          footerBg: '#E9E4D9',
                          footerText: '#8C7326',
                        },
                        {
                          name: 'Midnight Sapphire',
                          heroBg: '#001233',
                          heroAccent: '#33A1FD',
                          navBg: '#000814',
                          navText: '#33A1FD',
                          detailsBg: '#001D3D',
                          detailsText: '#90E0EF',
                          servicesBg: '#001D3D',
                          servicesCard: '#003566',
                          bookingBg: '#003566',
                          bookingCard: '#001D3D',
                          bookingAccent: '#FFC300',
                          aboutBg: '#001233',
                          aboutText: '#90E0EF',
                          expBg: '#000814',
                          footerBg: '#000814',
                          footerText: '#90E0EF',
                        },
                        {
                          name: 'Dusty Rose & Gold',
                          heroBg: '#8E6C88',
                          heroAccent: '#E5B8C0',
                          navBg: '#2D142C',
                          navText: '#E5B8C0',
                          detailsBg: '#522E38',
                          detailsText: '#F7EBEB',
                          servicesBg: '#522E38',
                          servicesCard: '#815854',
                          bookingBg: '#815854',
                          bookingCard: '#522E38',
                          bookingAccent: '#E5B8C0',
                          aboutBg: '#8E6C88',
                          aboutText: '#F7EBEB',
                          expBg: '#2D142C',
                          footerBg: '#2D142C',
                          footerText: '#F7EBEB',
                        },
                        {
                          name: 'Tuscan Olive',
                          heroBg: '#3E442B',
                          heroAccent: '#D4AF37',
                          navBg: '#2D311E',
                          navText: '#D4AF37',
                          detailsBg: '#606C38',
                          detailsText: '#FEFAE0',
                          servicesBg: '#606C38',
                          servicesCard: '#283618',
                          bookingBg: '#283618',
                          bookingCard: '#606C38',
                          bookingAccent: '#DDA15E',
                          aboutBg: '#3E442B',
                          aboutText: '#FEFAE0',
                          expBg: '#283618',
                          footerBg: '#1A1F13',
                          footerText: '#FEFAE0',
                        },
                        {
                          name: 'Modern Slate',
                          heroBg: '#333533',
                          heroAccent: '#F5CB5C',
                          navBg: '#202020',
                          navText: '#F5CB5C',
                          detailsBg: '#242424',
                          detailsText: '#CFDBD5',
                          servicesBg: '#242424',
                          servicesCard: '#333533',
                          bookingBg: '#333533',
                          bookingCard: '#242424',
                          bookingAccent: '#F5CB5C',
                          aboutBg: '#333533',
                          aboutText: '#CFDBD5',
                          expBg: '#202020',
                          footerBg: '#202020',
                          footerText: '#CFDBD5',
                        },
                        {
                          name: 'Royal Amethyst',
                          heroBg: '#432371',
                          heroAccent: '#FAAE7B',
                          navBg: '#220B19',
                          navText: '#FAAE7B',
                          detailsBg: '#4A154B',
                          detailsText: '#E0E1DD',
                          servicesBg: '#4A154B',
                          servicesCard: '#220B19',
                          bookingBg: '#220B19',
                          bookingCard: '#4A154B',
                          bookingAccent: '#FAAE7B',
                          aboutBg: '#432371',
                          aboutText: '#E0E1DD',
                          expBg: '#220B19',
                          footerBg: '#1A0A13',
                          footerText: '#E0E1DD',
                        },
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            setSettingsForm({
                              ...settingsForm,
                              hero_bg_color: preset.heroBg,
                              hero_accent_color: preset.heroAccent,
                              navbar_bg_color: preset.navBg,
                              navbar_text_color: preset.navText,
                              details_bg_color: preset.detailsBg,
                              details_text_color: preset.detailsText,
                              services_bg_color: preset.servicesBg,
                              services_card_bg_color: preset.servicesCard,
                              booking_bg_color: preset.bookingBg,
                              booking_card_bg_color: preset.bookingCard,
                              booking_accent_color: preset.bookingAccent,
                              about_bg_color: preset.aboutBg,
                              about_text_color: preset.footerText,
                              experiences_bg_color: preset.expBg,
                              footer_bg_color: preset.footerBg,
                              footer_text_color: preset.footerText,
                            });
                            showSuccessNotice(`Applied "${preset.name}" palette! Click Save to apply.`);
                          }}
                          className="p-3 rounded-xl bg-black/50 border border-white/10 hover:border-rose-400/50 transition-all text-left group hover:scale-[1.02]"
                        >
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="w-3.5 h-3.5 rounded-full border border-white/30" style={{ backgroundColor: preset.heroBg }} />
                            <div className="w-3.5 h-3.5 rounded-full border border-white/30" style={{ backgroundColor: preset.heroAccent }} />
                            <div className="w-3.5 h-3.5 rounded-full border border-white/30" style={{ backgroundColor: preset.bookingBg }} />
                          </div>
                          <span className="block text-xs font-semibold text-white group-hover:text-rose-200 transition-colors">
                            {preset.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Section-by-Section Color Control Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Section 1: Header / Navbar */}
                    <div className="p-5 rounded-2xl bg-black/40 border border-white/10 hover:border-rose-400/30 transition-all space-y-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-rose-200 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-rose-400" />
                          <span>1. Navigation Header Bar</span>
                        </label>
                        <span className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: settingsForm.navbar_bg_color || '#000000' }} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-rose-200/70 mb-1">
                            Header Background Color
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={settingsForm.navbar_bg_color || '#000000'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, navbar_bg_color: e.target.value })}
                              className="w-10 h-9 rounded-lg bg-black/40 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                            />
                            <input
                              type="text"
                              value={settingsForm.navbar_bg_color || '#000000'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, navbar_bg_color: e.target.value })}
                              className="flex-1 bg-black/50 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-rose-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-rose-200/70 mb-1">
                            Nav Links & Accent Color
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={settingsForm.navbar_text_color || '#ea297e'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, navbar_text_color: e.target.value })}
                              className="w-10 h-9 rounded-lg bg-black/40 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                            />
                            <input
                              type="text"
                              value={settingsForm.navbar_text_color || '#ea297e'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, navbar_text_color: e.target.value })}
                              className="flex-1 bg-black/50 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-rose-400"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Hero Introduction Banner */}
                    <div className="p-5 rounded-2xl bg-black/40 border border-white/10 hover:border-rose-400/30 transition-all space-y-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-rose-200 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-rose-400" />
                          <span>2. Hero Banner Section</span>
                        </label>
                        <span className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: settingsForm.hero_bg_color || '#701932' }} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-rose-200/70 mb-1">
                            Hero Background Color
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={settingsForm.hero_bg_color || '#701932'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, hero_bg_color: e.target.value })}
                              className="w-10 h-9 rounded-lg bg-black/40 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                            />
                            <input
                              type="text"
                              value={settingsForm.hero_bg_color || '#701932'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, hero_bg_color: e.target.value })}
                              className="flex-1 bg-black/50 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-rose-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-rose-200/70 mb-1">
                            Hero Title Highlight Color
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={settingsForm.hero_accent_color || '#ea297e'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, hero_accent_color: e.target.value })}
                              className="w-10 h-9 rounded-lg bg-black/40 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                            />
                            <input
                              type="text"
                              value={settingsForm.hero_accent_color || '#ea297e'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, hero_accent_color: e.target.value })}
                              className="flex-1 bg-black/50 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-rose-400"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Details Ribbon */}
                    <div className="p-5 rounded-2xl bg-black/40 border border-white/10 hover:border-rose-400/30 transition-all space-y-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-rose-200 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-rose-400" />
                          <span>3. Details Marquee Ribbon</span>
                        </label>
                        <span className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: settingsForm.details_bg_color || '#501D2C' }} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-rose-200/70 mb-1">
                            Ribbon Background Color
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={settingsForm.details_bg_color || '#501D2C'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, details_bg_color: e.target.value })}
                              className="w-10 h-9 rounded-lg bg-black/40 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                            />
                            <input
                              type="text"
                              value={settingsForm.details_bg_color || '#501D2C'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, details_bg_color: e.target.value })}
                              className="flex-1 bg-black/50 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-rose-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-rose-200/70 mb-1">
                            Ribbon Text Color
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={settingsForm.details_text_color || '#E5B8C0'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, details_text_color: e.target.value })}
                              className="w-10 h-9 rounded-lg bg-black/40 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                            />
                            <input
                              type="text"
                              value={settingsForm.details_text_color || '#E5B8C0'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, details_text_color: e.target.value })}
                              className="flex-1 bg-black/50 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-rose-400"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Services Showcase */}
                    <div className="p-5 rounded-2xl bg-black/40 border border-white/10 hover:border-rose-400/30 transition-all space-y-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-rose-200 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-rose-400" />
                          <span>4. Services Portfolio Showcase</span>
                        </label>
                        <span className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: settingsForm.services_bg_color || '#501D2C' }} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-rose-200/70 mb-1">
                            Section Background Color
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={settingsForm.services_bg_color || '#501D2C'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, services_bg_color: e.target.value })}
                              className="w-10 h-9 rounded-lg bg-black/40 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                            />
                            <input
                              type="text"
                              value={settingsForm.services_bg_color || '#501D2C'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, services_bg_color: e.target.value })}
                              className="flex-1 bg-black/50 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-rose-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-rose-200/70 mb-1">
                            Card Container Background
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={settingsForm.services_card_bg_color || '#3B1622'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, services_card_bg_color: e.target.value })}
                              className="w-10 h-9 rounded-lg bg-black/40 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                            />
                            <input
                              type="text"
                              value={settingsForm.services_card_bg_color || '#3B1622'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, services_card_bg_color: e.target.value })}
                              className="flex-1 bg-black/50 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-rose-400"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 5: Booking Calendar */}
                    <div className="p-5 rounded-2xl bg-black/40 border border-white/10 hover:border-rose-400/30 transition-all space-y-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-rose-200 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-rose-400" />
                          <span>5. Booking Calendar Section</span>
                        </label>
                        <span className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: settingsForm.booking_bg_color || '#5b0827' }} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-rose-200/70 mb-1">
                            Section Background Color
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={settingsForm.booking_bg_color || '#5b0827'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, booking_bg_color: e.target.value })}
                              className="w-10 h-9 rounded-lg bg-black/40 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                            />
                            <input
                              type="text"
                              value={settingsForm.booking_bg_color || '#5b0827'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, booking_bg_color: e.target.value })}
                              className="flex-1 bg-black/50 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-rose-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-rose-200/70 mb-1">
                            Left Calendar Card Background
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={settingsForm.booking_card_bg_color || '#2E1222'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, booking_card_bg_color: e.target.value })}
                              className="w-10 h-9 rounded-lg bg-black/40 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                            />
                            <input
                              type="text"
                              value={settingsForm.booking_card_bg_color || '#2E1222'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, booking_card_bg_color: e.target.value })}
                              className="flex-1 bg-black/50 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-rose-400"
                            />
                          </div>
                        </div>
                      </div>
                    </div>





                    {/* Section 7: Client Experiences Gallery */}
                    <div className="p-5 rounded-2xl bg-black/40 border border-white/10 hover:border-rose-400/30 transition-all space-y-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-rose-200 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-rose-400" />
                          <span>6. Client Experiences Gallery</span>
                        </label>
                        <span className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: settingsForm.experiences_bg_color || '#180711' }} />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-rose-200/70 mb-1">
                          Gallery Background Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={settingsForm.experiences_bg_color || '#180711'}
                            onChange={(e) => setSettingsForm({ ...settingsForm, experiences_bg_color: e.target.value })}
                            className="w-10 h-9 rounded-lg bg-black/40 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                          />
                          <input
                            type="text"
                            value={settingsForm.experiences_bg_color || '#180711'}
                            onChange={(e) => setSettingsForm({ ...settingsForm, experiences_bg_color: e.target.value })}
                            className="flex-1 bg-black/50 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-rose-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 8: Footer */}
                    <div className="p-5 rounded-2xl bg-black/40 border border-white/10 hover:border-rose-400/30 transition-all space-y-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-rose-200 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-rose-400" />
                          <span>7. Footer Section</span>
                        </label>
                        <span className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: settingsForm.footer_bg_color || '#1A0A13' }} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-rose-200/70 mb-1">
                            Footer Background Color
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={settingsForm.footer_bg_color || '#1A0A13'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, footer_bg_color: e.target.value })}
                              className="w-10 h-9 rounded-lg bg-black/40 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                            />
                            <input
                              type="text"
                              value={settingsForm.footer_bg_color || '#1A0A13'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, footer_bg_color: e.target.value })}
                              className="flex-1 bg-black/50 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-rose-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-rose-200/70 mb-1">
                            Footer Text Color
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={settingsForm.footer_text_color || '#FBF8F6'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, footer_text_color: e.target.value })}
                              className="w-10 h-9 rounded-lg bg-black/40 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                            />
                            <input
                              type="text"
                              value={settingsForm.footer_text_color || '#FBF8F6'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, footer_text_color: e.target.value })}
                              className="flex-1 bg-black/50 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-rose-400"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                </form>
              )}

              {/* TAB 3: IMAGE SLOTS & TRANSFORMATIONS */}
              {activeTab === 'images' && (
                <form onSubmit={handleSaveImageSlots} className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-editorial text-2xl text-white">Logo & Boutique Image Studio</h3>
                      <p className="text-xs text-rose-200/70 mt-0.5">
                        Upload your brand logo, adjust showcase thumbnails, and manage your client experience gallery. Customize zoom, positioning, and background removal for any image.
                      </p>
                    </div>
                  </div>


// ... (other helper components like ImageSlotEditor)


// ... inside render:
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 px-1">
                        <div className="w-8 h-8 rounded-lg bg-[#C45266] flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="text-sm font-semibold uppercase tracking-widest text-rose-300">Brand Identity (Logo)</h4>
                      </div>
                      <ImageSlotEditor slotKey="logo_url" label="Primary Boutique Logo" defaultAspect="auto" />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 px-1">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-rose-400" />
                        </div>
                        <h4 className="text-sm font-semibold uppercase tracking-widest text-rose-300">Showcase & Portfolio Imagery</h4>
                      </div>
                    <ImageSlotEditor slotKey="service_nails" label="Nails Portfolio Showcase" defaultAspect="4/3" />
                    <ImageSlotEditor slotKey="service_lashes" label="Lashes Portfolio Showcase" defaultAspect="4/3" />
                    <ImageSlotEditor slotKey="service_hair" label="Wig Installation Showcase" defaultAspect="4/3" />
                    <ExperienceGalleryEditor 
                      gallery={imageSlotsForm.experience_gallery || []} 
                      onUpdate={(newGallery) => { 
                        setImageSlotsForm({ ...imageSlotsForm, experience_gallery: newGallery }); 
                        updateImageSlots({ experience_gallery: newGallery }); 
                      }} 
                    />
                    <ImageSlotEditor slotKey="services_feature" label="Services Feature Editorial Photo" defaultAspect="4/5" />
                    </div>
                  </div>

                </form>
              )}

              {/* TAB 4: SERVICES & PRICING */}
              {activeTab === 'services' && (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-editorial text-2xl sm:text-3xl text-white">Treatments & Services Editor</h3>
                      <p className="text-xs text-rose-200/70 mt-1">
                        Edit prices, treatment names, and categories. Add new offerings or remove old ones. Changes sync live across the entire boutique and booking form.
                      </p>
                    </div>
                  </div>

                  {/* Add New Treatment Form */}
                  <div className="p-5 rounded-2xl bg-black/40 border border-rose-400/30 space-y-4">
                    <div className="flex items-center gap-2 text-rose-200 text-xs font-semibold uppercase tracking-wider">
                      <Plus className="w-4 h-4 text-rose-400" />
                      <span>Add New Treatment Offering</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-5">
                        <label className="block text-[11px] uppercase tracking-wider text-rose-200/70 mb-1">
                          Treatment Name *
                        </label>
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="e.g. Russian Gel Manicure"
                          className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-rose-200/30 focus:outline-none focus:border-rose-400"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] uppercase tracking-wider text-rose-200/70 mb-1">
                          Category
                        </label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value as any)}
                          className="w-full bg-black/50 border border-white/20 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-rose-400"
                        >
                          <option value="nails">Nails</option>
                          <option value="lashes">Lashes</option>
                          <option value="hair">Wig Installation</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] uppercase tracking-wider text-rose-200/70 mb-1">
                          Price ({settingsForm.currency_symbol || 'MWK'})
                        </label>
                        <input
                          type="number"
                          value={newPrice}
                          onChange={(e) => setNewPrice(Number(e.target.value))}
                          className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-rose-400"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] uppercase tracking-wider text-rose-200/70 mb-1">
                          Duration (min)
                        </label>
                        <input
                          type="number"
                          value={newDuration}
                          onChange={(e) => setNewDuration(Number(e.target.value))}
                          className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-rose-400"
                        />
                      </div>

                      <div className="sm:col-span-12">
                        <label className="block text-[11px] uppercase tracking-wider text-rose-200/70 mb-1">
                          Description
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            placeholder="Brief description of the treatment technique and results..."
                            className="flex-1 bg-black/50 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-rose-200/30 focus:outline-none focus:border-rose-400"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!newTitle.trim()) {
                                alert('Please provide a treatment name');
                                return;
                              }
                              const newSrv: ServiceItem = {
                                id: `srv-${Date.now()}`,
                                category: newCategory,
                                number: `0${servicesList.length + 1}`,
                                title: newTitle.trim(),
                                description: newDescription.trim() || 'Bespoke atelier beauty treatment.',
                                price: newPrice > 0 ? newPrice : 35000,
                                duration_min: newDuration > 0 ? newDuration : 45,
                                is_active: true,
                              };
                              const updated = [...servicesList, newSrv];
                              setServicesList(updated);
                              updateServices(updated);
                              setNewTitle('');
                              setNewDescription('');
                              showSuccessNotice(`Added "${newSrv.title}" to treatments!`);
                            }}
                            className="px-5 py-2 rounded-xl bg-[#C45266] hover:bg-[#b04356] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 shadow-md"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Treatment</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Existing Treatments List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-rose-300 font-medium px-1">
                      <span>Current Active Treatments ({servicesList.length})</span>
                      <span className="text-[11px] text-rose-200/60">Edits save and broadcast instantly</span>
                    </div>

                    {servicesList.map((srv, index) => (
                      <div
                        key={srv.id}
                        className="p-4 rounded-2xl bg-black/30 border border-white/10 hover:border-rose-400/30 transition-all space-y-3"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                          <div className="sm:col-span-1 text-xs font-mono text-rose-300 font-bold">
                            #{index + 1}
                          </div>

                          <div className="sm:col-span-5">
                            <label className="block text-[10px] uppercase font-mono text-rose-300/60 mb-0.5">
                              Treatment Name
                            </label>
                            <input
                              type="text"
                              value={srv.title}
                              onChange={(e) => {
                                const updated = [...servicesList];
                                updated[index].title = e.target.value;
                                setServicesList(updated);
                              }}
                              className="w-full bg-black/40 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] uppercase font-mono text-rose-300/60 mb-0.5">
                              Category
                            </label>
                            <select
                              value={srv.category}
                              onChange={(e) => {
                                const updated = [...servicesList];
                                updated[index].category = e.target.value as any;
                                setServicesList(updated);
                              }}
                              className="w-full bg-black/40 border border-white/20 rounded-lg px-2 py-1.5 text-xs text-white"
                            >
                              <option value="nails">Nails</option>
                              <option value="lashes">Lashes</option>
                              <option value="hair">Wig Installation</option>
                            </select>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] uppercase font-mono text-rose-300/60 mb-0.5">
                              Price ({settingsForm.currency_symbol || 'MWK'})
                            </label>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-rose-300 font-mono">{settingsForm.currency_symbol || 'MWK'}</span>
                              <input
                                type="number"
                                value={srv.price}
                                onChange={(e) => {
                                  const updated = [...servicesList];
                                  updated[index].price = Number(e.target.value);
                                  setServicesList(updated);
                                }}
                                className="w-full bg-black/40 border border-white/20 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-1">
                            <label className="block text-[10px] uppercase font-mono text-rose-300/60 mb-0.5">
                              Mins
                            </label>
                            <input
                              type="number"
                              value={srv.duration_min}
                              onChange={(e) => {
                                const updated = [...servicesList];
                                updated[index].duration_min = Number(e.target.value);
                                setServicesList(updated);
                              }}
                              className="w-full bg-black/40 border border-white/20 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                            />
                          </div>

                          <div className="sm:col-span-1 flex justify-end items-end pt-3 sm:pt-0">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = servicesList.filter((_, i) => i !== index);
                                setServicesList(updated);
                                updateServices(updated);
                                showSuccessNotice(`Deleted "${srv.title}"`);
                              }}
                              className="p-2 text-rose-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors"
                              title="Delete Treatment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Description field */}
                        <div className="pt-1">
                          <input
                            type="text"
                            value={srv.description || ''}
                            onChange={(e) => {
                              const updated = [...servicesList];
                              updated[index].description = e.target.value;
                              setServicesList(updated);
                            }}
                            placeholder="Treatment description..."
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-rose-100/80 placeholder-white/20 focus:outline-none focus:border-rose-400/50"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* TAB 5: CALENDAR SLOTS */}
              {activeTab === 'slots' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-editorial text-2xl text-white">Daily Booking Slots & Schedule</h3>
                      <p className="text-xs text-rose-200/70 mt-0.5">
                        Add, edit times, customize periods, toggle availability, or delete slots. Changes broadcast instantly.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleResetDefaultSlots}
                        className="px-3.5 py-1.5 rounded-xl border border-white/20 hover:bg-white/10 text-rose-200 text-xs transition-colors"
                        title="Restore standard boutique operating hours"
                      >
                        Reset Defaults
                      </button>
                    </div>
                  </div>

                  {/* Add New Time Slot Form */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-rose-400/30 space-y-3">
                    <div className="flex items-center gap-2 text-rose-200 text-xs font-semibold uppercase tracking-wider">
                      <Plus className="w-4 h-4 text-rose-400" />
                      <span>Add New Time Slot</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      <div className="sm:col-span-5">
                        <label className="block text-[11px] uppercase tracking-wider text-rose-200/70 mb-1">
                          Slot Time *
                        </label>
                        <div className="relative">
                          <Clock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-rose-300/60" />
                          <input
                            type="text"
                            value={newSlotTime}
                            onChange={(e) => setNewSlotTime(e.target.value)}
                            placeholder="e.g. 03:30 PM, 12:15 PM"
                            className="w-full bg-black/50 border border-white/20 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-rose-200/30 font-mono focus:outline-none focus:border-rose-400"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[11px] uppercase tracking-wider text-rose-200/70 mb-1">
                          Period
                        </label>
                        <select
                          value={newSlotPeriod}
                          onChange={(e) => setNewSlotPeriod(e.target.value as any)}
                          className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400"
                        >
                          <option value="morning">Morning (until 12 PM)</option>
                          <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                          <option value="evening">Evening (5 PM onwards)</option>
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <button
                          type="button"
                          onClick={handleAddSlot}
                          className="w-full py-2 px-4 rounded-xl bg-[#C45266] hover:bg-[#b04356] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Slot</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* List of Time Slots with Inline Editing & Delete */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-rose-300 font-medium px-1">
                      <span>Available Slots ({slotsList.length})</span>
                      <span className="text-[11px] text-rose-200/60">
                        Edit time directly or toggle checkbox to enable/disable
                      </span>
                    </div>

                    {slotsList.length === 0 ? (
                      <div className="p-8 text-center bg-black/20 rounded-2xl border border-white/10 text-rose-200/60 text-xs">
                        No time slots configured. Click "Reset Defaults" above to restore standard hours.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {slotsList.map((slot, index) => (
                          <div
                            key={`${slot.time}-${index}`}
                            className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                              slot.is_available
                                ? 'bg-black/30 border-rose-400/40 text-white'
                                : 'bg-black/15 border-white/10 text-white/50 opacity-75'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              {/* Inline Editable Time String */}
                              <div className="relative flex-1">
                                <Clock className="w-3.5 h-3.5 absolute left-2.5 top-2 text-rose-300/70" />
                                <input
                                  type="text"
                                  value={slot.time}
                                  onChange={(e) =>
                                    handleUpdateSlotField(index, { time: e.target.value })
                                  }
                                  className="w-full bg-black/40 border border-white/15 focus:border-rose-400 rounded-lg pl-8 pr-2 py-1 text-xs font-mono font-semibold text-white focus:outline-none"
                                />
                              </div>

                              {/* Delete Slot Button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteSlot(index)}
                                className="p-1.5 text-rose-400 hover:text-red-300 hover:bg-red-950/50 rounded-lg transition-colors shrink-0"
                                title={`Delete slot ${slot.time}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10 text-xs">
                              {/* Period Selector */}
                              <select
                                value={slot.period}
                                onChange={(e) =>
                                  handleUpdateSlotField(index, { period: e.target.value as any })
                                }
                                className="bg-black/30 border border-white/10 rounded px-2 py-0.5 text-[11px] font-mono uppercase text-rose-200 focus:outline-none"
                              >
                                <option value="morning">Morning</option>
                                <option value="afternoon">Afternoon</option>
                                <option value="evening">Evening</option>
                              </select>

                              {/* Availability Toggle */}
                              <label className="flex items-center gap-2 cursor-pointer select-none">
                                <span className={`text-[11px] font-medium ${slot.is_available ? 'text-emerald-300' : 'text-rose-300/50'}`}>
                                  {slot.is_available ? 'Active' : 'Offline'}
                                </span>
                                <input
                                  type="checkbox"
                                  checked={slot.is_available}
                                  onChange={(e) => {
                                    handleUpdateSlotField(index, { is_available: e.target.checked });
                                    // Also auto-save toggle immediately
                                    const updated = [...slotsList];
                                    updated[index].is_available = e.target.checked;
                                    updateCalendarSlots(updated);
                                  }}
                                  className="w-4 h-4 accent-[#C45266] rounded cursor-pointer"
                                />
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: GOOGLE CALENDAR SYNC */}
              {activeTab === 'calendar' && (
                <div className="space-y-6 max-w-2xl">
                  <div>
                    <h3 className="font-editorial text-2xl text-white">CEO Google Calendar Sync</h3>
                    <p className="text-xs text-rose-200/70 mt-0.5">
                      Connect the CEO's designated Google account to automatically receive booking appointments and 30-minute pop-up reminders in Google Calendar.
                    </p>
                  </div>

                  {calendarConnectMsg && (
                    <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${calendarConnectMsg.includes('success') ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-200' : 'bg-red-950/70 border border-red-500/40 text-red-200'}`}>
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>{calendarConnectMsg}</span>
                    </div>
                  )}

                  <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-white">Google Account Authorization</h4>
                        <p className="text-[11px] text-rose-200/70 mt-0.5">
                          Sign in with the CEO Google account that should receive calendar notifications.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleConnectCalendar}
                        disabled={isConnectingCalendar}
                        className="px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-black text-xs font-medium tracking-wide transition-all shadow flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        <Calendar className="w-4 h-4 text-[#ea297e]" />
                        <span>{isConnectingCalendar ? 'Connecting...' : 'Sign in with Google'}</span>
                      </button>
                    </div>

                    <div className="pt-3 border-t border-white/10 space-y-4">
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-rose-200 mb-1 font-medium">
                          CEO Google Account Email
                        </label>
                        <input
                          type="email"
                          value={settingsForm.ceo_google_email || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, ceo_google_email: e.target.value })}
                          placeholder="ceo@mtmansion.com"
                          className="w-full bg-black/40 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-400 font-mono"
                        />
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <div>
                          <span className="text-xs font-medium text-white block">Enable Automatic Calendar Sync</span>
                          <span className="text-[11px] text-rose-200/60">Automatically create calendar events when clients book</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={settingsForm.calendar_sync_enabled !== false}
                          onChange={(e) => setSettingsForm({ ...settingsForm, calendar_sync_enabled: e.target.checked })}
                          className="w-4 h-4 accent-[#C45266] rounded cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider text-rose-200 mb-1 font-medium">
                          Popup Reminder Time (Minutes Before Appointment)
                        </label>
                        <select
                          value={settingsForm.calendar_reminder_min || 30}
                          onChange={(e) => setSettingsForm({ ...settingsForm, calendar_reminder_min: Number(e.target.value) })}
                          className="w-full bg-black/40 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-400 font-mono"
                        >
                          <option value={15} className="bg-[#240F1B]">15 minutes before</option>
                          <option value={30} className="bg-[#240F1B]">30 minutes before</option>
                          <option value={60} className="bg-[#240F1B]">1 hour before</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: SUPABASE REAL-TIME CONNECTION */}
              {activeTab === 'supabase' && (
                <div className="space-y-6 max-w-2xl">
                  <div>
                    <h3 className="font-editorial text-2xl text-white">Supabase Postgres Changes Sync</h3>
                    <p className="text-xs text-rose-200/70 mt-0.5">
                      Connect your Supabase project to enable cloud Postgres replication and live cross-device table updates.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-rose-200 uppercase tracking-wider">
                        Real-Time Sync Engine Status
                      </span>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-mono flex items-center gap-1.5 ${
                          isSupabaseActive
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        {isSupabaseActive ? 'Supabase Postgres Active' : 'WebSocket Broadcast Active'}
                      </span>
                    </div>

                    <p className="text-xs text-rose-200/70 leading-relaxed">
                      MT Mansion is configured with zero-refresh synchronization. When you save an appointment or update an image, our server broadcasts via WebSockets immediately and replicates to your Supabase Postgres database.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-rose-200 mb-1 font-medium">
                        Supabase Project URL
                      </label>
                      <input
                        type="url"
                        value={settingsForm.supabase_url}
                        onChange={(e) => setSettingsForm({ ...settingsForm, supabase_url: e.target.value })}
                        placeholder="https://your-project.supabase.co"
                        className="w-full bg-black/40 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-rose-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-rose-200 mb-1 font-medium">
                        Supabase Anon Public API Key
                      </label>
                      <input
                        type="password"
                        value={settingsForm.supabase_anon_key}
                        onChange={(e) => setSettingsForm({ ...settingsForm, supabase_anon_key: e.target.value })}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        className="w-full bg-black/40 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-rose-400"
                      />
                    </div>
                  </div>

                  {supabaseTestResult && (
                    <div
                      className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                        supabaseTestResult.success
                          ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-200'
                          : 'bg-red-950/70 border border-red-500/40 text-red-200'
                      }`}
                    >
                      {supabaseTestResult.success ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                      <span>{supabaseTestResult.message}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={isTestingSupabase}
                      onClick={async () => {
                        setIsTestingSupabase(true);
                        setSupabaseTestResult(null);
                        const res = await testSupabase(settingsForm.supabase_url, settingsForm.supabase_anon_key);
                        setSupabaseTestResult(res);
                        setIsTestingSupabase(false);
                      }}
                      className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors flex items-center gap-2"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTestingSupabase ? 'animate-spin' : ''}`} />
                      <span>Test Supabase Connection</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
