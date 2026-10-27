import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  FileText,
  Inbox,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Archive,
  Edit3,
  PlusCircle,
  Package,
  RotateCcw,
  AlertCircle,
  ChevronRight,
  Loader2,
  Filter,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getItems, archiveItem, confirmReturn } from '../api/items.api';
import { getMyClaims, getClaimsForItem, reviewClaim, withdrawClaim } from '../api/claims.api';
import StatusBadge from '../components/StatusBadge';
import ClaimCard from '../components/ClaimCard';
import ConfirmDialog from '../components/ConfirmDialog';
import { ItemCardSkeleton, ClaimCardSkeleton } from '../components/Skeleton';
import { getImageUrl } from '../utils/imageUrl';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Overview stats
  const [stats, setStats] = useState({
    totalReports: 0,
    activeItems: 0,
    pendingClaims: 0,
    returnedItems: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [overviewLoading, setOverviewLoading] = useState(true);

  // My Reports Tab state
  const [myItems, setMyItems] = useState([]);
  const [reportsFilter, setReportsFilter] = useState({ type: 'all', status: 'all' });
  const [reportsLoading, setReportsLoading] = useState(false);

  // Incoming Claims Tab state
  const [incomingClaims, setIncomingClaims] = useState([]);
  const [incomingLoading, setIncomingLoading] = useState(false);

  // My Claims Tab state
  const [myClaims, setMyClaims] = useState([]);
  const [myClaimsLoading, setMyClaimsLoading] = useState(false);

  // Returned Items Tab state
  const [returnedItems, setReturnedItems] = useState([]);
  const [returnedLoading, setReturnedLoading] = useState(false);

  // Dialog state
  const [dialogConfig, setDialogConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    variant: 'danger',
    action: null,
  });
  const [isDialogProcessing, setIsDialogProcessing] = useState(false);

  // Helper: check if item belongs to current user
  const isMyItem = useCallback(
    (item) => {
      if (!user || !item) return false;
      const uid = user._id || user.id;
      const ownerId = item.reportedBy?._id || item.reportedBy?.id || item.reportedBy;
      return String(uid) === String(ownerId);
    },
    [user]
  );

  // Fetch Overview Data
  const loadOverviewData = useCallback(async () => {
    setOverviewLoading(true);
    try {
      // Fetch user items and claims
      const [itemsRes, claimsRes] = await Promise.allSettled([
        getItems({ limit: 100 }),
        getMyClaims(),
      ]);

      let userItemsList = [];
      if (itemsRes.status === 'fulfilled') {
        const raw = itemsRes.value.data?.items || itemsRes.value.items || (Array.isArray(itemsRes.value.data) ? itemsRes.value.data : []);
        userItemsList = raw.filter(isMyItem);
      }

      let userClaimsList = [];
      if (claimsRes.status === 'fulfilled') {
        userClaimsList = claimsRes.value.data?.claims || claimsRes.value.claims || (Array.isArray(claimsRes.value.data) ? claimsRes.value.data : []);
      }

      const activeCount = userItemsList.filter((it) => it.status === 'open').length;
      const returnedCount = userItemsList.filter((it) => it.status === 'returned').length;
      const pendingClaimsCount = userClaimsList.filter((c) => c.status === 'pending').length;

      setStats({
        totalReports: userItemsList.length,
        activeItems: activeCount,
        pendingClaims: pendingClaimsCount,
        returnedItems: returnedCount,
      });

      // Combine for recent activities list
      const activities = [
        ...userItemsList.map((item) => ({
          id: `item-${item._id || item.id}`,
          title: `Reported ${item.type} item: "${item.title}"`,
          date: item.createdAt || item.dateOccurred,
          type: item.type,
          link: `/items/${item._id || item.id}`,
          status: item.status,
        })),
        ...userClaimsList.map((claim) => ({
          id: `claim-${claim._id || claim.id}`,
          title: `Submitted claim for: "${claim.item?.title || 'Reported Item'}"`,
          date: claim.createdAt,
          type: 'claim',
          link: claim.item ? `/items/${claim.item._id || claim.item.id || claim.item}` : '#',
          status: claim.status,
        })),
      ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 5);

      setRecentActivities(activities);
    } catch (err) {
      console.error('Failed to load overview statistics', err);
    } finally {
      setOverviewLoading(false);
    }
  }, [isMyItem]);

  // Fetch My Reports
  const loadMyReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const res = await getItems({ limit: 100 });
      const raw = res.data?.items || res.items || (Array.isArray(res.data) ? res.data : []);
      setMyItems(raw.filter(isMyItem));
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setReportsLoading(false);
    }
  }, [isMyItem]);

  // Fetch Incoming Claims on user's found items
  const loadIncomingClaims = useCallback(async () => {
    setIncomingLoading(true);
    try {
      const itemsRes = await getItems({ limit: 100 });
      const raw = itemsRes.data?.items || itemsRes.items || (Array.isArray(itemsRes.data) ? itemsRes.data : []);
      const myFoundItems = raw.filter((it) => isMyItem(it) && it.type === 'found');

      const claimsPromises = myFoundItems.map((item) =>
        getClaimsForItem(item._id || item.id).catch(() => ({ data: { claims: [] } }))
      );

      const claimsResults = await Promise.all(claimsPromises);
      const aggregated = [];
      claimsResults.forEach((res, index) => {
        const itemClaims = res.data?.claims || res.claims || (Array.isArray(res.data) ? res.data : []);
        itemClaims.forEach((c) => {
          aggregated.push({ ...c, item: myFoundItems[index] });
        });
      });

      setIncomingClaims(aggregated);
    } catch (err) {
      toast.error('Failed to load incoming claims');
    } finally {
      setIncomingLoading(false);
    }
  }, [isMyItem]);

  // Fetch My Claims
  const loadMyClaims = useCallback(async () => {
    setMyClaimsLoading(true);
    try {
      const res = await getMyClaims();
      const list = res.data?.claims || res.claims || (Array.isArray(res.data) ? res.data : []);
      setMyClaims(list);
    } catch (err) {
      toast.error('Failed to load your claims');
    } finally {
      setMyClaimsLoading(false);
    }
  }, []);

  // Fetch Returned Items
  const loadReturnedItems = useCallback(async () => {
    setReturnedLoading(true);
    try {
      const res = await getItems({ limit: 100 });
      const raw = res.data?.items || res.items || (Array.isArray(res.data) ? res.data : []);
      const returned = raw.filter((it) => isMyItem(it) && it.status === 'returned');
      setReturnedItems(returned);
    } catch (err) {
      toast.error('Failed to load returned items');
    } finally {
      setReturnedLoading(false);
    }
  }, [isMyItem]);

  // Lazy tab loader
  useEffect(() => {
    if (activeTab === 'overview') loadOverviewData();
    if (activeTab === 'reports') loadMyReports();
    if (activeTab === 'incoming') loadIncomingClaims();
    if (activeTab === 'myclaims') loadMyClaims();
    if (activeTab === 'returned') loadReturnedItems();
  }, [activeTab, loadOverviewData, loadMyReports, loadIncomingClaims, loadMyClaims, loadReturnedItems]);

  // Actions
  const handleArchive = (itemId) => {
    setDialogConfig({
      isOpen: true,
      title: 'Archive Item?',
      message: 'This will hide the item from public campus listings.',
      confirmText: 'Archive',
      variant: 'danger',
      action: async () => {
        await archiveItem(itemId);
        toast.success('Item archived successfully');
        loadMyReports();
        loadOverviewData();
      },
    });
  };

  const handleConfirmReturn = (itemId) => {
    setDialogConfig({
      isOpen: true,
      title: 'Confirm Item Handover?',
      message: 'This will mark the item as successfully returned and close all pending claims.',
      confirmText: 'Mark Returned',
      variant: 'primary',
      action: async () => {
        await confirmReturn(itemId);
        toast.success('Item marked as returned!');
        loadMyReports();
        loadOverviewData();
      },
    });
  };

  const handleApproveClaim = async (claimId) => {
    try {
      await reviewClaim(claimId, { decision: 'approved' });
      toast.success('Claim approved! You can coordinate handover.');
      loadIncomingClaims();
    } catch (err) {
      toast.error('Failed to approve claim');
    }
  };

  const handleRejectClaim = async (claimId, reviewNote) => {
    try {
      await reviewClaim(claimId, { decision: 'rejected', reviewNote });
      toast.success('Claim rejected');
      loadIncomingClaims();
    } catch (err) {
      toast.error('Failed to reject claim');
    }
  };

  const handleWithdrawClaim = (claimId) => {
    setDialogConfig({
      isOpen: true,
      title: 'Withdraw Claim?',
      message: 'Are you sure you want to withdraw this ownership claim?',
      confirmText: 'Withdraw',
      variant: 'danger',
      action: async () => {
        await withdrawClaim(claimId);
        toast.success('Claim withdrawn');
        loadMyClaims();
        loadOverviewData();
      },
    });
  };

  const executeDialogAction = async () => {
    if (!dialogConfig.action) return;
    setIsDialogProcessing(true);
    try {
      await dialogConfig.action();
    } catch (e) {
      // handled in action
    } finally {
      setIsDialogProcessing(false);
      setDialogConfig((prev) => ({ ...prev, isOpen: false }));
    }
  };

  // Filtered reports
  const filteredReports = myItems.filter((item) => {
    if (reportsFilter.type !== 'all' && item.type !== reportsFilter.type) return false;
    if (reportsFilter.status !== 'all' && item.status !== reportsFilter.status) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back, <span className="font-semibold text-slate-800">{user?.name}</span>! Track your reports, claims, and returns.
          </p>
        </div>

        <Link
          to="/items/new"
          className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Report New Item
        </Link>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'reports', label: 'My Reports', icon: FileText },
          { id: 'incoming', label: 'Incoming Claims', icon: Inbox },
          { id: 'myclaims', label: 'My Claims', icon: ShieldCheck },
          { id: 'returned', label: 'Returned Items', icon: CheckCircle2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Reports
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                {overviewLoading ? '-' : stats.totalReports}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                Active Listings
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-2">
                {overviewLoading ? '-' : stats.activeItems}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                Pending Claims
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-2">
                {overviewLoading ? '-' : stats.pendingClaims}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                Items Returned
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 mt-2">
                {overviewLoading ? '-' : stats.returnedItems}
              </p>
            </div>
          </div>

          {/* Recent Activity List */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
              Recent Campus Activity
            </h2>

            {overviewLoading ? (
              <div className="space-y-3">
                <div className="w-full h-12 rounded-xl animate-shimmer" />
                <div className="w-full h-12 rounded-xl animate-shimmer" />
              </div>
            ) : recentActivities.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="py-3.5 flex items-center justify-between hover:bg-slate-50/60 rounded-xl px-2 transition-colors"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          act.type === 'lost'
                            ? 'bg-amber-100 text-amber-700'
                            : act.type === 'found'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {act.type === 'claim' ? (
                          <ShieldCheck className="w-4 h-4" />
                        ) : (
                          <Package className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                          {act.title}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {act.date ? new Date(act.date).toLocaleDateString() : 'Recent'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <StatusBadge status={act.status} />
                      {act.link && (
                        <Link
                          to={act.link}
                          className="p-1 text-slate-400 hover:text-indigo-600"
                          title="View"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No recent activity recorded.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {/* Sub Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Filter:
              </span>
              <select
                value={reportsFilter.type}
                onChange={(e) => setReportsFilter((p) => ({ ...p, type: e.target.value }))}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="all">All Types</option>
                <option value="lost">Lost Items</option>
                <option value="found">Found Items</option>
              </select>

              <select
                value={reportsFilter.status}
                onChange={(e) => setReportsFilter((p) => ({ ...p, status: e.target.value }))}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="returned">Returned</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <span className="text-xs text-slate-400 font-medium">
              Showing {filteredReports.length} reports
            </span>
          </div>

          {reportsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ItemCardSkeleton />
              <ItemCardSkeleton />
            </div>
          ) : filteredReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReports.map((item) => (
                <div
                  key={item._id || item.id}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            item.type === 'lost'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.type}
                        </span>
                        <StatusBadge status={item.status} />
                      </div>
                      <Link
                        to={`/items/${item._id || item.id}`}
                        className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1"
                      >
                        {item.title}
                      </Link>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {item.location} • {item.dateOccurred ? new Date(item.dateOccurred).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>

                    {item.images && item.images.length > 0 && (
                      <img
                        src={getImageUrl(Array.isArray(item.images) ? item.images[0] : item.images)}
                        alt={item.title}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <Link
                      to={`/items/${item._id || item.id}`}
                      className="font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      View Details →
                    </Link>

                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/items/${item._id || item.id}/edit`}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Link>

                      {item.status !== 'archived' && (
                        <button
                          type="button"
                          onClick={() => handleArchive(item._id || item.id)}
                          className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                          title="Archive"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {item.status !== 'returned' && (
                        <button
                          type="button"
                          onClick={() => handleConfirmReturn(item._id || item.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold text-[11px] hover:bg-emerald-700"
                        >
                          Handover
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
              No reports matching the selected filters.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: INCOMING CLAIMS */}
      {activeTab === 'incoming' && (
        <div className="space-y-4">
          {incomingLoading ? (
            <div className="space-y-3">
              <ClaimCardSkeleton />
              <ClaimCardSkeleton />
            </div>
          ) : incomingClaims.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incomingClaims.map((claim) => (
                <ClaimCard
                  key={claim._id || claim.id}
                  claim={claim}
                  isOwner={true}
                  onApprove={handleApproveClaim}
                  onReject={handleRejectClaim}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
              No incoming claims on your reported items.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MY CLAIMS */}
      {activeTab === 'myclaims' && (
        <div className="space-y-4">
          {myClaimsLoading ? (
            <div className="space-y-3">
              <ClaimCardSkeleton />
              <ClaimCardSkeleton />
            </div>
          ) : myClaims.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myClaims.map((claim) => (
                <ClaimCard
                  key={claim._id || claim.id}
                  claim={claim}
                  isOwner={false}
                  onWithdraw={handleWithdrawClaim}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
              You haven't submitted any ownership claims yet.
            </div>
          )}
        </div>
      )}

      {/* TAB 5: RETURNED ITEMS */}
      {activeTab === 'returned' && (
        <div className="space-y-4">
          {returnedLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ItemCardSkeleton />
            </div>
          ) : returnedItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {returnedItems.map((item) => (
                <div
                  key={item._id || item.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <StatusBadge status="returned" />
                      <span className="text-xs text-slate-400 font-medium capitalize">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{item.location}</p>
                  </div>
                  <Link
                    to={`/items/${item._id || item.id}`}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
              No items marked as returned yet.
            </div>
          )}
        </div>
      )}

      {/* Reusable Confirm Dialog */}
      <ConfirmDialog
        isOpen={dialogConfig.isOpen}
        title={dialogConfig.title}
        message={dialogConfig.message}
        confirmText={dialogConfig.confirmText}
        confirmVariant={dialogConfig.variant}
        isLoading={isDialogProcessing}
        onConfirm={executeDialogAction}
        onCancel={() => setDialogConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default Dashboard;
