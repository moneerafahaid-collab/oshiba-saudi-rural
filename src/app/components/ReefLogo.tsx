import { assetUrl } from "../utils/assetUrl";

/** شعار منصة عشيبة السعودية الريفية — PNG بخلفية شفافة */
export const OSHIBA_LOGO_SRC = assetUrl("/images/oshiba-saudi-logo.png");

/** نسبة العرض إلى الارتفاع بعد قص الهوامش (890×426) */
export const OSHIBA_LOGO_ASPECT = 890 / 426;

/** @deprecated استخدم OSHIBA_LOGO_SRC */
export const REEF_LOGO_SRC = OSHIBA_LOGO_SRC;

interface ReefLogoProps {
  className?: string;
  /** ارتفاع الشعار بالبكسل — نفس مقاسات الاستخدام السابق */
  height?: number;
}

export function ReefLogo({ className = "", height = 44 }: ReefLogoProps) {
  const width = Math.round(height * OSHIBA_LOGO_ASPECT);

  return (
    <img
      src={OSHIBA_LOGO_SRC}
      alt="عشيبة السعودية الريفية"
      width={width}
      height={height}
      className={`block object-contain object-center w-auto shrink-0 ${className}`}
      style={{ height, width, maxHeight: height }}
      draggable={false}
    />
  );
}
