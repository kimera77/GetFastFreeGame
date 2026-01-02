import Image, { type StaticImageData } from 'next/image';
import { cn } from '@/lib/utils';
import AmazonIcon from './icon_amazon.png';
import EpicIcon from './icon_epic.png';
import GOGIcon from './icon_gog.png';
import SteamIcon from './icon_steam.png';

type PlatformIconProps = Omit<React.ComponentProps<typeof Image>, 'src' | 'alt'> & {
  platform: string;
};

const UnknownPlatformIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </svg>
);

export function PlatformIcon({
  platform,
  className,
  ...props
}: PlatformIconProps) {
  const normalizedPlatform = platform.toLowerCase();

  let iconSrc: StaticImageData | null = null;
  let altText = `${platform} icon`;

  if (normalizedPlatform.includes('steam')) {
    iconSrc = SteamIcon;
  } else if (normalizedPlatform.includes('epic')) {
    iconSrc = EpicIcon;
  } else if (normalizedPlatform.includes('gog')) {
    iconSrc = GOGIcon;
  } else if (
    normalizedPlatform.includes('amazon') ||
    normalizedPlatform.includes('prime')
  ) {
    iconSrc = AmazonIcon;
  }

  if (iconSrc) {
    return (
      <Image
        src={iconSrc}
        alt={altText}
        className={cn('h-10 w-10 object-contain', className)}
        {...props}
      />
    );
  }

  return (
    <UnknownPlatformIcon
      className={cn('text-muted-foreground', className)}
      {...props}
    />
  );
}
