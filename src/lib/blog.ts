import fs from 'fs';
import path from 'path';
import readingTime from 'reading-time';
import { parse as parseYaml } from 'yaml';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  image?: string;
  readingTime: string;
  content: string;
}

const BLOG_DIR = path.join(process.cwd(), 'content/blog');

/**
 * Blog slugs come from filenames on disk and are then used two ways: joined
 * onto BLOG_DIR to read a file, and interpolated into `/blog/${slug}` hrefs.
 * Constraining them to lowercase kebab-case makes both uses safe by
 * construction — a slug can carry no `.` or path separator to escape BLOG_DIR,
 * and no `:` to introduce a URL scheme in an href (CodeQL js/stored-xss).
 *
 * Every post currently in content/blog already conforms, so this documents and
 * enforces the existing convention rather than changing behavior.
 */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidBlogSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function parseFrontmatter(fileContent: string): { data: Record<string, unknown>; content: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(fileContent);
  if (!match) {
    return { data: {}, content: fileContent };
  }

  const parsed = parseYaml(match[1]);
  return {
    data: isRecord(parsed) ? parsed : {},
    content: fileContent.slice(match[0].length),
  };
}

function toBlogPost(slug: string, fileContent: string): BlogPost {
  const { data, content } = parseFrontmatter(fileContent);
  const stats = readingTime(content);

  return {
    slug,
    title: asString(data.title),
    description: asString(data.description),
    date: asString(data.date),
    author: asString(data.author),
    tags: asStringArray(data.tags),
    image: asString(data.image) || undefined,
    readingTime: stats.text,
    content,
  };
}

export function getAllPosts(): BlogPost[] {
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx'));

  return files
    .map(filename => {
      // slice, not replace('.mdx', '') — replace strips the first occurrence
      // anywhere in the name, so "notes.mdx.mdx" would yield "notes.mdx".
      const slug = filename.slice(0, -'.mdx'.length);
      if (!isValidBlogSlug(slug)) return null;
      const fileContent = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf-8');
      return toBlogPost(slug, fileContent);
    })
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
  // Validate before touching the filesystem so a slug can never join its way
  // out of BLOG_DIR.
  if (!isValidBlogSlug(slug)) return null;

  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return toBlogPost(slug, fileContent);
}

export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tags = new Set<string>();
  posts.forEach(post => post.tags.forEach(tag => tags.add(tag)));
  return Array.from(tags).sort();
}
