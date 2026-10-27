import React, { useState, useRef } from 'react';
import { UploadCloud, X, AlertCircle } from 'lucide-react';
import { getImageUrl } from '../utils/imageUrl';

const ImageUploader = ({
  onChange,
  existingImages = [],
  onRemoveExisting,
  maxImages = 5,
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef(null);

  const totalExisting = existingImages ? existingImages.length : 0;
  const remainingSlots = maxImages - (totalExisting + selectedFiles.length);

  const handleFiles = (filesList) => {
    setErrorMessage('');
    const incomingFiles = Array.from(filesList);

    if (incomingFiles.length + selectedFiles.length + totalExisting > maxImages) {
      setErrorMessage(`You can only upload up to ${maxImages} images in total.`);
      return;
    }

    const validNewFiles = [];

    for (const file of incomingFiles) {
      // Type check
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setErrorMessage('Only image files (JPEG, PNG, WEBP) are allowed.');
        return;
      }
      // Size check (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage(`File "${file.name}" exceeds the 5MB size limit.`);
        return;
      }

      validNewFiles.push(file);
    }

    const validNewPreviews = validNewFiles.map((file) => URL.createObjectURL(file));
    const updatedFiles = [...selectedFiles, ...validNewFiles];
    const updatedPreviews = [...filePreviews, ...validNewPreviews];

    setSelectedFiles(updatedFiles);
    setFilePreviews(updatedPreviews);
    onChange(updatedFiles);
  };

  const handleRemoveNew = (index) => {
    URL.revokeObjectURL(filePreviews[index]);
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    const updatedPreviews = filePreviews.filter((_, i) => i !== index);

    setSelectedFiles(updatedFiles);
    setFilePreviews(updatedPreviews);
    onChange(updatedFiles);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      {remainingSlots > 0 ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
            dragActive
              ? 'border-indigo-600 bg-indigo-50/50 scale-[1.01]'
              : 'border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-slate-50'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-800 mb-1">
            Click to upload or drag & drop images
          </p>
          <p className="text-xs text-slate-500">
            PNG, JPG, WEBP up to 5MB each ({remainingSlots} slot{remainingSlots > 1 ? 's' : ''} remaining)
          </p>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-100 text-center text-xs text-slate-600 font-medium">
          Maximum limit of {maxImages} images reached.
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="flex items-center space-x-2 text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Existing Images (Edit mode) */}
      {existingImages && existingImages.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Current Images ({existingImages.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {existingImages.map((image, idx) => (
              <div
                key={`existing-${idx}`}
                className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square shadow-sm"
              >
                <img src={getImageUrl(image)} alt={`Existing ${idx + 1}`} className="w-full h-full object-cover" />
                {onRemoveExisting && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveExisting(idx);
                    }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600/90 hover:bg-red-700 text-white flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity"
                    title="Remove Image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <span className="absolute bottom-1 left-1.5 text-[10px] bg-slate-900/60 text-white px-1.5 py-0.5 rounded backdrop-blur-sm">
                  Saved
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Images Preview */}
      {filePreviews.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            New Uploads ({filePreviews.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {filePreviews.map((url, idx) => (
              <div
                key={`new-${idx}`}
                className="relative group rounded-xl overflow-hidden border border-indigo-200 bg-slate-100 aspect-square shadow-sm"
              >
                <img src={url} alt={`Upload preview ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveNew(idx);
                  }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/80 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                  title="Remove Preview"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <span className="absolute bottom-1 left-1.5 text-[10px] bg-indigo-600/90 text-white px-1.5 py-0.5 rounded font-medium">
                  Ready
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
