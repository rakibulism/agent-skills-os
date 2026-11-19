// The OpenAPI 3.1 description of the public API, published at /openapi.json by
// scripts/agent-files.mjs. Keep it in step with skills-api.mjs and ask.mjs; the tests
// in tests/api.test.mjs check that every documented error code is real.

const SITE_URL = 'https://skills.rakibulism.space';

const error = (description, example) => ({
  description,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' }, example: { ...example, docs: `${SITE_URL}/docs/api` } } },
});

export const openapi = {
  openapi: '3.1.0',
  info: {
    title: 'Agent Skills OS API',
    version: '1.0.0',
    summary: 'Search an open library of AI agent skills and read any skill as Markdown.',
    description:
      'Agent Skills OS is an open library of agent skills: each skill is one SKILL.md file that the universal-agent-skills npm package loads into Claude, OpenAI, LangChain, CrewAI, AutoGen, Cursor or any AGENTS.md tool. ' +
      'Use this API to find a skill for a task (listSkills), fetch its full instructions (getSkill), or ask in plain language which skill fits (askSkills). ' +
      'No authentication is needed. Every error is JSON with error, code, hint and docs fields.',
    contact: { name: 'Agent Skills OS', url: `${SITE_URL}/contact`, email: '40rakib70@gmail.com' },
    license: { name: 'MIT', identifier: 'MIT' },
  },
  externalDocs: { description: 'API guide', url: `${SITE_URL}/docs/api` },
  servers: [{ url: SITE_URL, description: 'Production' }],
  // Public API: no authentication on any operation.
  security: [],
  tags: [
    { name: 'Skills', description: 'Read the skill library.' },
    { name: 'Ask', description: 'Plain-language questions answered from the library.' },
  ],
  paths: {
    '/api/skills': {
      get: {
        operationId: 'listSkills',
        tags: ['Skills'],
        summary: 'List or search skills',
        description:
          'Returns every skill sorted by name, or with q, the skills whose name, description, tags or text contain every word of the query, best match first. Use it to find the name to pass to getSkill.',
        parameters: [
          {
            name: 'q',
            in: 'query',
            required: false,
            description: 'Keywords describing the task, for example "accessibility review". At most 200 characters.',
            schema: { type: 'string', maxLength: 200 },
            example: 'accessibility',
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            description: 'Maximum number of skills to return, from 1 to 100. Defaults to 100.',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 100 },
          },
        ],
        responses: {
          200: {
            description: 'Matching skills.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SkillList' } } },
          },
          400: error('The query or limit is invalid.', { error: 'limit must be a whole number from 1 to 100.', code: 'invalid_limit', hint: 'Leave limit out to get up to 100 skills.' }),
          405: error('Only GET, HEAD and OPTIONS are allowed.', { error: 'POST is not supported here.', code: 'method_not_allowed', hint: 'Use GET.' }),
          503: error('The skills index could not be read.', { error: 'The skills index is unavailable.', code: 'index_unavailable', hint: 'Try again shortly.' }),
        },
      },
    },
    '/api/skills/{name}': {
      get: {
        operationId: 'getSkill',
        tags: ['Skills'],
        summary: 'Get one skill with its SKILL.md',
        description:
          'Returns a skill\'s metadata, its full SKILL.md (the instructions to give an agent), and ready-to-run usage snippets for the npm package and the CLI.',
        parameters: [
          {
            name: 'name',
            in: 'path',
            required: true,
            description: 'The skill name: lowercase letters, digits and hyphens, as returned by listSkills.',
            schema: { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{0,63}$' },
            example: 'super-ui',
          },
        ],
        responses: {
          200: {
            description: 'The skill.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SkillDetail' } } },
          },
          400: error('The name is not a valid skill name.', { error: '"Bad Name" is not a valid skill name.', code: 'invalid_name', hint: 'Skill names are lowercase letters, digits and hyphens, like super-ui. GET /api/skills lists them.' }),
          404: error('No skill has this name.', { error: 'There is no skill named "nope".', code: 'skill_not_found', hint: 'GET /api/skills?q=<keywords> to find the right name.' }),
          405: error('Only GET, HEAD and OPTIONS are allowed.', { error: 'POST is not supported here.', code: 'method_not_allowed', hint: 'Use GET.' }),
          503: error('The index or the skill file could not be read.', { error: 'The skills index is unavailable.', code: 'index_unavailable', hint: 'Try again shortly.' }),
        },
      },
    },
    '/api/ask': {
      post: {
        operationId: 'askSkills',
        tags: ['Ask'],
        summary: 'Ask which skill fits a task',
        description:
          'Answers a plain-language question about the library, grounded in the skills that search ranks highest. Returns a short answer plus cards that point at skills, install commands or usage snippets. Rate limited to about 12 questions a minute per client.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AskRequest' },
              example: { question: 'Which skill reviews accessibility?' },
            },
          },
        },
        responses: {
          200: {
            description: 'The answer.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AskResponse' } } },
          },
          400: error('The question is missing.', { error: 'Ask a question first.', code: 'missing_question', hint: 'Send a JSON body with a non-empty "question" string (300 characters at most).' }),
          405: error('Only POST is allowed.', { error: 'Use POST.', code: 'method_not_allowed', hint: 'Send POST /api/ask with a JSON body.' }),
          429: error('Too many questions, or the AI model is busy.', { error: 'Too many questions. Try again in a minute.', code: 'rate_limited', hint: 'Wait 60 seconds.' }),
          502: error('The AI model failed or returned nothing.', { error: 'The AI is unavailable right now.', code: 'ai_unavailable', hint: 'Try again shortly.' }),
          503: error('Ask AI is not configured or the index is unavailable.', { error: 'Ask AI is not set up yet.', code: 'not_configured', hint: 'Search with GET /api/skills?q=... instead.' }),
          504: error('The AI took too long.', { error: 'The AI took too long to answer.', code: 'ai_timeout', hint: 'Try again, or ask a shorter question.' }),
        },
      },
    },
  },
  components: {
    schemas: {
      Error: {
        type: 'object',
        description: 'Every error response has this shape.',
        required: ['error', 'code', 'hint', 'docs'],
        properties: {
          error: { type: 'string', description: 'What went wrong, in plain words.' },
          code: {
            type: 'string',
            description: 'A stable machine-readable error code.',
            enum: [
              'not_found', 'method_not_allowed', 'query_too_long', 'invalid_limit', 'invalid_name', 'skill_not_found',
              'skill_file_unavailable', 'index_unavailable', 'missing_question', 'rate_limited', 'not_configured',
              'ai_busy', 'ai_unavailable', 'ai_timeout', 'empty_answer',
            ],
          },
          hint: { type: 'string', description: 'How to fix the request or what to try next.' },
          docs: { type: 'string', format: 'uri', description: 'Where the API is documented.' },
        },
      },
      SkillSummary: {
        type: 'object',
        required: ['name', 'title', 'description', 'version', 'tags', 'url', 'markdownUrl', 'apiUrl'],
        properties: {
          name: { type: 'string', description: 'The skill name, used in URLs, the API and the npm package.', example: 'super-ui' },
          title: { type: 'string', description: 'Display name from the SKILL.md front matter.' },
          description: { type: 'string', description: 'When to use the skill and what it produces.' },
          version: { type: ['string', 'null'], description: 'Semantic version of the skill file.', example: '0.1.0' },
          tags: { type: 'array', items: { type: 'string' }, description: 'Lowercase topic tags.' },
          url: { type: 'string', format: 'uri', description: 'The skill\'s web page.' },
          markdownUrl: { type: 'string', format: 'uri', description: 'The raw SKILL.md.' },
          apiUrl: { type: 'string', format: 'uri', description: 'This skill in the API (getSkill).' },
        },
      },
      SkillList: {
        type: 'object',
        required: ['query', 'total', 'count', 'skills'],
        properties: {
          query: { type: ['string', 'null'], description: 'The q parameter, or null when listing everything.' },
          total: { type: 'integer', description: 'How many skills matched.' },
          count: { type: 'integer', description: 'How many are in this response (at most limit).' },
          skills: { type: 'array', items: { $ref: '#/components/schemas/SkillSummary' } },
        },
      },
      SkillDetail: {
        allOf: [
          { $ref: '#/components/schemas/SkillSummary' },
          {
            type: 'object',
            required: ['markdown', 'usage', 'sourceUrl'],
            properties: {
              markdown: { type: 'string', description: 'The full SKILL.md, front matter included.' },
              usage: {
                type: 'object',
                required: ['install', 'claude', 'cli'],
                properties: {
                  install: { type: 'string', description: 'Command that installs the npm package.' },
                  claude: { type: 'string', description: 'JavaScript that loads the skill for the Claude Agent SDK.' },
                  cli: { type: 'string', description: 'CLI command that prints the skill.' },
                },
              },
              sourceUrl: { type: 'string', format: 'uri', description: 'The skill folder on GitHub.' },
            },
          },
        ],
      },
      AskRequest: {
        type: 'object',
        required: ['question'],
        properties: {
          question: { type: 'string', minLength: 1, maxLength: 300, description: 'A plain-language question, for example "How do I use a skill with LangChain?"' },
        },
      },
      AskCard: {
        description: 'A pointer the answer refers to: a skill, an install command, or a usage snippet.',
        oneOf: [
          {
            type: 'object',
            required: ['type', 'slug'],
            properties: { type: { const: 'skill' }, slug: { type: 'string', description: 'A skill name.' } },
          },
          {
            type: 'object',
            required: ['type', 'manager'],
            properties: { type: { const: 'install' }, manager: { type: 'string', enum: ['npm', 'pnpm', 'yarn', 'bun'] } },
          },
          {
            type: 'object',
            required: ['type', 'framework', 'skill'],
            properties: {
              type: { const: 'usage' },
              framework: { type: 'string', enum: ['claude', 'openai', 'langchain', 'python', 'files'] },
              skill: { type: 'string', description: 'A skill name.' },
            },
          },
        ],
      },
      AskResponse: {
        type: 'object',
        required: ['answer', 'cards', 'followups'],
        properties: {
          answer: { type: 'string', description: 'A short answer in plain text.' },
          cards: { type: 'array', items: { $ref: '#/components/schemas/AskCard' } },
          followups: { type: 'array', items: { type: 'string' }, description: 'Suggested next questions.' },
        },
      },
    },
  },
};
