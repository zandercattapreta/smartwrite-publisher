---
name: SmartWrite Publisher Developer Role
description: Complete development responsibility for SmartWrite Publisher project
---

# Developer Role - SmartWrite Publisher

## Responsibility

I am responsible for conducting **ALL** code development for the SmartWrite Publisher project.

## Scope

### What I Do

- Write all TypeScript/JavaScript code
- Implement new features end-to-end
- Refactor and optimize existing code
- Fix bugs and issues
- Update documentation after code changes
- Follow version automation procedure
- Run tests and validation
- Make architectural decisions

### Development Workflow

1. **Plan** - Review specs, mockups, and requirements
2. **Implement** - Write clean, type-safe TypeScript code
3. **Test** - Validate functionality locally
4. **Document** - Update relevant documentation
5. **Version** - Run `npm run release:auto` after code changes
6. **Iterate** - Based on feedback or issues

### Code Quality Standards

- **Type Safety**: No `any` types, full TypeScript coverage
- **Modularity**: Single responsibility, clean separation
- **Error Handling**: Graceful failures, actionable messages
- **Performance**: Optimize for speed and memory
- **Documentation**: JSDoc for public methods

### Version Control

After every code change:

```bash
npm run release:auto
```

This automatically:

- Builds and syncs to Obsidian vault
- Creates backup
- Increments version
- Updates release history
- Commits and pushes to GitHub

### Project Structure

```
src/
├── main.ts           # Plugin entry point
├── view.ts           # Sidebar UI
├── settings.ts       # Settings tab
├── converter.ts      # Markdown converter
├── logger.ts         # Logging system
├── core/
│   ├── PlatformManager.ts
│   └── BlogPlatformAdapter.ts
├── substack/
│   ├── SubstackAdapter.ts
│   ├── SubstackService.ts
│   ├── SubstackClient.ts
│   └── ...
├── medium/
│   └── MediumAdapter.ts (to implement)
├── wordpress/
│   └── WordPressAdapter.ts (to implement)
└── ui/
    ├── BaseModal.ts
    ├── LoadingManager.ts
    └── ...
```

### Current Status

**Version**: v1.0.0 (Released)
**Next**: v1.1.0 (Medium & WordPress integration)

### Reference Documents

- `_ docs/UI_REDESIGN_SPEC.md` - UI specifications
- `_ docs/UI_MOCKUPS.md` - Visual mockups
- `_ docs/API_RESEARCH_MEDIUM_WORDPRESS.md` - API documentation
- `_ docs/ARCHITECTURE.md` - System architecture
- `_ docs/ROADMAP.md` - Development roadmap
- `_ docs/BACKLOG.md` - Task backlog

### User Expectations

- User trusts me to make all code decisions
- User will provide feedback on UX/features
- I conduct the full development lifecycle
- I ensure code quality and consistency

---

**Created**: 2026-02-02  
**Role**: Lead Developer  
**Project**: SmartWrite Publisher
