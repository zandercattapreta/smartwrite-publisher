# SmartWrite Publisher - Development Backlog

**Version**: v1.0.0  
**Date**: 2026-02-02  
**Maintained by**: Zander Catta Preta

---

## How to Use This Backlog

This document contains **all planned tasks** organized by:

- **Epic**: Logical grouping of related features
- **Priority**: P0 (Critical) → P4 (Nice to have)
- **Status**: Backlog | In Progress | Done | Cancelled
- **Effort**: Session estimate (hours of focused work)

---

## Priority Legend

| Priority | Description                        | When to Work       |
| -------- | ---------------------------------- | ------------------ |
| **P0**   | Critical - Blocker                 | Immediately        |
| **P1**   | High - Necessary for release       | Next milestone     |
| **P2**   | Medium - Important but not blocker | Within version     |
| **P3**   | Low - Desirable                    | When time permits  |
| **P4**   | Nice to have - Future              | Backlog refinement |

---

## Current Focus: v1.1.0 Foundation

**Objective**: Prepare infrastructure for Medium and WordPress

**Prioritized Tasks**:

1. [EPIC-001-TASK-001] Refactor UniversalPost interface
2. [EPIC-001-TASK-002] Implement MediumAdapter skeleton
3. [EPIC-001-TASK-003] Implement WordPressAdapter skeleton
4. [EPIC-002-TASK-001] Create settings UI for Medium
5. [EPIC-002-TASK-002] Create settings UI for WordPress

---

# EPICS AND TASKS

## EPIC-001: Multi-Platform Core Infrastructure

**Description**: Base infrastructure to support multiple platforms  
**Target Version**: v1.1.0  
**Owner**: Zander

### Tasks

#### [EPIC-001-TASK-001] Refactor UniversalPost Interface

- **Status**: Backlog
- **Priority**: P0
- **Estimated Sessions**: 1-2 sessions (3-6 hours)
- **Description**: Standardize UniversalPost interface to support all necessary fields for Medium, WordPress, and Substack

**Acceptance Criteria**:

- [ ] UniversalPost interface has fields: title, subtitle, content, contentHtml, tags, category, author, publishDate
- [ ] Generic metadata allows platform-specific extensions
- [ ] All existing adapters use UniversalPost
- [ ] Complete type safety (no any)

**Technical Notes**:

```typescript
interface UniversalPost {
	title: string;
	subtitle?: string;
	content: string; // Markdown source
	contentHtml?: string; // HTML converted
	tags?: string[];
	category?: string;
	author?: string;
	publishDate?: Date;
	featuredImage?: string;
	metadata?: Record<string, any>; // Platform-specific
}
```

---

#### [EPIC-001-TASK-002] Implement MediumAdapter Skeleton

- **Status**: Backlog
- **Priority**: P0
- **Estimated Sessions**: 2-3 sessions (6-9 hours)

**Acceptance Criteria**:

- [ ] MediumAdapter class implements BlogPlatformAdapter
- [ ] configure(), testConnection() methods functional
- [ ] createDraft(), publishPost() methods with TODO comments
- [ ] getPlatformCapabilities() returns correct capabilities
- [ ] Registered in PlatformManager

**Dependencies**: EPIC-001-TASK-001

---

#### [EPIC-001-TASK-003] Implement WordPressAdapter Skeleton

- **Status**: Backlog
- **Priority**: P0
- **Estimated Sessions**: 2-3 sessions (6-9 hours)

**Acceptance Criteria**:

- [ ] WordPressAdapter class implements BlogPlatformAdapter
- [ ] REST API authentication (Application Password)
- [ ] configure(), testConnection() methods functional
- [ ] createDraft(), publishPost() methods with TODO comments
- [ ] WP Multi-site support (URL per site)
- [ ] Registered in PlatformManager

**Dependencies**: EPIC-001-TASK-001

---

#### [EPIC-001-TASK-004] Convert to Medium Format

