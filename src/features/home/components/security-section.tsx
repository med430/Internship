import {
  Database,
  Globe,
  Key,
  Lock,
  MessageSquare,
  Shield,
} from "lucide-react";

const SECURITY_ITEMS = [
  {
    title: "End-to-end encryption",
    description:
      "All data is encrypted in transit and at rest using industry-standard AES-256 encryption",
    icon: Lock,
  },
  {
    title: "Anonymized AI processing",
    description:
      "Personal identifiers are removed before data reaches our AI systems",
    icon: Shield,
  },
  {
    title: "SSO and role-based access",
    description: "Enterprise SSO integration with granular permission controls",
    icon: Key,
  },
  {
    title: "Regular security audits",
    description:
      "Comprehensive penetration testing and third-party security assessments",
    icon: Database,
  },
  {
    title: "GDPR and CCPA compliant",
    description: "Full compliance with global data protection regulations",
    icon: Globe,
  },
  {
    title: "Detailed audit logs",
    description: "Complete activity tracking for compliance and transparency",
    icon: MessageSquare,
  },
];

export function SecuritySection() {
  return (
    <section className="py-20 px-6 bg-card/30">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold font-heading">
            Security and compliance
          </h2>
          <p className="text-lg text-muted-foreground">
            Your data is protected with enterprise-grade security
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SECURITY_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex gap-4">
                <Icon className="h-8 w-8 text-primary shrink-0" />
                <div>
                  <h3 className="font-bold mb-2 font-heading">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
