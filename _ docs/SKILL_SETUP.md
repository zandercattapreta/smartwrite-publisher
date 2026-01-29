# Obsidian Plugin Skill - Setup & Usage

**Status**: ✅ Installed

---

## What Was Added

The professional-grade Obsidian plugin development skill has been installed to your project:

```
.claude/
├── skills/obsidian/
│   ├── SKILL.md                          # Main overview (312 lines)
│   └── reference/                        # 8 detailed reference files
│       ├── accessibility.md              # MANDATORY A11y guidelines
│       ├── code-quality.md
│       ├── css-styling.md
│       ├── file-operations.md
│       ├── memory-management.md
│       ├── submission.md                 # Obsidian submission requirements
│       ├── type-safety.md
│       └── ui-ux.md
└── commands/
    ├── obsidian.md                       # Slash command to load skill
    └── create-plugin.md                  # Plugin generator command
```

---

## How to Use

### Automatic (Preferred)

The skill loads automatically when working with Obsidian plugin files. Just ask Claude naturally:

```
Help me fix this memory leak in my plugin
```

Claude will automatically apply the Obsidian guidelines.

### Manual Slash Command

Explicitly load the skill using:

```
/obsidian
```

Or invoke the plugin generator:

```
/create-plugin
```

---

## Quick Reference: 27 Critical Rules

The skill enforces these rules (organized by category):

### Submission & Naming (5 rules)
- Plugin ID: no "obsidian", can't end with "plugin"
- Plugin name: no "Obsidian", can't end with "Plugin"
- Description: no "Obsidian" or "This plugin"
- Description must end with `.?!)` punctuation

### Memory & Lifecycle (2 rules)
- Use `registerEvent()` for automatic cleanup
- Don't store view references in plugin

### Type Safety (1 rule)
- Use `instanceof` instead of type casting

### UI/UX (5 rules)
- Use sentence case for all UI text ("Advanced settings" not "Advanced Settings")
- No "command" in command names/IDs
- No plugin ID in command IDs
- No default hotkeys
- Use `.setHeading()` for settings headings

### API Best Practices (6 rules)
- Use Editor API for active file edits
- Use `Vault.process()` for background file mods
- Use `normalizePath()` for user paths
- Use `Platform` API for OS detection
- Use `requestUrl()` instead of `fetch()`
- No console.log in onload/onunload

### Styling (2 rules)
- Use Obsidian CSS variables
- Scope CSS to plugin containers

### Accessibility (3 rules) - **MANDATORY**
- Keyboard accessible for all interactive elements
- ARIA labels for icon buttons
- Clear focus indicators (`:focus-visible`)

### Security & Compatibility (2 rules)
- Don't use `innerHTML`/`outerHTML`
- Avoid regex lookbehind (iOS compatibility)

### Code Quality (1 rule)
- Remove all sample/template code

---

## SmartWrite Publisher Status Check

### ✅ Current Strengths
- v0.1.8 is solid foundation
- Sidebar UI implemented
- Settings persistence working
- Active note detection functional
- Logging service in place

### 🔍 Areas to Review

Based on the skill guidelines, consider auditing:

1. **Memory Management** (`src/main.ts`)
   - Check `registerEvent()` usage
   - Verify no view references stored

2. **Type Safety** (`src/view.ts`)
   - Ensure `instanceof` used for type checking
   - Check for unsafe type casts

3. **UI/UX** (`src/settings.ts`)
   - Verify all UI text is sentence case
   - Check command naming conventions

4. **Accessibility** (all UI components)
   - ARIA labels on interactive elements
   - Focus indicators on buttons
   - Keyboard navigation support

5. **Styling** (`styles.css`)
   - Use Obsidian CSS variables
   - Scope to plugin containers

6. **Production Code** (`src/main.ts`)
   - Remove console.log from onload/onunload
   - Clean up debug code

---

## Next Steps

### Immediate
1. Read `.claude/skills/obsidian/SKILL.md` for overview
2. Review reference files relevant to your current phase

### For Phase 2 (v0.2.x)
- `reference/file-operations.md` - For metadata parser and file handling
- `reference/code-quality.md` - For Substack API integration
- `reference/submission.md` - For submission readiness

### Before Submission to Obsidian
- Use the submission checklist in `reference/submission.md`
- Run ESLint with `eslint-plugin-obsidianmd`
- Verify against all 27 rules

---

## Accessing the Skill

All skill documentation is available in your project:

```
.claude/skills/obsidian/SKILL.md           # Start here (312 lines)
.claude/skills/obsidian/reference/         # Detailed topics
```

You can also ask Claude:
```
/obsidian
```

---

## Integration with Development Workflow

The skill is now part of your project. When developing:

1. **Working on a feature?** → Ask Claude with context
2. **Refactoring code?** → Ask Claude to review against guidelines
3. **Creating new components?** → Ask Claude to follow best practices
4. **Approaching submission?** → Use the submission checklist

---

## Resources

- **Main Skill**: `.claude/skills/obsidian/SKILL.md`
- **Accessibility (Mandatory)**: `.claude/skills/obsidian/reference/accessibility.md`
- **Submission Guide**: `.claude/skills/obsidian/reference/submission.md`
- **Official Obsidian Docs**: https://docs.obsidian.md
- **Plugin Guidelines**: https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines

---

_The Obsidian Plugin Skill is now integrated into SmartWrite Publisher. Use it to guide development, improve code quality, and prepare for community plugin submission._
