import React, { useState, useEffect, useMemo } from 'react';
import { Users, Flag, Trophy, TrendingUp, Plus, Star, CheckCircle, ThumbsUp, ThumbsDown, MessageSquare, Trash2, HelpingHand, Shield, Eye, HelpCircle } from 'lucide-react';
import { MobileCard } from './ui/mobile-card';
import { MobileButton } from './ui/mobile-button';
import { useAuth } from '../hooks/useAuth';
import { useCommunity } from '../hooks/useCommunity';
import { Button } from './ui/button';
import { MobileInput } from './ui/mobile-input';
import { MobileTextarea } from './ui/mobile-input';
import { MobileSelect, MobileSearchInput } from './ui/mobile-input';
import { API } from '../lib/api';
import MobileModal from './MobileModal';
import Login from './Login';
import MobilePullToRefresh from './MobilePullToRefresh';

export default function CommunityHub({ setActiveTab }) {
  const [activeTab, setActiveTabLocal] = useState('reports');
  const { reports, latestReports, fetchLatestReports, fetchReports, leaderboard, trendingThreats, myStats, loadAllData, isLoading, pagination, hasMore, createReport, uploadReportMedia, deleteReport, voteOnReport, addComment, fetchReportById, fetchComments, deleteComment, fetchLeaderboard, fetchMyStats } = useCommunity();
  const { user, isAuthenticated } = useAuth();

  const [showNewReport, setShowNewReport] = useState(false);
  const [newReport, setNewReport] = useState({
    description: '',
    threat_type: 'SCAM',
    urgency: 'MEDIUM',
    location: ''
  });
  const [newReportFiles, setNewReportFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

  // Lightbox for media
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Comments modal
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [commentsReport, setCommentsReport] = useState(null);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsHasMore, setCommentsHasMore] = useState(false);

  // Inline comment inputs per report
  const [commentTexts, setCommentTexts] = useState({}); // { [reportId]: text }

  const [pointsPeriod, setPointsPeriod] = useState('90d'); // '90d' | 'all'
  const [myStatusFilter, setMyStatusFilter] = useState('ALL'); // ALL | PENDING | APPROVED | VERIFIED | REJECTED

  // Feed filters/search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterThreatType, setFilterThreatType] = useState('ALL');
  const [filterUrgency, setFilterUrgency] = useState('ALL');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData({ period: pointsPeriod });
    }
  }, [isAuthenticated, loadAllData, pointsPeriod]);

  // Ensure My Reports includes own reports regardless of approval/verification status
  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === 'my_reports') {
      // include_own=true causes backend to include user's reports of any status
      fetchReports({ include_own: 'true' }, false);
    }
  }, [activeTab, isAuthenticated, fetchReports]);

  

  // Proper infinite scroll with pagination
  useEffect(() => {
    const handleScroll = () => {
      if (activeTab !== 'feed') return;
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
      if (nearBottom && !isLoading && hasMore && pagination) {
        const nextPage = pagination.next_num;
        if (nextPage) {
          fetchReports({ page: nextPage }, true); // Append to existing reports
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab, isLoading, hasMore, pagination, fetchReports]);

  const filteredFeedReports = useMemo(() => {
    if (!reports || reports.length === 0) return [];
    return reports.filter((r) => {
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
  }, [reports, searchQuery, filterThreatType, filterUrgency, verifiedOnly]);

  const resolveMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    try {
      // Use URL to safely join base and path, avoiding double slashes
      return new URL(url, API).toString();
    } catch (e) {
      return `${API}${url}`;
    }
  };

  const isImageMedia = (media) => {
    if (!media || !media.media_type) return true; // default to image if unspecified
    return media.media_type.toLowerCase().startsWith('image');
  };

  const isVideoMedia = (media) => {
    if (!media || !media.media_type) return false;
    return media.media_type.toLowerCase().startsWith('video');
  };

  const openLightbox = (mediaList, startIndex = 0) => {
    const images = (mediaList || [])
      .filter(isImageMedia)
      .map(m => ({ id: m.id, src: resolveMediaUrl(m.media_url) }))
      .filter(i => !!i.src);
    if (images.length > 0) {
      setLightboxImages(images);
      setLightboxIndex(Math.max(0, Math.min(startIndex, images.length - 1)));
      setLightboxOpen(true);
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

  const tabs = [
    { id: 'reports', label: 'Report Scam', icon: Flag },
    { id: 'feed', label: 'Community Reports', icon: Users },
    { id: 'my_reports', label: 'My Reports', icon: CheckCircle },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'latest', label: 'Latest Scams', icon: TrendingUp }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'reports':
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Report a Scam</h3>
              <p className="text-sm text-gray-600">Help protect others by reporting scams you encounter</p>
            </div>
            
            <MobileCard className="bg-blue-50 border-blue-200">
              <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Flag className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Your Reporting Stats</h4>
                    <p className="text-sm text-gray-600">Keep reporting to climb the leaderboard!</p>
                  </div>
                </div>
                <div className="flex justify-end mb-2">
                  <select
                    value={pointsPeriod}
                    onChange={(e) => {
                      const v = e.target.value;
                      setPointsPeriod(v);
                      // Refresh stats + leaderboard for chosen period
                      fetchMyStats({ period: v });
                      fetchLeaderboard({ period: v });
                    }}
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="90d">Last 90 days</option>
                    <option value="all">All time</option>
                  </select>
                </div>
                {
                  // Determine tier styling
                }
                {(() => {
                  const tierRaw = (myStats?.tier || '').toString();
                  const t = tierRaw.toLowerCase();
                  const hasTier = !!tierRaw;
                  const gridCols = hasTier ? 'grid-cols-4' : 'grid-cols-3';
                  let badgeBg = 'bg-gray-100 text-gray-700';
                  let iconColor = 'text-gray-600';
                  let iconEl = null;
                  if (t.includes('helper')) {
                    badgeBg = 'bg-blue-100 text-blue-700';
                    iconColor = 'text-blue-600';
                    iconEl = <HelpingHand className={`w-4 h-4 ${iconColor}`} />;
                  } else if (t.includes('ally')) {
                    badgeBg = 'bg-purple-100 text-purple-700';
                    iconColor = 'text-purple-600';
                    iconEl = <Shield className={`w-4 h-4 ${iconColor}`} />;
                  } else if (t.includes('champion')) {
                    badgeBg = 'bg-yellow-100 text-yellow-700';
                    iconColor = 'text-yellow-600';
                    iconEl = <Trophy className={`w-4 h-4 ${iconColor}`} />;
                  } else if (t.includes('guardian')) {
                    badgeBg = 'bg-emerald-100 text-emerald-700';
                    iconColor = 'text-emerald-600';
                    iconEl = (
                      <span className="relative inline-block w-5 h-5">
                        <Shield className={`w-5 h-5 absolute inset-0 ${iconColor}`} />
                        <Eye className="w-3 h-3 absolute bottom-0 right-0 text-emerald-700" />
                      </span>
                    );
                  }

                  return (
                    <div className={`grid ${gridCols} gap-4 text-center`}>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{myStats?.report_count ?? 0}</div>
                        <div className="text-xs text-gray-600">Reports</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{myStats?.points ?? 0}</div>
                        <div className="text-xs text-gray-600">Points</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">{myStats?.rank ? `#${myStats.rank}` : '—'}</div>
                        <div className="text-xs text-gray-600">Rank</div>
                      </div>
                      {hasTier && (
                        <div className="flex flex-col items-center justify-center">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${badgeBg}`}>
                            {iconEl}
                            <span className="text-xs font-medium">{tierRaw}</span>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">Tier</div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </MobileCard>

            <MobileButton
              onClick={() => setShowNewReport(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
            >
              <Plus className="w-5 h-5 mr-2" />
              Report New Scam
            </MobileButton>
          </div>
        );

      case 'feed':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Community Reports</h3>
                  <p className="text-sm text-gray-600">See a scam? Share it.</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    onChange={(e) => fetchReports({ sort: e.target.value }, false)}
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                    defaultValue="newest"
                  >
                    <option value="newest">Newest</option>
                    <option value="top">Top</option>
                    <option value="verified">Verified first</option>
                  </select>
                  <Button onClick={() => fetchReports({}, false)} variant="outline" size="sm">Refresh</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <MobileSearchInput
                  placeholder="Search reports..."
                  onSearch={(q) => setSearchQuery(q)}
                />
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
                      { value: 'LOW', label: 'Caution' },
                      { value: 'MEDIUM', label: 'Scam' },
                      { value: 'HIGH', label: 'Ongoing Scam' }
                    ]}
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-gray-700">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                    />
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
            </div>
            {/* Pull-to-refresh container around feed list */}
            <MobilePullToRefresh
              onRefresh={async () => {
                await fetchReports({}, false);
              }}
              className="h-[60vh] sm:h-[65vh] md:h-[70vh]"
            >
              {/* Pagination info */}
              {pagination && (
                <div className="text-center text-xs text-gray-500 mb-2">
                  Showing {filteredFeedReports.length} of {pagination.total} reports
                  {hasMore && <span className="ml-2">• Scroll to load more</span>}
                </div>
              )}
              <div className="space-y-3">
                {filteredFeedReports && filteredFeedReports.length > 0 ? (
                  filteredFeedReports.map((report) => (
                    <MobileCard key={report.id} className="border-gray-200">
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{report.threat_type}</span>
                            <span className="text-xs text-gray-500">{report.created_at ? new Date(report.created_at).toLocaleDateString() : ''}</span>
                            {report.verified && <CheckCircle className="w-3.5 h-3.5 text-green-600" />}
                          </div>
                          <div className="text-xs text-gray-500 mb-1 flex items-center gap-2">
                            <span>by {report.creator?.name || 'Anonymous'}</span>
                            {(() => {
                              const tierRaw = (report.creator?.tier || '').toString();
                              if (!tierRaw) return null;
                              const t = tierRaw.toLowerCase();
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
                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full ${badgeBg}`}>
                                  {iconEl}
                                  <span className="text-[10px] font-medium leading-none">{tierRaw}</span>
                                </span>
                              );
                            })()}
                          </div>
                          {report.creator?.bio && (
                            <div className="text-xs text-gray-500 italic mb-1">{report.creator.bio}</div>
                          )}
                          <p className="text-sm text-gray-800">{report.description}</p>

                          {report.media && report.media.length > 0 && (
                            <div className="mt-2 grid grid-cols-3 gap-2">
                              {(report.media.filter(m => isImageMedia(m) || isVideoMedia(m)).slice(0, 3)).map((m, idx, arr) => {
                                const isLastAndExtra = (idx === arr.length - 1) && (report.media.length > 3);
                                const extraCount = report.media.length - 3;
                                const src = resolveMediaUrl(m.media_url);
                                return (
                                  <button
                                    key={m.id || idx}
                                    type="button"
                                    onClick={() => openLightbox(report.media, idx)}
                                    className="relative w-full h-24 bg-gray-100 rounded overflow-hidden focus:outline-none"
                                  >
                                    {src && (
                                      isVideoMedia(m) ? (
                                        <video src={src} className="w-full h-full object-cover" muted playsInline />
                                      ) : (
                                        <img
                                          src={src}
                                          alt="report media"
                                          className="w-full h-full object-cover"
                                          loading="lazy"
                                          onError={(e) => {
                                            const fallback = m.media_url || '';
                                            if (fallback && e.currentTarget.src !== fallback) {
                                              e.currentTarget.src = fallback;
                                            } else {
                                              e.currentTarget.style.display = 'none';
                                            }
                                          }}
                                        />
                                      )
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

                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => voteOnReport(report.id, 'up')}
                                variant="ghost"
                                size="sm"
                                className={report.user_vote === 'up' ? 'text-green-600' : ''}
                              >
                                <ThumbsUp className="w-4 h-4 mr-1" /> {report.votes_up || 0}
                              </Button>
                              <Button
                                onClick={() => voteOnReport(report.id, 'down')}
                                variant="ghost"
                                size="sm"
                                className={report.user_vote === 'down' ? 'text-red-600' : ''}
                              >
                                <ThumbsDown className="w-4 h-4 mr-1" /> {report.votes_down || 0}
                              </Button>
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5" /> {report.comments?.length || 0}
                            </div>
                          </div>

                          {report.comments && report.comments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {report.comments.slice(0, 2).map((c, i) => (
                                <div key={c.id || i} className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
                                  <span className="font-medium">{c.user_name || 'Anonymous'}:</span> {c.comment}
                                </div>
                              ))}
                              <div>
                                <Button variant="ghost" size="sm" onClick={() => handleViewAllComments(report.id)}>
                                  View all comments
                                </Button>
                              </div>
                            </div>
                          )}

                          <div className="mt-2 flex items-center gap-2">
                            <MobileInput
                              placeholder="Add a comment..."
                              value={commentTexts[report.id] || ''}
                              onChange={(e) => setCommentTexts(prev => ({ ...prev, [report.id]: e.target.value }))}
                              className="flex-1"
                            />
                            <Button
                              size="sm"
                              disabled={!((commentTexts[report.id] || '').trim())}
                              onClick={async () => {
                                const text = (commentTexts[report.id] || '').trim();
                                if (!text) return;
                                await addComment(report.id, { comment: text });
                                setCommentTexts(prev => ({ ...prev, [report.id]: '' }));
                              }}
                            >
                              Comment
                            </Button>
                          </div>
                          {/* Allow owner to delete their report */}
                          {report.user_id === user?.id && (
                            <div className="mt-2 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  if (confirm('Delete this report? This cannot be undone.')) {
                                    const res = await deleteReport(report.id);
                                    if (!res.success) alert(res.error || 'Failed to delete');
                                  }
                                }}
                              >
                                Delete report
                              </Button>
                            </div>
                          )}
                          </div>
                        </div>
                      </div>
                    </MobileCard>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-6">No reports to display yet.</p>
                )}

                {/* Loading indicator for pagination */}
                {isLoading && hasMore && (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading more reports...</p>
                  </div>
                )}

                {/* Fallback Load More button */}
                {hasMore && !isLoading && (
                  <div className="text-center py-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (pagination?.next_num) {
                          fetchReports({ page: pagination.next_num }, true);
                        }
                      }}
                    >
                      Load more
                    </Button>
                  </div>
                )}
              </div>
            </MobilePullToRefresh>
          </div>
        );

      case 'my_reports':
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">My Reports</h3>
              <p className="text-sm text-gray-600">See the status of your submitted reports</p>
            </div>

            {/* Status breakdown */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-green-50 rounded">
                <div className="text-base font-semibold text-green-700">{myStats?.approved_count ?? 0}</div>
                <div className="text-xs text-green-700">Approved</div>
              </div>
              <div className="p-2 bg-blue-50 rounded">
                <div className="text-base font-semibold text-blue-700">{myStats?.verified_count ?? 0}</div>
                <div className="text-xs text-blue-700">Verified</div>
              </div>
              <div className="p-2 bg-yellow-50 rounded">
                <div className="text-base font-semibold text-yellow-700">{myStats?.pending_count ?? 0}</div>
                <div className="text-xs text-yellow-700">Pending</div>
              </div>
              <div className="p-2 bg-red-50 rounded">
                <div className="text-base font-semibold text-red-700">{myStats?.rejected_count ?? 0}</div>
                <div className="text-xs text-red-700">Rejected</div>
              </div>
            </div>

            {/* Quick filters */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'PENDING', label: 'Pending' },
                { id: 'APPROVED', label: 'Approved' },
                { id: 'VERIFIED', label: 'Verified' },
                { id: 'REJECTED', label: 'Rejected' }
              ].map((opt) => (
                <Button
                  key={opt.id}
                  size="sm"
                  variant={myStatusFilter === opt.id ? 'default' : 'outline'}
                  onClick={() => setMyStatusFilter(opt.id)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>

            <div className="space-y-3">
              {reports && reports.length > 0 ? (
                reports
                  .filter(r => r.user_id === user?.id)
                  .filter(r => myStatusFilter === 'ALL' ? true : (r.status === myStatusFilter))
                  .map((report) => (
                  <MobileCard key={report.id} className="border-gray-200">
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              report.status === 'APPROVED' || report.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                              report.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {report.status}
                            </span>
                            {report.urgency === 'HIGH' && (
                              <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">Ongoing Scam</span>
                            )}
                            {report.verified && (
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">Verified</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mb-1 flex items-center gap-2">
                            <span>by {report.creator?.name || 'You'}</span>
                            {(() => {
                              const tierRaw = (report.creator?.tier || user?.tier || '').toString();
                              if (!tierRaw) return null;
                              const t = tierRaw.toLowerCase();
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
                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full ${badgeBg}`}>
                                  {iconEl}
                                  <span className="text-[10px] font-medium leading-none">{tierRaw}</span>
                                </span>
                              );
                            })()}
                            <span>• Submitted {new Date(report.created_at).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-gray-800">{report.description}</p>

                          {report.media && report.media.length > 0 && (
                            <div className="mt-2 grid grid-cols-3 gap-2">
                              {(report.media.filter(m => !m.media_type || m.media_type.startsWith('image')).slice(0, 3)).map((m, idx, arr) => {
                                const isLastAndExtra = (idx === arr.length - 1) && (report.media.length > 3);
                                const extraCount = report.media.length - 3;
                                const src = m.media_url && (m.media_url.startsWith('http') ? m.media_url : `${API}${m.media_url}`);
                                return (
                                  <button
                                    key={m.id || idx}
                                    type="button"
                                    onClick={() => openLightbox(report.media, idx)}
                                    className="relative w-full h-24 bg-gray-100 rounded overflow-hidden focus:outline-none"
                                  >
                                    {src && (
                                      <img src={src} alt="report media" className="w-full h-full object-cover" loading="lazy" />
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
                        </div>
                      </div>
                    </div>
                  </MobileCard>
                ))
              ) : (
                <p className="text-gray-500 text-center py-6">No reports found</p>
              )}
            </div>
          </div>
        );

      case 'leaderboard':
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Top Reporters</h3>
              <p className="text-sm text-gray-600">Community heroes protecting others from scams</p>
            </div>
            <div className="flex justify-end">
              <select
                value={pointsPeriod}
                onChange={(e) => {
                  const v = e.target.value;
                  setPointsPeriod(v);
                  fetchLeaderboard({ period: v });
                }}
                className="text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
            </div>
            
            <div className="space-y-2">
              {leaderboard.map((user, index) => (
                <MobileCard key={user.id} className="border-gray-200">
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : user.rank}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{user.username || user.name}</span>
                            {(() => {
                              const tierRaw = (user.tier || '').toString();
                              if (!tierRaw) return null;
                              const t = tierRaw.toLowerCase();
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
                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full ${badgeBg}`}>
                                  {iconEl}
                                  <span className="text-[10px] font-medium leading-none">{tierRaw}</span>
                                </span>
                              );
                            })()}
                          </div>
                          <div className="text-xs text-gray-600">{user.points ?? 0} pts</div>
                        </div>
                      </div>
                      {index < 3 && (
                        <Star className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                  </div>
                </MobileCard>
              ))}
            </div>
          </div>
        );

      case 'latest':
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Latest Scams</h3>
              <p className="text-sm text-gray-600">10 most recent approved or verified reports marked as Ongoing Scam</p>
            </div>
            
            <div className="space-y-3">
              {latestReports && latestReports.length > 0 ? (
                latestReports.map((report) => (
                  <MobileCard key={report.id} className="border-gray-200">
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              report.status === 'APPROVED' || report.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                              report.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {report.status}
                            </span>
                            {report.verified && (
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">Verified</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mb-1 flex items-center gap-2">
                            <span>by {report.creator?.name || 'Anonymous'}</span>
                            {(() => {
                              const tierRaw = (report.creator?.tier || '').toString();
                              if (!tierRaw) return null;
                              const t = tierRaw.toLowerCase();
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
                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full ${badgeBg}`}>
                                  {iconEl}
                                  <span className="text-[10px] font-medium leading-none">{tierRaw}</span>
                                </span>
                              );
                            })()}
                            <span>• {new Date(report.created_at).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-gray-800">{report.description}</p>

                          {report.media && report.media.length > 0 && (
                            <div className="mt-2 grid grid-cols-3 gap-2">
                              {(report.media.filter(m => !m.media_type || m.media_type.startsWith('image')).slice(0, 3)).map((m, idx, arr) => {
                                const isLastAndExtra = (idx === arr.length - 1) && (report.media.length > 3);
                                const extraCount = report.media.length - 3;
                                const src = m.media_url && (m.media_url.startsWith('http') ? m.media_url : `${API}${m.media_url}`);
                                return (
                                  <button
                                    key={m.id || idx}
                                    type="button"
                                    onClick={() => openLightbox(report.media, idx)}
                                    className="relative w-full h-24 bg-gray-100 rounded overflow-hidden focus:outline-none"
                                  >
                                    {src && (
                                      <img src={src} alt="report media" className="w-full h-full object-cover" loading="lazy" />
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
                        </div>
                      </div>
                    </div>
                  </MobileCard>
                ))
              ) : (
                <p className="text-gray-500 text-center py-6">No recent reports.</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 p-4 max-w-3xl mx-auto">
      {!isAuthenticated ? (
        <div className="space-y-6">
          <MobileCard>
            <div className="text-center py-8">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
              <p className="text-gray-600 mb-6">Please log in to access the Community Hub, report scams, and view the feed.</p>
              <MobileButton 
                onClick={() => setActiveTab('login')}
                className="bg-[#21a1ce] hover:bg-[#1a8bb8] text-white"
              >
                Go to Login
              </MobileButton>
            </div>
          </MobileCard>
          <div className="max-w-md mx-auto">
            <Login onLoginSuccess={() => setActiveTab('community')} onSwitchToRegister={() => setActiveTab('register')} />
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <div className="w-10 h-10 bg-[#21a1ce] rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Community Hub</h1>
            <p className="text-sm text-gray-600">Spot it. Share it. Stay safe.</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabLocal(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          {renderContent()}

          {/* Community Benefits */}
          <div className="mt-6">
            <MobileCard className="bg-orange-50 border-orange-200">
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">🤝 Community Benefits</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Report scams to protect others</li>
                  <li>• Earn points and climb the leaderboard</li>
                  <li>• Stay updated on latest threats</li>
                  <li>• Build a safer digital community</li>
                </ul>
              </div>
            </MobileCard>
          </div>

          {/* New Report Modal */}
          {showNewReport && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
                <h2 className="text-xl font-semibold mb-4">Report New Threat</h2>
                {!isAuthenticated ? (
                  <div className="text-center text-gray-600">
                    Please log in to submit a community report.
                  </div>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        setIsSubmitting(true);
                        const result = await createReport(newReport);
                        if (!result.success) {
                          throw new Error(result.error || 'Failed to create report');
                        }
                        // Upload files
                        for (const file of newReportFiles) {
                          const up = await uploadReportMedia(result.report.id, file);
                          if (!up.success) {
                            throw new Error(up.error || 'Failed to upload media');
                          }
                        }
                        setShowNewReport(false);
                        setNewReport({ description: '', threat_type: 'SCAM', urgency: 'MEDIUM', location: '' });
                        setNewReportFiles([]);
                        setToast({ type: 'success', message: 'Report submitted successfully' });
                        setTimeout(() => setToast(null), 3000);
                        loadAllData();
                      } catch (err) {
                        setToast({ type: 'error', message: err.message || 'Submission failed' });
                        setTimeout(() => setToast(null), 4000);
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    className="space-y-4"
                  >
                    <MobileTextarea
                      placeholder="Detailed Description"
                      value={newReport.description}
                      onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                      required
                      rows={4}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <select
                        value={newReport.threat_type}
                        onChange={(e) => setNewReport({ ...newReport, threat_type: e.target.value })}
                        className="border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="PHISHING">Phishing</option>
                        <option value="MALWARE">Malware</option>
                        <option value="SCAM">Scam</option>
                        <option value="SOCIAL_ENGINEERING">Social Engineering</option>
                        <option value="OTHER">Other</option>
                      </select>
                      <div className="relative">
                        <select
                        value={newReport.urgency}
                        onChange={(e) => setNewReport({ ...newReport, urgency: e.target.value })}
                        className="border border-gray-300 rounded-md px-3 py-2"
                        aria-describedby="urgency-help"
                      >
                        <option value="LOW">Caution</option>
                        <option value="MEDIUM">Scam</option>
                        <option value="HIGH">Ongoing Scam</option>
                      </select>
                        <button
                          type="button"
                          aria-label="Urgency help"
                          title="What do these mean?"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() => alert('Caution: suspicious or low-risk; Scam: confirmed scam but not active; Ongoing Scam: active scam happening now or immediate risk.')}
                        >
                          <HelpCircle className="w-4 h-4" />
                        </button>
                      </div>
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
                      onChange={(e) => setNewReport({ ...newReport, location: e.target.value })}
                    />
                    <div className="flex space-x-3">
                      <Button type="submit" className="flex-1" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Report'}
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
                )}
              </div>
            </div>
          )}

          {/* Toast Notification */}
          {toast && (
            <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-3 rounded-lg shadow-md text-sm z-50 ${
              toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}>
              {toast.message}
            </div>
          )}

          {/* Lightbox Modal */}
          <MobileModal isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} title="Preview" fullScreen hideOnDesktop={false}>
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
                  <Button onClick={() => setLightboxIndex(i => Math.max(0, i - 1))} disabled={lightboxIndex === 0} variant="outline" size="sm">Prev</Button>
                  <div className="text-sm text-gray-600">{lightboxIndex + 1} / {lightboxImages.length}</div>
                  <Button onClick={() => setLightboxIndex(i => Math.min(lightboxImages.length - 1, i + 1))} disabled={lightboxIndex >= lightboxImages.length - 1} variant="outline" size="sm">Next</Button>
                </div>
              </div>
            )}
          </MobileModal>

          {/* Full Comments Modal */}
          <MobileModal isOpen={commentsModalOpen} onClose={() => setCommentsModalOpen(false)} title="All Comments" hideOnDesktop={false}>
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
        </>
      )}
    </div>
  );
}
