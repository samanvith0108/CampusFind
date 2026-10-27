import React, { useState } from 'react';
import { Bell, CheckCheck, Filter, Inbox } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationItem from '../components/NotificationItem';
import Pagination from '../components/Pagination';

const Notifications = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [filterType, setFilterType] = useState('all'); // 'all' | 'unread'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredList = notifications.filter((item) => {
    if (filterType === 'unread') {
      return !item.isRead && !item.read;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedList = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600 border border-red-200">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Stay updated with claims, handovers, and activity on your campus listings.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors shrink-0"
          >
            <CheckCheck className="w-4 h-4 mr-1.5" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setFilterType('all');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filterType === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => {
              setFilterType('unread');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filterType === 'unread'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Page {currentPage} of {totalPages}
        </span>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={`skel-notif-${idx}`} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 animate-shimmer h-20" />
          ))}
        </div>
      ) : paginatedList.length > 0 ? (
        <div className="space-y-3">
          {paginatedList.map((notification) => (
            <NotificationItem
              key={notification._id || notification.id}
              notification={notification}
              onMarkRead={markAsRead}
            />
          ))}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            {filterType === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {filterType === 'unread'
              ? 'You are all caught up! Check back later for updates on your items.'
              : 'When someone submits an ownership claim or reports a match, you’ll see it here.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
