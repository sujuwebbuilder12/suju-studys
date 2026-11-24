import { useState } from "react";
import { GraduationCap } from "lucide-react";

const TEACHER_AVATAR_PATH = "/src/assets/images/suju_teacher_avatar_1795484988763.jpg";

interface TeacherAvatarProps {
  size?: "sm" | "lg";
}

export function TeacherAvatar({ size = "sm" }: TeacherAvatarProps) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses =
    size === "lg"
      ? "h-24 w-24 rounded-2xl sm:h-28 sm:w-28"
      : "h-8 w-8 rounded-lg";

  if (imgError) {
    return (
      <div
        className={`${sizeClasses} flex shrink-0 items-center justify-center border border-amber-200 bg-amber-50 text-amber-700`}
        aria-label="SuJu AI गुरुजी"
      >
        <GraduationCap className={size === "lg" ? "h-10 w-10" : "h-4.5 w-4.5"} />
      </div>
    );
  }

  return (
    <img
      src={TEACHER_AVATAR_PATH}
      alt="SuJu AI गुरुजी"
      referrerPolicy="no-referrer"
      onError={() => setImgError(true)}
      className={`${sizeClasses} shrink-0 border border-slate-200/90 object-cover shadow-xs`}
    />
  );
}
