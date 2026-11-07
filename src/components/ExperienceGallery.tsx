import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon, GripVertical, Trash2 } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { processImageFile } from '../lib/imageUpload';

export const SortableImage: React.FC<{
  id: string;
  src: string;
  index: number;
  onRemove: () => void;
}> = ({ id, src, index, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group rounded-2xl overflow-hidden aspect-square border ${
        isDragging ? 'border-rose-400 opacity-60 shadow-2xl z-20 scale-105' : 'border-white/15 bg-black/40'
      } transition-all`}
    >
      <img
        src={src}
        alt={`Gallery photo ${index + 1}`}
        className="w-full h-full object-cover select-none pointer-events-none"
        referrerPolicy="no-referrer"
      />

      {/* Drag Handle Overlay */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing flex items-center justify-center"
      >
        <span className="p-2 rounded-xl bg-black/60 text-white/90 backdrop-blur-sm border border-white/20 flex items-center gap-1 text-[11px] font-mono">
          <GripVertical className="w-4 h-4 text-rose-300" />
          <span>Drag</span>
        </span>
      </div>

      {/* Remove Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onRemove();
        }}
        className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-rose-900/90 text-rose-200 hover:text-white rounded-full transition-colors border border-white/20 z-10"
        title="Delete image"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      {/* Index badge */}
      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/70 text-[10px] font-mono text-rose-200 border border-white/10">
        #{index + 1}
      </div>
    </div>
  );
};

export const ExperienceGalleryEditor: React.FC<{
  gallery: string[];
  onUpdate: (gallery: string[]) => void;
}> = ({ gallery, onUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = gallery.indexOf(active.id);
      const newIndex = gallery.indexOf(over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newGallery = arrayMove(gallery, oldIndex, newIndex);
        onUpdate(newGallery);
      }
    }
  };

  const addImages = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const fileList = Array.from(files).filter((f) => f.type.startsWith('image/'));
      const processed = await Promise.all(
        fileList.map((f) => processImageFile(f, 1600, 0.88))
      );
      onUpdate([...gallery, ...processed]);
    } catch (err) {
      console.error('Failed to process uploaded images:', err);
      alert('Could not process some of the uploaded images.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-rose-200 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-rose-400" />
            <span>Customer Experiences Gallery ({gallery.length} photos)</span>
          </label>
          <p className="text-[11px] text-rose-200/60 mt-0.5">
            Drag to reorder photos. Uploaded images are optimized and synced live to your storefront.
          </p>
        </div>

        <label className="px-4 py-2 rounded-xl bg-[#C45266] hover:bg-[#b04356] text-white text-xs font-medium cursor-pointer transition-all flex items-center justify-center gap-2 shadow shrink-0">
          <Upload className="w-3.5 h-3.5" />
          <span>{isUploading ? 'Optimizing...' : 'Upload Multiple Photos'}</span>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            disabled={isUploading}
            onChange={(e) => addImages(e.target.files)}
          />
        </label>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files) {
            addImages(e.dataTransfer.files);
          }
        }}
        className={`p-6 border-2 border-dashed rounded-2xl text-center transition-all ${
          isDragOver
            ? 'border-rose-400 bg-rose-950/30'
            : 'border-white/15 bg-black/20 hover:border-rose-400/30'
        }`}
      >
        <Upload className="w-6 h-6 mx-auto mb-2 text-rose-300" />
        <p className="text-xs font-medium text-rose-100">
          Drag & drop new client pictures here, or click upload button above
        </p>
        <p className="text-[10px] text-rose-300/50 mt-1 font-mono">
          Supports PNG, JPG, WEBP · Automatic compression for lightning-fast loading
        </p>
      </div>

      {/* Sortable Grid */}
      {gallery.length === 0 ? (
        <div className="py-8 text-center text-rose-300/60 text-xs">
          No experience gallery photos yet. Upload photos to showcase client nail art, lashes, and hair styles.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={gallery} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {gallery.map((img, i) => (
                <SortableImage
                  key={`${img.substring(0, 40)}-${i}`}
                  id={img}
                  src={img}
                  index={i}
                  onRemove={() => {
                    const newGallery = gallery.filter((_, idx) => idx !== i);
                    onUpdate(newGallery);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};
