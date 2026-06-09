/** حقول إثراء اختيارية — تُطبَّق تجربةً تجربة (نموذج: مربط الطائي) */
export interface BookingOption {
  label: string;
  description: string;
}

export interface ExperienceStoryFields {
  /** وصف عام للتجربة قبل الحجز */
  description?: string;
  /** ما يشمله الحجز */
  bookingIncludes?: string[];
  /** خيارات التجربة (داخل / خارج…) */
  bookingOptions?: BookingOption[];
  heritageStory?: string;
  hostStory?: string;
  hostName?: string;
  hostTitle?: string;
  whySpecial?: string;
  previewImages?: string[];
}

const AL_TAI_ID = 22;
const NAJOM_HAIL_ID = 16;
const SHAMMAR_ID = 19;

export const EXPERIENCE_ENRICHMENT: Record<number, ExperienceStoryFields> = {
  [NAJOM_HAIL_ID]: {
    description:
      "تجربة تطعيس في صحراء حائل مع فريق نجم حائل — من أول كثيب إلى جلسة البر، بإشراف فريق عاش الرمال منذ صغره ويحوّل شغفه إلى مغامرة يعيشها الجميع.",
    bookingIncludes: [
      "مرافقة فريق نجم حائل طوال الرحلة",
      "سيارات تطعيس مجهّزة ومؤمّنة",
      "جولة بين كثبان النفود مع توقفات للتصوير",
      "جلسة بر تقليدية بعد التطعيس",
      "معدات السلامة والإرشاد قبل الانطلاق",
    ],
    heritageStory:
      "في قلب رمال حائل بدأت الحكاية… مو مجرد هواية سيارات ورمال، كانت علاقة طويلة بيننا وبين النفود، بين صوت المحركات وهدوء الصحراء وقت الغروب. كبرنا وإحنا نشوف التطعيس متعة، حرية، وضحكة أصدقاء ما تنسى. وكل مرة نطلع فيها للرمال كنا نقول: «ليش هالإحساس ما يعيشه الكل؟» ومن هنا بدأ «فريق نجم حائل».",
    hostStory:
      "قررنا نحول شغفنا إلى تجربة يعيشها كل شخص يحب المغامرة، سواء أول مرة يجرب أو عاشق للرمال من سنين. مو بس نوصلّك للكثبان… نبي نخليك تعيش الأجواء كاملة: صوت الكفرات على الرمل، رهبة الطلعات، حماس النزلات، وجلسة البر بعد التعب. نهتم بأدق التفاصيل لأننا نعرف شعور الشخص اللي جاي يدور تجربة مختلفة فعلًا، مو مجرد طلعة عادية.",
    hostName: "فريق نجم حائل",
    hostTitle: "تطعيس وتراث النفود — نجوم حائل",
    whySpecial:
      "في نجم حائل… إحنا ما نقدم خدمة تطعيس فقط، إحنا نصنع ذكرى ترجع تتكلم عنها كل مرة تشوف فيها الرمل.",
    previewImages: ["/images/hail/tattees-night.png"],
  },
  [SHAMMAR_ID]: {
    description:
      "رحلة استكشاف بين جبال شمر ووديان حائل مع مرشدين محليين يعرفون كل ممر وصخرة — مغامرة بعيداً عن الطريق السريع، في عالم الجبال اللي ما ينشاف إلا بالمشي.",
    bookingIncludes: [
      "مرافقة مرشد محلي طوال الرحلة",
      "مسارات آمنة بين الجبال والوديان",
      "توقفات للتصوير والاستكشاف",
      "إرشادات السلامة قبل الانطلاق",
      "ماء خفيف واستراحة في منتصف المسار",
    ],
    heritageStory:
      "في قلب حائل، بين الجبال اللي شكلتها الرياح عبر آلاف السنين، فيه شيء ما ينشاف من الطريق السريع ولا ينحكى عنه في الخرائط. أنا ما كنت أؤمن إن المكان يقدر «ينادي»، لكن أول مرة دخلت هالمسارات بين الجبال حسّيت كأن حائل كانت تخبّي سر وتبي أحد يكتشفه. صمت غريب… مو صمت فراغ، صمت مليان حكايات. صخور كأنها متراصة عن قصد، ممرات ضيقة تفتح فجأة على مشاهد ما تتوقعها، وهواء بارد حتى لو الشمس فوقك. هنا تبدأ فكرة رحلتنا: «رحلة الاستكشاف في جبال حائل».",
    hostStory:
      "مو مجرد مشي… هي دخول لعالم ثاني داخل نفس المدينة. كل خطوة تاخذك أعمق، وكل منعطف يخليك تقول: «كيف ما شفت المكان هذا قبل؟» اللي يجي معنا ما يطلع بنفس الشعور اللي دخل فيه، لأن الجبال هنا ما تعطيك مشهد… تعطيك تجربة.",
    hostName: "مرشدون محليون — جبال شمر",
    hostTitle: "استكشاف وادي وجبال حائل",
    whySpecial:
      "وإذا كنت تتساءل: ليه أحجز؟ لأن في قلب حائل فيه شيء ينتظرك، ما ينشاف إلا إذا دخلت بنفسك.",
    previewImages: [
      "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=600&h=400&fit=crop&auto=format",
    ],
  },
  [AL_TAI_ID]: {
    description:
      "تجربة ركوب خيل عربي أصيل في أكاديمية ومربط الطائي بحائل، بإشراف مدربين محترفين. تناسب المبتدئين والعائلات ومحبي الخيول، مع خيار الركوب داخل المربط أو في الروضة الخارجية حسب مستواك ورغبتك.",
    bookingIncludes: [
      "ركوب خيل مع مدرب مرافق طوال التجربة",
      "تعريف بالحصان وأساسيات التحكم والأمان",
      "معدات السلامة (خوذة وسترة واقية)",
      "جولة تعريفية قصيرة في المربط وتاريخ الخيل العربي",
      "ماء واستراحة بعد الجولة",
    ],
    bookingOptions: [
      {
        label: "داخل المربط",
        description:
          "تدريب وتأقلم مع الحصان في الصالة المغطاة — مثالي للمبتدئين والأطفال والعائلات في أجواء آمنة ومظللة.",
      },
      {
        label: "في الروضة الخارجية",
        description:
          "جولة ركوب في أجواء حائل الطبيعية بين المدرّبات والروضة، مع مرافقة المدرب خطوة بخطوة.",
      },
    ],
    heritageStory:
      "يرتبط مربط الطائي بتراث الفروسية في حائل منذ أجيال. كانت الخيول العربية الأصيلة رفيقة البادية والقافلة، ورمزاً للكرم والشجاعة في شمال المملكة. اليوم يحافظ المربط على هذه المهنة ويعيد إحياءها كتجربة حية يعيشها الزائر.",
    hostStory:
      "يقود التجربة فريق أكاديمية ومربط الطائي — مربون ورُواد مهنة ورثوها عن آبائهم في روضة حائل. يشاركونك قصة كل حصان، وكيف تطورت رعاية الخيل العربي من البادية إلى أكاديمية تُعلّم وتُعرّف بالتراث.",
    hostName: "أبو سلطان الطائي",
    hostTitle: "مربي خيل عربي أصيل — أكاديمية ومربط الطائي",
    whySpecial:
      "تجربة تجمع بين ركوب الخيل والحكاية والمهنة التراثية في قلب الريف الحائلي.",
    previewImages: ["/images/hail/al-tai-horses.png"],
  },
};

