import React, { useState, useEffect } from 'react';
import Spinner from '@/components/ui/Spinner';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/Layout/AdminLayout';
import { useFieldDetails, useToggleFieldClaimed } from '@/hooks/useFields';
import { useVerifyAdmin } from '@/hooks/useAuth';
import { useFieldReviews } from '@/hooks/useReviews';
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getImageUrl, getImageUrls } from '@/utils/imageUrl';
import { AmenityIcon } from '@/components/ui/AmenityIcon';
import { RatingStars } from '@/components/common/RatingStars';

// Capitalize first letter of each word separated by hyphens (e.g., "post-and-wire" -> "Post-And-Wire")
const capitalizeFirst = (str: string | null | undefined): string => {
  if (!str) return 'N/A';
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-');
};

// Convert 24hr time to 12hr format with AM/PM
const formatTo12Hour = (time: string | null | undefined): string => {
  if (!time) return '';

  // Handle if already in 12hr format
  if (time.includes('AM') || time.includes('PM')) {
    return time;
  }

  // Parse 24hr format (e.g., "14:00" or "9:00")
  const [hourStr, minuteStr] = time.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr || '00';

  if (isNaN(hour)) return time;

  const period = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12; // Convert 0 to 12, 13-23 to 1-11

  return `${hour}:${minute.padStart(2, '0')} ${period}`;
};

// Reusable Card Component
const Card = ({ children, className = '', ...props }: { children: React.ReactNode; className?: string;[key: string]: any }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
};


// Info Card Component
const InfoCard = ({ label, value, className = '' }: { label: string; value: React.ReactNode; className?: string }) => {
  return (
    <div className={className}>
      <p className="text-sm font-light text-gray-500 text-opacity-90 mb-1">{label}</p>
      <p className="text-base font-semibold text-[#192215]">{value}</p>
    </div>
  );
};

