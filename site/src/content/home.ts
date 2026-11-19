import { SITE, TARGETS } from '@/lib/site';

/** The home page's explanatory copy, shared by the page and /index.md. */
export const HOW = {
  kicker: 'How it works',
  title: 'One Markdown file, every agent runtime.',
  note: 'Agent Skills OS is a library of reusable instructions for AI agents, plus the tools that load them.',
  steps: [
    {
      title: 'Find a skill',
      text: 'Search the catalog above by name or task, or ask a question in plain words with Ask AI. Agents can do the same through the [JSON API](/docs/api) (`GET /api/skills?q=`), the [command-line tool](/docs/cli) or [llms.txt](/llms.txt).',
    },
    {
      title: 'Load it into any agent',
      text: 'Install `universal-agent-skills` from npm and make one call. `forClaude(name)` returns a system prompt for the Claude Agent SDK, `forOpenAI(name)` an assistant config, `forLangChain(name)` a prompt template. CrewAI and AutoGen read the same files from Python; Cursor and AGENTS.md tools get rule files.',
    },
    {
      title: 'Keep every agent in sync',
      text: 'Each skill is a plain `SKILL.md` in a public repository, versioned and reviewed in pull requests. Update the package and every agent gets the new version, with nothing to copy between tools and nothing to drift apart.',
    },
  ],
  whenTitle: 'When to use it',
  when: [
    'You run more than one agent framework and want the same instructions in all of them.',
    'A coding agent should pull in a skill on demand, as a Cursor rule or an AGENTS.md section.',
    'You want reviewed, versioned prompts instead of text pasted between tools.',
    'An AI agent needs a ready-made skill for a task and can call an API or a CLI to get it.',
  ],
} as const;

export const KEYWORDS = [
  'agent skills',
  'AI agent skills library',
  'SKILL.md',
  'universal-agent-skills npm package',
  'Claude Agent SDK skills',
  'LangChain prompt templates',
  'Cursor rules',
  'AGENTS.md',
] as const;

/** Structured data for the home page: who publishes the site and what the product is. */
export function homeJsonLd() {
  const org = `${SITE.url}/#organization`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': org,
        name: SITE.name,
        url: `${SITE.url}/`,
        logo: `${SITE.url}/apple-touch-icon.png`,
        description: SITE.description,
        email: SITE.email,
        founder: { '@type': 'Person', name: SITE.author, url: SITE.authorUrl },
        address: {
          '@type': 'PostalAddress',
          streetAddress: SITE.address.street,
          addressLocality: SITE.address.city,
          addressCountry: SITE.address.countryCode,
        },
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: SITE.email,
          url: `${SITE.url}/contact`,
          availableLanguage: ['English'],
        },
        sameAs: [SITE.repo, SITE.npm, SITE.authorUrl],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE.url}/#website`,
        name: SITE.name,
        url: `${SITE.url}/`,
        description: SITE.description,
        inLanguage: 'en',
        publisher: { '@id': org },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE.url}/?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${SITE.url}/#software`,
        name: SITE.name,
        alternateName: SITE.pkg,
        description: SITE.description,
        url: `${SITE.url}/`,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any (Node.js 18 or newer)',
        softwareRequirements: 'Node.js 18 or newer',
        downloadUrl: SITE.npm,
        installUrl: SITE.npm,
        codeRepository: SITE.repo,
        license: 'https://opensource.org/licenses/MIT',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        keywords: KEYWORDS.join(', '),
        featureList: [
          'Searchable library of agent skills, one Markdown file each',
          `Adapters for ${TARGETS.join(', ')}`,
          'Public JSON API with an OpenAPI 3.1 description',
          'agent-skills command-line tool',
        ],
        author: { '@type': 'Person', name: SITE.author, url: SITE.authorUrl },
        publisher: { '@id': org },
      },
    ],
  };
}
