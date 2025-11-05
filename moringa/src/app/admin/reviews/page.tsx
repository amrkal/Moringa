'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Flag, 
  MessageCircle, 
  Trash2,
  Eye,
  Filter,
  Search,
  Star
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface Review {
  id: string;
  user_name: string;
  meal_name: string;
  meal_id: string;
  order_id?: string;
  rating: number;
  comment: string;
  photos: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';
  is_verified: boolean;
  helpful_count: number;
  unhelpful_count: number;
  admin_response?: string;
  created_at: string;
  moderation_notes?: string;
}

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');
  const [moderationNotes, setModerationNotes] = useState('');
  const [moderationAction, setModerationAction] = useState<'APPROVED' | 'REJECTED' | 'FLAGGED'>('APPROVED');

  useEffect(() => {
    fetchReviews();
  }, [statusFilter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'ALL' ? { status_filter: statusFilter } : {};
      const response = await api.get('/reviews/admin/all', { params });
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (reviewId: string, status: string, notes?: string) => {
    try {
      await api.put(`/reviews/admin/${reviewId}/moderate`, {
        status,
        moderation_notes: notes,
      });
      toast.success(`Review ${status.toLowerCase()} successfully`);
      fetchReviews();
      setShowModerationModal(false);
      setSelectedReview(null);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to moderate review');
    }
  };

  const handleRespond = async (reviewId: string) => {
    if (!adminResponse.trim()) {
      toast.error('Please enter a response');
      return;
    }

    try {
      await api.post(`/reviews/admin/${reviewId}/respond`, {
        admin_response: adminResponse.trim(),
      });
      toast.success('Response added successfully');
      fetchReviews();
      setShowResponseModal(false);
      setSelectedReview(null);
      setAdminResponse('');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to add response');
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.success('Review deleted successfully');
      fetchReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete review');
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.meal_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const configs = {
      PENDING: { bg: 'bg-yellow-100 dark:bg-yellow-950/30', text: 'text-yellow-700 dark:text-yellow-400', icon: Shield },
      APPROVED: { bg: 'bg-green-100 dark:bg-green-950/30', text: 'text-green-700 dark:text-green-400', icon: CheckCircle },
      REJECTED: { bg: 'bg-red-100 dark:bg-red-950/30', text: 'text-red-700 dark:text-red-400', icon: XCircle },
      FLAGGED: { bg: 'bg-orange-100 dark:bg-orange-950/30', text: 'text-orange-700 dark:text-orange-400', icon: Flag },
    };
    const config = configs[status as keyof typeof configs];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <Icon className="h-3 w-3" />
        {status}
      </span>
    );
  };

  const statusCounts = {
    ALL: reviews.length,
    PENDING: reviews.filter(r => r.status === 'PENDING').length,
    APPROVED: reviews.filter(r => r.status === 'APPROVED').length,
    REJECTED: reviews.filter(r => r.status === 'REJECTED').length,
    FLAGGED: reviews.filter(r => r.status === 'FLAGGED').length,
  };

  return (
    <AdminLayout title="Review Moderation">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Review Moderation</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage customer reviews and ratings
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-4">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'FLAGGED'] as StatusFilter[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {status} ({statusCounts[status]})
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reviews by user, meal, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <MessageCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No reviews found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="bg-card rounded-xl border border-border p-6 space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Avatar */}
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">
                        {review.user_name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-foreground">{review.user_name}</h3>
                        {review.is_verified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 text-xs font-medium rounded-full border border-green-200 dark:border-green-900">
                            <Shield className="h-3 w-3" />
                            Verified
                          </span>
                        )}
                        {getStatusBadge(review.status)}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                        <span className="font-medium">{review.meal_name}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < review.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-none text-gray-300'
                              }`}
                              strokeWidth={2}
                            />
                          ))}
                        </div>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comment */}
                <p className="text-foreground leading-relaxed">{review.comment}</p>

                {/* Photos */}
                {review.photos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {review.photos.map((photo, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden border border-border">
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${photo}`}
                          alt={`Review photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Engagement Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>👍 {review.helpful_count} helpful</span>
                  <span>👎 {review.unhelpful_count} not helpful</span>
                  {review.order_id && (
                    <span className="text-xs bg-muted px-2 py-1 rounded">Order: {review.order_id.slice(0, 8)}</span>
                  )}
                </div>

                {/* Admin Response */}
                {review.admin_response && (
                  <div className="ml-6 pl-4 border-l-2 border-primary/30 bg-primary/5 rounded-r-lg p-4">
                    <p className="text-sm font-semibold text-foreground mb-1">Restaurant Response</p>
                    <p className="text-sm text-foreground">{review.admin_response}</p>
                  </div>
                )}

                {/* Moderation Notes */}
                {review.moderation_notes && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Moderation Notes</p>
                    <p className="text-sm text-foreground">{review.moderation_notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                  {review.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleModerate(review.id, 'APPROVED')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedReview(review);
                          setModerationAction('REJECTED');
                          setShowModerationModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          setSelectedReview(review);
                          setModerationAction('FLAGGED');
                          setShowModerationModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Flag className="h-4 w-4" />
                        Flag
                      </button>
                    </>
                  )}
                  {review.status === 'APPROVED' && !review.admin_response && (
                    <button
                      onClick={() => {
                        setSelectedReview(review);
                        setShowResponseModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Respond
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-950/30 hover:bg-red-200 dark:hover:bg-red-950/50 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium transition-colors ml-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Moderation Modal */}
        {showModerationModal && selectedReview && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {moderationAction === 'REJECTED' ? 'Reject Review' : 'Flag Review'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Please provide a reason for this action:
              </p>
              <textarea
                value={moderationNotes}
                onChange={(e) => setModerationNotes(e.target.value)}
                placeholder="Enter moderation notes..."
                rows={4}
                className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowModerationModal(false);
                    setModerationNotes('');
                    setSelectedReview(null);
                  }}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleModerate(selectedReview.id, moderationAction, moderationNotes)}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                    moderationAction === 'REJECTED' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Response Modal */}
        {showResponseModal && selectedReview && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-foreground mb-4">Respond to Review</h3>
              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-foreground">{selectedReview.comment}</p>
              </div>
              <textarea
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder="Write your response..."
                rows={4}
                className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowResponseModal(false);
                    setAdminResponse('');
                    setSelectedReview(null);
                  }}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRespond(selectedReview.id)}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
                >
                  Send Response
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
