# Contributing

Thanks for adding to the library. Every skill here is one Markdown file someone wrote and shared. Fixes to existing skills, the loader and the website are welcome too.

## Add a skill

1. **Fork and clone** the repository, then start a branch:

   ```bash
   git clone https://github.com/<you>/agent-skills-os.git
   cd agent-skills-os
   git checkout -b add-my-skill
   ```

2. **Write the skill** in `skills/<name>/SKILL.md`. The folder name is the skill's name.

   ```markdown
   ---
   name: my-skill
   description: When to use this skill and what it produces.
   version: 0.1.0
   tags: [domain, capability]
   inputs:
     - name: input_name
       description: What this input is.
       required: true
   related: [other-skill]   # optional
   author: your-name        # optional, only if you wrote it
   ---

   # my-skill

   The instructions the agent follows: the process,
   the output shape, and what to avoid.
   ```

   Longer supporting material can go in `skills/<name>/references/`, linked from the body.

3. **Check it loads**:

   ```bash
   node -e "import('./src/index.js').then(m => console.log(m.getSkill('my-skill')))"
   node scripts/export-skill.js my-skill   # optional: Cursor, AGENTS.md and Stitch exports
   ```

4. **Open a pull request** against `main`. Say what the skill is for and show one example of it working.

## What gets merged

- One clear job per skill, named for what it does.
- Your own writing. Add `author` and `author_url` only to a skill you wrote, and never change another skill's attribution.
- No secrets, keys or private data in the skill or its references.
- Instructions a model can follow: lead with when to use it, describe the process, specify the output shape, and name the failure modes.

## Work on the website

The site lives in `site/` (Next.js, React, StyleX). See [site/README.md](site/README.md).

```bash
npm run site:dev
```
