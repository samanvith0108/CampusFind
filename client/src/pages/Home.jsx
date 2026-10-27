import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Search,
  PlusCircle,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  Package,
} from 'lucide-react';
import { useItems } from '../hooks/useItems';
import ItemCard from '../components/ItemCard';
import SearchFilters from '../components/SearchFilters';
import Pagination from '../components/Pagination';
import { ItemCardSkeleton } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [filters, setFilters] = useState({
    keyword: '',
    type: '',
    category: '',
    location: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    sort: '-createdAt',
    page: 1,
    limit: 9,
  });

  const { items, loading, error, pagination, refetch } = useItems(filters);

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 480, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 sm:p-12 lg:p-16 shadow-2xl">
        {/* Glow and decoration accents */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-12 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-indigo-200 mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Official SST Scaler Campus Community Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-tight mb-4">
            Find What You’ve Lost.{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Return What You’ve Found.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl font-normal leading-relaxed">
            A fast, secure, and student-verified hub to reunite lost belongings with their rightful owners across campus.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/items/new?type=lost"
              className="inline-flex items-center px-6 py-3.5 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Report Lost Item
            </Link>

            <Link
              to="/items/new?type=found"
              className="inline-flex items-center px-6 py-3.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Report Found Item
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-6 text-left">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">100%</p>
              <p className="text-xs text-slate-400 font-medium">Campus Verified (@sst.scaler.com)</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">85%+</p>
              <p className="text-xs text-slate-400 font-medium">Items Reunited Safely</p>
            </div>
            <div className="hidden sm:block">
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-400">24/7</p>
              <p className="text-xs text-slate-400 font-medium">Active Campus Community</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters Section */}
      <section id="browse-items" className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Campus Listings
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Browse recent lost and found posts, filter by location, or submit a claim
            </p>
          </div>
          {pagination.total > 0 && (
            <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
              {pagination.total} item{pagination.total > 1 ? 's' : ''} listed
            </span>
          )}
        </div>

        {/* Filters Widget */}
        <SearchFilters filters={filters} onChange={setFilters} />

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2 text-sm font-medium">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={refetch}
              className="text-xs font-bold underline hover:no-underline text-red-800"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <ItemCardSkeleton key={`skeleton-${idx}`} />
            ))}
          </div>
        ) : items && items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <ItemCard key={item._id || item.id} item={item} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Package className="w-8 h-8 stroke-[1.7]" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No items found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
              We couldn't find any items matching your active criteria. Try broadening your keywords or resetting filters.
            </p>
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={() =>
                  setFilters({
                    keyword: '',
                    type: '',
                    category: '',
                    location: '',
                    status: '',
                    dateFrom: '',
                    dateTo: '',
                    sort: '-createdAt',
                    page: 1,
                    limit: 9,
                  })
                }
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Clear all filters
              </button>
              <Link
                to="/items/new"
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors"
              >
                Post an item
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
