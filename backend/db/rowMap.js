/** تحويل صفوف PostgreSQL إلى شكل متوافق مع منطق MongoDB السابق */

function mapUser(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    phone: row.phone,
    passwordHash: row.password_hash,
    name: row.name,
    role: row.role,
    providerHost: row.provider_host || undefined,
    email: row.email || undefined,
    age: row.age != null ? Number(row.age) : undefined,
    interestType: row.interest_type || undefined,
    profileCompleted: row.profile_completed === true,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapExperience(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    legacyId: row.legacy_id,
    title: row.title,
    region: row.region,
    category: row.category,
    price: Number(row.price),
    duration: row.duration,
    rating: Number(row.rating),
    reviews: row.reviews_count,
    imageUrl: row.image_url,
    host: row.host,
    maxGroup: row.max_group,
    tags: row.tags || [],
    featured: row.featured,
    active: row.active,
    description: row.description,
    bookingIncludes: row.booking_includes || [],
    bookingOptions: row.booking_options || [],
    heritageStory: row.heritage_story,
    hostStory: row.host_story,
    hostName: row.host_name,
    hostTitle: row.host_title,
    whySpecial: row.why_special,
    previewImages: row.preview_images || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapBooking(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    invoiceNumber: row.invoice_number,
    experienceId: row.experience_id,
    experienceTitle: row.experience_title,
    experienceRegion: row.experience_region,
    host: row.host,
    dateLabel: row.date_label,
    timeLabel: row.time_label,
    guests: row.guests,
    groupType: row.group_type,
    paymentMethod: row.payment_method,
    pricePerPerson: row.price_per_person,
    subtotal: row.subtotal,
    serviceFee: row.service_fee,
    total: row.total,
    userPhone: row.user_phone,
    userName: row.user_name,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSubmission(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    title: row.title,
    region: row.region,
    category: row.category,
    price: row.price,
    duration: row.duration,
    hostName: row.host_name,
    phone: row.phone,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapReview(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    experienceId: row.experience_id,
    experienceTitle: row.experience_title,
    host: row.host,
    userName: row.user_name,
    userPhone: row.user_phone,
    rating: row.rating,
    comment: row.comment,
    visible: row.visible,
    featured: row.featured,
    highlight: row.highlight,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapInquiry(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    userName: row.user_name,
    userPhone: row.user_phone,
    subject: row.subject,
    message: row.message,
    status: row.status,
    adminReply: row.admin_reply,
    repliedAt: row.replied_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function experienceFromSeed(doc) {
  return {
    legacy_id: doc.legacyId ?? null,
    title: doc.title,
    region: doc.region,
    category: doc.category,
    price: doc.price,
    duration: doc.duration,
    rating: doc.rating ?? 4.5,
    reviews_count: doc.reviews ?? 0,
    image_url: doc.imageUrl,
    host: doc.host,
    max_group: doc.maxGroup,
    tags: JSON.stringify(doc.tags || []),
    featured: doc.featured ?? false,
    active: doc.active !== false,
    description: doc.description ?? null,
    booking_includes: JSON.stringify(doc.bookingIncludes || []),
    booking_options: JSON.stringify(doc.bookingOptions || []),
    heritage_story: doc.heritageStory ?? null,
    host_story: doc.hostStory ?? null,
    host_name: doc.hostName ?? null,
    host_title: doc.hostTitle ?? null,
    why_special: doc.whySpecial ?? null,
    preview_images: JSON.stringify(doc.previewImages || []),
  };
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value)
  );
}

module.exports = {
  mapUser,
  mapExperience,
  mapBooking,
  mapSubmission,
  mapReview,
  mapInquiry,
  experienceFromSeed,
  isUuid,
};
