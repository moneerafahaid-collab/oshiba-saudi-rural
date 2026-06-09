/** تحويل سجل التجربة إلى شكل الواجهة الأمامية */
function formatExperience(doc) {
  const o = doc.toObject ? doc.toObject() : { ...doc };
  const id = o.legacyId != null ? o.legacyId : String(o._id);
  return {
    id,
    _id: o._id != null ? String(o._id) : undefined,
    title: o.title,
    region: o.region,
    category: o.category,
    price: o.price,
    duration: o.duration,
    rating: o.rating,
    reviews: o.reviews,
    imageUrl: o.imageUrl,
    host: o.host,
    maxGroup: o.maxGroup,
    tags: o.tags || [],
    featured: o.featured,
    description: o.description,
    bookingIncludes: o.bookingIncludes || [],
    bookingOptions: o.bookingOptions || [],
    heritageStory: o.heritageStory,
    hostStory: o.hostStory,
    hostName: o.hostName,
    hostTitle: o.hostTitle,
    whySpecial: o.whySpecial,
    previewImages: o.previewImages || [],
  };
}

module.exports = { formatExperience };