- **Status**: Backlog
- **Priority**: P1
- **Estimated Sessions**: 3-4 sessions (9-12 hours)

**Acceptance Criteria**:

- [ ] Markdown → Medium HTML format
- [ ] Tag support (max 5)
- [ ] Canonical URL support
- [ ] License support (all-rights-reserved, public-domain, cc-\*)
- [ ] Image upload via Medium API
- [ ] Code blocks with syntax highlighting

**Technical Notes**:

- Medium API: https://github.com/Medium/medium-api-docs
- Content format: HTML string with allowed tags

---

#### [EPIC-001-TASK-005] Convert to WordPress Blocks (Gutenberg)

- **Status**: Backlog
- **Priority**: P1
- **Estimated Sessions**: 5-7 sessions (15-21 hours)

**Acceptance Criteria**:

- [ ] Markdown → Gutenberg blocks JSON
- [ ] Support basic blocks: paragraph, heading, list, code, quote
- [ ] Image block support with featured image
- [ ] Embed support (YouTube, Twitter)
- [ ] Fallback to Classic Editor (HTML)

**Technical Notes**:

- WordPress REST API v2: `/wp/v2/posts`
- Block format: JSON array of block objects

---

## EPIC-002: Multi-Platform User Interface

**Description**: UI/UX for configuring and using multiple platforms  
**Target Version**: v1.1.0  
**Owner**: Zander

### Tasks

#### [EPIC-002-TASK-001] Settings UI for Medium

- **Status**: Backlog
- **Priority**: P0
- **Estimated Sessions**: 1-2 sessions (3-6 hours)

**Acceptance Criteria**:

- [ ] Input field for Integration Token
- [ ] Platform-specific "Test Connection" button
- [ ] Help text with link to generate token
- [ ] Token format validation

**UI Mockup**:

```
[Medium Integration]
Integration Token: [_____________________] [Test]
ℹ️ Get your token at https://medium.com/me/settings/security
Status: Not connected
```

---

#### [EPIC-002-TASK-002] Settings UI for WordPress

- **Status**: Backlog
- **Priority**: P0
- **Estimated Sessions**: 2-3 sessions (6-9 hours)

**Acceptance Criteria**:

- [ ] Input field for Site URL
- [ ] Input field for Username
- [ ] Input field for Application Password
- [ ] "Test Connection" button
- [ ] Multi-site selector (if multiple sites)
- [ ] Help text with setup instructions

---

#### [EPIC-002-TASK-003] Platform Selection UI (Active Note)

- **Status**: Backlog
- **Priority**: P1
- **Estimated Sessions**: 2-3 sessions (6-9 hours)

**Acceptance Criteria**:

- [ ] Checkboxes to select platforms
- [ ] Only configured platforms appear
- [ ] Default: Substack selected
- [ ] Publish button publishes to all selected
- [ ] Results modal shows status per platform

**UI Mockup**:

```
Publish to:
[x] Substack
[x] Medium
[ ] WordPress (not configured)

[Create Draft] [Publish Live]
```

---

#### [EPIC-002-TASK-004] Batch Publishing Multi-Platform UI

- **Status**: Backlog
- **Priority**: P2
- **Estimated Sessions**: 3-4 sessions (9-12 hours)

**Acceptance Criteria**:

- [ ] Select platforms for batch
- [ ] Preview of posts per platform
- [ ] Progress bar per platform
- [ ] Aggregated results modal (success/fail per platform)

---

## EPIC-003: Complete Medium Integration

**Description**: Complete Medium implementation  
**Target Version**: v1.1.0  
**Owner**: Zander

### Tasks

#### [EPIC-003-TASK-001] Medium API Client

- **Status**: Backlog
- **Priority**: P1
- **Estimated Sessions**: 2-3 sessions (6-9 hours)

**Acceptance Criteria**:

- [ ] MediumClient wrapper for API
- [ ] Authentication via Integration Token
- [ ] GET /v1/me (user info)
- [ ] GET /v1/users/{userId}/publications
- [ ] POST /v1/users/{userId}/posts

