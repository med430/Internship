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
  width = 140,
  height = 40,
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
      ? "/onboard_logo-1-black.png"
      : "/onboard_logo-1.png";

  return (
    <Link href="/" className={`inline-flex items-center ${className ?? ""}`}>
      <Image
        src={logoSrc}
        alt="OnBoard"
        width={width}
        height={height}
        style={{ width: "auto", height: `${height}px` }}
        className="object-contain"
      />
    </Link>
  );
}
