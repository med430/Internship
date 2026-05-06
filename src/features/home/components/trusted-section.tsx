import Image from "next/image";
import Link from "next/link";

export function TrustedSection() {
  return (
    <section className="py-12 px-6 border-y border-border bg-card/30">
      <div className="container mx-auto max-w-7xl">
        <p className="text-center text-sm text-muted-foreground mb-8 font-label">
          Trusted by students and professionals from
        </p>
        <div className="flex items-center justify-center">
          <Link
            href="https://insat.rnu.tn/"
            target="_blank"
            rel="noopener noreferrer"
            className="relative w-32 h-32"
          >
            <Image
              src="/insat.jpg"
              alt="INSAT"
              fill
              sizes="128px"
              className="object-contain rounded-2xl"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