**Error Handling**:

- 401: Invalid token
- 403: Insufficient permissions
- Rate limiting handling

---

#### [EPIC-003-TASK-002] Medium Draft Creation

- **Status**: Backlog
- **Priority**: P1
- **Estimated Sessions**: 2-3 sessions (6-9 hours)

**Acceptance Criteria**:

- [ ] createDraft() creates post with publishStatus=draft
- [ ] Tags correctly applied
- [ ] Canonical URL set
- [ ] Content format validated
- [ ] Success response parsed

---

#### [EPIC-003-TASK-003] Medium Live Publishing

- **Status**: Backlog
- **Priority**: P1
- **Estimated Sessions**: 1-2 sessions (3-6 hours)

**Acceptance Criteria**:

- [ ] publishPost() with publishStatus=public
- [ ] License selection
- [ ] Success notification
- [ ] Link to published post

---

#### [EPIC-003-TASK-004] Medium Image Upload

- **Status**: Backlog
- **Priority**: P2
- **Estimated Sessions**: 3-4 sessions (9-12 hours)

**Acceptance Criteria**:

- [ ] POST /v1/images endpoint
- [ ] Detect images in markdown
- [ ] Upload images to Medium
- [ ] Replace local paths with Medium URLs
- [ ] Error handling for upload failures

---

## EPIC-004: Complete WordPress Integration

**Description**: Complete WordPress implementation  
**Target Version**: v1.1.0  
**Owner**: Zander

### Tasks

#### [EPIC-004-TASK-001] WordPress REST API Client

- **Status**: Backlog
- **Priority**: P1
- **Estimated Sessions**: 2-3 sessions (6-9 hours)

**Acceptance Criteria**:

- [ ] WordPressClient wrapper
- [ ] Application Password authentication
- [ ] GET /wp/v2/users/me
- [ ] GET /wp/v2/posts
- [ ] POST /wp/v2/posts
- [ ] POST /wp/v2/media (image upload)

---

#### [EPIC-004-TASK-002] WordPress Post Creation (Gutenberg)

- **Status**: Backlog
- **Priority**: P1
- **Estimated Sessions**: 3-5 sessions (9-15 hours)

**Acceptance Criteria**:

- [ ] Convert markdown to Gutenberg blocks
- [ ] Set status=draft or status=publish
- [ ] Set categories (by name or ID)
- [ ] Set tags
- [ ] Set featured image (after upload)

---

#### [EPIC-004-TASK-003] WordPress Classic Editor Fallback

- **Status**: Backlog
- **Priority**: P2
- **Estimated Sessions**: 1-2 sessions (3-6 hours)

**Acceptance Criteria**:

- [ ] Detect if site uses Classic Editor
- [ ] Fallback to HTML content
- [ ] Settings option to force Classic mode

---

#### [EPIC-004-TASK-004] WordPress Multi-Site Support

- **Status**: Backlog
- **Priority**: P3
- **Estimated Sessions**: 2-3 sessions (6-9 hours)

**Acceptance Criteria**:

- [ ] Detect multi-site setup
- [ ] Switch between sites
- [ ] Separate credentials per site
- [ ] UI to manage multiple sites

---

## EPIC-005: GUI Installer

**Description**: Electron app for plugin installation  
**Target Version**: v1.1.0  
**Owner**: Zander

### Tasks

#### [EPIC-005-TASK-001] Electron App Setup

- **Status**: Backlog
- **Priority**: P2
- **Estimated Sessions**: 2-3 sessions (6-9 hours)

**Acceptance Criteria**:

- [ ] Electron + React/Vue base app
- [ ] Window management
- [ ] Platform detection (Windows/macOS/Linux)
- [ ] Auto-updater integration

---

#### [EPIC-005-TASK-002] Vault Detection

- **Status**: Backlog
- **Priority**: P2
- **Estimated Sessions**: 3-4 sessions (9-12 hours)

