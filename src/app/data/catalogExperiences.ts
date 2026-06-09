import { hailExperiences } from "./hailExperiences";

export interface CatalogExperience {
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

/** كتالوج تجارب ثابت — للعرض على GitHub Pages بدون خادم */
export const CATALOG_EXPERIENCES: CatalogExperience[] = [
  {
    id: 1,
    title: "قطاف التمور في واحة الأحساء",
    region: "المنطقة الشرقية",
    category: "زراعة",
    price: 120,
    duration: "٤ ساعات",
    rating: 4.9,
    reviews: 142,
    imageUrl:
      "https://images.unsplash.com/photo-1642073537056-20608544f111?w=600&h=400&fit=crop&auto=format",
    host: "أبو محمد الزهراني",
    maxGroup: 8,
    tags: ["تمور", "حصاد", "تراث"],
    featured: true,
  },
  {
    id: 2,
    title: "تجربة الفلاحة التقليدية في عسير",
    region: "منطقة عسير",
    category: "زراعة",
    price: 95,
    duration: "٦ ساعات",
    rating: 4.8,
    reviews: 98,
    imageUrl:
      "https://images.unsplash.com/photo-1616382093586-84ed7932c216?w=600&h=400&fit=crop&auto=format",
    host: "أم سالم العسيري",
    maxGroup: 6,
    tags: ["حراثة", "جبال", "أسرة"],
    featured: false,
  },
  {
    id: 3,
    title: "قطف ورد الطائف مع المزارعين",
    region: "منطقة مكة المكرمة",
    category: "زراعة",
    price: 150,
    duration: "٣ ساعات",
    rating: 4.9,
    reviews: 215,
    imageUrl:
      "https://images.unsplash.com/photo-1722435693931-c54b95084d56?w=600&h=400&fit=crop&auto=format",
    host: "فارس القحطاني",
    maxGroup: 10,
    tags: ["ورد الطائف", "عطور", "ربيع"],
    featured: true,
  },
  {
    id: 4,
    title: "زيارة مزارع العسل في جبال الباحة",
    region: "منطقة الباحة",
    category: "مواشي",
    price: 200,
    duration: "٥ ساعات",
    rating: 4.7,
    reviews: 76,
    imageUrl:
      "https://images.unsplash.com/photo-1758522965291-36664fbdac9c?w=600&h=400&fit=crop&auto=format",
    host: "ناصر آل زاهر",
    maxGroup: 5,
    tags: ["عسل", "نحل بري", "جبال"],
    featured: false,
  },
  {
    id: 5,
    title: "رحلة صيد تقليدي في خليج جازان",
    region: "منطقة جازان",
    category: "صيد",
    price: 180,
    duration: "٨ ساعات",
    rating: 4.6,
    reviews: 54,
    imageUrl:
      "https://images.unsplash.com/photo-1778098809190-dbd18f7c0729?w=600&h=400&fit=crop&auto=format",
    host: "عبدالله الجازاني",
    maxGroup: 8,
    tags: ["بحر", "غروب", "تراث"],
    featured: false,
  },
  {
    id: 6,
    title: "ليلة في مزرعة النخيل بالمدينة",
    region: "منطقة المدينة المنورة",
    category: "إقامة",
    price: 350,
    duration: "ليلة كاملة",
    rating: 4.9,
    reviews: 189,
    imageUrl:
      "https://images.unsplash.com/photo-1604302882991-b75900e23890?w=600&h=400&fit=crop&auto=format",
    host: "حمد المدني",
    maxGroup: 4,
    tags: ["نخيل", "هدوء", "إقامة"],
    featured: true,
  },
  {
    id: 7,
    title: "نسج السدو التراثي مع حرفيات الرياض",
    region: "منطقة الرياض",
    category: "مهن",
    price: 130,
    duration: "٤ ساعات",
    rating: 4.8,
    reviews: 67,
    imageUrl:
      "https://images.unsplash.com/photo-1638310533874-6c124c012e1d?w=600&h=400&fit=crop&auto=format",
    host: "أم خالد العنزي",
    maxGroup: 6,
    tags: ["سدو", "نسيج", "تراث"],
    featured: true,
  },
  {
    id: 8,
    title: "رعي الإبل في بادية نجد",
    region: "منطقة الرياض",
    category: "مواشي",
    price: 160,
    duration: "٦ ساعات",
    rating: 4.7,
    reviews: 45,
    imageUrl:
      "https://images.unsplash.com/photo-1659870461071-9bf6852f3cdd?w=600&h=400&fit=crop&auto=format",
    host: "سالم الدوسري",
    maxGroup: 10,
    tags: ["إبل", "بادية", "رعي"],
    featured: false,
  },
  {
    id: 9,
    title: "صناعة سلال الخوص في الأحساء",
    region: "المنطقة الشرقية",
    category: "مهن",
    price: 110,
    duration: "٣ ساعات",
    rating: 4.6,
    reviews: 83,
    imageUrl:
      "https://images.unsplash.com/photo-1707978932202-751b08324daf?w=600&h=400&fit=crop&auto=format",
    host: "فاطمة العبدالله",
    maxGroup: 8,
    tags: ["خوص", "سلال", "حرفة"],
    featured: false,
  },
  {
    id: 10,
    title: "قطف الرمان في بساتين القصيم",
    region: "منطقة القصيم",
    category: "زراعة",
    price: 85,
    duration: "٥ ساعات",
    rating: 4.8,
    reviews: 112,
    imageUrl:
      "https://images.unsplash.com/photo-1759211695822-9e214a87d082?w=600&h=400&fit=crop&auto=format",
    host: "أبو عبدالرحمن البريدي",
    maxGroup: 12,
    tags: ["رمان", "قصيم", "بستان"],
    featured: false,
  },
  {
    id: 11,
    title: "صيد الأسماك في شواطئ تبوك",
    region: "منطقة تبوك",
    category: "صيد",
    price: 200,
    duration: "٧ ساعات",
    rating: 4.7,
    reviews: 39,
    imageUrl:
      "https://images.unsplash.com/photo-1777543807214-1a45ca79f5bf?w=600&h=400&fit=crop&auto=format",
    host: "ماجد السلمي",
    maxGroup: 6,
    tags: ["بحر أحمر", "تبوك", "قوارب"],
    featured: false,
  },
  {
    id: 12,
    title: "إقامة في قرية عسير الجبلية",
    region: "منطقة عسير",
    category: "إقامة",
    price: 420,
    duration: "ليلة كاملة",
    rating: 4.9,
    reviews: 156,
    imageUrl:
      "https://images.unsplash.com/photo-1665477116539-0bab93c41e87?w=600&h=400&fit=crop&auto=format",
    host: "عائلة آل شهري",
    maxGroup: 5,
    tags: ["جبال", "عسير", "ضباب"],
    featured: true,
  },
  {
    id: 13,
    title: "تقطير عطر الورد الطائفي يدوياً",
    region: "منطقة مكة المكرمة",
    category: "مهن",
    price: 175,
    duration: "٤ ساعات",
    rating: 4.9,
    reviews: 203,
    imageUrl:
      "https://images.unsplash.com/photo-1582758054019-6e219958f733?w=600&h=400&fit=crop&auto=format",
    host: "عبدالعزيز العتيبي",
    maxGroup: 8,
    tags: ["عطور", "تقطير", "ورد"],
    featured: true,
  },
  ...hailExperiences,
];

export function filterCatalogExperiences(params?: {
  region?: string;
  category?: string;
  search?: string;
}): CatalogExperience[] {
  let list = [...CATALOG_EXPERIENCES];
  if (params?.region && params.region !== "جميع المناطق") {
    list = list.filter((e) => e.region === params.region);
  }
  if (params?.category && params.category !== "all") {
    list = list.filter((e) => e.category === params.category);
  }
  if (params?.search?.trim()) {
    const q = params.search.trim().toLowerCase();
    list = list.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.region.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  return list;
}
