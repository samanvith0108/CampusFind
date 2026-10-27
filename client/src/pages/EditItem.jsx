import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Tag,
  MapPin,
  Calendar,
  FileText,
  Loader2,
  Lock,
} from 'lucide-react';
import { getItem, updateItem } from '../api/items.api';
import ImageUploader from '../components/ImageUploader';
import { ITEM_CATEGORIES } from '../constants/itemCategories';

const EditItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [itemType, setItemType] = useState('lost');
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      category: '',
      description: '',
      location: '',
      dateOccurred: '',
    },
  });

  const descriptionValue = watch('description', '');
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await getItem(id);
        const data = res.data?.item || res.item || res.data;
        if (!data) {
          toast.error('Item not found');
          navigate('/dashboard');
          return;
        }

        setItemType(data.type || 'lost');
        setValue('title', data.title || '');
        setValue('category', data.category || 'Electronics');
        setValue('description', data.description || '');
        setValue('location', data.location || '');
        if (data.dateOccurred) {
          setValue('dateOccurred', new Date(data.dateOccurred).toISOString().split('T')[0]);
        }

        const images = Array.isArray(data.images)
          ? data.images
          : typeof data.images === 'string' && data.images
          ? [data.images]
          : [];
        setExistingImages(images);
      } catch (err) {
        toast.error('Failed to load item for editing');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, setValue, navigate]);

  const handleRemoveExistingImage = (indexToRemove) => {
    setExistingImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title.trim());
      formData.append('category', data.category);
      formData.append('description', data.description.trim());
      formData.append('location', data.location.trim());
      formData.append('dateOccurred', data.dateOccurred);

      // Keep tracked existing images as JSON array
      formData.append('existingImages', JSON.stringify(existingImages));

      // Append new files
      newFiles.forEach((file) => {
        formData.append('images', file);
      });

      await updateItem(id, formData);
      toast.success('Item updated successfully!');
      navigate(`/items/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update item');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
        <p className="text-sm text-slate-500">Loading item data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">
      <div>
        <Link
          to={`/items/${id}`}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Cancel and Return to Item
        </Link>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Edit Item Listing
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Update information for this {itemType} item.
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              itemType === 'lost'
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
          >
            {itemType === 'lost' ? 'Lost Item' : 'Found Item'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Item Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Silver Dell XPS 15..."
              {...register('title', {
                required: 'Please enter a descriptive item title',
                minLength: { value: 3, message: 'Title must be at least 3 characters' },
              })}
              className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.title
                  ? 'border-red-400 focus:ring-red-400'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
              }`}
            />
            {errors.title && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Category & Date Occurred */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center">
                <Tag className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Category
              </label>
              <select
                {...register('category', { required: 'Please select a category' })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {ITEM_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Date Occurred
              </label>
              <input
                type="date"
                max={todayStr}
                {...register('dateOccurred', { required: 'Date is required' })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Campus Location
            </label>
            <input
              type="text"
              placeholder="e.g. 3rd Floor Library"
              {...register('location', { required: 'Location is required' })}
              className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.location
                  ? 'border-red-400 focus:ring-red-400'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
              }`}
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
                <FileText className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Description
              </label>
              <span className="text-[11px] text-slate-400">
                {descriptionValue.length}/1000 characters
              </span>
            </div>
            <textarea
              rows={4}
              {...register('description', {
                required: 'Please provide a description',
                maxLength: { value: 1000, message: 'Max 1000 characters' },
              })}
              className={`w-full p-4 rounded-xl border text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.description
                  ? 'border-red-400 focus:ring-red-400'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
              }`}
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Manage Images (Up to 5)
            </label>
            <ImageUploader
              existingImages={existingImages}
              onRemoveExisting={handleRemoveExistingImage}
              onChange={(files) => setNewFiles(files)}
              maxImages={5}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end space-x-3">
          <Link
            to={`/items/${id}`}
            className="px-5 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-7 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-all flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditItem;
