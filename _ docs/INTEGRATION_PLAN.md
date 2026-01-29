# SmartWrite Publisher x Obsidian Plugin Skill - Integration Plan

**Date**: January 29, 2026
**Project**: SmartWrite Publisher
**Status**: Setup Phase - Analysis

---

## Executive Summary

The `obsidian-plugin-skill` repository is a comprehensive Claude skill that provides **professional-grade guidelines** for Obsidian plugin development. Incorporating this skill into SmartWrite Publisher will:

1. **Elevate Code Quality** - 27 critical ESLint rules + best practices
2. **Ensure Submission Readiness** - Official Obsidian submission requirements
3. **Improve Accessibility** - MANDATORY keyboard navigation and ARIA labels
4. **Streamline Development** - Slash commands and plugin generation tools
5. **Future-Proof Architecture** - Memory management and lifecycle patterns

---

## What is obsidian-plugin-skill?

### Overview

A production-ready **Claude AI skill** that encodes:
- All 27 ESLint rules from `eslint-plugin-obsidianmd`
- Official Obsidian Plugin Guidelines
- Submission requirements for the community plugins directory
- Memory management and lifecycle best practices
- Security guidelines and XSS prevention
- Platform compatibility (including iOS considerations)
- Accessibility (A11y) mandatory requirements
- Network request best practices (requestUrl vs fetch)

### Structure

```
obsidian-plugin-skill/
├── .claude/
│   ├── skills/obsidian/
│   │   ├── SKILL.md                    # Main overview (312 lines)
│   │   └── reference/                  # Detailed documentation
│   │       ├── memory-management.md
│   │       ├── type-safety.md
│   │       ├── ui-ux.md
│   │       ├── file-operations.md
│   │       ├── css-styling.md
│   │       ├── accessibility.md        # MANDATORY
│   │       ├── code-quality.md
│   │       └── submission.md
│   └── commands/
│       ├── obsidian.md                 # Slash command
│       └── create-plugin.md            # Plugin generator command
├── tools/
│   └── create-plugin.js                # Interactive boilerplate generator
├── install-skill.sh                    # Installation script
└── README.md                           # Comprehensive documentation
```

---

## Current State of SmartWrite Publisher

### ✅ What's Working

- **Core Functionality**: Sidebar UI, settings persistence, note detection
- **Git Integration**: Already connected to GitHub
- **Reasonable Structure**: Has src/, manifest.json, package.json
- **Recent Development**: v0.1.8 with logging service and performance optimization

### ⚠️ Areas for Improvement

1. **Code Structure**
   - Some opportunity for better type safety
   - Memory leak prevention could be more explicit

2. **Accessibility**
   - No explicit focus management mentioned
   - ARIA labels may not be comprehensive

3. **Documentation**
   - Limited developer guidelines in the project
   - No submission checklist

4. **Best Practices**
   - Some console.log usage in onload (should be removed for production)
   - UI text case consistency not explicitly enforced

5. **Styling**
   - Opportunity to ensure all CSS uses Obsidian variables

---

## Integration Opportunities

### Level 1: Install the Skill (Immediate)

**What**: Copy the `.claude` directory from obsidian-plugin-skill to SmartWrite Publisher

**Benefits**:
- Provides comprehensive guidelines for ongoing development
- Claude will automatically apply best practices
- Enables slash commands for guidance

**Effort**: ~5 minutes

```bash
# Copy the skill
cp -r obsidian-plugin-skill/.claude smartwrite-publisher/

# Or run the installer
cd smartwrite-publisher
../obsidian-plugin-skill/install-skill.sh
```

### Level 2: Audit & Refactor Code (Medium)

**What**: Review existing code against the 27 critical rules and reference files

**Target Areas**:
- `src/main.ts` - Memory leaks, lifecycle patterns
- `src/view.ts` - Type safety, DOM operations
- `src/settings.ts` - Settings UI consistency
- `styles.css` - CSS variable usage
- Accessibility compliance

**Effort**: 2-3 hours

**Expected Improvements**:
- Better type safety (instanceof vs casting)
- Cleaner settings UI (sentence case)
- Proper ARIA labels
- Memory leak prevention
- CSS variable compliance

### Level 3: Add Missing Documentation (Medium)

**What**: Create submission-ready documentation

**New Files**:
- `CONTRIBUTING.md` - Contribution guidelines
- `SUBMISSION_CHECKLIST.md` - Pre-release verification
- `DEVELOPMENT.md` - Local development setup
- `ARCHITECTURE.md` - Plugin architecture overview

**Effort**: 1-2 hours

### Level 4: Enhance Testing & CI/CD (Advanced)

**What**: Add ESLint rules and automated checks

**Actions**:
- Install `eslint-plugin-obsidianmd`
- Configure `eslint.config.mts` with rules
- Add pre-commit hooks
- Update GitHub Actions workflow

**Effort**: 1-2 hours

---

## Phase 2 Features & Skill Integration

Looking at your roadmap (v0.2.x), the skill will help with:

