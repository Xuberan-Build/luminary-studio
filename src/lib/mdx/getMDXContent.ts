import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { compileMDX } from 'next-mdx-remote/rsc';
import readingTime from 'reading-time';

const contentDirectory = path.join(process.cwd(), 'src/content');

export interface ContentMeta {
  title: string;
  description: string;
  slug: string;
  date: string;
  category?: string;
  pillar?: string;
  cluster?: string;
  author?: string;
  image?: string;
  keywords?: string[];
  readingTime?: string;
}

export async function getContentBySlug(
  type: 'blog' | 'resources',
  slug: string,
  pillar?: string
) {
  const basePath = pillar
    ? path.join(contentDirectory, type, pillar)
    : path.join(contentDirectory, type);

  const filePath = path.join(basePath, `${slug}.mdx`);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);

  const { content: compiledContent } = await compileMDX({
    source: content,
    options: { parseFrontmatter: true },
  });

  return {
    meta: {
      ...data,
      slug,
      readingTime: readingTime(content).text,
    } as ContentMeta,
    content: compiledContent,
  };
}

export function getAllContent(type: 'blog' | 'resources', pillar?: string) {
  const basePath = pillar
    ? path.join(contentDirectory, type, pillar)
    : path.join(contentDirectory, type);

  if (!fs.existsSync(basePath)) {
    return [];
  }

  const files = fs.readdirSync(basePath);
  const mdxFiles = files.filter((file) => file.endsWith('.mdx'));

  return mdxFiles.map((file) => {
    const filePath = path.join(basePath, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(fileContent);
    const slug = file.replace('.mdx', '');

    return {
      ...data,
      slug,
    } as ContentMeta;
  });
}

export function getPillarContent(pillar: string) {
  const pillarPath = path.join(contentDirectory, 'resources', pillar, '_pillar.mdx');
  
  if (!fs.existsSync(pillarPath)) {
    return null;
  }

  const fileContent = fs.readFileSync(pillarPath, 'utf-8');
  const { data, content } = matter(fileContent);

  return {
    meta: data as ContentMeta,
    content,
  };
}
