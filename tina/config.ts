import { defineConfig, LocalAuthProvider } from 'tinacms';
import { TinaUserCollection, UsernamePasswordAuthJSProvider } from 'tinacms-authjs/dist/tinacms';

const branch =
  process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || 'main';

const hasSelfHostedEnv = Boolean(
  process.env.NEXTAUTH_SECRET &&
    process.env.GITHUB_OWNER &&
    process.env.GITHUB_REPO &&
    process.env.GITHUB_PERSONAL_ACCESS_TOKEN &&
    process.env.KV_REST_API_URL &&
    process.env.KV_REST_API_TOKEN
);

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true' || !hasSelfHostedEnv;

export default defineConfig({
  contentApiUrlOverride: '/api/tina/gql',
  branch,
  authProvider: isLocal ? new LocalAuthProvider() : new UsernamePasswordAuthJSProvider(),
  build: {
    outputFolder: 'lucidadmindashboard',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: 'uploads',
      publicFolder: 'public',
    },
  },
  schema: {
    collections: [
      TinaUserCollection,
      {
        label: 'Site Settings',
        name: 'siteSettings',
        path: 'content/settings',
        format: 'json',
        ui: {
          global: true,
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        fields: [
          { type: 'string', name: 'siteName', label: 'Site name', required: true },
          { type: 'string', name: 'siteUrl', label: 'Site URL', required: true },
          { type: 'string', name: 'defaultTitle', label: 'Default title', required: true },
          { type: 'string', name: 'titleTemplate', label: 'Title template', required: true },
          { type: 'string', name: 'description', label: 'Description', ui: { component: 'textarea' }, required: true },
          { type: 'string', name: 'abstract', label: 'Abstract', ui: { component: 'textarea' }, required: true },
          {
            type: 'string',
            name: 'keywords',
            label: 'Keywords',
            list: true,
            required: true,
          },
          { type: 'string', name: 'creator', label: 'Creator', required: true },
          { type: 'string', name: 'publisher', label: 'Publisher', required: true },
          { type: 'string', name: 'category', label: 'Category', required: true },
          { type: 'string', name: 'themeColor', label: 'Theme color', required: true },
          { type: 'image', name: 'ogImage', label: 'Open Graph image', required: true },
          { type: 'string', name: 'twitterHandle', label: 'Twitter handle', required: true },
          {
            type: 'object',
            name: 'navItems',
            label: 'Navigation items',
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.label ?? 'Navigation item' }),
            },
            fields: [
              { type: 'string', name: 'label', label: 'Label', required: true },
              { type: 'string', name: 'href', label: 'Link', required: true },
            ],
          },
          {
            type: 'object',
            name: 'navCta',
            label: 'Navigation CTA',
            fields: [
              { type: 'string', name: 'label', label: 'Label', required: true },
              { type: 'string', name: 'href', label: 'Href', required: true },
            ],
          },
          { type: 'string', name: 'footerMarqueeText', label: 'Footer marquee text', required: true },
          {
            type: 'object',
            name: 'footerPrimaryCta',
            label: 'Footer primary CTA',
            fields: [
              { type: 'string', name: 'label', label: 'Label', required: true },
              { type: 'string', name: 'url', label: 'URL', required: true },
            ],
          },
          {
            type: 'object',
            name: 'socialLinks',
            label: 'Social links',
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.label ?? 'Social link' }),
            },
            fields: [
              { type: 'string', name: 'label', label: 'Label', required: true },
              { type: 'string', name: 'url', label: 'URL', required: true },
            ],
          },
          { type: 'string', name: 'footerCopyright', label: 'Footer copyright', required: true },
        ],
      },
      {
        label: 'Homepage',
        name: 'homePage',
        path: 'content/pages',
        format: 'json',
        ui: {
          global: true,
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        fields: [
          {
            type: 'object',
            name: 'hero',
            label: 'Hero',
            fields: [
              { type: 'string', name: 'mobileHeadline', label: 'Mobile headline', ui: { component: 'textarea' }, required: true },
              { type: 'string', name: 'curvedHeadline', label: 'Curved headline', required: true },
              { type: 'string', name: 'eyebrow', label: 'Eyebrow', required: true },
              { type: 'string', name: 'description', label: 'Description', ui: { component: 'textarea' }, required: true },
              { type: 'string', name: 'primaryCtaLabel', label: 'Primary CTA label', required: true },
              { type: 'string', name: 'primaryCtaUrl', label: 'Primary CTA URL', required: true },
            ],
          },
          {
            type: 'object',
            name: 'featureShowcase',
            label: 'Feature showcase',
            fields: [
              { type: 'string', name: 'headingPrefix', label: 'Heading prefix', required: true },
              { type: 'string', name: 'highlightWord', label: 'Highlight word', required: true },
              { type: 'string', name: 'description', label: 'Description', ui: { component: 'textarea' }, required: true },
              {
                type: 'object',
                name: 'slides',
                label: 'Slides',
                list: true,
                ui: {
                  itemProps: (item) => ({ label: item?.title ?? 'Slide' }),
                },
                fields: [
                  { type: 'image', name: 'image', label: 'Image', required: true },
                  { type: 'string', name: 'title', label: 'Title', required: true },
                ],
              },
            ],
          },
          {
            type: 'object',
            name: 'projectsSection',
            label: 'Projects section',
            fields: [{ type: 'string', name: 'eyebrow', label: 'Eyebrow', required: true }],
          },
          {
            type: 'object',
            name: 'servicesSection',
            label: 'Services section',
            fields: [
              { type: 'string', name: 'eyebrow', label: 'Eyebrow', required: true },
              {
                type: 'object',
                name: 'items',
                label: 'Services',
                list: true,
                ui: {
                  itemProps: (item) => ({ label: item?.title ?? 'Service' }),
                },
                fields: [
                  { type: 'string', name: 'title', label: 'Title', required: true },
                  { type: 'string', name: 'content', label: 'Content', ui: { component: 'textarea' }, required: true },
                ],
              },
            ],
          },
          {
            type: 'object',
            name: 'testimonialsSection',
            label: 'Testimonials section',
            fields: [{ type: 'string', name: 'curvedHeading', label: 'Curved heading', required: true }],
          },
          {
            type: 'object',
            name: 'blogSection',
            label: 'Blog section',
            fields: [
              { type: 'string', name: 'eyebrow', label: 'Eyebrow', required: true },
              { type: 'string', name: 'heading', label: 'Heading', required: true },
            ],
          },
        ],
      },
      {
        label: 'Projects',
        name: 'project',
        path: 'content/projects',
        format: 'json',
        fields: [
          { type: 'number', name: 'order', label: 'Order', required: true },
          { type: 'string', name: 'company', label: 'Company', required: true },
          { type: 'string', name: 'title', label: 'Title', isTitle: true, required: true },
          { type: 'string', name: 'date', label: 'Date', required: true },
          { type: 'image', name: 'image', label: 'Image', required: true },
          { type: 'image', name: 'video', label: 'Video', required: false },
          { type: 'string', name: 'href', label: 'Link', required: true },
        ],
      },
      {
        label: 'Testimonials',
        name: 'testimonial',
        path: 'content/testimonials',
        format: 'json',
        fields: [
          { type: 'number', name: 'order', label: 'Order', required: true },
          { type: 'string', name: 'author', label: 'Author', isTitle: true, required: true },
          { type: 'string', name: 'company', label: 'Company', required: true },
          { type: 'string', name: 'quote', label: 'Quote', ui: { component: 'textarea' }, required: true },
        ],
      },
      {
        label: 'Posts',
        name: 'post',
        path: 'content/posts',
        format: 'md',
        ui: {
          router: ({ document }) => `/journal/${document._sys.filename}`,
        },
        fields: [
          { type: 'string', name: 'title', label: 'Title', isTitle: true, required: true },
          { type: 'string', name: 'excerpt', label: 'Excerpt', ui: { component: 'textarea' }, required: true },
          { type: 'string', name: 'meta', label: 'Meta label', required: true },
          { type: 'image', name: 'coverImage', label: 'Cover image', required: true },
          { type: 'datetime', name: 'publishedAt', label: 'Published at', required: true },
          { type: 'string', name: 'link', label: 'Link' },
          { type: 'rich-text', name: 'body', label: 'Body', isBody: true, required: true },
        ],
      },
    ],
  },
});
