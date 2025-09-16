import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/Layout/AdminLayout';
import { useFieldDetails } from '@/hooks/useFields';
import { useVerifyAdmin } from '@/hooks/useAuth';
import { useFieldReviews } from '@/hooks/useReviews';
import { Check, Star } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';

// Reusable Card Component
const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
};


// Info Card Component
const InfoCard = ({ label, value, className = '' }) => {
  return (
    <div className={className}>
      <p className="text-sm font-light text-gray-500 text-opacity-90 mb-1">{label}</p>
      <p className="text-base font-semibold text-[#192215]">{value}</p>
    </div>
  );
};

// Image Gallery Component
const ImageGallery = ({ images }) => {
  return (
    <div className="grid grid-cols-6 gap-4">
      {images.map((img, index) => (
        <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
          <img 
            src={img} 
            alt={`Field image ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
};

// Review Card Component
const ReviewCard = ({ name, date, rating, review, avatar }) => {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <img 
            src={avatar || 'https://via.placeholder.com/40'} 
            alt={name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-medium text-gray-900">{name}</p>
            <p className="text-sm text-gray-500">{date}</p>
          </div>
        </div>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={16} 
              className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
            />
          ))}
        </div>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{review}</p>
    </Card>
  );
};

// Table Component
const Table = ({ headers, rows }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            {headers.map((header, index) => (
              <th key={index} className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="py-4 px-4 text-sm text-gray-900">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Main Field Details Component
export default function FieldDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { data: admin, isLoading: adminLoading, error: adminError } = useVerifyAdmin();
  const { data: fieldResponse, isLoading: fieldLoading } = useFieldDetails(id as string);
  const field = fieldResponse?.data || fieldResponse; // Handle both wrapped and unwrapped responses
  const { data: reviewsData, isLoading: reviewsLoading } = useFieldReviews(id as string);

  useEffect(() => {
    if (!adminLoading && (adminError || !admin)) {
      router.push('/login');
    }
  }, [admin, adminLoading, adminError, router]);

  if (adminLoading || fieldLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!field) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Field not found</p>
        </div>
      </AdminLayout>
    );
  }

  // Dynamic data from field
  const fieldImages = field.images?.length > 0 ? field.images : [];
  const safetyRules = field.rules?.length > 0 ? field.rules : [];
  const bookingPolicies = field.cancellationPolicy ? [field.cancellationPolicy] : [];
  
  // Format earnings data from booking history
  const earningsData = field.recentBookings?.slice(0, 6).map((b: any) => [
    `#${b.id.slice(0, 4).toUpperCase()}`,
    b.user?.name?.toUpperCase() || 'UNKNOWN',
    formatDate(b.date) + ' at ' + b.startTime,
    b.numberOfDogs?.toString() || '1',
    b.duration || '1',
    formatCurrency(b.totalPrice || 0),
    <StatusBadge status={b.status} />
  ]) || [];

  // Calculate total earnings
  const totalEarnings = field.recentBookings?.reduce((sum: number, b: any) => 
    sum + (b.totalPrice || 0), 0
  ) || 0;

  // Format reviews from API data
  const reviews = reviewsData?.reviews || [];
  const averageRating = reviewsData?.averageRating || 0;
  const totalReviews = reviewsData?.total || 0;
  const ratingDistribution = reviewsData?.ratingDistribution || {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0
  };

  // Calculate percentage for rating bars
  const maxRatingCount = Math.max(...Object.values(ratingDistribution));
  const getRatingPercentage = (rating: number) => {
    const count = ratingDistribution[rating as keyof typeof ratingDistribution] || 0;
    return maxRatingCount > 0 ? (count / maxRatingCount) * 100 : 0;
  };

  return (
    <AdminLayout>
      <div className="bg-light min-h-screen">
        <div className="p-6">
          {/* Page Title */}
          <h1 className="text-2xl font-semibold text-gray-900 mb-6"><span className="text-[#8D8D8D] font-semibold">Field Overview / </span>Field Details</h1>

          {/* Field Overview */}
          <div className="mb-6">
            <h2 className="text-[#192215] font-semibold text-xl leading-5 mb-3">Field Overview</h2>
            <Card className="p-5">
              <div className="grid grid-cols-5 gap-8">
                <InfoCard label="Name" value={field.name || "N/A"} />
                <InfoCard label="Type" value={field.type || "N/A"} />
                <InfoCard label="Size" value={field.size || "N/A"} />
                <InfoCard label="Price" value={field.pricePerHour ? `${formatCurrency(field.pricePerHour)}/hr` : "N/A"} />
                <InfoCard label="Status" value={field.isActive ? "Active" : "Inactive"} />
              </div>
              <div className="grid grid-cols-5 gap-8 mt-6">
                <InfoCard label="Terrain Type" value={field.terrainType || "N/A"} />
                <InfoCard label="Fence Type" value={field.fenceType || "N/A"} />
                <InfoCard label="Fence Size" value={field.fenceSize || "N/A"} />
                <InfoCard label="Surface Type" value={field.surfaceType || "N/A"} />
                <InfoCard label="Opening Hours" value={field.openingTime && field.closingTime ? `${field.openingTime} - ${field.closingTime}` : "N/A"} />
              </div>
              <div className="grid grid-cols-5 gap-8 mt-6">
                <InfoCard label="Booking Duration" value={field.bookingDuration || "N/A"} />
                <InfoCard label="Max Dogs" value={field.maxDogs || "N/A"} />
                <InfoCard label="Operating Days" value={field.operatingDays?.length ? field.operatingDays.join(', ') : "N/A"} />
                <InfoCard label="Instant Booking" value={field.instantBooking ? "Yes" : "No"} />
                <InfoCard label="Amenities" value={field.amenities?.length ? field.amenities.join(', ') : "N/A"} />
              </div>
            </Card>
          </div>
          
          {/* Location Info */}
          <div className="mb-6">
            <h2 className="text-[#192215] font-semibold text-xl leading-5 mb-3">Location</h2>
            <Card className="p-5">
              <div className="grid grid-cols-4 gap-8">
                <InfoCard label="Address" value={field.address || "N/A"} />
                <InfoCard label="City" value={field.city || "N/A"} />
                <InfoCard label="State" value={field.state || "N/A"} />
                <InfoCard label="Zip Code" value={field.zipCode || "N/A"} />
              </div>
            </Card>
          </div>
          
          {/* Field Owner Info */}
          <div className="mb-6">
            <h2 className="text-[#192215] font-semibold text-xl leading-5 mb-3">Field Owner Info</h2>
            <Card className="p-5">
              <div className="flex items-center gap-20">
                <div className="flex items-center gap-4">
                  {field.owner?.image ? (
                    <img 
                      src={field.owner.image} 
                      alt="Owner"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-xs">N/A</span>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-lg font-semibold">{field.owner?.name || field.ownerName || "N/A"}</p>
                  </div>
                </div>
                <InfoCard label="Email" value={field.owner?.email || "N/A"} />
                <InfoCard label="Contact" value={field.owner?.phone || "N/A"} />
                <InfoCard label="Joined On" value={field.joinedOn || "N/A"} />
                <InfoCard label="Status" value={field.owner ? "Active" : "N/A"} />
              </div>
            </Card>
          </div>
          
          {/* Field Images */}
          <div className="mb-6">
            <h2 className="text-[#192215] font-semibold text-xl leading-5 mb-3">Field Images</h2>
            <Card className="p-5">
              {fieldImages.length > 0 ? (
                <ImageGallery images={fieldImages} />
              ) : (
                <p className="text-gray-500 text-center py-8">No images available</p>
              )}
            </Card>
          </div>
          
          {/* Description */}
          <div className="mb-6">
            <h2 className="text-[#192215] font-semibold text-xl leading-5 mb-3">Description</h2>
            <Card className="p-5">
              <p className="text-sm text-gray-600 leading-relaxed">
                {field.description || "N/A"}
              </p>
            </Card>
          </div>
          
          {/* Community Safety Rules */}
          <div className="mb-6">
            <h2 className="text-[#192215] font-semibold text-xl leading-5 mb-3">Community safety rules</h2>
            <Card className="p-5">
              {safetyRules.length > 0 ? (
                <div className="space-y-4">
                  {safetyRules.map((rule: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{rule}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No safety rules available</p>
              )}
            </Card>
          </div>
          
          {/* Booking Policies */}
          <div className="mb-6">
            <h2 className="text-[#192215] font-semibold text-xl leading-5 mb-3">Booking Policies</h2>
            <Card className="p-5">
              {bookingPolicies.length > 0 ? (
                <div className="space-y-4">
                  {bookingPolicies.map((policy: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{policy}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No booking policies available</p>
              )}
            </Card>
          </div>
          
          {/* Earnings History */}
          {earningsData.length > 0 && (
            <div className="mb-6">
              <h2 className="text-[#192215] font-semibold text-xl leading-5 mb-3">Earnings History</h2>
              <Card>
                <div className="p-5 flex justify-between items-center border-b border-gray-200">
                  <h3 className="text-lg font-semibold">Recent Transactions</h3>
                  <p className="text-sm text-gray-500">Total Earnings {formatCurrency(totalEarnings)}</p>
                </div>
                <Table 
                  headers={['', 'Client Name', 'Date/Time', 'Count', 'Time', 'Amount', 'Status']}
                  rows={earningsData}
                />
              </Card>
            </div>
          )}
          
          {/* Reviews & Ratings */}
          <div className="mb-6">
            <h2 className="text-[#192215] font-semibold text-xl leading-5 mb-3">Reviews & Ratings</h2>
            <Card className="p-5">
              <h3 className="text-lg font-semibold mb-4">
                {totalReviews > 0 
                  ? `Over ${totalReviews} results with an average of ${averageRating.toFixed(1)} star reviews`
                  : 'No reviews yet'}
              </h3>
              
              {/* Rating Overview */}
              <div className="flex gap-8 mb-8">
                <div className="flex flex-col items-center">
                  <p className="text-sm text-gray-500 mb-2">Reviews</p>
                  <p className="text-3xl font-semibold">{averageRating.toFixed(1)}</p>
                  <div className="flex gap-1 my-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        className={i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">{totalReviews} Reviews</p>
                </div>
                
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-gray-600 w-12">{stars} Star</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400 transition-all duration-300"
                          style={{
                            width: `${getRatingPercentage(stars)}%`
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-8 text-right">
                        {ratingDistribution[stars as keyof typeof ratingDistribution] || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Review Cards */}
              {reviewsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <Card key={index} className="p-4 animate-pulse">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                          <div>
                            <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
                          ))}
                        </div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </Card>
                  ))}
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.slice(0, 5).map((review: any) => (
                    <ReviewCard 
                      key={review.id}
                      name={review.user?.name || 'Anonymous'}
                      date={formatDate(review.createdAt)}
                      rating={review.rating}
                      review={review.comment}
                      avatar={review.user?.avatar}
                    />
                  ))}
                  {reviews.length > 5 && (
                    <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                      View all {reviews.length} reviews →
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No reviews available for this field yet.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}