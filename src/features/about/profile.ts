/** About sahifasining "code space" ko'rinishi uchun barcha ma'lumot (server → client). */
export type CodeProfile = {
  name: string;
  role: string;
  avatar: string;
  summary: string[];
  experience: { title: string; org: string; period: string; location: string; description: string }[];
  education: { title: string; org: string; period: string; location: string }[];
  skills: string[];
  projects: { title: string; tech: string[]; href: string; demo: string; source: string }[];
  posts: { title: string; href: string; date: string }[];
  socials: { label: string; url: string }[];
  cvUrl: string;
  leetcode: { solved: number; ranking: number; username: string } | null;
  links: { posts: string; projects: string; certificates: string };
  counts: { posts: number; projects: number; certificates: number };
};
