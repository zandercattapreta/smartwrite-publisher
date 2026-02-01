# Contributing to SmartWrite Publisher

Thank you for your interest in contributing to SmartWrite Publisher! This guide will help you get started.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How Can I Contribute?](#how-can-i-contribute)
3. [Development Setup](#development-setup)
4. [Project Structure](#project-structure)
5. [Coding Standards](#coding-standards)
6. [Adding a New Platform](#adding-a-new-platform)
7. [Testing Guidelines](#testing-guidelines)
8. [Submitting Changes](#submitting-changes)
9. [Documentation](#documentation)
10. [Release Process](#release-process)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all.

### Our Standards

**Positive behavior includes**:

- Being respectful and inclusive
- Accepting constructive criticism gracefully
- Focusing on what's best for the community
- Showing empathy toward others

**Unacceptable behavior includes**:

- Harassment or discriminatory language
- Trolling or insulting comments
- Publishing others' private information
- Other unprofessional conduct

### Enforcement

Instances of abusive behavior may be reported to the project maintainers. All complaints will be reviewed and investigated promptly and fairly.

---

## How Can I Contribute?

### Reporting Bugs

**Before creating a bug report**:

1. Check the [FAQ](./FAQ.md) and [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Search [existing issues](https://github.com/zandercpzed/smartwrite-publisher/issues)
3. Update to the latest version

**When creating a bug report, include**:

- Plugin version (check `manifest.json`)
- Obsidian version
- Operating system (Windows/Mac/Linux + version)
- Steps to reproduce
- Expected behavior
- Actual behavior
- System logs (copy from sidebar)
- Screenshots if applicable

**Use this template**:

```markdown
**Plugin Version**: 0.3.11
**Obsidian Version**: 1.4.5
**OS**: Windows 11

**Steps to Reproduce**:

1. Open plugin sidebar
2. Click "Publish all as drafts"
3. Select folder "Posts"

**Expected**: Files should be listed
**Actual**: No files shown

**Logs**:
```

[paste logs here]

```

**Screenshots**: [if applicable]
```

### Suggesting Features

**Before suggesting a feature**:

1. Check the [Roadmap](../README.md#roadmap)
2. Search existing feature requests
3. Consider if it aligns with project goals

**When suggesting a feature, describe**:

- Problem it solves
- Proposed solution
- Alternative solutions considered
- Who would benefit
- Example use cases

### Improving Documentation

Documentation contributions are highly valued!

**Areas that need help**:

- Fixing typos or unclear explanations
- Adding examples
- Improving organization
- Translating to other languages
- Creating video tutorials

**Documentation files**:

- `docs/USER_GUIDE.md` - User documentation
- `docs/FAQ.md` - Frequently asked questions
- `docs/TROUBLESHOOTING.md` - Problem solutions
- `docs/API_DOCUMENTATION.md` - Developer docs
- `docs/CONTRIBUTING.md` - This file
- `README.md` - Project overview

---

## Development Setup

### Prerequisites

**Required**:

- Node.js 16+ and npm
- Git
- Obsidian (for testing)
- Code editor (VS Code recommended)

**Optional**:

- TypeScript knowledge
- Obsidian Plugin API experience

### Initial Setup

1. **Fork the Repository**:

    ```bash
    # On GitHub, click "Fork" button
    # Clone your fork
    git clone https://github.com/YOUR-USERNAME/smartwrite-publisher.git
    cd smartwrite-publisher
    ```

2. **Install Dependencies**:

    ```bash
    npm install
    ```

3. **Set Up Test Vault**:

    ```bash
    # Create or use existing Obsidian vault
    # Note the path, you'll need it for testing
    ```

4. **Configure Build**:

    ```javascript
    // Edit esbuild.config.mjs
    const OBSIDIAN_PLUGIN_PATH =
        '/path/to/your/vault/.obsidian/plugins/smartwrite-publisher'
    ```

5. **Build**:

    ```bash
    npm run build
    ```

6. **Enable in Obsidian**:
    - Open Obsidian
    - Settings → Community Plugins
    - Enable "SmartWrite Publisher"

### Development Workflow

```bash
# Create feature branch
git checkout -b feature/my-new-feature

# Make changes
# Edit files...

# Build and test
npm run build

# Test in Obsidian
# Reload plugin with Ctrl+R (in dev mode)

# Commit
git add .
git commit -m "Add: My new feature"

# Push
git push origin feature/my-new-feature

# Create PR on GitHub
```

---

## Project Structure

```
smartwrite-publisher/
├── src/
│   ├── main.ts                    # Plugin entry point
│   ├── view.ts                    # Sidebar UI
│   ├── settings.ts                # Settings tab
│   ├── converter.ts               # Markdown → HTML
│   ├── types.ts                   # TypeScript interfaces
│   ├── substack/
│   │   ├── SubstackService.ts     # Main service
│   │   ├── SubstackClient.ts      # HTTP wrapper
│   │   ├── SubstackPayloadBuilder.ts  # Payload factory
│   │   ├── SubstackErrorHandler.ts    # Error handling
│   │   └── SubstackIdStrategy.ts      # ID discovery
│   └── adapters/ (v0.4.0)
│       ├── SubstackAdapter.ts
│       ├── MediumAdapter.ts
│       └── WordPressAdapter.ts
├── docs/
│   ├── USER_GUIDE.md
│   ├── FAQ.md
│   ├── TROUBLESHOOTING.md
│   ├── API_DOCUMENTATION.md
│   └── CONTRIBUTING.md
├── styles.css                     # Plugin styles
├── manifest.json                  # Plugin metadata
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── esbuild.config.mjs             # Build config
├── README.md                      # Project overview
├── CHANGELOG.md                   # Version history
└── LICENSE                        # MIT license
```

---

## Coding Standards

### TypeScript Style

**General Rules**:

- Use TypeScript, not JavaScript
- Strict type checking enabled
- No `any` types (use `unknown` or specific types)
- Prefer `const` over `let`
- No `var`

**Example**:

```typescript
// Good ✅
const result: PublishResult = await service.publishPost(post)
if (result.success) {
    console.log(`Success: ${result.postUrl}`)
}

// Bad ❌
var result: any = await service.publishPost(post)
if (result.success) {
    console.log('Success: ' + result.postUrl)
}
```

### Naming Conventions

**Classes**: PascalCase

```typescript
class SubstackService {}
class MarkdownConverter {}
```

**Interfaces**: PascalCase, prefix with `I` if ambiguous

```typescript
interface PublishResult {}
interface IAdapter {} // if "Adapter" class also exists
```

**Methods/Functions**: camelCase

```typescript
async publishPost(post: PublishRequest): Promise<PublishResult>
convertMarkdown(text: string): string
```

**Constants**: UPPER_SNAKE_CASE

```typescript
const DEFAULT_SETTINGS = {}
const MAX_RETRIES = 3
```

**Private Members**: prefix with `_` or use `private` keyword

```typescript
class Example {
    private _cookie: string // or
    private cookie: string
}
```

### Code Organization

**File Structure**:

```typescript
// 1. Imports
import { Plugin } from 'obsidian'
import { SubstackService } from './substack/SubstackService'

// 2. Constants
const DEFAULT_VALUE = 123

// 3. Interfaces/Types
interface MyInterface {}

// 4. Classes
export class MyClass {
    // Public properties
    public name: string

    // Private properties
    private _service: SubstackService

    // Constructor
    constructor() {}

    // Public methods
    public async doSomething(): Promise<void> {}

    // Private methods
    private helper(): void {}
}
```

### Comments and Documentation

**JSDoc for Public APIs**:

```typescript
/**
 * Publishes a post to Substack
 * @param post - The post to publish
 * @param options - Publishing options
 * @returns Promise resolving to publish result
 * @throws Error if authentication fails
 */
async publishPost(
    post: PublishRequest,
    options: PublishOptions
): Promise<PublishResult> {
    // Implementation...
}
```

**Inline Comments**:

```typescript
// Use for complex logic
const normalized = cookie.replace(/^substack\.sid=/, '') // Remove prefix

// Avoid obvious comments
const x = 5 // Set x to 5 ❌ (obvious)
```

### Error Handling

**Always handle errors**:

```typescript
// Good ✅
try {
    const result = await riskyOperation()
    return result
} catch (error) {
    console.error('Operation failed:', error)
    throw new Error(`Failed: ${error.message}`)
}

// Bad ❌
const result = await riskyOperation() // Unhandled rejection
```

**Specific error types**:

```typescript
if (!post.title) {
    throw new Error('Post title is required')
}

if (response.status === 401) {
    throw new AuthenticationError('Invalid credentials')
}
```

### Async/Await

**Prefer async/await over promises**:

```typescript
// Good ✅
async function publish() {
    const result = await service.publishPost(post)
    return result
}

// Acceptable for simple chains
service.publishPost(post).then((result) => console.log(result))

// Bad ❌
service.publishPost(post).then((result) => {
    doSomething(result).then((x) => {
        doSomethingElse(x).then((y) => {
            // Callback hell
        })
    })
})
```

---

## Adding a New Platform

### Step 1: Create Adapter File

```typescript
// src/adapters/MediumAdapter.ts
import { BlogPlatformAdapter } from '../core/BlogPlatformAdapter'
import { UniversalPost, PublishResult } from '../types'

export class MediumAdapter implements BlogPlatformAdapter {
    name = 'medium'
    displayName = 'Medium'
    icon = '📝'

    async authenticate(credentials: any): Promise<boolean> {
        // Implement Medium authentication
        // Return true if successful
    }

    async testConnection(): Promise<boolean> {
        // Test if authenticated and can access API
    }

    async createDraft(post: UniversalPost): Promise<PublishResult> {
        // Convert UniversalPost to Medium format
        // POST to Medium API
        // Return result
    }

    async publishPost(post: UniversalPost): Promise<PublishResult> {
        // Similar to createDraft but publish live
    }

    mapUniversalPost(post: UniversalPost): any {
        // Convert UniversalPost to platform-specific format
        return {
            title: post.title,
            contentFormat: 'markdown',
            content: post.content,
            tags: post.tags || [],
        }
    }

    getPlatformCapabilities() {
        return {
            supportsTags: true,
            supportsCategories: false,
            supportsScheduling: false,
            supportsDrafts: true,
        }
    }
}
```

### Step 2: Register Adapter

```typescript
// src/core/PlatformManager.ts
import { MediumAdapter } from '../adapters/MediumAdapter'

export class PlatformManager {
    private adapters: Map<string, BlogPlatformAdapter> = new Map()

    constructor() {
        // Register all adapters
        this.register(new SubstackAdapter())
        this.register(new MediumAdapter()) // Add here
    }
}
```

### Step 3: Add Settings UI

```typescript
// src/settings.ts
containerEl.createEl('h3', { text: 'Medium Settings' })

new Setting(containerEl)
    .setName('API Token')
    .setDesc('Your Medium API token')
    .addText((text) =>
        text
            .setPlaceholder('Enter token')
            .setValue(this.plugin.settings.mediumToken)
            .onChange(async (value) => {
                this.plugin.settings.mediumToken = value
                await this.plugin.saveSettings()
            })
    )
```

### Step 4: Update Types

```typescript
// src/types.ts
interface SmartWriteSettings {
    // Existing...
    substackCookie: string
    substackUrl: string

    // Add Medium
    mediumToken: string
    mediumUserId: string
}
```

### Step 5: Test Thoroughly

- [ ] Authentication works
- [ ] Draft creation works
- [ ] Live publishing works
- [ ] Error handling correct
- [ ] UI updates properly
- [ ] Settings persist

### Step 6: Document

- Update USER_GUIDE.md with platform setup
- Add FAQ entries for platform
- Document API limitations
- Update README.md

---

## Testing Guidelines

### Manual Testing

**Required before PR**:

- [ ] Plugin builds without errors (`npm run build`)
- [ ] TypeScript compiles (`tsc -noEmit`)
- [ ] Plugin loads in Obsidian
- [ ] All existing features still work (no regressions)
- [ ] New feature works as expected
- [ ] Tested on your OS (specify in PR)

**Testing Checklist for Publishing Features**:

- [ ] Single note as draft
- [ ] Single note live
- [ ] Batch publishing (5 files)
- [ ] Empty folder handling
- [ ] Invalid markdown handling
- [ ] Network error handling
- [ ] Authentication error handling

### Test Data

Use consistent test data:

**Test Note**:

```markdown
# Test Post - Contributing Guide

This is a test post for the contributing guide.

## Section 1

Content with **formatting** and [links](https://example.com).

## Section 2

- List item 1
- List item 2
```

**Expected Result**:

- Title: "Test Post - Contributing Guide"
- Subtitle: "This is a test post for the contributing guide."
- HTML with all formatting preserved
- Word count > 0

---

## Submitting Changes

### Pull Request Process

1. **Create Issue First** (for features):
    - Discuss the change before implementing
    - Get feedback on approach
    - Ensure it aligns with project goals

2. **Fork and Branch**:

    ```bash
    git checkout -b feature/descriptive-name
    ```

3. **Make Changes**:
    - Follow coding standards
    - Add/update tests
    - Update documentation

4. **Commit**:

    ```bash
    git add .
    git commit -m "Type: Brief description

    Longer explanation if needed.

    - Detail 1
    - Detail 2"
    ```

    **Commit Types**:
    - `Add:` New feature
    - `Fix:` Bug fix
    - `Update:` Improve existing feature
    - `Refactor:` Code restructure
    - `Docs:` Documentation only
    - `Test:` Add/update tests
    - `Chore:` Build, dependencies, etc.

5. **Push**:

    ```bash
    git push origin feature/descriptive-name
    ```

6. **Open Pull Request**:
    - Go to GitHub
    - Click "New Pull Request"
    - Fill out PR template
    - Link related issues
    - Request review

### PR Template

```markdown
## Description

Brief description of changes

## Related Issue

Fixes #123

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Builds successfully
- [ ] Manual testing completed
- [ ] No regressions

## Testing Environment

- OS: Windows 11
- Obsidian: 1.4.5
- Plugin: 0.3.11

## Checklist

- [ ] Code follows style guidelines
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No console errors
- [ ] Tested in Obsidian

## Screenshots

[If UI changes]
```

### Review Process

1. **Automated Checks** (if set up):
    - Build succeeds
    - No TypeScript errors

2. **Manual Review**:
    - Code quality
    - Follows standards
    - No security issues
    - Documentation adequate

3. **Testing**:
    - Maintainer tests changes
    - Verifies no regressions

4. **Feedback**:
    - May request changes
    - Discussion on approach

5. **Merge**:
    - Once approved
    - Squash or merge commits
    - Close related issues

---

## Documentation

### Documentation Standards

**All documentation must**:

- Be in English (primary language)
- Use Markdown format
- Include table of contents for long docs
- Have clear section headers
- Provide examples
- Be kept up to date

**Voice and Tone**:

- Professional but friendly
- Active voice preferred
- Clear and concise
- Assume beginner knowledge for user docs
- Technical details for API docs

**Example Good vs Bad**:

**Good** ✅:

```markdown
To publish a post, click the "Create draft" button.
Your post will appear in the Substack dashboard.
```

**Bad** ❌:

```markdown
The draft creation functionality can be accessed
by the user through the UI button interface.
```

### Updating Documentation

**When to update docs**:

- Adding new feature
- Changing existing behavior
- Fixing bugs that affect usage
- Adding new platform
- Changing settings

**Which docs to update**:

- `USER_GUIDE.md` - If user-facing change
- `FAQ.md` - If common question
- `TROUBLESHOOTING.md` - If fixing bug
- `API_DOCUMENTATION.md` - If API change
- `README.md` - If major feature
- `CHANGELOG.md` - Always for releases

---

## Release Process

### Versioning

We use Semantic Versioning (SemVer):

**Format**: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

**Examples**:

- `0.3.11` → `0.3.12`: Bug fix
- `0.3.11` → `0.4.0`: New feature
- `0.3.11` → `1.0.0`: Major rewrite

### Release Checklist

**For Maintainers**:

1. **Update Version**:

    ```json
    // manifest.json
    { "version": "0.3.12" }

    // package.json
    { "version": "0.3.12" }
    ```

2. **Update CHANGELOG.md**:

    ```markdown
    ## [0.3.12] - 2026-01-30

    ### Fixed

    - Bug description (#issue-number)

    ### Added

    - Feature description
    ```

3. **Build**:

    ```bash
    npm run build
    ```

4. **Test**:
    - Manual testing of all features
    - No regressions

5. **Commit**:

    ```bash
    git add .
    git commit -m "Release: v0.3.12"
    git tag -a v0.3.12 -m "Version 0.3.12"
    ```

6. **Push**:

    ```bash
    git push origin main
    git push origin v0.3.12
    ```

7. **GitHub Release**:
    - Go to Releases
    - Create new release from tag
    - Paste CHANGELOG entry
    - Attach `main.js`, `manifest.json`, `styles.css`

8. **Announce**:
    - Update README.md if needed
    - Notify users (if major release)

---

## Getting Help

### Questions?

- **General questions**: Open a GitHub issue
- **Technical questions**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Bug reports**: Use bug template
- **Feature ideas**: Open feature request

### Resources

- [Obsidian Plugin API Docs](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Semantic Versioning](https://semver.org/)

---

## License

By contributing to SmartWrite Publisher, you agree that your contributions will be licensed under the MIT License.

---

## Thank You!

Your contributions make SmartWrite Publisher better for everyone. Thank you for taking the time to contribute!

**Questions about contributing?**
Open an issue and we'll help you get started.

---

**Last Updated**: January 30, 2026
**Document Version**: 1.0
