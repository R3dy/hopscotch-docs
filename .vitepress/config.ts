import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Hopscotch Adventures',
  description: 'Technical documentation for the Hopscotch Adventures TTRPG platform — data model, engine, format, and architecture.',
  lang: 'en-US',
  appearance: 'dark',
  lastUpdated: true,
  cleanUrls: true,

  head: [
    ['link', { rel: 'icon', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#07070C' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:site_name', content: 'Hopscotch Adventures Docs' }],
    ['meta', { name: 'color-scheme', content: 'dark only' }],
  ],

  themeConfig: {
    logo: '/favicon.svg',
    siteTitle: 'Hopscotch Docs',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Data Model', link: '/data-model/adventure' },
      { text: 'Engine', link: '/engine/combat-engine' },
      { text: 'Format', link: '/format/parser' },
      { text: 'Architecture', link: '/architecture/overview' },
      { text: 'Mock Adventure', link: '/mock-adventure/overview' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          collapsed: false,
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Scene Runner', link: '/guide/scene-runner' },
            { text: 'Combat Runner', link: '/guide/combat-runner' },
          ],
        },
      ],
      '/data-model/': [
        {
          text: 'Data Model',
          collapsed: false,
          items: [
            { text: 'Adventure', link: '/data-model/adventure' },
            { text: 'Scene', link: '/data-model/scene' },
            { text: 'Beat', link: '/data-model/beat' },
            { text: 'Read Aloud Passage', link: '/data-model/read-aloud' },
            { text: 'NPC', link: '/data-model/npc' },
            { text: 'Roll Prompt', link: '/data-model/roll-prompt' },
            { text: 'Transition', link: '/data-model/transition' },
            { text: 'Secret', link: '/data-model/secret' },
            { text: 'Rule', link: '/data-model/rule' },
          ],
        },
        {
          text: 'Combat',
          collapsed: true,
          items: [
            { text: 'Combat (Scene)', link: '/data-model/combat' },
            { text: 'Combatant', link: '/data-model/combatant' },
            { text: 'Combat Action', link: '/data-model/combat-action' },
            { text: 'Round', link: '/data-model/round' },
            { text: 'End Condition', link: '/data-model/end-condition' },
            { text: 'Aftermath Rule', link: '/data-model/aftermath' },
            { text: 'Trigger Note', link: '/data-model/trigger-note' },
            { text: 'Battlefield', link: '/data-model/battlefield' },
          ],
        },
        {
          text: 'Runtime',
          collapsed: true,
          items: [
            { text: 'Asset References', link: '/data-model/asset-ref' },
            { text: 'Run State', link: '/data-model/run-state' },
            { text: 'Preferences', link: '/data-model/prefs' },
          ],
        },
      ],
      '/engine/': [
        {
          text: 'Engine',
          collapsed: false,
          items: [
            { text: 'Combat Engine', link: '/engine/combat-engine' },
            { text: 'Outcome Engine', link: '/engine/outcome-engine' },
          ],
        },
      ],
      '/format/': [
        {
          text: 'Format Pipeline',
          collapsed: false,
          items: [
            { text: 'Parser', link: '/format/parser' },
            { text: 'Validator', link: '/format/validator' },
          ],
        },
      ],
      '/architecture/': [
        {
          text: 'Architecture',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/architecture/overview' },
            { text: 'Data Flow', link: '/architecture/data-flow' },
            { text: 'Decisions', link: '/architecture/decisions' },
          ],
        },
      ],
      '/mock-adventure/': [
        {
          text: 'Moonlight Heist',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/mock-adventure/overview' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/R3dy/HopscotchAdventures' },
    ],

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Built with VitePress. Hopscotch Adventures is a TTRPG companion platform.',
    },

    outline: {
      level: [2, 3],
      label: 'On this page',
    },
  },
})
