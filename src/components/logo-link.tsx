"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";

type Props = {
  width?: number;
  height?: number;
  className?: string;
};

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function LogoLink({
  width = 280,
  height = 80,
  className,
}: Props) {
  const { resolvedTheme } = useTheme();
  const isHydrated = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const logoSrc =
    isHydrated && resolvedTheme === "light"
      ? "/stagio_logo_1.png"
      : "/stagio-logo-white.png";

  return (
    <Link href="/" className={`inline-flex items-center ${className ?? ""}`}>
      <Image
        src={logoSrc}
        alt="Stagio"
        width={width}
        height={height}
        loading="eager"
        priority
        style={{ width: "auto", height: `${height}px` }}
        className="object-contain"
      />
    </Link>
  );
}
