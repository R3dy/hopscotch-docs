---
layout: home

hero:
  name: Hopscotch Adventures
  text: TTRPG Platform Documentation
  tagline: Data model, combat engine, format pipeline, and architecture for the mobile-first GM companion.
  image:
    src: /favicon.svg
    alt: Hopscotch Adventures
  actions:
    - theme: brand
      text: Getting Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/R3dy/HopscotchAdventures

features:
  - icon: 📖
    title: Guide
    details: Learn to use the Scene Runner, Combat Runner, and read-aloud system. Walk through Prep and Table modes.
    link: /guide/getting-started
  - icon: 🗂️
    title: Data Model
    details: Complete type reference for every entity — Adventure, Scene, Beat, Combatant, EndCondition, and more.
    link: /data-model/adventure
  - icon: ⚙️
    title: Engine
    details: Pure TypeScript combat and outcome engines. Data-driven end conditions, action reducers, and the requires DSL.
    link: /engine/combat-engine
  - icon: 📦
    title: Format Pipeline
    details: How <code>.hopscotch</code> files become typed Adventures — parser, validator, and diagnostic system.
    link: /format/parser
  - icon: 🏗️
    title: Architecture
    details: Stack, module layout, key design decisions, data flow, and the north star — one Scene Runner, zero adventure-specific code.
    link: /architecture/overview
  - icon: 🌙
    title: Moonlight Heist
    details: The showcase adventure — a combat-bearing social heist demonstrating every major system in the platform.
    link: /mock-adventure/overview
---
