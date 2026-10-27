import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Sparkles,
  Search,
  CheckCircle2,
  Tag,
  MapPin,
  Calendar,
  FileText,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { createItem } from '../api/items.api';
import ImageUploader from '../components/ImageUploader';
import { ITEM_CATEGORIES } from '../constants/itemCategories';

const CreateItem = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') === 'found' ? 'found' : 'lost';

  const [itemType, setItemType] = useState(initialType);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      category: 'Electronics',
      description: '',
      location: '',
      dateOccurred: new Date().toISOString().split('T')[0],
    },
  });

  const descriptionValue = watch('description', '');
  const todayStr = new Date().toISOString().split('T')[0];

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title.trim());
      formData.append('type', itemType);
      formData.append('category', data.category);
      formData.append('description', data.description.trim());
      formData.append('location', data.location.trim());
      formData.append('dateOccurred', data.dateOccurred);

      // Append images
      uploadedFiles.forEach((file) => {
        formData.append('images', file);
      });

      const response = await createItem(formData);
      const createdItem = response.data?.item || response.item || response.data;
      const itemId = createdItem._id || createdItem.id;

      toast.success(
        itemType === 'lost'
          ? 'Lost item report published!'
          : 'Found item report published! Thank you.'
      );

      navigate(itemId ? `/items/${itemId}` : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish item report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Back button */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Listings
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Report a Campus Item
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Provide accurate details to help connect this item with its rightful owner.
        </p>

        {/* Type Selector Toggle Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {/* Lost Toggle */}
          <div
            onClick={() => setItemType('lost')}
            className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-start space-x-3.5 ${
              itemType === 'lost'
                ? 'border-amber-500 bg-amber-50/50 shadow-md shadow-amber-500/10'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                itemType === 'lost' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <Search className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <p
                className={`text-sm font-bold ${
                  itemType === 'lost' ? 'text-amber-900' : 'text-slate-800'
                }`}
              >
                I Lost Something
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Report a misplaced possession to notify the campus.
              </p>
            </div>
          </div>

          {/* Found Toggle */}
          <div
            onClick={() => setItemType('found')}
            className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-start space-x-3.5 ${
              itemType === 'found'
                ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-500/10'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                itemType === 'found' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <p
                className={`text-sm font-bold ${
                  itemType === 'found' ? 'text-emerald-900' : 'text-slate-800'
                }`}
              >
                I Found Something
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Help return a discovered item safely to its owner.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Item Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Silver Dell XPS 15 with stickers, Black JBL Headset..."
              {...register('title', {
                required: 'Please enter a descriptive item title',
                minLength: { value: 3, message: 'Title must be at least 3 characters' },
                maxLength: { value: 100, message: 'Title cannot exceed 100 characters' },
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

          {/* Category & Date Occurred Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center">
                <Tag className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Category <span className="text-red-500 ml-0.5">*</span>
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

            {/* Date Occurred */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Date {itemType === 'lost' ? 'Lost' : 'Found'} <span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                type="date"
                max={todayStr}
                {...register('dateOccurred', {
                  required: 'Please specify the date',
                })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              {errors.dateOccurred && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">
                  {errors.dateOccurred.message}
                </p>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Campus Location <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 3rd Floor Library, Main Cafeteria, Basketball Court..."
              {...register('location', {
                required: 'Please state where this item was lost or found',
              })}
              className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.location
                  ? 'border-red-400 focus:ring-red-400'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
              }`}
            />
            {errors.location && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">
                {errors.location.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
                <FileText className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Description <span className="text-red-500 ml-0.5">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {descriptionValue.length}/1000 characters
              </span>
            </div>
            <textarea
              rows={4}
              placeholder="Describe color, brand, condition, and any distinguishing marks..."
              {...register('description', {
                required: 'Please provide a description of the item',
                maxLength: {
                  value: 1000,
                  message: 'Description cannot exceed 1000 characters',
                },
              })}
              className={`w-full p-4 rounded-xl border text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.description
                  ? 'border-red-400 focus:ring-red-400'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
              }`}
            />
            {errors.description && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Images Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Photographs (Optional, Up to 5)
            </label>
            <ImageUploader
              onChange={(files) => setUploadedFiles(files)}
              maxImages={5}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3">
          <Link
            to="/"
            className="px-5 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-7 py-3 rounded-xl text-sm font-bold text-white shadow-md transition-all flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed ${
              itemType === 'lost'
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing Listing...</span>
              </>
            ) : (
              <span>Publish {itemType === 'lost' ? 'Lost' : 'Found'} Report</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateItem;
