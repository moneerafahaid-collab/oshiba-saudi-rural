export interface RegionSpotlight {
  fullRegion: string;
  name: string;
  description: string;
  highlight: string;
  tags: string[];
  imageUrl: string;
  imageAlt: string;
}

export const REGION_SPOTLIGHTS: Record<string, RegionSpotlight> = {
  "منطقة حائل": {
    fullRegion: "منطقة حائل",
    name: "حائل",
    description:
      "حيث تمتزج المغامرة بجمال الطبيعة — من محمية الفقع ومحمية الفروة إلى فعاليات التطعيس وجو هايكينق آجا وسلمى، مرورًا بمنتجعات عقده وقطاف الفراولة وركوب الخيل بين الجبال.",
    highlight: "تجربة واحدة تجمع كل سحر حائل في مكان واحد.",
    tags: ["محميات", "تطعيس", "هايكينق", "عقده", "فراولة"],
    imageUrl: "/images/hail/hail-banner.png",
    imageAlt: "جبال وصحراء حائل — منظر طبيعي",
  },
  "منطقة جازان": {
    fullRegion: "منطقة جازان",
    name: "جازان",
    description:
      "جنوب المملكة بإطلالات بحرية وزراعة استوائية — جزر فرسان، مزارع المانجو والقهوة، قرى ساحلية، وصيد تقليدي يعيشه أهل المنطقة من جيل لجيل.",
    highlight: "اكتشف جمال الجنوب حيث البحر يلتقي بالجبال الخضراء.",
    tags: ["بحر", "جزر", "صيد", "مانجو", "قرى"],
    imageUrl:
      "https://images.unsplash.com/photo-1778098809190-dbd18f7c0729?w=800&h=500&fit=crop&auto=format",
    imageAlt: "ساحل جازان — بحر وجزر",
  },
  "منطقة عسير": {
    fullRegion: "منطقة عسير",
    name: "عسير",
    description:
      "جبال شامخة وضباب وسحاب يلامس القمم — مزارع متدرجة، قرى تراثية على الحافة، وفعاليات موسمية تجمع العائلات في أجواء باردة طوال العام.",
    highlight: "عسير منطقة لا تُنسى لمحبي الطبيعة والهواء النقي.",
    tags: ["جبال", "ضباب", "مزارع", "تراث", "موسم"],
    imageUrl:
      "https://images.unsplash.com/photo-1695289566332-08eb1e223b6e?w=800&h=500&fit=crop&auto=format",
    imageAlt: "جبال عسير الخضراء",
  },
  "المنطقة الشرقية": {
    fullRegion: "المنطقة الشرقية",
    name: "الشرقية",
    description:
      "من واحة الأحساء العالمية إلى سهول القصيم المجاورة — نخيل، تمور، واحات مائية، ومهن زراعية عريقة يشاركك أهلها قصص الحصاد والتراث.",
    highlight: "واحات ونخيل وتراث زراعي أصيل في قلب الشرق.",
    tags: ["تمور", "واحات", "نخيل", "حصاد", "تراث"],
    imageUrl:
      "https://images.unsplash.com/photo-1604302882991-b75900e23890?w=800&h=500&fit=crop&auto=format",
    imageAlt: "واحة ونخيل — المنطقة الشرقية",
  },
  "منطقة مكة المكرمة": {
    fullRegion: "منطقة مكة المكرمة",
    name: "مكة والطائف",
    description:
      "من مزارع ورد الطائف على الجبال إلى قرى الحجاز — عطور، موسم القطاف، وضيافة مكة المعروفة في أجواء ريفية هادئة بعيداً عن الزحام.",
    highlight: "عطر الورود ومزارع الجبال في أحضان الحجاز.",
    tags: ["ورد", "قطاف", "جبال", "عطور", "قرى"],
    imageUrl:
      "https://images.unsplash.com/photo-1582758054019-6e219958f733?w=800&h=500&fit=crop&auto=format",
    imageAlt: "مزارع وورود — منطقة مكة المكرمة",
  },
  "منطقة المدينة المنورة": {
    fullRegion: "منطقة المدينة المنورة",
    name: "المدينة",
    description:
      "واحات نخيل ومزارع تاريخية حول المدينة — إقامة ريفية، جولات في البساتين، وتجارب تعرّفك على حياة المزارعين في نجد الغربي.",
    highlight: "هدوء الواحات ودفء الضيافة المدنية.",
    tags: ["نخيل", "واحات", "إقامة", "مزارع", "تراث"],
    imageUrl:
      "https://images.unsplash.com/photo-1604302882991-b75900e23890?w=800&h=500&fit=crop&auto=format",
    imageAlt: "واحات المدينة المنورة",
  },
  "منطقة الرياض": {
    fullRegion: "منطقة الرياض",
    name: "الرياض",
    description:
      "بادية نجد وقرى قريبة من العاصمة — مزارع محلية، مهن تراثية، وفعاليات موسمية تجمع العائلات في أجواء ريفية أصيلة على مشارف الرياض.",
    highlight: "القرب من العاصمة مع روح الريف النجدي.",
    tags: ["نجد", "مزارع", "تراث", "عائلات", "موسم"],
    imageUrl:
      "https://images.unsplash.com/photo-1659870461071-9bf6852f3cdd?w=800&h=500&fit=crop&auto=format",
    imageAlt: "بادية نجد — منطقة الرياض",
  },
  "منطقة الباحة": {
    fullRegion: "منطقة الباحة",
    name: "الباحة",
    description:
      "غابات ضبابية وعسل جبلي وقرى معلقة على الجبال — طبيعة خلابة وتجارب زراعية وحرفية يقدّمها أهل الباحة بفخر وكرم.",
    highlight: "جمال الجنوب الغربي بين الضباب والعسل.",
    tags: ["عسل", "جبال", "غابات", "حرف", "قرى"],
    imageUrl:
      "https://images.unsplash.com/photo-1758522965291-36664fbdac9c?w=800&h=500&fit=crop&auto=format",
    imageAlt: "جبال الباحة",
  },
  "منطقة القصيم": {
    fullRegion: "منطقة القصيم",
    name: "القصيم",
    description:
      "بساتين الرمان والحمضيات في قلب نجد — مزارع عائلية، موسم الحصاد، وضيافة قصيمية معروفة في تجارب زراعية قريبة من الطبيعة.",
    highlight: "نكهة نجد الزراعية في أرياف القصيم.",
    tags: ["رمان", "بساتين", "حصاد", "مزارع", "نجد"],
    imageUrl:
      "https://images.unsplash.com/photo-1759211695822-9e214a87d082?w=800&h=500&fit=crop&auto=format",
    imageAlt: "بساتين القصيم",
  },
  "منطقة تبوك": {
    fullRegion: "منطقة تبوك",
    name: "تبوك",
    description:
      "بحر أحمر وجبال شاهقة وصحراء واسعة — تنوّع طبيعي نادر بين الساحل والداخل، مع تجارب صيد وزراعة وتراث بدوي أصيل.",
    highlight: "حيث يلتقي البحر بالصحراء في شمال المملكة.",
    tags: ["بحر", "صحراء", "صيد", "جبال", "تراث"],
    imageUrl:
      "https://images.unsplash.com/photo-1777543807214-1a45ca79f5bf?w=800&h=500&fit=crop&auto=format",
    imageAlt: "ساحل تبوك",
  },
};

export function getRegionSpotlight(fullRegion: string): RegionSpotlight | null {
  return REGION_SPOTLIGHTS[fullRegion] ?? null;
}
