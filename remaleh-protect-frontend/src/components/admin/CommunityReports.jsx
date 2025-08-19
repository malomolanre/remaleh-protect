import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import MobileModal from '../MobileModal';
import { API } from '../../lib/api';

const CommunityReports = ({ initialFilters }) => {
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
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

    try {
      if (bulkAction === 'verify') {
        await Promise.all(selectedReports.map(async (id) => {
          const response = await api.request({ method: 'POST', url: `/api/community/reports/${id}/verify` });
          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `Failed to verify report ${id}`);
          }
        }));
      } else {
        const actionMap = { reject: 'REJECTED', escalate: 'FLAGGED', approve: 'APPROVED' };
        const mapped = actionMap[bulkAction] || actionMap['approve'];
        await Promise.all(selectedReports.map(async (id) => {
          const response = await api.request({
            method: 'PUT',
            url: `/api/admin/reports/${id}/moderate`,
            data: { action: mapped }
          });
          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `Failed to ${bulkAction} report ${id}`);
          }
        }));
      }

      // Refresh reports list
      fetchReports();
      setSelectedReports([]);
      setShowBulkModal(false);
      setBulkAction('');
    } catch (err) {
      console.error('Bulk action error:', err);
      alert(`Failed to perform bulk action: ${err.response?.data?.error || err.message}`);
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
              <span className={`px-2 py-1 text-xs rounded-full ${
                report.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                report.status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                report.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {report.status}
              </span>
              {report.verified && (
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

  const ReportDetailModal = () => (
    <MobileModal
      isOpen={showReportModal}
      onClose={() => setShowReportModal(false)}
      title="Report Details"
      hideOnDesktop={false}
    >
      {selectedReport && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Threat Type</label>
              <p className="text-gray-900">{selectedReport.threat_type}</p>
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
                  <button
                    onClick={() => {
                      handleReportAction(selectedReport.id, 'escalate');
                      setShowReportModal(false);
                    }}
                    className="bg-yellow-600 text-white px-3 py-2 rounded text-sm hover:bg-yellow-700"
                  >
                    Escalate
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

  const BulkActionModal = () => (
    <MobileModal
      isOpen={showBulkModal}
      onClose={() => setShowBulkModal(false)}
      title="Bulk Actions"
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
            <option value="verify">Approve</option>
            <option value="reject">Reject</option>
            <option value="escalate">Flag</option>
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
                onClick={() => setShowBulkModal(true)}
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
    </div>
  );
};

export default CommunityReports;
