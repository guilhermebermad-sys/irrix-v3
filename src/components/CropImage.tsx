import { getCropImage } from "@/lib/cultivos/cropImages";
import { cn } from "@/lib/utils";

interface CropImageProps {
  cultura?: string | null;
  estadio?: string | null;
  size?: number;
  className?: string;
  rounded?: boolean;
  withRing?: boolean;
}

export function CropImage({
  cultura, estadio, size = 64, className, rounded = true, withRing = false,
}: CropImageProps) {
  const src = getCropImage(cultura);
  return (
    <img
      src={src}
      alt={cultura ?? "Cultura"}
      title={cultura ? `${cultura}${estadio ? " · " + estadio : ""}` : "Cultura"}
      width={size}
      height={size}
      loading="lazy"
      className={cn(
        "object-contain shrink-0",
        rounded && "rounded-xl",
        withRing && "neu-inset p-1.5",
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
}
