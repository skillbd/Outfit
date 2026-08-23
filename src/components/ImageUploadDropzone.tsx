import React, { useState, useRef, DragEvent } from 'react';
import { UploadCloud, Image as ImageIcon, Link2, X, Check, Loader2, Plus, Sparkles, Trash2, Star } from 'lucide-react';
import { processMultipleImageFiles, processImageFile } from '../utils/imageUtils';

interface ImageUploadDropzoneProps {
  label?: string;
  description?: string;
  images: string[];
  onChange: (images: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  presets?: string[];
  aspectRatio?: 'square' | 'video' | 'portrait' | 'wide' | 'auto';
  compact?: boolean;
}

export const ImageUploadDropzone: React.FC<ImageUploadDropzoneProps> = ({
  label = 'Upload Image',
  description = 'Supports PNG, JPG, WebP or SVG (সর্বোচ্চ ২০টি ছবি আপলোড করতে পারবেন)',
  images,
  onChange,
  multiple = false,
  maxFiles = 20,
  presets = [],
  aspectRatio = 'square',
  compact = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

    await handleFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    await handleFiles(e.target.files);
    // Reset file input value so selecting identical file again triggers change
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFiles = async (files: FileList | File[]) => {
    setIsUploading(true);
    const count = files.length;
    setUploadCount(count);
    try {
      if (multiple) {
        const processed = await processMultipleImageFiles(files);
        const newUrls = processed.map((p) => p.dataUrl);
        const merged = [...images, ...newUrls].slice(0, maxFiles);
        onChange(merged);
      } else {
        const file = Array.from(files)[0];
        if (file) {
          const processed = await processImageFile(file);
          onChange([processed.dataUrl]);
        }
      }
    } catch (err) {
      console.error('Failed to process image:', err);
      alert('Could not process the selected image file.');
    } finally {
      setIsUploading(false);
      setUploadCount(0);
    }
  };

  const handleAddUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) return;

    if (multiple) {
      onChange([...images, urlInput.trim()].slice(0, maxFiles));
    } else {
      onChange([urlInput.trim()]);
    }
    setUrlInput('');
  };

  const handleSelectPreset = (presetUrl: string) => {
    if (multiple) {
      if (!images.includes(presetUrl)) {
        onChange([...images, presetUrl].slice(0, maxFiles));
      }
    } else {
      onChange([presetUrl]);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const handleSetAsCover = (index: number) => {
    if (index === 0) return;
    const item = images[index];
    const rest = images.filter((_, idx) => idx !== index);
    onChange([item, ...rest]);
  };

  return (
    <div className="space-y-3">
      {/* Label and Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          {label && (
            <label className="block font-bold text-gray-800 uppercase tracking-wide text-[11px]">
              {label}
            </label>
          )}
          {description && (
            <p className="text-[10px] text-gray-400 mt-0.5">{description}</p>
          )}
        </div>

        {/* Tab pills */}
        <div className="inline-flex bg-gray-100 p-0.5 rounded-lg text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-white text-blue-600 shadow-2xs font-bold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              activeTab === 'url'
                ? 'bg-white text-blue-600 shadow-2xs font-bold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Web URL
          </button>
          {presets.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                activeTab === 'presets'
                  ? 'bg-white text-blue-600 shadow-2xs font-bold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Presets ({presets.length})
            </button>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Tab: Upload File via Drag & Drop */}
      {activeTab === 'upload' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
              : 'border-gray-300 hover:border-blue-400 bg-gray-50/50 hover:bg-gray-50'
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <UploadCloud className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">
                {isUploading
                  ? `Optimizing & uploading ${uploadCount > 0 ? uploadCount : ''} photos...`
                  : 'Click to browse multiple photos or drag & drop'}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5 font-medium">
                {multiple
                  ? `একসাথে একাধিক (৪, ৫, ১০+ ছবি) সিলেক্ট করুন (সর্বোচ্চ ${maxFiles}টি ছবি)`
                  : 'Upload single image (high quality auto-compressed)'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Web URL Input */}
      {activeTab === 'url' && (
        <form onSubmit={handleAddUrl} className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="url"
              placeholder="Paste direct image URL (https://...)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={!urlInput.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            {multiple ? '+ Add to List' : 'Set Image'}
          </button>
        </form>
      )}

      {/* Tab: Presets */}
      {activeTab === 'presets' && presets.length > 0 && (
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
          <span className="text-[10px] font-bold text-gray-500 uppercase block mb-2">
            Click any curated visual to use:
          </span>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`relative w-14 h-14 rounded-lg border overflow-hidden transition-all cursor-pointer ${
                  images.includes(preset)
                    ? 'border-blue-600 ring-2 ring-blue-500 ring-offset-1 scale-105'
                    : 'border-gray-200 hover:border-gray-400 opacity-80 hover:opacity-100'
                }`}
              >
                <img src={preset} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                {images.includes(preset) && (
                  <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white drop-shadow" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Preview Gallery / Single Preview */}
      {images.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-700 mb-2">
            <span className="flex items-center gap-1.5">
              <span>{multiple ? `Attached Images (${images.length} / ${maxFiles})` : 'Current Image Preview'}</span>
              {multiple && images.length >= 3 && (
                <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.2 rounded-full font-semibold">
                  Multi-photos active
                </span>
              )}
            </span>
            {images.length > 1 && multiple && (
              <span className="text-[10px] text-gray-400 font-normal">
                First image is the primary storefront cover
              </span>
            )}
          </div>

          <div
            className={
              multiple
                ? 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5'
                : 'relative inline-block max-w-full'
            }
          >
            {images.map((imgUrl, idx) => (
              <div
                key={idx}
                className={`group relative rounded-xl border border-gray-200 bg-gray-100 overflow-hidden shadow-2xs transition-all ${
                  multiple
                    ? 'aspect-square'
                    : aspectRatio === 'wide'
                    ? 'aspect-[21/9] w-full max-w-lg'
                    : aspectRatio === 'video'
                    ? 'aspect-video w-full max-w-md'
                    : aspectRatio === 'portrait'
                    ? 'aspect-[3/4] w-32'
                    : 'w-24 h-24'
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`Preview ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />

                {/* Primary cover badge */}
                {multiple && idx === 0 && (
                  <span className="absolute top-1 left-1 bg-black/80 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow">
                    Cover
                  </span>
                )}

                {/* Hover overlay actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                  {multiple && idx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleSetAsCover(idx)}
                      className="p-1 bg-white/90 hover:bg-white text-gray-900 rounded-md transition-colors shadow-xs"
                      title="Set as main cover image"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md transition-colors shadow-xs"
                    title="Remove this image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Inline '+ Add More' Button for Quick Additional Photos */}
            {multiple && images.length < maxFiles && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 bg-gray-50/70 hover:bg-blue-50/50 flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-blue-600 transition-all cursor-pointer group"
                title="Add more photos"
              >
                <div className="p-1.5 rounded-full bg-white shadow-2xs group-hover:scale-110 transition-transform">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold">+ Add More</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

