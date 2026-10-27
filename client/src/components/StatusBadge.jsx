import React from 'react';
import {
  CheckCircle,
  Clock,
  Archive,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

const StatusBadge = ({ status }) => {
  const normStatus = (status || '').toLowerCase();

  let config = {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: HelpCircle,
    label: status || 'Unknown',
  };

  switch (normStatus) {
    case 'open':
      config = {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: CheckCircle,
        label: 'Open',
      };
      break;
    case 'returned':
      config = {
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        icon: RotateCcw,
        label: 'Returned',
      };
      break;
    case 'resolved':
      config = {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        icon: CheckCircle2,
        label: 'Resolved',
      };
      break;
    case 'archived':
    case 'closed':
      config = {
        bg: 'bg-slate-100',
        text: 'text-slate-600',
        border: 'border-slate-200',
        icon: Archive,
        label: normStatus === 'closed' ? 'Closed' : 'Archived',
      };
      break;
    case 'pending':
      config = {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: Clock,
        label: 'Pending',
      };
      break;
    case 'approved':
      config = {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: CheckCircle2,
        label: 'Approved',
      };
      break;
    case 'rejected':
      config = {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: XCircle,
        label: 'Rejected',
      };
      break;
    case 'withdrawn':
      config = {
        bg: 'bg-slate-100',
        text: 'text-slate-500',
        border: 'border-slate-200',
        icon: AlertCircle,
        label: 'Withdrawn',
      };
      break;
    default:
      config = {
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-200',
        icon: HelpCircle,
        label: normStatus ? normStatus.charAt(0).toUpperCase() + normStatus.slice(1) : 'Unknown',
      };
  }

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} shadow-sm tracking-wide`}
    >
      <Icon className="w-3.5 h-3.5 mr-1 stroke-[2.2]" />
      {config.label}
    </span>
  );
};

export default StatusBadge;
