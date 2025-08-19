import React, { useState, useEffect } from 'react';
import { HelpingHand, Shield, Trophy, Eye } from 'lucide-react';
import { api } from '../../lib/api';
import MobileModal from '../MobileModal';
import { API } from '../../lib/api';

const CommunityReports = ({ initialFilters }) => {
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null); // { type: 'success'|'error'|'info', message }
  const [bulkErrors, setBulkErrors] = useState([]); // [{ id, error }]
  const [selectedReports, setSelectedReports] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState('');

  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 20,
    status: '',
    urgency: '',
    threat_type: '',
    verified: ''
  });

  // Apply initial filters on mount
  useEffect(() => {
    if (initialFilters && Object.keys(initialFilters).length > 0) {
      setFilters(prev => ({ ...prev, ...initialFilters, page: 1 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/api/admin/reports?${params}`);
      const data = await response.json();
      setReports(data.reports || []);
      setPagination(data.pagination || {});
      setError(null);
    } catch (err) {
      setError('Failed to load community reports');
      console.error('Reports error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportAction = async (reportId, action) => {
    try {
      let response;
      if (action === 'verify') {
        // Use community verify endpoint to set verified=true and status=VERIFIED
        response = await api.request({
          method: 'POST',
          url: `/api/community/reports/${reportId}/verify`
        });
      } else {
        const actionMap = {
          reject: 'REJECTED',
          escalate: 'FLAGGED',
          approve: 'APPROVED'
        };
        const mapped = actionMap[action] || actionMap['approve'];
        response = await api.request({
          method: 'PUT',
          url: `/api/admin/reports/${reportId}/moderate`,
          data: { action: mapped }
        });
      }
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to ${action} report`);
      }

      // Refresh reports list
      fetchReports();
      setSelectedReports([]);
    } catch (err) {
      console.error('Report action error:', err);
      alert(`Failed to ${action} report: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedReports.length === 0) return;

    setBulkErrors([]);
    try {
      if (bulkAction === 'delete') {
        if (!window.confirm(`Delete ${selectedReports.length} report(s)? This cannot be undone.`)) return;
      }

      const results = await Promise.allSettled(selectedReports.map(async (id) => {
        if (bulkAction === 'verify') {
          const response = await api.request({ method: 'POST', url: `/api/community/reports/${id}/verify` });
          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `Failed to verify report ${id}`);
          }
          return { id };
        }
        if (bulkAction === 'delete') {
          const response = await api.request({ method: 'DELETE', url: `/api/admin/reports/${id}` });
          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `Failed to delete report ${id}`);
          }
          return { id };
        }
        const actionMap = { reject: 'REJECTED', approve: 'APPROVED' };
        const mapped = actionMap[bulkAction] || actionMap['approve'];
        const response = await api.request({ method: 'PUT', url: `/api/admin/reports/${id}/moderate`, data: { action: mapped } });
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to ${bulkAction} report ${id}`);
        }
        return { id };
      }));

      const failed = results
        .map((r, idx) => ({ r, id: selectedReports[idx] }))
        .filter(x => x.r.status === 'rejected')
        .map(x => ({ id: x.id, error: x.r.reason?.message || 'Unknown error' }));
      const succeeded = results.filter(r => r.status === 'fulfilled').length;

      // Refresh list
      fetchReports();
      setSelectedReports([]);
      setShowBulkModal(false);
      setBulkAction('');

      if (failed.length > 0) {
        setBulkErrors(failed);
        setToast({ type: 'error', message: `Bulk ${bulkAction}: ${succeeded} succeeded, ${failed.length} failed` });
      } else {
        setToast({ type: 'success', message: `Bulk ${bulkAction}: ${succeeded} succeeded` });
      }
      setTimeout(() => setToast(null), 3500);
    } catch (err) {
      console.error('Bulk action error:', err);
      setToast({ type: 'error', message: err.response?.data?.error || err.message || 'Bulk action failed' });
      setTimeout(() => setToast(null), 4500);
    }
  };

  const handleReportSelect = (reportId) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleSelectAll = () => {
    if (selectedReports.length === reports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(reports.map(report => report.id));
    }
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const ReportRow = ({ report }) => (
    <div className="bg-white border rounded-lg p-4 mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={selectedReports.includes(report.id)}
            onChange={() => handleReportSelect(report.id)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                report.urgency === 'HIGH' ? 'bg-red-100 text-red-800' :
                report.urgency === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {report.urgency === 'HIGH' ? 'Ongoing Scam' : report.urgency === 'MEDIUM' ? 'Scam' : 'Caution'}
              </span>
              {report.status !== 'VERIFIED' && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  report.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  report.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  report.status === 'ESCALATED' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {report.status}
                </span>
              )}
              {(report.verified || report.status === 'VERIFIED') && (
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  ✓ Verified
                </span>
              )}
            </div>
            <h4 className="font-medium text-gray-900">{report.threat_type}</h4>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{report.description}</p>
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <span>Location: {report.location || 'N/A'}</span>
              <span>Votes: +{report.votes_up} / -{report.votes_down}</span>
              <span>Created: {new Date(report.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setSelectedReport(report);
              setShowReportModal(true);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View
          </button>
          <div className="relative">
            <select
              onChange={(e) => handleReportAction(report.id, e.target.value)}
              className="text-sm border rounded px-2 py-1"
              defaultValue=""
            >
              <option value="" disabled>Actions</option>
              {report.status === 'PENDING' && (
                <>
                  <option value="approve">Approve</option>
                  <option value="verify">Verify</option>
                  <option value="reject">Reject</option>
                  <option value="escalate">Flag</option>
                </>
              )}
              {report.status === 'APPROVED' && (
                <>
                  <option value="verify">Verify</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const ReportDetailModal = () => {
    const reporterObj = selectedReport && selectedReport.reporter && typeof selectedReport.reporter === 'object' ? selectedReport.reporter : null;
    const reporterName = selectedReport ? (
      (selectedReport.creator && (selectedReport.creator.username || selectedReport.creator.name)) ||
      selectedReport.creator_name ||
      selectedReport.user_name ||
      (reporterObj && (reporterObj.username || reporterObj.email || reporterObj.name)) ||
      (selectedReport.user && (selectedReport.user.username || selectedReport.user.name)) ||
      selectedReport.user_email ||
      selectedReport.email ||
      (typeof selectedReport.reporter === 'string' ? selectedReport.reporter : '') ||
      'Anonymous'
    ) : '';
    const reporterTier = selectedReport ? (
      (selectedReport.creator && selectedReport.creator.tier) ||
      selectedReport.creator_tier ||
      (selectedReport.user && selectedReport.user.tier) ||
      (reporterObj && reporterObj.tier) ||
      selectedReport.tier ||
      ''
    ) : '';
    return (
      <MobileModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Report Details"
        hideOnDesktop={false}
        fullScreen
      >
        {selectedReport && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Threat Type</label>
              <p className="text-gray-900">{selectedReport.threat_type}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reporter</label>
              <div className="flex items-center gap-2 text-gray-900">
                <span>{reporterName}</span>
                {reporterTier && (() => {
                  const t = String(reporterTier).toLowerCase();
                  let badgeBg = 'bg-gray-100 text-gray-700';
                  let iconColor = 'text-gray-600';
                  let iconEl = null;
                  if (t.includes('helper')) {
                    badgeBg = 'bg-blue-100 text-blue-700';
                    iconColor = 'text-blue-600';
                    iconEl = <HelpingHand className={`w-3.5 h-3.5 ${iconColor}`} />;
                  } else if (t.includes('ally')) {
                    badgeBg = 'bg-purple-100 text-purple-700';
                    iconColor = 'text-purple-600';
                    iconEl = <Shield className={`w-3.5 h-3.5 ${iconColor}`} />;
                  } else if (t.includes('champion')) {
                    badgeBg = 'bg-yellow-100 text-yellow-700';
                    iconColor = 'text-yellow-600';
                    iconEl = <Trophy className={`w-3.5 h-3.5 ${iconColor}`} />;
                  } else if (t.includes('guardian')) {
                    badgeBg = 'bg-emerald-100 text-emerald-700';
                    iconColor = 'text-emerald-600';
                    iconEl = (
                      <span className="relative inline-block w-4 h-4">
                        <Shield className={`w-4 h-4 absolute inset-0 ${iconColor}`} />
                        <Eye className="w-2.5 h-2.5 absolute bottom-0 right-0 text-emerald-700" />
                      </span>
                    );
                  }
                  return (
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs ${badgeBg}`}>
                      {iconEl}
                      <span className="leading-none">{reporterTier}</span>
                    </span>
                  );
                })()}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Urgency</label>
              <p className="text-gray-900">{selectedReport.urgency}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <p className="text-gray-900">{selectedReport.status}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Verified</label>
              <p className="text-gray-900">{selectedReport.verified ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <p className="text-gray-900">{selectedReport.location || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Created</label>
              <p className="text-gray-900">
                {new Date(selectedReport.created_at).toLocaleString()}
              </p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <p className="text-gray-900">{selectedReport.description}</p>
          </div>

          {selectedReport.media && selectedReport.media.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
              <div className="grid grid-cols-3 gap-2">
                {selectedReport.media.map((m, idx) => {
                  const url = m.media_url?.startsWith('http') ? m.media_url : `${API}${m.media_url}`;
                  return (
                    <a
                      key={m.id || idx}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-full h-24 bg-gray-100 rounded overflow-hidden"
                    >
                      <img
                        src={url}
                        alt="attachment"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Up Votes</label>
              <p className="text-gray-900">{selectedReport.votes_up}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Down Votes</label>
              <p className="text-gray-900">{selectedReport.votes_down}</p>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-2">Quick Actions</h4>
            <div className="flex space-x-2">
              {selectedReport.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => {
                      handleReportAction(selectedReport.id, 'approve');
                      setShowReportModal(false);
                    }}
                    className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      handleReportAction(selectedReport.id, 'verify');
                      setShowReportModal(false);
                    }}
                    className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                  >
                    Verify
                  </button>
                  <button
                    onClick={() => {
                      handleReportAction(selectedReport.id, 'reject');
                      setShowReportModal(false);
                    }}
                    className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                  >
                    Reject
                  </button>
                </>
              )}
              {selectedReport.status === 'APPROVED' && (
                <button
                  onClick={() => {
                    handleReportAction(selectedReport.id, 'verify');
                    setShowReportModal(false);
                  }}
                  className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                >
                  Verify
                </button>
              )}
              <button
                onClick={async () => {
                  if (!confirm('Delete this report?')) return;
                  try {
                    const response = await api.request({ method: 'DELETE', url: `/api/admin/reports/${selectedReport.id}` });
                    if (!response.ok) throw new Error('Delete failed');
                    setShowReportModal(false);
                    fetchReports();
                  } catch (e) {
                    alert('Failed to delete report');
                  }
                }}
                className="bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
        )}
      </MobileModal>
    );
  };

  const BulkActionModal = () => (
    <MobileModal
      isOpen={showBulkModal}
      onClose={() => setShowBulkModal(false)}
      title="Bulk Actions"
      hideOnDesktop={false}
      fullScreen
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Action for {selectedReports.length} selected reports
          </label>
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Select action...</option>
            <option value="approve">Approve</option>
            <option value="verify">Verify</option>
            <option value="reject">Reject</option>
            <option value="delete">Delete</option>
          </select>
        </div>
        
        <div className="pt-4 border-t">
          <div className="flex space-x-2">
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              Apply Action
            </button>
            <button
              onClick={() => setShowBulkModal(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </MobileModal>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Community Reports</h1>
            <p className="text-gray-600">Manage and moderate community threat reports</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-2">
            {selectedReports.length > 0 && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowBulkModal(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Bulk Actions ({selectedReports.length})
              </button>
            )}
            <button
              onClick={fetchReports}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => updateFilters({ status: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
              <option value="ESCALATED">Escalated</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select
              value={filters.urgency}
              onChange={(e) => updateFilters({ urgency: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">All Severity</option>
              <option value="HIGH">Ongoing Scam</option>
              <option value="MEDIUM">Scam</option>
              <option value="LOW">Caution</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.threat_type}
              onChange={(e) => updateFilters({ threat_type: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">All Categories</option>
              <option value="PHISHING">Phishing</option>
              <option value="MALWARE">Malware</option>
              <option value="SCAM">Scam</option>
              <option value="SOCIAL_ENGINEERING">Social Engineering</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verified</label>
            <select
              value={filters.verified}
              onChange={(e) => updateFilters({ verified: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">All</option>
              <option value="true">Verified Only</option>
              <option value="false">Unverified Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Per Page</label>
            <select
              value={filters.per_page}
              onChange={(e) => updateFilters({ per_page: parseInt(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Reports ({pagination.total || 0})
            </h3>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedReports.length === reports.length && reports.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Select All</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">⚠️ {error}</div>
              <button
                onClick={fetchReports}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No reports found matching your criteria
            </div>
          ) : (
            <div>
              {reports.map(report => (
                <ReportRow key={report.id} report={report} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.per_page) + 1} to{' '}
              {Math.min(pagination.page * pagination.per_page, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => updateFilters({ page: pagination.page - 1 })}
                disabled={pagination.page <= 1}
                className="px-3 py-2 border rounded-lg disabled:bg-gray-100 disabled:text-gray-400"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-gray-700">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => updateFilters({ page: pagination.page + 1 })}
                disabled={pagination.page >= pagination.pages}
                className="px-3 py-2 border rounded-lg disabled:bg-gray-100 disabled:text-gray-400"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ReportDetailModal />
      <BulkActionModal />

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-3 rounded-lg shadow-md text-sm z-50 ${
          toast.type === 'success' ? 'bg-green-600 text-white' : toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-800 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Bulk error details */}
      {bulkErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded">
          <div className="font-medium mb-2">Some items failed:</div>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {bulkErrors.map(e => (
              <li key={e.id}>#{e.id}: {e.error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CommunityReports;