### Metadata Parser
- Type-safe frontmatter handling
- Following Obsidian's metadata patterns
- Safe file operations using `Vault.process()`

### Markdown to HTML Converter
- XSS prevention (avoid innerHTML)
- Proper DOM manipulation patterns
- Accessibility for generated content

### Substack Publishing API
- Using `requestUrl()` instead of `fetch()`
- CORS-compliant network requests
- Error handling best practices

### Hashtag Generator
- String handling best practices
- User input validation
- Settings storage patterns

---

## Top 27 Critical Rules - Quick Reference

The skill emphasizes these rules (many enforced by Obsidian's submission bot):

**Naming & Submission (5 rules)**
1. Plugin ID: no "obsidian", can't end with "plugin"
2. Plugin name: no "Obsidian", can't end with "Plugin"
3. Plugin name: can't start with "Obsi" or end with "dian"
4. Description: no "Obsidian" or "This plugin"
5. Description must end with `.?!)` punctuation

**Memory & Lifecycle (2 rules)**
6. Use `registerEvent()` for automatic cleanup
7. Don't store view references in plugin

**Type Safety (1 rule)**
8. Use `instanceof` instead of type casting

**UI/UX (5 rules)**
9. Use sentence case for all UI text
10. No "command" in command names/IDs
11. No plugin ID in command IDs
12. No default hotkeys
13. Use `.setHeading()` for settings headings

**API Best Practices (6 rules)**
14. Use Editor API for active file edits
15. Use `Vault.process()` for background mods
16. Use `normalizePath()` for user paths
17. Use `Platform` API for OS detection
18. Use `requestUrl()` instead of `fetch()`
19. No console.log in onload/onunload

**Styling (2 rules)**
20. Use Obsidian CSS variables
21. Scope CSS to plugin containers

**Accessibility (3 rules) - MANDATORY**
22. Keyboard accessible for all interactive elements
23. ARIA labels for icon buttons
24. Clear focus indicators (`:focus-visible`)

**Security & Compatibility (2 rules)**
25. Don't use `innerHTML`/`outerHTML`
26. Avoid regex lookbehind

**Code Quality (1 rule)**
27. Remove all sample/template code

---

## Recommended Incorporation Strategy

### Phase 1: Foundation (This Week)
1. **Install the skill** to SmartWrite Publisher
2. **Review** SmartWrite Publisher code against top 10 rules
3. **Document findings** in AUDIT.md

### Phase 2: Quick Wins (Next Week)
1. **Audit code** for obvious issues
2. **Fix low-hanging fruit**:
   - UI text to sentence case
   - Remove console.log from onload
   - Add missing ARIA labels
   - Ensure CSS variable usage

### Phase 3: Deep Refactor (Following Week)
1. **Memory management review**
2. **Type safety improvements**
3. **Settings UI enhancements**
4. **Accessibility audit**

### Phase 4: Submission Prep (Month 2)
1. **Create submission checklist**
2. **Final testing & validation**
3. **Prepare for Obsidian community plugins

---

## File Structure After Integration

```
smartwrite-publisher/
├── .claude/                            # NEW - Added from skill
│   ├── skills/obsidian/
│   │   ├── SKILL.md
│   │   └── reference/
│   └── commands/
│       └── obsidian.md
├── src/
│   ├── main.ts
│   ├── view.ts
│   ├── settings.ts
│   ├── logger.ts
│   └── modal.ts
├── styles.css
├── manifest.json
├── package.json
├── tsconfig.json
├── esbuild.config.mjs
└── _ docs/                             # Your docs
    ├── FEATURES.md
    ├── INTEGRATION_PLAN.md             # NEW - This file
    ├── AUDIT.md                        # NEW - After audit
    ├── SUBMISSION_CHECKLIST.md         # NEW - Before release
    └── ...
```

---

## Action Items for Zander

### Immediate (Today)
- [ ] Review this integration plan
- [ ] Confirm you want to proceed with Level 1 (skill installation)

### Short Term (This Week)
- [ ] Run the skill installer or manually copy `.claude/`
- [ ] Verify you can run `claude` commands with the skill loaded
- [ ] Schedule code audit session

### Medium Term (Ongoing)
- [ ] Address audit findings
- [ ] Refactor code per skill guidelines
- [ ] Create submission-ready documentation

---

## Resources

- **Obsidian API**: https://docs.obsidian.md
- **ESLint Plugin**: https://github.com/obsidianmd/eslint-plugin-obsidianmd
- **Plugin Guidelines**: https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines
- **Submission Repo**: https://github.com/obsidianmd/obsidian-releases
- **Skill Repository**: https://github.com/gapmiss/obsidian-plugin-skill

---

## Questions for Clarification

1. Do you want to start with just installing the skill, or audit the code immediately?
2. Is v0.2.x feature development imminent, or can we refactor first?
3. Do you plan to submit to Obsidian community plugins eventually?
4. Any specific areas of concern in the current codebase?

---

_This plan balances immediate usability with long-term quality and submission readiness._
