import React, { useState } from 'react';
import {
  Search,
  Filter,
  X,
  Calendar,
  MapPin,
  Tag,
  ArrowUpDown,
  RotateCcw,
} from 'lucide-react';
import { ITEM_CATEGORIES } from '../constants/itemCategories';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'returned', label: 'Returned' },
  { value: 'resolved', label: 'Resolved' },
];

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest Reports' },
  { value: 'createdAt', label: 'Oldest Reports' },
  { value: '-dateOccurred', label: 'Recently Lost or Found' },
];

const SearchFilters = ({ filters = {}, onChange, onSearch }) => {
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const handleFieldChange = (field, value) => {
    onChange({
      ...filters,
      [field]: value,
      page: 1, // reset page on filter change
    });
  };

  const handleClearFilters = () => {
    onChange({
      keyword: '',
      type: '',
      category: '',
      location: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      sort: '-createdAt',
      page: 1,
    });
  };

  const hasActiveFilters = Boolean(
    filters.keyword ||
      filters.type ||
      (filters.category && filters.category !== 'All Categories') ||
      filters.location ||
      filters.status ||
      filters.dateFrom ||
      filters.dateTo ||
      (filters.sort && filters.sort !== '-createdAt')
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 mb-8">
      {/* Top Bar: Search Bar + Type Toggle + Mobile Filter Trigger */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Keyword Search */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by keywords (e.g. Blue HydroFlask, Casio Watch, AirPods)..."
            value={filters.keyword || ''}
            onChange={(e) => handleFieldChange('keyword', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
          />
          {filters.keyword && (
            <button
              onClick={() => handleFieldChange('keyword', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Clear keyword"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start lg:self-auto w-full sm:w-auto justify-center">
          <button
            type="button"
            onClick={() => handleFieldChange('type', '')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex-1 sm:flex-none ${
              !filters.type
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Items
          </button>
          <button
            type="button"
            onClick={() => handleFieldChange('type', 'lost')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex-1 sm:flex-none ${
              filters.type === 'lost'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lost
          </button>
          <button
            type="button"
            onClick={() => handleFieldChange('type', 'found')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex-1 sm:flex-none ${
              filters.type === 'found'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Found
          </button>
        </div>

        {/* Mobile Toggle Button */}
        <div className="flex items-center space-x-2 lg:hidden">
          <button
            type="button"
            onClick={() => setIsOpenMobile((prev) => !prev)}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium border border-slate-200 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100"
          >
            <Filter className="w-4 h-4 mr-2 text-slate-500" />
            {isOpenMobile ? 'Hide Filters' : 'More Filters'}
            {hasActiveFilters && (
              <span className="ml-2 w-2 h-2 rounded-full bg-indigo-600"></span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 hover:text-red-600"
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Extended Filters Grid (Desktop always visible, mobile collapsible) */}
      <div
        className={`mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 ${
          isOpenMobile ? 'grid' : 'hidden lg:grid'
        }`}
      >
        {/* Category */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center">
            <Tag className="w-3 h-3 mr-1 text-slate-400" />
            Category
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleFieldChange('category', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {ITEM_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center">
            <MapPin className="w-3 h-3 mr-1 text-slate-400" />
            Campus Location
          </label>
          <input
            type="text"
            placeholder="e.g. Library, Cafe, Lab 4..."
            value={filters.location || ''}
            onChange={(e) => handleFieldChange('location', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Date From & To Combined */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center">
            <Calendar className="w-3 h-3 mr-1 text-slate-400" />
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleFieldChange('dateFrom', e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="From date"
            />
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleFieldChange('dateTo', e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="To date"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center">
            <Filter className="w-3 h-3 mr-1 text-slate-400" />
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFieldChange('status', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center">
              <ArrowUpDown className="w-3 h-3 mr-1 text-slate-400" />
              Sort By
            </label>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="hidden lg:inline-flex items-center text-[11px] font-semibold text-slate-400 hover:text-red-600 transition-colors"
              >
                <RotateCcw className="w-3 h-3 mr-0.5" />
                Reset
              </button>
            )}
          </div>
          <select
            value={filters.sort || 'newest'}
            onChange={(e) => handleFieldChange('sort', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
