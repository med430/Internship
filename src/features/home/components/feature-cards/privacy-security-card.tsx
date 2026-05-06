import { Shield } from "lucide-react";

const BADGES = ["Crypted", "Anonymized", "Secure"];

export function PrivacySecurityCard() {
  return (
    <div className="group relative p-6 rounded-3xl bg-gradient-to-br from-orange-500/15 to-orange-500/8 border-2 border-orange-500/20 hover:border-orange-500 transition-all duration-700 hover:shadow-[0_0_40px_-12px] hover:shadow-orange-500 cursor-pointer overflow-hidden">
      <Shield className="h-14 w-14 text-orange-500 mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700" />
      <h3 className="text-2xl font-bold mb-3 font-heading group-hover:text-orange-500 transition-colors">
        Privacy-First Security
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Your data is anonymized, encrypted, and protected with enterprise-grade
        security.
      </p>
      <div className="flex flex-wrap gap-2">
        {BADGES.map((badge) => (
          <div
            key={badge}
            className="px-2 py-1 rounded-md bg-orange-500/10 border border-orange-500/30 text-xs font-semibold text-orange-500"
          >
            {badge}
          </div>
        ))}
      </div>
    </div>
  );
}
