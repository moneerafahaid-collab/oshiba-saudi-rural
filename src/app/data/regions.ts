export interface RegionCard {
  name: string;
  fullRegion: string;
  desc: string;
  imageUrl: string;
  featured?: boolean;
}

/** كل مناطق المملكة المعروضة في المنصة */
export const ALL_REGIONS: RegionCard[] = [
  {
    name: "حائل",
    fullRegion: "منطقة حائل",
    desc: "محميات وجبال وتطعيس وفراولة",
    imageUrl:
      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400&h=533&fit=crop&auto=format",
    featured: true,
  },
  {
    name: "عسير",
    fullRegion: "منطقة عسير",
    desc: "جبال وسحاب وحقول خضراء",
    imageUrl:
      "https://images.unsplash.com/photo-1695289566332-08eb1e223b6e?w=400&h=533&fit=crop&auto=format",
    featured: true,
  },
  {
    name: "الأحساء",
    fullRegion: "المنطقة الشرقية",
    desc: "أكبر واحة نخيل في العالم",
    imageUrl:
      "https://images.unsplash.com/photo-1604302882991-b75900e23890?w=400&h=533&fit=crop&auto=format",
    featured: true,
  },
  {
    name: "الطائف",
    fullRegion: "منطقة مكة المكرمة",
    desc: "عطر الورود والمزارع المتسلسلة",
    imageUrl:
      "https://images.unsplash.com/photo-1582758054019-6e219958f733?w=400&h=533&fit=crop&auto=format",
    featured: true,
  },
  {
    name: "جازان",
    fullRegion: "منطقة جازان",
    desc: "البحر والجزر والصيد الأصيل",
    imageUrl:
      "https://images.unsplash.com/photo-1778098809190-dbd18f7c0729?w=400&h=533&fit=crop&auto=format",
    featured: true,
  },
  {
    name: "الرياض",
    fullRegion: "منطقة الرياض",
    desc: "بادية نجد ومهن تراثية",
    imageUrl:
      "https://images.unsplash.com/photo-1659870461071-9bf6852f3cdd?w=600&h=400&fit=crop&auto=format",
  },
  {
    name: "مكة",
    fullRegion: "منطقة مكة المكرمة",
    desc: "ورد وعطور ومزارع جبلية",
    imageUrl:
      "https://images.unsplash.com/photo-1722435693931-c54b95084d56?w=400&h=533&fit=crop&auto=format",
  },
  {
    name: "المدينة",
    fullRegion: "منطقة المدينة المنورة",
    desc: "واحات نخيل وإقامة ريفية",
    imageUrl:
      "https://images.unsplash.com/photo-1604302882991-b75900e23890?w=400&h=533&fit=crop&auto=format",
  },
  {
    name: "الباحة",
    fullRegion: "منطقة الباحة",
    desc: "عسل جبلي وغابات ضبابية",
    imageUrl:
      "https://images.unsplash.com/photo-1758522965291-36664fbdac9c?w=400&h=533&fit=crop&auto=format",
  },
  {
    name: "القصيم",
    fullRegion: "منطقة القصيم",
    desc: "بساتين ورمان وزراعة",
    imageUrl:
      "https://images.unsplash.com/photo-1759211695822-9e214a87d082?w=400&h=533&fit=crop&auto=format",
  },
  {
    name: "تبوك",
    fullRegion: "منطقة تبوك",
    desc: "بحر أحمر وصيد وتنوّع طبيعي",
    imageUrl:
      "https://images.unsplash.com/photo-1777543807214-1a45ca79f5bf?w=400&h=533&fit=crop&auto=format",
  },
];
