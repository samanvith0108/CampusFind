import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Tag,
  Laptop,
  Smartphone,
  FileText,
  Key,
  Briefcase,
  HelpCircle,
  Eye,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { getImageUrl } from '../utils/imageUrl';

// Helper to pick category icon
const getCategoryIcon = (category) => {
  const norm = (category || '').toLowerCase();
  if (norm.includes('electronic') || norm.includes('laptop')) return Laptop;
  if (norm.includes('phone') || norm.includes('mobile')) return Smartphone;
  if (norm.includes('document') || norm.includes('card') || norm.includes('id')) return FileText;
  if (norm.includes('key')) return Key;
  if (norm.includes('bag') || norm.includes('backpack')) return Briefcase;
  return Tag;
};

const ItemCard = ({ item }) => {
  if (!item) return null;

  const isLost = item.type === 'lost';
  const CategoryIcon = getCategoryIcon(item.category);
  const formattedDate = item.dateOccurred
    ? new Date(item.dateOccurred).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  // Extract first image url if array or string
  const firstImage = Array.isArray(item.images) ? item.images[0] : item.images;
  const imageUrl = getImageUrl(firstImage);

  return (
    <Link
      to={`/items/${item._id || item.id}`}
      className="group card overflow-hidden flex flex-col h-full bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 transition-all duration-300"
    >
      {/* Image or gradient placeholder */}
      <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div
            className={`w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br ${
              isLost
                ? 'from-amber-100/60 via-amber-50 to-orange-100/50 text-amber-600'
                : 'from-emerald-100/60 via-emerald-50 to-teal-100/50 text-emerald-600'
            }`}
          >
            <CategoryIcon className="w-12 h-12 stroke-[1.5] mb-2 opacity-80 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-xs font-medium uppercase tracking-wider opacity-75">
              {item.category || 'Item'}
            </span>
          </div>
        )}

        {/* Type Badge: Top Left */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
              isLost
                ? 'bg-amber-500 text-white shadow-amber-500/20'
                : 'bg-emerald-600 text-white shadow-emerald-600/20'
            }`}
          >
            {isLost ? 'Lost Item' : 'Found Item'}
          </span>
        </div>

        {/* Status Badge: Top Right */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={item.status || 'open'} />
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Pill */}
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 mb-2">
            <CategoryIcon className="w-3.5 h-3.5 text-indigo-500" />
            <span className="capitalize">{item.category || 'General'}</span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2 leading-snug">
            {item.title}
          </h3>

          {/* Optional brief description snippet */}
          {item.description && (
            <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        {/* Metadata Footer */}
        <div className="pt-3 border-t border-slate-100 flex flex-col space-y-1.5 text-xs text-slate-500 font-medium">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-slate-600 truncate max-w-[65%]">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{item.location || 'Campus'}</span>
            </div>

            <div className="flex items-center space-x-1 text-slate-400 shrink-0">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;
