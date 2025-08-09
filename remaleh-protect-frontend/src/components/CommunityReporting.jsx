import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Shield, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';
import { useCommunity } from '../hooks/useCommunity';

export default function CommunityReporting() {
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
    clearError
  } = useCommunity();

  const [showNewReport, setShowNewReport] = useState(false);
  const [showNewAlert, setShowNewAlert] = useState(false);
  const [newReport, setNewReport] = useState({
    title: '',
    description: '',
    threat_type: 'phishing',
    severity: 'medium',
    location: '',
    evidence: ''
  });
  const [newAlert, setNewAlert] = useState({
    title: '',
    message: '',
    priority: 'medium'
  });
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    const result = await createReport(newReport);
    if (result.success) {
      setShowNewReport(false);
      setNewReport({
        title: '',
        description: '',
        threat_type: 'phishing',
        severity: 'medium',
        location: '',
        evidence: ''
      });
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
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
        <Button onClick={clearError} className="mt-2" variant="outline" size="sm">
          Dismiss
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community Threat Reporting</h1>
          <p className="text-gray-600">Report threats, share insights, and help protect the community</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowNewReport(true)}>
            <AlertTriangle className="h-4 w-4 mr-2" />
            Report Threat
          </Button>
          <Button onClick={() => setShowNewAlert(true)} variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Create Alert
          </Button>
        </div>
      </div>

      {/* Community Stats */}
      {communityStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Active Members</p>
                <p className="text-2xl font-bold text-gray-900">{communityStats.active_members || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{communityStats.total_reports || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Verified Threats</p>
                <p className="text-2xl font-bold text-gray-900">{communityStats.verified_threats || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Protected Users</p>
                <p className="text-2xl font-bold text-gray-900">{communityStats.protected_users || 0}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Trending Threats */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Trending Threats</h2>
          <TrendingUp className="h-5 w-5 text-orange-500" />
        </div>
        <div className="space-y-3">
          {trendingThreats && trendingThreats.length > 0 ? (
            trendingThreats.map((threat) => (
              <div key={threat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="font-medium text-gray-900">{threat.title}</p>
                    <p className="text-sm text-gray-600">{threat.description}</p>
                  </div>
                </div>
                <Badge variant={threat.severity === 'high' ? 'destructive' : threat.severity === 'medium' ? 'default' : 'secondary'}>
                  {threat.severity}
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No trending threats at the moment</p>
          )}
        </div>
      </Card>

      {/* Recent Reports */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Reports</h2>
          <Button onClick={loadAllData} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
        <div className="space-y-4">
          {reports && reports.length > 0 ? (
            reports.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{report.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Type: {report.threat_type}</span>
                      <span>Location: {report.location}</span>
                      <span>Reported: {new Date(report.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={report.severity === 'high' ? 'destructive' : report.severity === 'medium' ? 'default' : 'secondary'}>
                      {report.severity}
                    </Badge>
                    {report.verification_status === 'verified' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleVote(report.id, 'upvote')}
                        variant="ghost"
                        size="sm"
                        className={report.user_vote === 'upvote' ? 'text-green-600' : ''}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {report.votes?.upvotes || 0}
                      </Button>
                      <Button
                        onClick={() => handleVote(report.id, 'downvote')}
                        variant="ghost"
                        size="sm"
                        className={report.user_vote === 'downvote' ? 'text-red-600' : ''}
                      >
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        {report.votes?.downvotes || 0}
                      </Button>
                    </div>
                    {report.verification_status !== 'verified' && (
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
                    {report.reporter_name || 'Anonymous'}
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
                    <Input
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
      </Card>

      {/* Community Alerts */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Community Alerts</h2>
        </div>
        <div className="space-y-3">
          {alerts && alerts.length > 0 ? (
            alerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900">{alert.title}</h4>
                  <p className="text-sm text-blue-800">{alert.message}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-blue-600">
                    <span>Priority: {alert.priority}</span>
                    <span>{new Date(alert.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No active alerts</p>
          )}
        </div>
      </Card>

      {/* New Report Modal */}
      {showNewReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h2 className="text-xl font-semibold mb-4">Report New Threat</h2>
            <form onSubmit={handleSubmitReport} className="space-y-4">
              <Input
                placeholder="Threat Title"
                value={newReport.title}
                onChange={(e) => setNewReport({...newReport, title: e.target.value})}
                required
              />
              <Textarea
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
                  <option value="phishing">Phishing</option>
                  <option value="malware">Malware</option>
                  <option value="scam">Scam</option>
                  <option value="social_engineering">Social Engineering</option>
                  <option value="other">Other</option>
                </select>
                <select
                  value={newReport.severity}
                  onChange={(e) => setNewReport({...newReport, severity: e.target.value})}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <Input
                placeholder="Location/URL"
                value={newReport.location}
                onChange={(e) => setNewReport({...newReport, location: e.target.value})}
              />
              <Textarea
                placeholder="Evidence or Additional Details"
                value={newReport.evidence}
                onChange={(e) => setNewReport({...newReport, evidence: e.target.value})}
                rows={3}
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
              <Input
                placeholder="Alert Title"
                value={newAlert.title}
                onChange={(e) => setNewAlert({...newAlert, title: e.target.value})}
                required
              />
              <Textarea
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
