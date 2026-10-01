import avatar96 from '@/assets/mascot/assistant-avatar-96.webp';
import avatar256 from '@/assets/mascot/assistant-avatar-256.webp';
import full360 from '@/assets/mascot/assistant-full-360.webp';
import full720 from '@/assets/mascot/assistant-full-720.webp';

/**
 * The dashboard AI Assistant's mascot: a plain white robot with deep-green
 * trim and a warm cream smile, in the brand's green and cream. Deliberately a
 * generic friendly robot with no cultural motifs or regalia.
 *
 * Used only inside the signed-in AI Assistant page. The public "Ask" launcher
 * keeps its own reviewed brand icon (public/img/ask-agent-icon*.svg) and is not
 * replaced by this. Generated in the style of the CovioIQ mascot and cut out
 * onto a transparent background; the untouched cut-out is
 * src/assets/mascot/assistant-source.png and the other files are cut from it.
 *
 * Decorative everywhere: each call site already names the assistant in text,
 * so alt is empty and the image is hidden from assistive tech rather than
 * announced twice.
 */

interface AvatarProps {
  /** Tailwind size classes, e.g. "h-8 w-8". */
  className?: string;
  /** "lg" serves the 256px cut for anything displayed above ~40px. */
  size?: 'sm' | 'lg';
}

/** Head cut, for the page title and message avatars. */
export function AssistantAvatar({ className = '', size = 'sm' }: AvatarProps) {
  const px = size === 'lg' ? 256 : 96;
  return (
    <img
      src={size === 'lg' ? avatar256 : avatar96}
      width={px}
      height={px}
      alt=""
      aria-hidden="true"
      decoding="async"
      draggable={false}
      className={`shrink-0 select-none object-contain ${className}`}
    />
  );
}

/** Full waving figure, for the empty state. */
export function AssistantFigure({ className = '' }: { className?: string }) {
  return (
    <img
      src={full360}
      srcSet={`${full360} 1x, ${full720} 2x`}
      width={223}
      height={360}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      draggable={false}
      className={`select-none object-contain ${className}`}
    />
  );
}