// Image Gallery Component
const ImageGallery = ({ images }: { images: string[] }) => {
  return (
    <div className="grid grid-cols-6 gap-4">
      {images.map((img, index) => (
        <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
          <img
            src={getImageUrl(img)}
            alt={`Field image ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
};

// Review Card Component
const ReviewCard = ({ name, date, rating, review, avatar }: { name: string; date: string; rating: number; review: string; avatar?: string }) => {
  const [imageError, setImageError] = useState(false);

  const hasValidAvatar = avatar && !avatar.includes('default-avatar') && !avatar.includes('placeholder') && !imageError;

  // Fallback to /user.svg when no valid avatar
  const fallbackAvatar = '/user.svg';

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
            <img
              src={hasValidAvatar ? avatar : fallbackAvatar}
              alt={name}
              className={hasValidAvatar ? "w-full h-full object-cover" : "w-6 h-6"}
              onError={() => setImageError(true)}
            />
          </div>
          <div>
            <p className="font-medium text-gray-900">{name}</p>
            <p className="text-sm text-gray-500">{date}</p>
          </div>
        </div>
        <RatingStars rating={rating} size={16} />
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{review}</p>
    </Card>
  );
};

// Table Component
const Table = ({ headers, rows }: { headers: string[], rows: any[][] }) => {
  return (
    <div className="overflow-x-auto lg:overflow-x-visible">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {headers.map((header, index) => (
              <th key={index} className="text-left py-3 px-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className={`py-4 px-4 text-sm ${cellIndex === 0 ? 'font-medium text-[#192215]' : 'text-gray-900'}`}>
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
  const toggleClaimedMutation = useToggleFieldClaimed();
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    fieldId: string;
    fieldName: string;
    currentStatus: boolean;
  } | null>(null);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const AMENITY_LIMIT = 6; // Number of amenities to show initially

  const openClaimedConfirmationModal = (fieldId: string, fieldName: string, currentStatus: boolean) => {
    setConfirmationModal({
      isOpen: true,
      fieldId,
      fieldName,
      currentStatus,
    });
  };

  const handleToggleClaimed = () => {
    if (!confirmationModal) return;

    toggleClaimedMutation.mutate(
      { fieldId: confirmationModal.fieldId, isClaimed: !confirmationModal.currentStatus },
      {
        onSuccess: () => {
          setConfirmationModal(null);
        },
      }
    );
  };

  useEffect(() => {
    if (!adminLoading && (adminError || !admin)) {
      router.push('/login');
    }
  }, [admin, adminLoading, adminError, router]);

  if (adminLoading || fieldLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Spinner size="xl" />
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

  // Safety rules from API (already parsed on backend)
  const safetyRules: string[] = field.safetyRules || [];

  // Booking policies from API (already parsed on backend)
  const bookingPolicies: string[] = field.policies || [];

  // Format earnings data from booking history with new columns
  const earningsData = field.recentBookings?.slice(0, 10).map((b: any) => {
    // For completed bookings, use stored commission; for others, show dynamic calculation
    const commission = b.platformCommission || (b.totalPrice * 0.2); // Default 20% if not stored
    const ownerAmount = b.fieldOwnerAmount || (b.totalPrice - commission);

    return [
      b.bookingId ? `#${b.bookingId}` : `#${b.id.slice(0, 8).toUpperCase()}`,  // Order ID
      (b.paymentIntentId || b.payment?.stripePaymentId) ? `#${(b.paymentIntentId || b.payment?.stripePaymentId).slice(-8).toUpperCase()}` : `#${b.id.slice(-8).toUpperCase()}`,  // Payment ID
      formatDate(b.date) + ' at ' + b.startTime,  // Date and Time
      b.user?.name || 'Unknown',  // Clients
      b.numberOfDogs?.toString() || '1',  // Dogs
      formatCurrency(b.totalPrice || 0),  // Total Amount
      formatCurrency(commission),  // Commission
      formatCurrency(ownerAmount),  // Owner Earnings
      <StatusBadge status={b.paymentStatus || b.status} />  // Status
    ];
  }) || [];

  // Calculate total earnings (field owner's actual earnings)
  const totalEarnings = field.totalOwnerEarnings || field.totalEarnings || 0;

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

  console.log(';;field', field)

  return (
    <AdminLayout>
      <div className="bg-light min-h-screen">
        <div className="p-6">
          {/* Page Title */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900"><span className="text-[#8D8D8D] font-semibold">Field Overview / </span>Field Details</h1>
            {/* Only show claimed toggle if field is approved */}
            {field.isApproved && (
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium text-gray-700 ${field.isClaimed ? 'text-green' : 'text-yellow'}`}>
                  {field.isClaimed ? 'Claimed' : 'Not Claimed'}
                </span>
                <button
                  onClick={() => openClaimedConfirmationModal(field.id, field.name, field.isClaimed || false)}
                  disabled={toggleClaimedMutation.isPending}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green focus:ring-offset-2 disabled:opacity-50"
                  style={{ backgroundColor: field.isClaimed ? '#4ade80' : '#e5e7eb' }}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${field.isClaimed ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>
            )}
          </div>

          {/* Field Overview */}
          <div className="mb-6">
            <h2 className="text-[#192215] font-semibold text-xl leading-5 mb-3">Field Overview</h2>
            <Card className="p-5">
              <div className="grid grid-cols-6 gap-8">
                <InfoCard label="Field ID" value={field.fieldId || field.id.slice(-6).toUpperCase()} />
                <InfoCard label="Name" value={field.name || "N/A"} />
                <InfoCard label="Size" value={capitalizeFirst(field.size)} />
                <InfoCard label="Price (30 min/dog)" value={field.price30min ? `${formatCurrency(field.price30min)}` : (field.price ? `${formatCurrency(field.price)}` : "N/A")} />
                <InfoCard label="Price (1 hr/dog)" value={field.price1hr ? `${formatCurrency(field.price1hr)}` : (field.price ? `${formatCurrency(field.price * 2)}` : "N/A")} />
                <InfoCard label="Status" value={field.isActive ? "Active" : "Inactive"} />
              </div>
              <div className="grid grid-cols-5 gap-8 mt-6">
                <InfoCard label="Terrain Type" value={capitalizeFirst(field.terrainType)} />
                <InfoCard label="Fence Type" value={capitalizeFirst(field.fenceType)} />
                <InfoCard label="Fence Size" value={capitalizeFirst(field.fenceSize)} />
                <InfoCard label="Surface Type" value={capitalizeFirst(field.surfaceType)} />
                <InfoCard label="Opening Hours" value={field.openingTime && field.closingTime ? `${formatTo12Hour(field.openingTime)} - ${formatTo12Hour(field.closingTime)}` : "N/A"} />
              </div>
              <div className="grid grid-cols-4 gap-8 mt-6">
                <InfoCard label="Booking Duration" value={capitalizeFirst(field.bookingDuration)} />
                <InfoCard label="Max Dogs" value={field.maxDogs || "N/A"} />
                <InfoCard label="Operating Days" value={field.operatingDays?.length ? field.operatingDays.map((day: string) => capitalizeFirst(day)).join(', ') : "N/A"} />
              </div>

              {/* Amenities Section */}
              <div className="mt-6">
                <p className="text-sm font-light text-gray-500 text-opacity-90 mb-2">Amenities</p>
                {field.amenities?.length ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {(showAllAmenities ? field.amenities : field.amenities.slice(0, AMENITY_LIMIT)).map((amenity: any, index: number) => {
                        const name = typeof amenity === 'string' ? amenity : (amenity?.label || amenity?.name || amenity?.value);
                        const icon = typeof amenity === 'object' ? amenity?.icon : null;

                        return (
                          <div key={index} className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-md border border-gray-100">
                            {icon && (
                              <div className="w-4 h-4">
                                <AmenityIcon src={icon} alt={name} fillColor="#22C55E" />
                              </div>
                            )}
                            <span className="text-sm font-medium text-gray-700">{name}</span>
                          </div>
                        );
                      })}
                    </div>
                    {field.amenities.length > AMENITY_LIMIT && (
                      <button
                        onClick={() => setShowAllAmenities(!showAllAmenities)}
                        className="mt-3 flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
                      >
                        {showAllAmenities ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Show {field.amenities.length - AMENITY_LIMIT} More
                          </>
                        )}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-base font-semibold text-[#192215]">N/A</p>
                )}
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
                      src={getImageUrl(field.owner.image)}
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
                <InfoCard label="Status" value={field.owner ? (field.owner.isBlocked ? "Blocked" : "Active") : "N/A"} />
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
            <h2 className="text-[#192215] font-semibold text-xl leading-5 mb-3">Community Safety Rules</h2>
            <Card className="p-5">
              {safetyRules.length > 0 ? (
                <div className="space-y-3">
                  {safetyRules.map((rule: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="10" cy="10" r="10" fill="#22C55E" />
                          <path d="M14 7L8.5 12.5L6 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <p className="text-base text-[#192215]">{rule}</p>
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
              <div className="space-y-3">
                {bookingPolicies.map((policy: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="10" r="10" fill="#22C55E" />
                        <path d="M14 7L8.5 12.5L6 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p className="text-base text-[#192215]">{policy}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Earnings History - Moved under Booking Policies */}
          <div className="mb-6">
            <h2 className="text-[#192215] font-semibold text-xl leading-5 mb-3">Earnings History</h2>
            <Card>
              <div className="p-5 flex justify-between items-center border-b border-gray-200">
                <h3 className="text-lg font-semibold">Recent Transactions</h3>
{/* <p className="text-sm text-gray-500">Total Earnings: <span className="font-semibold text-[#192215]">{formatCurrency(totalEarnings)}</span></p> */}
              </div>
              {earningsData.length > 0 ? (
                <Table
                  headers={['Order ID', 'Payment ID', 'Date and Time', 'Clients', 'Dogs', 'Total', 'Commission', 'Earnings', 'Status']}
                  rows={earningsData}
                />
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No earnings history available for this field yet.
                </div>
              )}
            </Card>
          </div>

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
                  <div className="my-2">
                    <RatingStars rating={averageRating} size={16} />
                  </div>
                  <p className="text-sm text-gray-500">{totalReviews} Reviews</p>
                </div>

                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-1 min-w-[40px]">
                        <span className="text-sm text-gray-600">{stars}</span>
                        <Star size={14} className="fill-[#FFDD57]  text-[#FFDD57]" />
                      </div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#FFDD57] transition-all duration-300"
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
                      name={review.user?.name || review.userName || 'Anonymous'}
                      date={formatDate(review.createdAt)}
                      rating={review.rating}
                      review={review.comment}
                      avatar={review.user?.googleImage || review.user?.image || review.userImage || '/default-avatar.png'}
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

      {/* Claim Status Confirmation Modal */}
      {confirmationModal?.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start mb-4">
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${!confirmationModal.currentStatus ? 'bg-green-100' : 'bg-yellow-100'
                  }`}
              >
                {!confirmationModal.currentStatus ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                )}
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {!confirmationModal.currentStatus ? 'Mark Field as Claimed' : 'Mark Field as Unclaimed'}
                </h3>
                <p className="text-sm text-gray-600">
                  {!confirmationModal.currentStatus
                    ? 'Are you sure you want to mark this field as claimed? This will indicate that the field has a verified owner.'
                    : 'Are you sure you want to mark this field as unclaimed? This will indicate that the field ownership is not verified.'}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Field Name:</span>
                  <span className="font-medium text-gray-900">{confirmationModal.fieldName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Status:</span>
                  <span className="font-medium text-gray-900">
                    {confirmationModal.currentStatus ? 'Claimed' : 'Unclaimed'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">New Status:</span>
                  <span className={`font-medium ${!confirmationModal.currentStatus ? 'text-green' : 'text-yellow'}`}>
                    {!confirmationModal.currentStatus ? 'Claimed' : 'Unclaimed'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmationModal(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleClaimed}
                disabled={toggleClaimedMutation.isPending}
                className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors shadow-sm ${!confirmationModal.currentStatus
                  ? 'bg-green hover:bg-green/80 disabled:bg-green'
                  : 'bg-yellow hover:bg-yellow-700 disabled:bg-yellow'
                  }`}
              >
                {toggleClaimedMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <Spinner size="sm" className="mr-2" />
                    Processing...
                  </div>
                ) : (
                  !confirmationModal.currentStatus ? 'Mark as Claimed' : 'Mark as Unclaimed'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}