import { assetUrl } from "../utils/assetUrl";

/** تجارب منطقة حائل — محميات، فعاليات، مغامرات، وإقامة */
export interface Experience {
  id: number;
  title: string;
  region: string;
  category: string;
  price: number;
  duration: string;
  rating: number;
  reviews: number;
  imageUrl: string;
  host: string;
  maxGroup: number;
  tags: string[];
  featured: boolean;
}

const HAIL = "منطقة حائل";

export const hailExperiences: Experience[] = [
  {
    id: 14,
    title: "جولة بيئية في محمية الفقع",
    region: HAIL,
    category: "محميات",
    price: 95,
    duration: "٥ ساعات",
    rating: 4.9,
    reviews: 128,
    imageUrl: assetUrl("/images/hail/faqa-reserve.png"),
    host: "مرشدو محمية الفقع",
    maxGroup: 12,
    tags: ["محمية الفقع", "بيئة", "حياة برية", "حائل"],
    featured: true,
  },
  {
    id: 15,
    title: "رحلة استكشاف محمية الفرولة",
    region: HAIL,
    category: "محميات",
    price: 110,
    duration: "٦ ساعات",
    rating: 4.8,
    reviews: 94,
    imageUrl: assetUrl("/images/hail/farwa-reserve.png"),
    host: "فريق المحميات بحائل",
    maxGroup: 10,
    tags: ["محمية الفرولة", "فراولة", "زراعة", "حائل"],
    featured: true,
  },
  {
    id: 16,
    title: "تطعيس في صحراء حائل",
    region: HAIL,
    category: "فعاليات",
    price: 140,
    duration: "٦ ساعات",
    rating: 4.9,
    reviews: 167,
    imageUrl: assetUrl("/images/hail/tattees-night.png"),
    host: "نجوم حائل",
    maxGroup: 15,
    tags: ["تطعيس", "فلك", "ليل", "صحراء"],
    featured: true,
  },
  {
    id: 17,
    title: "فعالية جو — أنشطة في أجواء حائل",
    region: HAIL,
    category: "فعاليات",
    price: 75,
    duration: "٤ ساعات",
    rating: 4.7,
    reviews: 203,
    imageUrl: assetUrl("/images/hail/jo-event.png"),
    host: "فعالية جو حائل",
    maxGroup: 20,
    tags: ["فعالية جو", "شعيب جو", "دفع رباعي", "عائلات"],
    featured: false,
  },
  {
    id: 18,
    title: "هايكينق في جبال أجا وسلمى",
    region: HAIL,
    category: "مغامرات",
    price: 160,
    duration: "٧ ساعات",
    rating: 4.9,
    reviews: 142,
    imageUrl: assetUrl("/images/hail/aja-salma-hiking.png"),
    host: "مسارات أجا",
    maxGroup: 8,
    tags: ["هايكينق", "أجا وسلمى", "جبال", "مغامرة"],
    featured: true,
  },
  {
    id: 19,
    title: "تجول بين جبال شمر ووديان حائل",
    region: HAIL,
    category: "مغامرات",
    price: 145,
    duration: "٨ ساعات",
    rating: 4.8,
    reviews: 88,
    imageUrl:
      "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=600&h=400&fit=crop&auto=format",
    host: "مرشدون محليون — جبال شمر",
    maxGroup: 10,
    tags: ["جبال شمر", "وديان", "تصوير", "مغامرة"],
    featured: false,
  },
  {
    id: 20,
    title: "إقامة في منتجعات عقده",
    region: HAIL,
    category: "إقامة",
    price: 480,
    duration: "ليلة كاملة",
    rating: 4.9,
    reviews: 231,
    imageUrl:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop&auto=format",
    host: "منتجعات عقده",
    maxGroup: 6,
    tags: ["عقده", "منتجعات", "استرخاء", "عائلات"],
    featured: true,
  },
  {
    id: 22,
    title: "ركوب الخيل في مربط الطائي حائل",
    region: HAIL,
    category: "مهن",
    price: 130,
    duration: "٣ ساعات",
    rating: 4.7,
    reviews: 72,
    imageUrl: assetUrl("/images/hail/al-tai-horses.png"),
    host: "أكاديمية ومربط الطائي",
    maxGroup: 6,
    tags: ["خيول", "مربط الطائي", "تراث", "حائل"],
    featured: false,
  },
];

export const HAIL_REGION_LABEL = HAIL;
