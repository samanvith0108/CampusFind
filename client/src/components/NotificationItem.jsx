import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle,
  XCircle,
  FileText,
  RotateCcw,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'claim_approved':
      return { icon: CheckCircle, bg: 'bg-emerald-100 text-emerald-600' };
    case 'claim_rejected':
      return { icon: XCircle, bg: 'bg-red-100 text-red-600' };
    case 'item_returned':
      return { icon: RotateCcw, bg: 'bg-indigo-100 text-indigo-600' };
    case 'claim_created':
    case 'claim_received':
      return { icon: FileText, bg: 'bg-amber-100 text-amber-600' };
    case 'match_found':
      return { icon: Sparkles, bg: 'bg-purple-100 text-purple-600' };
    default:
      return { icon: Bell, bg: 'bg-slate-100 text-slate-600' };
  }
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const past = new Date(dateStr);
  const diffInSec = Math.floor((now - past) / 1000);

  if (diffInSec < 60) return 'Just now';
  const diffInMin = Math.floor(diffInSec / 60);
  if (diffInMin < 60) return `${diffInMin}m ago`;
  const diffInHours = Math.floor(diffInMin / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  return past.toLocaleDateString();
};

const NotificationItem = ({ notification, onMarkRead }) => {
  if (!notification) return null;

  const isRead = Boolean(notification.isRead || notification.read);
  const { icon: Icon, bg } = getNotificationIcon(notification.type);
  const targetLink = notification.link || (notification.item ? `/items/${notification.item._id || notification.item}` : '/dashboard');

  const handleClick = () => {
    if (!isRead && onMarkRead) {
      onMarkRead(notification._id || notification.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative p-4 rounded-2xl border transition-all duration-200 flex items-start space-x-3.5 cursor-pointer ${
        isRead
          ? 'bg-white border-slate-200/80 hover:border-slate-300'
          : 'bg-indigo-50/40 border-indigo-200 hover:border-indigo-300 shadow-sm'
      }`}
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
        <Icon className="w-5 h-5 stroke-[2]" />
      </div>

      {/* Text Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={`text-sm ${isRead ? 'font-medium text-slate-700' : 'font-bold text-slate-900'}`}>
            {notification.title || 'Notification'}
          </p>
          <span className="text-[11px] font-medium text-slate-400 shrink-0">
            {formatTimeAgo(notification.createdAt)}
          </span>
        </div>

        <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
          {notification.message}
        </p>

        {targetLink && (
          <Link
            to={targetLink}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 mt-2 group/link"
          >
            <span>View details</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover/link:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>

      {/* Unread dot */}
      {!isRead && (
        <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0 mt-2 ring-4 ring-indigo-100" />
      )}
    </div>
  );
};

export default NotificationItem;
