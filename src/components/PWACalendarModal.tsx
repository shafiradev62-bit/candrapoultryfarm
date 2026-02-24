import { Calendar } from "@/components/ui/calendar";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

interface PWACalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  title?: string;
}

export function PWACalendarModal({ isOpen, onClose, selected, onSelect, title = "Pilih Tanggal" }: PWACalendarModalProps) {
  if (!isOpen) return null;

  const handleSelect = (date: Date | undefined) => {
    onSelect(date);
    onClose();
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-[24px] shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-[#1B4332]">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Calendar */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            initialFocus
            className="w-full"
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
