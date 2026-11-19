import type { IconName } from '@/components/Icon';
import type { Lang } from '@/lib/highlight';
import { TEMPLATE_FILE } from '@/lib/snippets';

/** The contribute page's steps and rules, shared by the page and its Markdown twin. */
export type Step = { icon: IconName; title: string; text: string; file: string; lang: Extract<Lang, 'sh' | 'md'>; code: string; what: string };

export const STEPS: Step[] = [
  {
    icon: 'fork',
    title: 'Fork and clone',
    text: 'Fork the repository on GitHub, then clone your fork and start a branch for your skill.',
    file: 'terminal', lang: 'sh', what: 'Commands',
    code: `git clone https://github.com/<you>/agent-skills-os.git
cd agent-skills-os
git checkout -b add-my-skill`,
  },
  {
    icon: 'file',
    title: 'Write the skill',
    text: "Create `skills/<name>/SKILL.md`. The folder name is the skill's name. Frontmatter first, then the instructions.",
    file: 'skills/my-skill/SKILL.md', lang: 'md', what: 'Template',
    code: TEMPLATE_FILE,
  },
  {
    icon: 'terminal',
    title: 'Check it loads',
    text: 'Load it through the package and look at what comes back. Optionally write the Cursor, AGENTS.md and Stitch versions too.',
    file: 'terminal', lang: 'sh', what: 'Commands',
    code: `node -e "import('./src/index.js').then(m => console.log(m.getSkill('my-skill')))"

# Optional: Cursor, AGENTS.md and Stitch exports
node scripts/export-skill.js my-skill`,
  },
  {
    icon: 'pullRequest',
    title: 'Open a pull request',
    text: 'Push your branch and open a pull request against `main`. Say what the skill is for and show one example of it working.',
    file: 'terminal', lang: 'sh', what: 'Commands',
    code: `git add skills/my-skill
git commit -m "Add my-skill"
git push -u origin add-my-skill
gh pr create --fill   # or open the PR on github.com`,
  },
];

export const ACCEPT = [
  'One clear job per skill, named for what it does.',
  'Your own writing. Add author and author_url only to a skill you wrote.',
  'No secrets, keys or private data in the skill or its references.',
  'Instructions a model can follow: a process, an output shape, and what to avoid.',
];

