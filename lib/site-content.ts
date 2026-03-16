import { cache } from 'react';
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import type {
  HomePageContent,
  PostDetail,
  PostSummary,
  ProjectEntry,
  SiteSettings,
  TestimonialEntry,
} from './site-types';

const CONTENT_ROOT = path.join(process.cwd(), 'content');

async function readJsonFile<T>(relativePath: string) {
  const filePath = path.join(CONTENT_ROOT, relativePath);
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents) as T;
}

async function readCollectionJson<T>(directory: string) {
  const directoryPath = path.join(CONTENT_ROOT, directory);
  const filenames = await fs.readdir(directoryPath);

  const entries = await Promise.all(
    filenames
      .filter((filename) => filename.endsWith('.json'))
      .map((filename) => readJsonFile<T>(path.join(directory, filename)))
  );

  return entries;
}

export const getSiteSettings = cache(async () => readJsonFile<SiteSettings>('settings/site.json'));

export const getHomePageContent = cache(async () => readJsonFile<HomePageContent>('pages/home.json'));

export const getProjects = cache(async () => {
  const entries = await readCollectionJson<ProjectEntry>('projects');
  return entries.sort((left, right) => left.order - right.order);
});

export const getTestimonials = cache(async () => {
  const entries = await readCollectionJson<TestimonialEntry>('testimonials');
  return entries.sort((left, right) => left.order - right.order);
});

export const getPosts = cache(async () => {
  const directoryPath = path.join(CONTENT_ROOT, 'posts');
  const filenames = await fs.readdir(directoryPath);

  const posts = await Promise.all(
    filenames
      .filter((filename) => filename.endsWith('.md'))
      .map(async (filename) => {
        const slug = filename.replace(/\.md$/, '');
        const filePath = path.join(directoryPath, filename);
        const source = await fs.readFile(filePath, 'utf8');
        const { data } = matter(source);

        return {
          slug,
          title: String(data.title ?? ''),
          excerpt: String(data.excerpt ?? ''),
          meta: String(data.meta ?? ''),
          coverImage: String(data.coverImage ?? ''),
          publishedAt: String(data.publishedAt ?? ''),
        } satisfies PostSummary;
      })
  );

  return posts.sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
});

export const getPostBySlug = cache(async (slug: string) => {
  const filePath = path.join(CONTENT_ROOT, 'posts', `${slug}.md`);
  const source = await fs.readFile(filePath, 'utf8');
  const { data, content } = matter(source);

  return {
    slug,
    title: String(data.title ?? ''),
    excerpt: String(data.excerpt ?? ''),
    meta: String(data.meta ?? ''),
    coverImage: String(data.coverImage ?? ''),
    publishedAt: String(data.publishedAt ?? ''),
    body: content,
  } satisfies PostDetail;
});