export function enrichExperience<T extends { id: number | string }>(
  exp: T
): T & ExperienceStoryFields {
  const id = typeof exp.id === "number" ? exp.id : Number(exp.id);
  const extra = EXPERIENCE_ENRICHMENT[id];
  return extra ? { ...exp, ...extra } : exp;
}

export function hasHeritageStory(exp: { id: number | string }): boolean {
  const id = typeof exp.id === "number" ? exp.id : Number(exp.id);
  return Boolean(EXPERIENCE_ENRICHMENT[id]?.heritageStory);
}

export function hasRichDetails(exp: { id: number | string }): boolean {
  const id = typeof exp.id === "number" ? exp.id : Number(exp.id);
  const e = EXPERIENCE_ENRICHMENT[id];
  return Boolean(e?.description || e?.bookingIncludes?.length);
}

export function getDetailFallback(exp: {
  title: string;
  region: string;
  category: string;
  host: string;
  duration: string;
  maxGroup: number;
}): Pick<ExperienceStoryFields, "description" | "bookingIncludes"> {
  return {
    description: `تجربة ${exp.category} في ${exp.region} مع ${exp.host}. مدة التجربة ${exp.duration}، ومناسبة لمجموعات حتى ${exp.maxGroup} أشخاص.`,
    bookingIncludes: [
      "مرافقة المضيف طوال التجربة",
      `المدة: ${exp.duration}`,
      `حتى ${exp.maxGroup} أشخاص في المجموعة`,
    ],
  };
}

export function buildOshibaStoryNarrative(
  exp: ExperienceStoryFields & { title?: string; host?: string }
): string {
  const parts: string[] = [];
  if (exp.title) {
    parts.push(`تعال أحكي لك عن «${exp.title}»…`);
  }
  if (exp.heritageStory) parts.push(exp.heritageStory);
  if (exp.hostStory) parts.push(exp.hostStory);
  if (exp.whySpecial) parts.push(exp.whySpecial);
  if (exp.host) {
    parts.push(`تستضيفك ${exp.host}. جاهز تعيش التجربة بنفسك؟`);
  }
  return parts.join("\n\n");
}
