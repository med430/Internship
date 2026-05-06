import type { PortfolioOption, ProfileFieldOption } from "../types";

export const WIREFRAMES: PortfolioOption[] = [
  {
    id: "classic",
    name: "Classic",
    badge: "/wireframes/classic.png",
    description:
      "Traditional layout with clear sections. Best for corporate and professional profiles.",
  },
  {
    id: "sidepanel",
    name: "Side Panel",
    badge: "/wireframes/sidepanel.png",
    description:
      "Fixed sidebar navigation. Perfect for content-heavy portfolios and detailed showcases.",
  },
  {
    id: "blog",
    name: "Blog",
    badge: "/wireframes/blog.png",
    description:
      "Article-style layout. Ideal for writers, bloggers, and thought leaders.",
  },
  {
    id: "hero",
    name: "Hero",
    badge: "/wireframes/hero.png",
    description:
      "Bold hero section design. Great for making a strong first impression.",
  },
  {
    id: "gallery",
    name: "Gallery",
    badge: "/wireframes/gallery.png",
    description:
      "Visual-first layout. Best for designers, artists, and creative professionals.",
  },
];

export const THEMES: PortfolioOption[] = [
  {
    id: "professional",
    name: "Professional",
    badge: "/themes/Professional.png",
    description:
      "Clean and corporate style with neutral colors and formal typography.",
  },
  {
    id: "creative",
    name: "Creative",
    badge: "/themes/Creative.png",
    description:
      "Vibrant and artistic with bold colors and expressive design elements.",
  },
  {
    id: "minimal",
    name: "Minimal",
    badge: "/themes/Minimal.png",
    description: "Simple and clean with focus on content and whitespace.",
  },
  {
    id: "tech",
    name: "Tech",
    badge: "/themes/Tech.png",
    description:
      "Modern tech-inspired with sharp edges and code-like aesthetics.",
  },
  {
    id: "elegant",
    name: "Elegant",
    badge: "/themes/Elegant.png",
    description:
      "Sophisticated and refined with subtle details and premium feel.",
  },
  {
    id: "dynamic",
    name: "Dynamic",
    badge: "/themes/Dynamic.png",
    description: "Energetic and modern with movement and contemporary design.",
  },
];

export const PROFILE_FIELDS: ProfileFieldOption[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "location", label: "Location" },
  { key: "targeted_role", label: "Targeted Role" },
  { key: "skills", label: "Skills" },
  { key: "education", label: "Education" },
  { key: "experiences", label: "Experiences" },
  { key: "achievements", label: "Achievements" },
  { key: "github_url", label: "GitHub URL" },
  { key: "linkedin_url", label: "LinkedIn URL" },
  { key: "twitter_url", label: "Twitter URL" },
];
