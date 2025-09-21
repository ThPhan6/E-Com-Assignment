import { LazyLoadImage, type Effect } from "react-lazy-load-image-component";
import noImagePlaceholder from "../assets/no-image-placeholder.svg";
import loadingPlaceholder from "../assets/loading-placeholder.svg";

interface ImageProps {
  src?: string;
  alt?: string;
  className?: string;
  effect?: Effect;
  placeholderSrc?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export const LazyImage = ({
  src = "",
  alt = "",
  className,
  effect = "blur",
  placeholderSrc = loadingPlaceholder,
  onError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = noImagePlaceholder;
  },
}: ImageProps) => {
  return (
    <LazyLoadImage
      src={src || noImagePlaceholder}
      alt={alt}
      className={className}
      effect={effect}
      placeholderSrc={placeholderSrc}
      onError={onError}
    />
  );
};
