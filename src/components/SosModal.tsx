import React, { useState } from 'react';
import { DemoUser, EmergencyType } from '../types';

interface SosModalProps {
  currentUser: DemoUser;
  isOpen: boolean;
  onClose: () => void;
  onSubmitSos: (data: {
    type: EmergencyType;
    location: string;
    note: string;
    image?: string;
  }) => Promise<void>;
}

const EMERGENCY_TYPES: EmergencyType[] = [
  'Medical emergency',
  'Fire Alarm / Burn',
  'Fall / Physical Injury',
  'Suspicious Activity',
  'Electrical Hazard',
  'Other Safety Emergency',
];

export const SosModal: React.FC<SosModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onSubmitSos,
}) => {
  const [selectedType, setSelectedType] = useState<EmergencyType>('Medical emergency');
  const [location, setLocation] = useState('Library — Floor 1');
  const [note, setNote] = useState('');
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmitSos({
        type: selectedType,
        location,
        note,
        image: imagePreview,
      });
      onClose();
    } catch (err) {
      console.error('Error triggering SOS:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#12141D] border border-[#ef4444]/60 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(239,68,68,0.3)] relative text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8c909f] hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-[#ef4444] text-white flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.6)]">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              emergency
            </span>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-[#e1e3e4]">
              CONFIRM EMERGENCY SOS
            </h2>
            <p className="font-mono-code text-xs text-[#c2c6d6]">
              Identity: {currentUser.name} ({currentUser.id})
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Select Type */}
          <div>
            <label className="block text-xs font-mono-code text-[#adc6ff] uppercase tracking-wider mb-2">
              Select Emergency Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {EMERGENCY_TYPES.map((type) => {
                const isSelected = selectedType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`p-3 rounded-xl border text-xs font-medium text-left transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-[#ef4444]/20 border-[#ef4444] text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                        : 'bg-[#1d2021] border-white/10 text-[#c2c6d6] hover:bg-[#282a2b]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm text-[#ffb4ab]">
                      {type.includes('Medical') ? 'local_hospital' : type.includes('Fire') ? 'local_fire_department' : type.includes('Fall') ? 'personal_injury' : type.includes('Suspicious') ? 'warning' : 'report'}
                    </span>
                    <span className="truncate">{type}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-mono-code text-[#adc6ff] uppercase tracking-wider mb-1">
              Campus Location
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#ffb786] text-lg">
                location_on
              </span>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full bg-[#0c0f10] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#e1e3e4] focus:outline-none focus:ring-2 focus:ring-[#4d8eff]"
                placeholder="e.g. Science Building Floor 3, Room 302"
              />
            </div>
          </div>

          {/* Short Note */}
          <div>
            <label className="block text-xs font-mono-code text-[#adc6ff] uppercase tracking-wider mb-1">
              Short Description / Note (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full bg-[#0c0f10] border border-white/10 rounded-xl p-3 text-sm text-[#e1e3e4] placeholder-[#8c909f] focus:outline-none focus:ring-2 focus:ring-[#4d8eff]"
              placeholder="e.g. Student fell down stairs, arm bleeding..."
            />
          </div>

          {/* Optional Image Attachment */}
          <div>
            <label className="block text-xs font-mono-code text-[#adc6ff] uppercase tracking-wider mb-1">
              Attach Photo for AI Triage (Optional)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                id="sos-image"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="sos-image"
                className="px-4 py-2 bg-[#282a2b] hover:bg-[#323536] border border-white/10 text-xs text-[#e1e3e4] rounded-xl cursor-pointer flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">photo_camera</span>
                Upload Image
              </label>
              {imagePreview && (
                <div className="flex items-center gap-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-10 h-10 object-cover rounded-lg border border-white/20"
                  />
                  <button
                    type="button"
                    onClick={() => setImagePreview(undefined)}
                    className="text-xs text-[#ffb4ab] hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-[#ef4444] hover:bg-red-600 text-white font-mono-code text-sm font-bold uppercase tracking-widest rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                DISPATCHING SOS...
              </span>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  emergency
                </span>
                SEND SOS NOW
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
