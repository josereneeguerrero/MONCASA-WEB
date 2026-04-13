import Image from 'next/image';

type BrandLogoProps = {
  className?: string;
};

export default function BrandLogo({ className = '' }: BrandLogoProps) {
  return (
    <Image
      src="/moncasa-logo.png"
      alt="Ferretería Moncasa"
      width={48}
      height={48}
      priority
      className={className}
    />
  );
}