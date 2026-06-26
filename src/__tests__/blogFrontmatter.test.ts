/**
 * @jest-environment node
 */

import { getAllPosts, getPostBySlug } from '@/lib/blog';

describe('blog frontmatter parsing', () => {
  it('loads MDX frontmatter and content for all posts', () => {
    const posts = getAllPosts();

    expect(posts.length).toBeGreaterThan(0);
    expect(posts[0]).toEqual(
      expect.objectContaining({
        slug: expect.any(String),
        title: expect.any(String),
        description: expect.any(String),
        date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        author: expect.any(String),
        tags: expect.any(Array),
        readingTime: expect.any(String),
        content: expect.stringContaining('# '),
      }),
    );
  });

  it('loads a single post by slug', () => {
    const post = getPostBySlug('understanding-ndpa-2023');

    expect(post).toEqual(
      expect.objectContaining({
        slug: 'understanding-ndpa-2023',
        title: 'Understanding the Nigeria Data Protection Act (NDPA) 2023 — A Developer\'s Guide',
        tags: expect.arrayContaining(['ndpa', 'compliance', 'guide']),
      }),
    );
  });
});
