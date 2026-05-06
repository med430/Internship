import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import type { PortfolioOption } from "../types";

interface OptionGridSelectorProps {
  title: string;
  subtitle: string;
  options: PortfolioOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function OptionGridSelector({
  title,
  subtitle,
  options,
  selectedId,
  onSelect,
}: OptionGridSelectorProps) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
          {title}
        </h3>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            title={option.description}
            className={`group relative rounded-md overflow-hidden border-2 transition-all ${
              selectedId === option.id
                ? "border-neutral-900 dark:border-neutral-50 ring-2 ring-neutral-900/20 dark:ring-neutral-50/20"
                : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
            }`}
          >
            <div className="aspect-[4/3] relative overflow-hidden">
              <Image
                src={option.badge}
                alt={option.name}
                fill
                sizes="33vw"
                className="absolute inset-0 object-contain p-1.5 group-hover:blur-sm transition-all duration-150"
              />
              <div
                className="absolute inset-0 bg-black/95 backdrop-blur-sm translate-y-full group-hover:translate-y-0 transition-transform duration-150 ease-out flex items-center justify-center p-3"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")`,
                }}
              >
                <p className="text-xs leading-tight text-white text-center relative z-10 -mt-3">
                  {option.description}
                </p>
              </div>
            </div>

            {selectedId === option.id && (
              <div className="absolute top-1 right-1 bg-neutral-900 dark:bg-neutral-50 rounded-full p-0.5 z-10">
                <CheckCircle2 className="w-2.5 h-2.5 text-white dark:text-neutral-900" />
              </div>
            )}

            <div className="absolute bottom-0 inset-x-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm py-1 text-center">
              <span className="text-[10px] font-medium text-neutral-900 dark:text-neutral-50">
                {option.name}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
