import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  ShieldAlert,
  Package,
  Users,
  Archive,
  Eye,
  Filter,
  Search,
} from 'lucide-react';
import {
  archiveAdminItem,
  getAdminReports,
  getAdminUsers,
  updateAdminUserStatus,
} from '../api/admin.api';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('items'); // 'items' | 'users'
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [itemPagination, setItemPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const [userPagination, setUserPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const [itemStats, setItemStats] = useState({ total: 0, open: 0, returned: 0, archived: 0 });
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [itemPage, setItemPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog state
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // The admin endpoint includes archived reports and provides paginated results.
  const fetchAllItems = useCallback(async () => {
    setLoadingItems(true);
    try {
      const params = { page: itemPage, limit: 25 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery.trim()) params.keyword = searchQuery.trim();

      const res = await getAdminReports(params);
      setItems(res.data?.items || []);
      const pagination = res.data?.pagination || {};
      setItemPagination({
        currentPage: pagination.page || itemPage,
        totalPages: pagination.totalPages || 1,
        total: pagination.total || 0,
      });
      setItemStats(res.data?.stats || { total: 0, open: 0, returned: 0, archived: 0 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load reports for admin panel');
    } finally {
      setLoadingItems(false);
    }
  }, [itemPage, searchQuery, statusFilter]);

  // Fetch the real campus user directory from the admin API.
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await getAdminUsers({ page: userPage, limit: 50 });
      setUsers(res.data?.users || []);
      const pagination = res.data?.pagination || {};
      setUserPagination({
        currentPage: pagination.page || userPage,
        totalPages: pagination.totalPages || 1,
        total: pagination.total || 0,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load community users');
    } finally {
      setLoadingUsers(false);
    }
  }, [userPage]);

  useEffect(() => {
    fetchAllItems();
  }, [fetchAllItems]);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [activeTab, fetchUsers]);

  const handleArchiveConfirm = async () => {
    if (!selectedItemId) return;
    setActionLoading(true);
    try {
      await archiveAdminItem(selectedItemId);
      toast.success('Item archived by Admin');
      if (itemPage === 1) {
        await fetchAllItems();
      } else {
        setItemPage(1);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to archive item');
    } finally {
      setActionLoading(false);
      setShowArchiveDialog(false);
      setSelectedItemId(null);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const nextStatus = !currentStatus;
      await updateAdminUserStatus(userId, nextStatus);
      toast.success(`User ${nextStatus ? 'activated' : 'deactivated'}`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: nextStatus } : u))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change user status');
    }
  };

  const totalItemsCount = itemStats.total;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black tracking-tight">Admin Moderation Console</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 uppercase">
                Staff Only
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Campus oversight, item moderation, and user governance.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            All Listings
          </span>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{totalItemsCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            Open
          </span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-2">{itemStats.open}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            Returned
          </span>
          <p className="text-2xl font-extrabold text-indigo-600 mt-2">{itemStats.returned}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Archived
          </span>
          <p className="text-2xl font-extrabold text-slate-500 mt-2">{itemStats.archived}</p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('items')}
          className={`flex items-center px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'items'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4 mr-2" />
          Campus Listings ({totalItemsCount})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4 mr-2" />
          Community Users
        </button>
      </div>

      {/* Tab 1: All Items List */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search items by title or location..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setItemPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                <Filter className="w-3.5 h-3.5 mr-1" />
                Status:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setItemPage(1);
                }}
                className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All ({totalItemsCount})</option>
                <option value="open">Open</option>
                <option value="returned">Returned</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Items Table */}
          {loadingItems ? (
            <div className="space-y-3">
              <div className="w-full h-14 rounded-2xl animate-shimmer" />
              <div className="w-full h-14 rounded-2xl animate-shimmer" />
              <div className="w-full h-14 rounded-2xl animate-shimmer" />
            </div>
          ) : items.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3.5 px-4">Item</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Reporter</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {items.map((it) => (
                      <tr key={it._id || it.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <Link
                            to={`/items/${it._id || it.id}`}
                            className="font-bold text-slate-800 hover:text-indigo-600 line-clamp-1"
                          >
                            {it.title}
                          </Link>
                          <span className="text-[11px] text-slate-400">
                            {it.location || 'Campus'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              it.type === 'lost'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {it.type}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 capitalize">
                          {it.category || 'General'}
                        </td>

                        <td className="py-3.5 px-4 text-slate-600">
                          {it.reportedBy?.name || 'Student'}
                        </td>

                        <td className="py-3.5 px-4">
                          <StatusBadge status={it.status} />
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-2">
                          <Link
                            to={`/items/${it._id || it.id}`}
                            className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            View
                          </Link>

                          {it.status !== 'archived' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedItemId(it._id || it.id);
                                setShowArchiveDialog(true);
                              }}
                              className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200"
                            >
                              <Archive className="w-3.5 h-3.5 mr-1" />
                              Archive
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
              No items matching criteria.
            </div>
          )}
          {!loadingItems && itemPagination.totalPages > 1 && (
            <Pagination
              currentPage={itemPagination.currentPage}
              totalPages={itemPagination.totalPages}
              onPageChange={setItemPage}
            />
          )}
        </div>
      )}

      {/* Tab 2: Users List */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {loadingUsers ? (
            <div className="space-y-3">
              <div className="w-full h-12 rounded-xl animate-shimmer" />
              <div className="w-full h-12 rounded-xl animate-shimmer" />
            </div>
          ) : users.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3.5 px-4">Name</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Moderation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800">{u.name}</td>
                        <td className="py-3.5 px-4 text-slate-600">{u.email}</td>
                        <td className="py-3.5 px-4 capitalize">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {u.role || 'student'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            u.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {u.isActive !== false ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleUserStatus(u._id, u.isActive !== false)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                              u.isActive !== false
                                ? 'text-red-600 bg-red-50 hover:bg-red-100'
                                : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                            }`}
                          >
                            {u.isActive !== false ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              <Users className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              No community users found.
            </div>
          )}
          {!loadingUsers && userPagination.totalPages > 1 && (
            <Pagination
              currentPage={userPagination.currentPage}
              totalPages={userPagination.totalPages}
              onPageChange={setUserPage}
            />
          )}
        </div>
      )}

      {/* Confirm Archive Modal */}
      <ConfirmDialog
        isOpen={showArchiveDialog}
        title="Admin Archive Confirmation"
        message="As an administrator, archiving this item will remove it immediately from the public catalog."
        confirmText="Confirm Archive"
        confirmVariant="danger"
        isLoading={actionLoading}
        onConfirm={handleArchiveConfirm}
        onCancel={() => {
          setShowArchiveDialog(false);
          setSelectedItemId(null);
        }}
      />
    </div>
  );
};

export default AdminDashboard;
