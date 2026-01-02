import { cn } from "@/lib/utils";

type PlatformIconProps = React.SVGProps<SVGSVGElement> & {
  platform: string;
};

const SteamIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.182c5.42 0 9.818 4.398 9.818 9.818S17.42 21.818 12 21.818 2.182 17.42 2.182 12 6.58 2.182 12 2.182zm4.83 5.332-5.913 2.27c-.36.14-.52.54-.38.9l1.45 3.77-3.795-1.45c-.36-.14-.76.02-.9.38l-2.27 5.913c-.14.36.02.76.38.9s.76-.02.9-.38l2.27-5.913c.14-.36.54-.52.9-.38l3.795 1.45c.36.14.76-.02.9-.38l2.27-5.913c.14-.36-.02-.76-.38-.9zm-4.01 5.92c-.89 0-1.61-.72-1.61-1.61s.72-1.61 1.61-1.61 1.61.72 1.61 1.61-.72 1.61-1.61 1.61z" />
    </svg>
);

const EpicGamesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.51 0C7.52 0 4 3.79 4 8.5v7C4 18.97 6.03 24 12.51 24S20 17.03 20 17V0h-7.49zM15.49 17c0 1.93-1.57 3.5-3.5 3.5S8.5 18.93 8.5 17v-1.5h7v1.5z" />
    </svg>
);

const GOGIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12c3.16 0 6.02-1.22 8.15-3.21L12 10.7l-4.79 4.88L3.29 11.6l8.72-8.8.1-.11H20.8c-2.02-1.84-4.76-3-7.8-3zm5.83 14.59L12 10.7l-4.79 4.88L3.29 11.6l8.72-8.8.1-.11h-.01l.95-.97c.31-.32.82-.32.95.18l3.96 11.5c.13.36-.08.77-.44.87z" />
    </svg>
);

const PrimeGamingIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.6 13.598 12.013 7.555 6.425 13.598l1.378.89 4.21-4.498v8.653h1.967V9.99l4.242 4.498 1.378-.89zM12.013 0C5.39 0 0 5.39 0 12.013s5.39 12.012 12.013 12.012S24.025 18.635 24.025 12.013 18.635 0 12.013 0zm0 21.84c-5.418 0-9.828-4.41-9.828-9.827S6.595 2.186 12.013 2.186s9.827 4.41 9.827 9.827-4.41 9.827-9.827 9.827z" />
    </svg>
);

const UnknownPlatformIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </svg>
);

export function PlatformIcon({ platform, className, ...props }: PlatformIconProps) {
  const normalizedPlatform = platform.toLowerCase();

  if (normalizedPlatform.includes('steam')) {
    return <SteamIcon className={cn("text-gray-700 dark:text-gray-300", className)} {...props} />;
  }
  if (normalizedPlatform.includes('epic')) {
    return <EpicGamesIcon className={cn("text-black dark:text-white", className)} {...props} />;
  }
  if (normalizedPlatform.includes('gog')) {
    return <GOGIcon className={cn("text-purple-600", className)} {...props} />;
  }
  if (normalizedPlatform.includes('amazon') || normalizedPlatform.includes('prime')) {
    return <PrimeGamingIcon className={cn("text-blue-500", className)} {...props} />;
  }

  return <UnknownPlatformIcon className={cn("text-muted-foreground", className)} {...props} />;
}