**Acceptance Criteria**:

- [ ] Search common Obsidian locations
- [ ] Parse obsidian.json for recent vaults
- [ ] Manual vault selection via folder picker
- [ ] Validate vault structure (.obsidian folder)

**Platform-Specific Paths**:

- Windows: `%APPDATA%/obsidian/`
- macOS: `~/Library/Application Support/obsidian/`
- Linux: `~/.config/obsidian/`

---

#### [EPIC-005-TASK-003] Plugin Installation Logic

- **Status**: Backlog
- **Priority**: P2
- **Estimated Sessions**: 2-3 sessions (6-9 hours)

**Acceptance Criteria**:

- [ ] Download latest release from GitHub
- [ ] Extract ZIP to vault plugins folder
- [ ] Enable plugin in community-plugins.json
- [ ] Verify installation success

---

#### [EPIC-005-TASK-004] Installer UI/UX

- **Status**: Backlog
- **Priority**: P2
- **Estimated Sessions**: 3-4 sessions (9-12 hours)

**Acceptance Criteria**:

- [ ] Splash screen
- [ ] Vault selection screen
- [ ] Installation progress screen
- [ ] Success/error screens
- [ ] Modern, clean design

---

#### [EPIC-005-TASK-005] Packaging and Distribution

- **Status**: Backlog
- **Priority**: P2
- **Estimated Sessions**: 3-4 sessions (9-12 hours)

**Acceptance Criteria**:

- [ ] electron-builder setup
- [ ] .exe for Windows (NSIS)
- [ ] .dmg for macOS (signed)
- [ ] .AppImage for Linux
- [ ] Auto-updater working
- [ ] GitHub releases automation

---

## EPIC-006: Advanced Features (v1.2.0)

**Description**: Advanced publishing features  
**Target Version**: v1.2.0  
**Owner**: Zander

### Tasks

#### [EPIC-006-TASK-001] Simultaneous Multi-Platform Publishing

- **Status**: Backlog
- **Priority**: P2
- **Estimated Sessions**: 3-4 sessions (9-12 hours)

**Acceptance Criteria**:

- [ ] Select multiple platforms in UI
- [ ] PlatformManager.publishToMultiple()
- [ ] Parallel execution with Promise.all()
- [ ] Aggregated results modal
- [ ] Individual error handling

---

#### [EPIC-006-TASK-002] Platform Templates System

- **Status**: Backlog
- **Priority**: P3
- **Estimated Sessions**: 5-7 sessions (15-21 hours)

**Acceptance Criteria**:

- [ ] Per-platform frontmatter parsing
- [ ] Conditional content blocks
- [ ] Template variables ({platform}, {date}, etc.)
- [ ] Preview output per platform

**Example**:

```markdown
---
title_substack: "How to Build Amazing Plugins"
title_medium: "Building Obsidian Plugins Like a Pro"
tags_substack: ["obsidian", "plugins"]
tags_medium: ["productivity", "coding"]
---

<!-- substack-only -->

Subscribe for more plugin tips!

<!-- /substack-only -->
```

---

#### [EPIC-006-TASK-003] Content Synchronization

- **Status**: Backlog
- **Priority**: P3
- **Estimated Sessions**: 5-7 sessions (15-21 hours)

**Acceptance Criteria**:

- [ ] Track post IDs (frontmatter or local DB)
- [ ] Detect file changes via watcher
- [ ] Update existing posts via API
- [ ] Conflict resolution UI
- [ ] Preview diff before update

**Technical Challenge**: Requires update support in APIs

---

#### [EPIC-006-TASK-004] Analytics Dashboard

- **Status**: Backlog
- **Priority**: P4
- **Estimated Sessions**: 5-7 sessions (15-21 hours)

**Acceptance Criteria**:

- [ ] Track published posts in local DB
- [ ] Fetch analytics when APIs support it
- [ ] Dashboard with charts (publications per platform)
- [ ] Export CSV/JSON reports

