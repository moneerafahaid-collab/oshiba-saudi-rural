import { assetUrl } from "../../utils/assetUrl";

/** أسلوب دائري نظيف مثل «روح السعودية» — خلفية لونية + صورة */
const AVATAR_SRC = assetUrl("/images/oshiba-avatar.png");

/** لون الخلفية داخل الدائرة (بنفسجي-أزرق هادئ كما في Visit Saudi) */
const CIRCLE_BG = "bg-[#7B89B8]";

const SIZES = {
  sm: "w-10 h-10",
  md: "w-14 h-14",
  lg: "w-[3.75rem] h-[3.75rem]",
  xl: "w-16 h-16",
} as const;

type OshibaAvatarSize = keyof typeof SIZES;

interface OshibaAvatarProps {
  size?: OshibaAvatarSize;
  className?: string;
}

export function OshibaAvatar({ size = "md", className = "" }: OshibaAvatarProps) {
  return (
    <div
      className={`${SIZES[size]} ${CIRCLE_BG} rounded-full overflow-hidden shrink-0 ${className}`}
      role="img"
      aria-label="عشيبة — مرشدتك الريفية"
    >
      <img
        src={AVATAR_SRC}
        alt=""
        className="w-full h-full object-cover object-[center_18%]"
        width={64}
        height={64}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

export { AVATAR_SRC as OSHIBA_AVATAR_SRC };
