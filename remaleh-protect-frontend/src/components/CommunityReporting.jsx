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
  ArrowLeft
} from 'lucide-react';
import { useCommunity } from '../hooks/useCommunity';
import { useAuth } from '../hooks/useAuth';

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
    clearError
  } = useCommunity();

  const [showNewReport, setShowNewReport] = useState(false);
  const [showNewAlert, setShowNewAlert] = useState(false);
  const [newReport, setNewReport] = useState({
    description: '',
    threat_type: 'SCAM',
    urgency: 'MEDIUM',
    location: ''
  });
  const [newReportFiles, setNewReportFiles] = useState([]);
  const [newAlert, setNewAlert] = useState({
    title: '',
    message: '',
    priority: 'medium'
  });
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [loadAllData, isAuthenticated]);

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
    <div className="space-y-6 p-4">
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
          <Button onClick={loadAllData} variant="outline" size="sm">
            Refresh
          </Button>
        </MobileCardHeader>
        <MobileCardContent>
          <div className="space-y-4">
            {reports && reports.length > 0 ? (
              reports.map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{report.threat_type}</h3>
                      <p className="text-sm text-gray-600 mb-2">{report.description}</p>
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
    </div>
  );
}
