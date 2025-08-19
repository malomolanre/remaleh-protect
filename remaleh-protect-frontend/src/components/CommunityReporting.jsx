import React, { useState, useEffect } from 'react';
import { MobileCard, MobileCardHeader, MobileCardContent } from './ui/mobile-card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { MobileTextarea } from './ui/mobile-input';
import { MobileInput } from './ui/mobile-input';
import { 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown,
  CheckCircle,
  Star,
  Lock,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { useCommunity } from '../hooks/useCommunity';
import { useAuth } from '../hooks/useAuth';
import { API } from '../lib/api';
import MobileModal from './MobileModal';
import MobilePullToRefresh from './MobilePullToRefresh';
import { MobileSelect, MobileSearchInput } from './ui/mobile-input';

export default function CommunityReporting({ setActiveTab }) {
  const { isAuthenticated, user } = useAuth();
  const {
    reports,
    trendingThreats,
    communityStats,
    alerts,
    isLoading,
    error,
    loadAllData,
    createReport,
    voteOnReport,
    verifyReport,
    addComment,
    createAlert,
    uploadReportMedia,
    fetchReportById,
    fetchComments,
    deleteComment,
    clearError
  } = useCommunity();

  const [showNewReport, setShowNewReport] = useState(false);
  const [showNewAlert, setShowNewAlert] = useState(false);
  const [newReport, setNewReport] = useState({ description: '', threat_type: 'SCAM', urgency: 'MEDIUM', location: '' });
  const [newAlert, setNewAlert] = useState({ title: '', message: '', priority: 'medium' });
  const [commentText, setCommentText] = useState('');
  const [newReportFiles, setNewReportFiles] = useState([]);
  // Filters/search for the recent reports list
  const [searchQuery, setSearchQuery] = useState('');
  const [filterThreatType, setFilterThreatType] = useState('ALL');
  const [filterUrgency, setFilterUrgency] = useState('ALL');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Full comments modal
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [commentsReport, setCommentsReport] = useState(null);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsHasMore, setCommentsHasMore] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
      const shouldOpen = (
        (typeof localStorage !== 'undefined' && localStorage.getItem('openNewReport') === '1') ||
        (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('openNewReport') === '1') ||
        (typeof window !== 'undefined' && window.__openNewReport === true)
      );
      if (shouldOpen) {
        setShowNewReport(true);
        try { localStorage.removeItem('openNewReport'); } catch (e) {}
        try { sessionStorage.removeItem('openNewReport'); } catch (e) {}
        try { delete window.__openNewReport; } catch (e) {}
      }
    }
  }, [loadAllData, isAuthenticated]);
  
  const filteredReports = (reports || []).filter((r) => {
    const matchesSearch = searchQuery
      ? (r.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.threat_type || '').toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesType = filterThreatType === 'ALL' ? true : (r.threat_type === filterThreatType);
    const matchesUrgency = filterUrgency === 'ALL' ? true : (r.urgency === filterUrgency);
    const matchesVerified = verifiedOnly ? !!r.verified : true;
    return matchesSearch && matchesType && matchesUrgency && matchesVerified;
  });

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    const result = await createReport(newReport);
    if (result.success) {
      // Upload any selected files
      for (const file of newReportFiles) {
        await uploadReportMedia(result.report.id, file);
      }
      setShowNewReport(false);
      setNewReport({
        description: '',
        threat_type: 'SCAM',
        urgency: 'MEDIUM',
        location: ''
      });
      setNewReportFiles([]);
    }
  };

  const handleSubmitAlert = async (e) => {
    e.preventDefault();
    const result = await createAlert(newAlert);
    if (result.success) {
      setShowNewAlert(false);
      setNewAlert({
        title: '',
        message: '',
        priority: 'medium'
      });
    }
  };

  const handleVote = async (reportId, voteType) => {
    await voteOnReport(reportId, voteType);
  };

  const handleVerify = async (reportId) => {
    await verifyReport(reportId, { verified: true });
  };

  const handleAddComment = async (reportId) => {
    if (commentText.trim()) {
      await addComment(reportId, { comment: commentText });
      setCommentText('');
    }
  };

  const handleViewAllComments = async (reportId) => {
    setCommentsPage(1);
    const res = await fetchComments(reportId, { page: 1, per_page: 20 });
    if (res.success) {
      setCommentsReport({ id: reportId, comments: res.comments || [] });
      setCommentsHasMore((res.pagination?.page || 1) < (res.pagination?.pages || 1));
      setCommentsModalOpen(true);
    }
  };

  const handleLoadMoreComments = async () => {
    if (!commentsReport) return;
    const nextPage = commentsPage + 1;
    const res = await fetchComments(commentsReport.id, { page: nextPage, per_page: 20 });
    if (res.success) {
      setCommentsReport(prev => ({ ...prev, comments: [...(prev.comments || []), ...(res.comments || [])] }));
      setCommentsPage(nextPage);
      setCommentsHasMore((res.pagination?.page || nextPage) < (res.pagination?.pages || nextPage));
    }
  };

  const handleDeleteComment = async (commentId) => {
    const res = await deleteComment(commentId);
    if (res.success) {
      setCommentsReport(prev => ({ ...prev, comments: (prev.comments || []).filter(c => c.id !== commentId) }));
    }
  };

  const openLightbox = (mediaList, startIndex = 0) => {
    const images = (mediaList || [])
      .filter(m => !m.media_type || m.media_type === 'image')
      .map(m => ({ id: m.id, src: m.media_url && (m.media_url.startsWith('http') ? m.media_url : `${API}${m.media_url}`) }))
      .filter(i => !!i.src);
    if (images.length > 0) {
      setLightboxImages(images);
      setLightboxIndex(Math.max(0, Math.min(startIndex, images.length - 1)));
      setLightboxOpen(true);
    }
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Lock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600 mb-2">Login required to access Community</p>
          <p className="text-gray-500 text-sm">Please log in to view and contribute to community reports</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading community data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    // Check if it's an authentication error
    const isAuthError = error.includes('Token is missing') || error.includes('401') || error.includes('Unauthorized')
    
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-800">
            {isAuthError ? 'Authentication Required' : error}
          </span>
        </div>
        <p className="text-red-700 text-sm mt-2">
          {isAuthError 
            ? 'Please log in to access community features. Your session may have expired.'
            : ''
          }
        </p>
        <div className="flex gap-2 mt-3">
          {isAuthError ? (
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              size="sm"
            >
              Go to Login
            </Button>
          ) : (
            <Button onClick={clearError} variant="outline" size="sm">
              Dismiss
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-3xl mx-auto">
      {/* Header with Back Button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => setActiveTab('community')}
          className="p-2 mr-3 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Community Reports</h1>
          <p className="text-gray-600 text-sm">Report and track security threats</p>
        </div>
      </div>

      {/* Community Stats */}
      {communityStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MobileCard className="p-4">
            <MobileCardHeader className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{communityStats.total_reports || 0}</p>
              </div>
            </MobileCardHeader>
          </MobileCard>
          <MobileCard className="p-4">
            <MobileCardHeader className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900">{(communityStats.status_breakdown && communityStats.status_breakdown.VERIFIED) || 0}</p>
              </div>
            </MobileCardHeader>
          </MobileCard>
          <MobileCard className="p-4">
            <MobileCardHeader className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{(communityStats.status_breakdown && communityStats.status_breakdown.PENDING) || 0}</p>
              </div>
            </MobileCardHeader>
          </MobileCard>
          <MobileCard className="p-4">
            <MobileCardHeader className="flex items-center">
              <Users className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Top Reporter</p>
                <p className="text-2xl font-bold text-gray-900">{(communityStats.top_contributors && communityStats.top_contributors[0]?.name) || '—'}</p>
              </div>
            </MobileCardHeader>
          </MobileCard>
        </div>
      )}

      {/* Trending Threats */}
      <MobileCard className="p-6">
        <MobileCardHeader className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Trending Threats</h2>
          <TrendingUp className="h-5 w-5 text-orange-500" />
        </MobileCardHeader>
        <MobileCardContent>
          <div className="space-y-3">
            {trendingThreats && trendingThreats.length > 0 ? (
              trendingThreats.map((threat, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="font-medium text-gray-900">{threat.threat_type}</p>
                      <p className="text-sm text-gray-600">Reports: {threat.report_count} • Trend: {threat.trend} • Urgency score: {threat.urgency_score}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No trending threats at the moment</p>
            )}
          </div>
        </MobileCardContent>
      </MobileCard>

      {/* Recent Reports */}
      <MobileCard className="p-6">
        <MobileCardHeader className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Reports</h2>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowNewReport(true)} size="sm">
              Report New Scam
            </Button>
            <Button onClick={loadAllData} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        </MobileCardHeader>
        <MobileCardContent>
          <div className="space-y-3">
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <MobileSearchInput placeholder="Search reports..." onSearch={(q) => setSearchQuery(q)} />
              <div className="flex items-center gap-2">
                <MobileSelect
                  value={filterThreatType}
                  onChange={(e) => setFilterThreatType(e.target.value)}
                  options={[
                    { value: 'ALL', label: 'All types' },
                    { value: 'PHISHING', label: 'Phishing' },
                    { value: 'MALWARE', label: 'Malware' },
                    { value: 'SCAM', label: 'Scam' },
                    { value: 'SOCIAL_ENGINEERING', label: 'Social Eng.' },
                    { value: 'OTHER', label: 'Other' }
                  ]}
                  className="flex-1"
                />
                <MobileSelect
                  value={filterUrgency}
                  onChange={(e) => setFilterUrgency(e.target.value)}
                  options={[
                    { value: 'ALL', label: 'All urgency' },
                    { value: 'LOW', label: 'Low' },
                    { value: 'MEDIUM', label: 'Medium' },
                    { value: 'HIGH', label: 'High' }
                  ]}
                  className="flex-1"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-gray-700">
                  <input type="checkbox" className="rounded" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
                  Verified only
                </label>
                {(searchQuery || verifiedOnly || filterThreatType !== 'ALL' || filterUrgency !== 'ALL') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterThreatType('ALL');
                      setFilterUrgency('ALL');
                      setVerifiedOnly(false);
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Scrollable + pull-to-refresh list */}
            <div className="text-center text-xs text-gray-500 mb-1">
              Showing {filteredReports.length}{Array.isArray(reports) ? ' of ' + reports.length : ''} reports
            </div>
            <MobilePullToRefresh onRefresh={loadAllData} className="h-[60vh] sm:h-[65vh] md:h-[70vh]">
              <div className="space-y-4">
                {filteredReports && filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{report.threat_type}</h3>
                          <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                          {report.media && report.media.length > 0 && (
                            <div className="mt-2 grid grid-cols-3 gap-2">
                              {(report.media.filter(m => !m.media_type || m.media_type === 'image').slice(0, 3)).map((m, idx, arr) => {
                                const isLastAndExtra = (idx === arr.length - 1) && (report.media.length > 3);
                                const extraCount = report.media.length - 3;
                                const src = m.media_url && (m.media_url.startsWith('http') ? m.media_url : `${API}${m.media_url}`);
                                return (
                                  <button
                                    key={m.id || idx}
                                    type="button"
                                    onClick={() => openLightbox(report.media, idx)}
                                    className="relative w-full h-20 bg-gray-100 rounded overflow-hidden focus:outline-none"
                                  >
                                    {src && (
                                      <img
                                        src={src}
                                        alt="report media"
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                      />
                                    )}
                                    {isLastAndExtra && extraCount > 0 && (
                                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                                        <span className="text-white text-sm font-semibold">+{extraCount}</span>
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Urgency: {report.urgency}</span>
                            <span>Location: {report.location || 'N/A'}</span>
                            <span>Reported: {report.created_at ? new Date(report.created_at).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {report.verified && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => handleVote(report.id, 'up')}
                              variant="ghost"
                              size="sm"
                              className={report.user_vote === 'up' ? 'text-green-600' : ''}
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              {report.votes_up || 0}
                            </Button>
                            <Button
                              onClick={() => handleVote(report.id, 'down')}
                              variant="ghost"
                              size="sm"
                              className={report.user_vote === 'down' ? 'text-red-600' : ''}
                            >
                              <ThumbsDown className="h-4 w-4 mr-1" />
                              {report.votes_down || 0}
                            </Button>
                          </div>
                          {/* Show verify button only for admins */}
                          {user?.is_admin && !report.verified && (
                            <Button
                              onClick={() => handleVerify(report.id)}
                              variant="outline"
                              size="sm"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Verify
                            </Button>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {report.creator?.name || 'Anonymous'}
                        </div>
                      </div>

                      {/* Comments */}
                      {report.comments && report.comments.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Comments</h4>
                          <div className="space-y-2">
                            {report.comments.map((comment, index) => (
                              <div key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                <span className="font-medium">{comment.user_name || 'Anonymous'}:</span> {comment.comment}
                              </div>
                            ))}
                          </div>
                          <div className="mt-2">
                            <Button variant="ghost" size="sm" onClick={() => handleViewAllComments(report.id)}>
                              View all comments
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Add Comment */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex space-x-2">
                          <MobileInput
                            placeholder="Add a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            onClick={() => handleAddComment(report.id)}
                            size="sm"
                            disabled={!commentText.trim()}
                          >
                            Comment
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No reports yet. Be the first to report a threat!</p>
                )}
              </div>
            </MobilePullToRefresh>
          </div>
        </MobileCardContent>
      </MobileCard>

      {/* Community Alerts */}
      <MobileCard className="p-6">
        <MobileCardHeader className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Community Alerts</h2>
        </MobileCardHeader>
        <MobileCardContent>
          <div className="space-y-3">
            {alerts && alerts.length > 0 ? (
              alerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900">{alert.threat_type || 'Community Alert'}</h4>
                    <p className="text-sm text-blue-800">{alert.message}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-blue-600">
                      <span>Severity: {alert.severity}</span>
                      <span>{alert.created_at ? new Date(alert.created_at).toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No active alerts</p>
            )}
          </div>
        </MobileCardContent>
      </MobileCard>

      {/* New Report Modal */}
      {showNewReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h2 className="text-xl font-semibold mb-4">Report New Threat</h2>
            <form onSubmit={handleSubmitReport} className="space-y-4">
              <MobileTextarea
                placeholder="Detailed Description"
                value={newReport.description}
                onChange={(e) => setNewReport({...newReport, description: e.target.value})}
                required
                rows={4}
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={newReport.threat_type}
                  onChange={(e) => setNewReport({...newReport, threat_type: e.target.value})}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="PHISHING">Phishing</option>
                  <option value="MALWARE">Malware</option>
                  <option value="SCAM">Scam</option>
                  <option value="SOCIAL_ENGINEERING">Social Engineering</option>
                  <option value="OTHER">Other</option>
                </select>
                <select
                  value={newReport.urgency}
                  onChange={(e) => setNewReport({...newReport, urgency: e.target.value})}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Attach Photos (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setNewReportFiles(Array.from(e.target.files || []))}
                  className="block w-full text-sm text-gray-700"
                />
                {newReportFiles.length > 0 && (
                  <div className="mt-2 text-xs text-gray-600">{newReportFiles.length} file(s) selected</div>
                )}
              </div>
              <MobileInput
                placeholder="Location/URL"
                value={newReport.location}
                onChange={(e) => setNewReport({...newReport, location: e.target.value})}
              />
              <div className="flex space-x-3">
                <Button type="submit" className="flex-1">
                  Submit Report
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewReport(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Alert Modal */}
      {showNewAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <h2 className="text-xl font-semibold mb-4">Create Community Alert</h2>
            <form onSubmit={handleSubmitAlert} className="space-y-4">
              <MobileInput
                placeholder="Alert Title"
                value={newAlert.title}
                onChange={(e) => setNewAlert({...newAlert, title: e.target.value})}
                required
              />
              <MobileTextarea
                placeholder="Alert Message"
                value={newAlert.message}
                onChange={(e) => setNewAlert({...newAlert, message: e.target.value})}
                required
                rows={4}
              />
              <select
                value={newAlert.priority}
                onChange={(e) => setNewAlert({...newAlert, priority: e.target.value})}
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
              <div className="flex space-x-3">
                <Button type="submit" className="flex-1">
                  Create Alert
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewAlert(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Comments Modal */}
      <MobileModal isOpen={commentsModalOpen} onClose={() => setCommentsModalOpen(false)} title="All Comments">
        {commentsReport ? (
          <div className="space-y-3">
            {commentsReport.comments && commentsReport.comments.length > 0 ? (
              commentsReport.comments.map((c) => (
                <div key={c.id} className="p-2 bg-gray-50 rounded border border-gray-200 flex items-start justify-between">
                  <div>
                    <div className="text-sm text-gray-800"><span className="font-medium">{c.user_name || 'Anonymous'}:</span> {c.comment}</div>
                    <div className="text-xs text-gray-500 mt-1">{c.created_at ? new Date(c.created_at).toLocaleString() : ''}</div>
                  </div>
                  {(user?.id === c.user_id || user?.is_admin) && (
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteComment(c.id)} title="Delete comment">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">No comments yet.</div>
            )}

            {commentsHasMore && (
              <div className="pt-2">
                <Button onClick={handleLoadMoreComments} variant="outline" size="sm">Load more</Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-500">Loading...</div>
        )}
      </MobileModal>

      {/* Lightbox Modal */}
      <MobileModal isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} title="Preview" fullScreen>
        {lightboxImages.length > 0 && (
          <div className="flex flex-col items-center">
            <div className="w-full h-[60vh] bg-black flex items-center justify-center mb-3">
              <img
                src={lightboxImages[lightboxIndex].src}
                alt="preview"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between w-full">
              <Button
                onClick={() => setLightboxIndex(i => Math.max(0, i - 1))}
                disabled={lightboxIndex === 0}
                variant="outline"
                size="sm"
              >
                Prev
              </Button>
              <div className="text-sm text-gray-600">{lightboxIndex + 1} / {lightboxImages.length}</div>
              <Button
                onClick={() => setLightboxIndex(i => Math.min(lightboxImages.length - 1, i + 1))}
                disabled={lightboxIndex >= lightboxImages.length - 1}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </MobileModal>
    </div>
  );
}
