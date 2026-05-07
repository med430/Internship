import Image from "next/image";

export function ProfileCompletionIntro() {
  return (
    <div className="text-center space-y-2">
      <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-tight flex items-center justify-center gap-1">
        <span>Welcome to</span>
        <Image
          src="/stagio-logo-blue.png"
          alt="Stagio"
          width={140}
          height={36}
          className="inline-block h-9 w-auto align-middle relative top-[2px]"
        />
      </h1>
      <p className="text-muted-foreground text-lg">
        Let&apos;s complete your profile for better job matching
      </p>
    </div>
  );
}
