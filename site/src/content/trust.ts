import type { Doc } from '@/lib/doc';
import { SITE } from '@/lib/site';

const ADDRESS = `${SITE.address.street}, ${SITE.address.city}, ${SITE.address.country}`;

export const ABOUT: Doc = {
  path: '/about',
  metaTitle: 'About',
  description: 'Agent Skills OS is an open, MIT-licensed library of AI agent skills and the universal-agent-skills npm package that loads them into any agent runtime.',
  kicker: 'About',
  title: 'About Agent Skills OS',
  lede: 'Agent Skills OS is an open library of agent skills: reusable instructions, one Markdown file each, that teach an AI agent how to do a specific job well. One npm package loads any of them into Claude, OpenAI, LangChain, CrewAI, AutoGen, Cursor and every AGENTS.md tool.',
  sections: [
    {
      id: 'what',
      title: 'What it is',
      blocks: [
        { p: 'A skill is a `SKILL.md` file: front matter that says what the skill is for, followed by the instructions an agent should follow, such as a process, an output shape and what to avoid. Skills are plain text, so you can read every one before you use it, review changes to them in a pull request, and keep them under version control next to your code.' },
        { p: 'The [universal-agent-skills](https://www.npmjs.com/package/universal-agent-skills) package reads those files and returns exactly what each runtime expects: a system prompt for the Claude Agent SDK, an assistant config for OpenAI, a prompt template for LangChain, a rule file for Cursor or a section for AGENTS.md. Write a skill once and every agent you run can use it.' },
        { p: 'Everything is free and open source under the MIT license. The skills, the loader, this website and its API all live in one public repository on [GitHub](https://github.com/rakibulism/agent-skills-os).' },
      ],
    },
    {
      id: 'ways',
      title: 'Ways to use it',
      blocks: [
        {
          list: [
            '**Website:** search the library or ask a question in plain language on the [home page](/).',
            '**npm package:** `npm install universal-agent-skills`, then call one adapter function. See the [docs](/docs).',
            '**CLI:** `npx universal-agent-skills list` prints the library in a terminal or a script. See the [CLI guide](/docs/cli).',
            '**API:** `GET /api/skills` returns the library as JSON for agents and tools. See the [API reference](/docs/api) and [/openapi.json](/openapi.json).',
            '**Markdown:** every page is also available as Markdown, and [/llms.txt](/llms.txt) explains the site to language models.',
          ],
        },
      ],
    },
    {
      id: 'who',
      title: 'Who makes it',
      blocks: [
        { p: `Agent Skills OS is built and maintained by [${SITE.author}](${SITE.authorUrl}) in ${SITE.address.city}, ${SITE.address.country}. Skills come from the community: anyone can [contribute one](/contribute) with a single Markdown file and a pull request, and each skill credits its author.` },
        { p: 'The project has no ads, no paid tier and no tracking. If something is wrong, out of date or missing, [open an issue](https://github.com/rakibulism/agent-skills-os/issues) or [get in touch](/contact).' },
      ],
    },
  ],
};

