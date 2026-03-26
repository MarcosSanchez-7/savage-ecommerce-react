import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

interface LogoWithShineProps {
  /** Extra classes on the outer Link wrapper */
  linkClassName?: string;
  /** Extra classes on the img wrapper div */
  iconClassName?: string;
  /** Tailwind text-size classes for "SAVAGE" */
  textClassName?: string;
  onClick?: () => void;
}

/**
 * Crown + "SAVAGE" text logo with a repeating GSAP gold-glow pulse.
 * The crown filter and text color are fully owned by GSAP so there is no
 * conflict with Tailwind utility classes.
 */
const LogoWithShine: React.FC<LogoWithShineProps> = ({
  linkClassName = '',
  iconClassName = 'size-8 md:size-10',
  textClassName = 'text-lg md:text-2xl',
  onClick,
}) => {
  const crownRef = useRef<HTMLImageElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    // Set the resting filter so GSAP owns it from frame 0 (avoids Tailwind conflict)
    gsap.set(crownRef.current, {
      filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.55)) brightness(1.1)',
    });

    // Repeating pulse: resting → glow → resting, every ~2.5 s
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.8 });

    tl.to(crownRef.current, {
      filter: 'drop-shadow(0 0 22px rgba(212,175,55,1)) brightness(1.75)',
      duration: 0.38,
      ease: 'power2.in',
    })
      .to(
        textRef.current,
        {
          color: '#D4AF37',
          textShadow: '0 0 14px rgba(212,175,55,0.55)',
          duration: 0.38,
          ease: 'power2.in',
        },
        '<', // same start time as crown tween
      )
      .to(crownRef.current, {
        filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.55)) brightness(1.1)',
        duration: 0.6,
        ease: 'power2.out',
      })
      .to(
        textRef.current,
        {
          color: '#ffffff',
          textShadow: 'none',
          duration: 0.6,
          ease: 'power2.out',
        },
        '<',
      );
  });

  return (
    <Link
      to="/"
      className={`flex items-center gap-2 group ${linkClassName}`}
      onClick={onClick}
    >
      <div className={`${iconClassName} flex items-center justify-center transition-transform group-hover:scale-110`}>
        <img
          ref={crownRef}
          src="/crown.png"
          alt="Savage Crown"
          className="w-full h-full object-contain"
        />
      </div>
      <h2
        ref={textRef}
        className={`${textClassName} font-black leading-none tracking-widest uppercase pt-1`}
        style={{ color: '#ffffff' }}
      >
        SAVAGE
      </h2>
    </Link>
  );
};

export default LogoWithShine;