**Note**: Limited by public analytics APIs

---

## EPIC-007: Bug Fixes and Improvements (Ongoing)

**Description**: Reported bugs and minor improvements  
**Target Version**: Ongoing

### Known Bugs

#### [BUG-001] Cookie Expiration Not Detected

- **Status**: Backlog
- **Priority**: P2
- **Estimated Sessions**: 1 session (2-3 hours)
- **Description**: When Substack cookie expires, error is not clear to user

**Acceptance Criteria**:

- [ ] Detect 401 errors specifically
- [ ] Show notification: "Your session expired. Please update your cookie."
- [ ] Auto-redirect to settings

---

#### [BUG-002] Large Images Timeout

- **Status**: Backlog
- **Priority**: P3
- **Estimated Sessions**: 2 sessions (4-6 hours)
- **Description**: Very large images cause timeout on publish

**Acceptance Criteria**:

- [ ] Detect image size before upload
- [ ] Warn if image > 5MB
- [ ] Auto-resize option
- [ ] Increase timeout for image uploads

---

### UX Improvements

#### [IMPROVEMENT-001] Keyboard Shortcuts

- **Status**: Backlog
- **Priority**: P3
- **Estimated Sessions**: 2 sessions (4-6 hours)

**Acceptance Criteria**:

- [ ] Cmd/Ctrl+Shift+P: Publish active note as draft
- [ ] Cmd/Ctrl+Shift+L: Publish live
- [ ] Customizable via settings

---

#### [IMPROVEMENT-002] Dark Mode Optimizations

- **Status**: Backlog
- **Priority**: P4
- **Estimated Sessions**: 1 session (2-3 hours)

**Acceptance Criteria**:

- [ ] Review all colors in dark mode
- [ ] Adjust contrast where needed
- [ ] More visible status indicators

---

## EPIC-008: Testing and Quality Assurance

**Description**: Add automated testing  
**Target Version**: v1.2.0  
**Owner**: Zander

### Tasks

#### [EPIC-008-TASK-001] Unit Tests Setup

- **Status**: Backlog
- **Priority**: P2
- **Estimated Sessions**: 2 sessions (4-6 hours)

**Acceptance Criteria**:

- [ ] Jest or Vitest setup
- [ ] Test runner configured
- [ ] Coverage reporting (goal: >70%)

---

#### [EPIC-008-TASK-002] Converter Tests

- **Status**: Backlog
- **Priority**: P2
- **Estimated Sessions**: 3-4 sessions (9-12 hours)

**Acceptance Criteria**:

- [ ] Test markdown → HTML conversion
- [ ] Test markdown → Tiptap JSON
- [ ] Test edge cases (empty, malformed)
- [ ] Test XSS prevention

---

#### [EPIC-008-TASK-003] Adapter Integration Tests

- **Status**: Backlog
- **Priority**: P3
- **Estimated Sessions**: 5-6 sessions (15-18 hours)

**Acceptance Criteria**:

- [ ] Mock API responses
- [ ] Test each adapter method
- [ ] Test error handling
- [ ] Test rate limiting

---

## Backlog Health Metrics

### Current Status

| Metric                 | Value | Goal |
| ---------------------- | ----- | ---- |
| Total tasks            | 35+   | N/A  |
| P0/P1 tasks estimated  | 90%   | >80% |
| Tasks without estimate | 5%    | <10% |
| Epics without owner    | 0%    | <20% |
| Open bugs              | 2     | <5   |

---

## Conclusion

This backlog is a **living document** updated continuously as:

- New bugs are reported
- Features are requested by the community
- Priorities change
- Development progresses

**How to contribute**:

1. Open GitHub Issues for bugs or feature requests
2. Vote on existing issues for prioritization
3. Participate in discussions to refine requirements
4. Contribute code via Pull Requests

---

**Backlog maintained by**: Zander Catta Preta  
**Last updated**: 2026-02-02  
**Next review**: Weekly (every Monday)