export const CONTACT: Doc = {
  path: '/contact',
  metaTitle: 'Contact',
  description: `How to reach the Agent Skills OS maintainer: email ${SITE.email}, GitHub issues for bugs and skill requests, and the project's postal address.`,
  kicker: 'Contact',
  title: 'Contact Agent Skills OS',
  lede: 'Agent Skills OS is maintained in the open. The fastest way to get something fixed is a GitHub issue; for anything private, send an email.',
  sections: [
    {
      id: 'reach',
      title: 'How to reach us',
      blocks: [
        {
          table: {
            head: ['For', 'Where'],
            rows: [
              ['Bugs, broken skills, skill requests', '[GitHub issues](https://github.com/rakibulism/agent-skills-os/issues)'],
              ['Adding or improving a skill', '[A pull request](/contribute) on GitHub'],
              ['Private questions, partnerships, press', `[${SITE.email}](mailto:${SITE.email})`],
              ['Security problems', `Email [${SITE.email}](mailto:${SITE.email}) and don't open a public issue`],
              ['Privacy and data requests', `Email [${SITE.email}](mailto:${SITE.email}); see the [privacy policy](/privacy)`],
            ],
          },
        },
        { p: 'Please include the page or skill you mean and what you expected to happen. For a bug in the npm package or the CLI, add the version (`npx universal-agent-skills --version`) and your Node.js version.' },
      ],
    },
    {
      id: 'details',
      title: 'Contact details',
      blocks: [
        {
          list: [
            `**Email:** [${SITE.email}](mailto:${SITE.email})`,
            `**Maintainer:** [${SITE.author}](${SITE.authorUrl})`,
            `**Postal address:** ${ADDRESS}`,
            '**Source code:** [github.com/rakibulism/agent-skills-os](https://github.com/rakibulism/agent-skills-os)',
            '**npm package:** [universal-agent-skills](https://www.npmjs.com/package/universal-agent-skills)',
          ],
        },
        { p: 'This is an open-source project run by one maintainer, so replies can take a few days. Issues on GitHub are public and other contributors may answer them sooner.' },
      ],
    },
  ],
};

export const PRIVACY: Doc = {
  path: '/privacy',
  metaTitle: 'Privacy',
  description: 'What Agent Skills OS collects (very little), what Ask AI sends to its model provider, and how to contact us about your data.',
  kicker: 'Privacy',
  title: 'Privacy policy',
  lede: 'Agent Skills OS has no accounts, no advertising, no analytics and no cookies. This page explains the little data that does move when you use the site, the API and Ask AI.',
  note: 'Last updated 19 November 2026',
  sections: [
    {
      id: 'collect',
      title: 'What we collect',
      blocks: [
        { p: '**Nothing that identifies you, by design.** The site sets no cookies and uses no analytics, tracking pixels or third-party scripts. Fonts are served from this domain, so loading a page makes no request to Google or any other font service. Search runs in your browser against a list of skills the page downloads.' },
        { p: '**Server logs.** The site is hosted on [Vercel](https://vercel.com/legal/privacy-policy). Like any web host, Vercel records standard request logs (IP address, time, URL, browser user agent) to run and secure the service, and keeps them for a limited period under its own policy. We use them only to fix problems and stop abuse.' },
      ],
    },
    {
      id: 'ask-ai',
      title: 'Ask AI and the API',
      blocks: [
        { p: 'When you use **Ask AI** (or `POST /api/ask`), the text of your question is sent to our server function, which passes it, along with short descriptions of the most relevant skills, to [OpenRouter](https://openrouter.ai/privacy). OpenRouter routes it to an AI model provider to write the answer. We do not store your questions. OpenRouter and the model provider handle the request under their own privacy policies, so please do not put personal or confidential information in a question.' },
        { p: 'To limit abuse, the function counts requests per IP address in memory for one minute. The count is never written to disk and disappears when the function instance stops. The read-only endpoints, `GET /api/skills` and `GET /api/skills/{name}`, process only the query you send and keep nothing.' },
      ],
    },
    {
      id: 'rights',
      title: 'Your choices and rights',
      blocks: [
        { p: 'Because we keep no personal data of our own, there is usually nothing for us to delete or export. If you believe we hold information about you, or you want to ask about the logs our host keeps, email [40rakib70@gmail.com](mailto:40rakib70@gmail.com) and we will help within 30 days.' },
        { p: 'Contributing a skill on GitHub is public by nature: your GitHub username, commits and any author name you add to a `SKILL.md` become part of the repository history. Links to other sites, such as GitHub and npm, are governed by those sites\' policies.' },
        { p: 'If this policy changes, the date at the top of this page changes with it, and the full history is in the [public repository](https://github.com/rakibulism/agent-skills-os).' },
      ],
    },
  ],
};
