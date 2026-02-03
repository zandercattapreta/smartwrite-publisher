# SmartWrite Publisher - UI Redesign Specification

**Version**: 1.1  
**Date**: 2026-02-02  
**Author**: Zander Catta Preta

---

## Overview

This document specifies the redesigned user interface for SmartWrite Publisher, focusing on a streamlined sidebar experience and improved multi-platform support.

---

## Key Changes

### What's Moving

| Component                             | Old Location       | New Location                    |
| ------------------------------------- | ------------------ | ------------------------------- |
| Blog Configuration (URL, Credentials) | Sidebar            | Settings Tab Only               |
| Connection Status Indicator           | Settings + Sidebar | Sidebar Only (Visual Indicator) |
| Tags Management                       | N/A                | Sidebar (Active Note Block)     |
| Categories Management                 | N/A                | Sidebar (Active Note Block)     |
| Visibility Controls                   | N/A                | Sidebar (Active Note Block)     |

### What's New

- **Smart Frontmatter Extraction**: Auto-populate fields from markdown frontmatter
- **Platform-Aware UI**: Fields disabled/grayed when platform doesn't support them
- **Enhanced Metadata Management**: Full tag/category CRUD operations
- **Scheduling Support**: Date/time picker for scheduled publishing

---

## Sidebar Structure (New)

```
┌─────────────────────────────────┐
│ SmartWrite Publisher            │
│ v1.1.0                          │
│ ● Connected (Substack)          │ ← Connection indicator
├─────────────────────────────────┤
│                                 │
│ [Active Note Block]             │ ← Main publishing UI
│                                 │
├─────────────────────────────────┤
│                                 │
│ [Batch Publishing Block]        │ ← Batch operations
│                                 │
├─────────────────────────────────┤
│                                 │
│ [System Logs Block]             │ ← Logs
│                                 │
└─────────────────────────────────┘
```

---

## Active Note Block (Detailed Specification)

### Layout

```
┌─────────────────────────────────────────────┐
│ Active Note                                 │
├─────────────────────────────────────────────┤
│                                             │
│ Publish Actions:                            │
│ [Create Draft] [Publish Live] [Schedule]    │
│                                             │
│ ─────────────────────────────────────────── │
│                                             │
│ Title:                                      │
│ [How to Build Obsidian Plugins       ]      │
│ ℹ️ Auto-extracted from H1                   │
│                                             │
│ Subtitle:                                   │
│ [A comprehensive guide               ]      │
│ ℹ️ Auto-extracted from first paragraph      │
│                                             │
│ Tags:                                       │
│ [x] obsidian  [x] plugins  [ ] coding       │
│ [+ Add Tag]  [Manage Tags]                  │
│ ℹ️ Auto-extracted from frontmatter          │
│                                             │
│ Categories: (WordPress only)                │
│ [x] Tutorials  [ ] Development              │
│ [+ Add Category]  [Manage Categories]       │
│ (grayed out for Substack/Medium)            │
│                                             │
│ Author:                                     │
│ [Zander Catta Preta              ▼]         │
│ ℹ️ Default from blog settings               │
│                                             │
│ Visibility:                                 │
│ [● Public  ○ Private  ○ Password]           │
│ (grayed out for Substack/Medium)            │
│                                             │
│ Schedule (if Schedule clicked):             │
│ Date: [2026-02-10     ] Time: [14:00]       │
│ (grayed out for Substack/Medium)            │
│                                             │
└─────────────────────────────────────────────┘
```

### Field Specifications

#### 1. Publish Actions

**Buttons**: Create Draft | Publish Live | Schedule

**Behavior**:

- **Create Draft**: Always available for all platforms
- **Publish Live**: Always available for all platforms
- **Schedule**: Only enabled for WordPress (grayed out for Substack/Medium)

**States**:

- Enabled: Full color, clickable
- Disabled: Grayed out, not clickable
- Loading: Spinner overlay, "Publishing..."

#### 2. Title Field

**Type**: Text input (single line)

**Auto-population Logic**:

1. Check frontmatter for `title` field
2. If not found, extract first H1 (`# Title`)
3. If not found, use filename (without `.md`)
4. Allow manual editing

**Example Frontmatter**:

```yaml
---
title: "Custom Title Here"
---
```

**Validation**:

- Required field
- Max length: 300 characters
- Show character count when > 250

#### 3. Subtitle Field

**Type**: Text input (single line)

**Auto-population Logic**:

1. Check frontmatter for `subtitle` or `description`
2. If not found, extract first paragraph after title
3. Truncate to 300 characters if needed
4. Allow manual editing

**Platform Support**:

- Substack: ✓ Supported
- Medium: ✓ Supported
- WordPress: ✓ Supported (as excerpt)

#### 4. Tags Field

**Type**: Multi-select checkboxes + autocomplete input

**Auto-population Logic**:

1. Check frontmatter for `tags` array
2. Parse tags from markdown (if using tag syntax like `#tag`)
3. Load existing tags from platform via API
4. Allow manual selection/creation

**Example Frontmatter**:

```yaml
---
tags:
    - obsidian
    - plugins
    - typescript
---
```

**UI Components**:

- **Tag Checkboxes**: Existing tags with selection state
- **Add Tag Button**: Opens input field for new tag
- **Manage Tags Link**: Opens tag management modal

**Platform Support & Limitations**:

- **Substack**: ✗ Not supported (entire section grayed out)
- **Medium**: ✓ Supported (Max 5, only first 3 used - show warning)
- **WordPress**: ✓ Supported (unlimited)

**Tag Management Modal**:

```
┌─────────────────────────────────┐
│ Manage Tags                     │
├─────────────────────────────────┤
│ Your Tags:                      │
│ [x] obsidian        [Delete]    │
│ [ ] plugins         [Delete]    │
│ [ ] typescript      [Delete]    │
│ [ ] coding          [Delete]    │
│                                 │
│ Create New Tag:                 │
│ [____________]  [Create]        │
│                                 │
│         [Close]                 │
└─────────────────────────────────┘
```

#### 5. Categories Field

**Type**: Multi-select checkboxes + autocomplete input

**Auto-population Logic**:

1. Check frontmatter for `categories` or `category`
2. Load existing categories from WordPress via API
3. Allow manual selection/creation

**Example Frontmatter**:

```yaml
---
category: Tutorials
# or
categories:
    - Tutorials
    - Development
---
```

**Platform Support**:

- **Substack**: ✗ Not supported (entire section grayed out)
- **Medium**: ✗ Not supported (entire section grayed out)
- **WordPress**: ✓ Supported (unlimited)

**Category Management Modal**:

```
┌─────────────────────────────────┐
│ Manage Categories               │
├─────────────────────────────────┤
│ Your Categories:                │
│ [x] Tutorials       [Delete]    │
│ [ ] Development     [Delete]    │
│ [ ] Guides          [Delete]    │
│                                 │
│ Create New Category:            │
│ [____________]  [Create]        │
│                                 │
│         [Close]                 │
└─────────────────────────────────┘
```

#### 6. Author Field

**Type**: Dropdown select

**Auto-population Logic**:

1. Fetch author list from platform API
2. Select current user as default
3. Check frontmatter for `author` override

**Platform Support**:

- **Substack**: ✓ Supported (single author, fixed)
- **Medium**: ✓ Supported (authenticated user)
- **WordPress**: ✓ Supported (multi-author sites, dropdown)

**Behavior**:

- **Single-author blogs**: Disabled dropdown, shows current author
- **Multi-author blogs**: Enabled dropdown with all authors

#### 7. Visibility Field

**Type**: Radio buttons

**Options**:

- **Public**: Anyone can view
- **Private**: Only site admins (WordPress)
- **Password Protected**: Requires password to view (WordPress)

**Platform Support**:

- **Substack**: ✗ Not supported (grayed out, defaults to public)
- **Medium**: Partial (public/unlisted/draft - different UI needed)
- **WordPress**: ✓ Fully supported

**Medium Alternative** (if Medium is platform):

```
Visibility:
[● Public  ○ Unlisted  ○ Draft]
```

#### 8. Schedule Fields (Conditional)

**Display Condition**: Only shown when "Schedule" button is clicked

**Type**: Date picker + Time picker

**Fields**:

- **Date**: Calendar picker (YYYY-MM-DD)
- **Time**: Time input (HH:MM, 24h format)

**Platform Support**:

- **Substack**: ✗ Not supported (Schedule button grayed out)
- **Medium**: ✗ Not supported (Schedule button grayed out)
- **WordPress**: ✓ Supported (future publish date)

**Validation**:

- Date must be in the future
- Show timezone info
- Confirm before scheduling

---

## Platform-Aware Behavior

### Disabled Field Styling

**Visual Indicators**:

- Grayed out text (opacity: 0.5)
- Disabled cursor (not-allowed)
- Optional lock icon 🔒
- Tooltip on hover: "Not supported by [Platform Name]"

**Example CSS**:

```css
.field-disabled {
	opacity: 0.5;
	pointer-events: none;
	cursor: not-allowed;
}

.field-disabled::after {
	content: "🔒 Not supported by [Platform]";
	font-size: 0.8em;
	color: #999;
}
```

### Platform Detection

The UI should dynamically adjust based on the configured platform:

```typescript
interface PlatformCapabilities {
	supportsTags: boolean;
	supportsCategories: boolean;
	supportsScheduling: boolean;
	supportsVisibility: boolean;
	supportsMultipleAuthors: boolean;
	tagLimit?: number;
}

const capabilities: Record<string, PlatformCapabilities> = {
	substack: {
		supportsTags: false,
		supportsCategories: false,
		supportsScheduling: false,
		supportsVisibility: false,
		supportsMultipleAuthors: false,
	},
	medium: {
		supportsTags: true,
		supportsCategories: false,
		supportsScheduling: false,
		supportsVisibility: true, // public/unlisted/draft
		supportsMultipleAuthors: false,
		tagLimit: 5,
	},
	wordpress: {
		supportsTags: true,
		supportsCategories: true,
		supportsScheduling: true,
		supportsVisibility: true,
		supportsMultipleAuthors: true,
	},
};
```

---

## Frontmatter Extraction

### Supported Frontmatter Formats

**YAML** (primary):

```yaml
---
title: "Post Title"
subtitle: "Post Subtitle"
tags:
    - tag1
    - tag2
categories:
    - Category Name
author: "Author Name"
visibility: public
date: 2026-02-10 14:00:00
---
```

**TOML** (secondary):

```toml
+++
title = "Post Title"
subtitle = "Post Subtitle"
tags = ["tag1", "tag2"]
categories = ["Category Name"]
author = "Author Name"
+++
```

### Extraction Priority

1. **Title**: frontmatter.title → First H1 → Filename
2. **Subtitle**: frontmatter.subtitle → frontmatter.description → First paragraph
3. **Tags**: frontmatter.tags → Inline tags (#tag syntax)
4. **Categories**: frontmatter.categories → frontmatter.category
5. **Author**: frontmatter.author → Default from platform
6. **Visibility**: frontmatter.visibility → Default (public)
7. **Date**: frontmatter.date → Current date/time

---

## Batch Publishing Block

### Simplified Design

```
┌─────────────────────────────────┐
│ Batch Publishing                │
├─────────────────────────────────┤
│                                 │
│ Folder:                         │
│ [/articles              ] [📁]  │
│                                 │
│ [Select Files to Publish]       │
│                                 │
│ Status:                         │
│ [● Draft  ○ Live  ○ Scheduled]  │
│ (Scheduled grayed for Sub/Med)  │
│                                 │
└─────────────────────────────────┘
```

**Changes from current**:

- Add Status selector (Draft/Live/Scheduled)
- Scheduled option disabled for Substack/Medium
- All batch posts use same status

---

## System Logs Block

**No changes** - Keep current implementation:

```
┌─────────────────────────────────┐
│ System Logs            [Copy] [Clear]
├─────────────────────────────────┤
│ 19:30:15 Published "Post 1"     │
│ 19:28:42 Error: Connection...   │
│ 19:25:10 Tag created: "new"     │
└─────────────────────────────────┘
```

---

## Settings Tab (Configuration)

### New Settings Structure

```
┌─────────────────────────────────────────┐
│ SmartWrite Publisher Settings           │
├─────────────────────────────────────────┤
│                                         │
│ Platform Configuration                  │
│ ─────────────────────────────────────── │
│                                         │
│ Blog URL:                               │
│ [https://myblog.substack.com      ] 🔍 │
│   ✓ Detected: Substack                  │
│                                         │
│ Platform: [Substack              ▼]     │
│   (Auto-detected, can override)         │
│                                         │
│ ───────────────────────────────────────  │
│                                         │
│ Authentication (Substack)               │
│ ─────────────────────────────────────── │
│                                         │
│ Session Cookie:                         │
│ [________________________       ]       │
│   ℹ️ How to get your Substack cookie    │
│                                         │
│ [Test Connection]                       │
│   ✓ Connected as: Zander Catta Preta    │
│   Publication: My Blog                  │
│                                         │
│ ───────────────────────────────────────  │
│                                         │
│ Default Settings                        │
│ ─────────────────────────────────────── │
│                                         │
│ Default Author: [Auto (from blog) ▼]    │
│ Default Visibility: [Public       ▼]    │
│ Auto-extract frontmatter: [✓]           │
│                                         │
└─────────────────────────────────────────┘
```

### Platform-Specific Auth Fields

**Substack**:

- Session Cookie (text input)

**Medium**:

- Integration Token (text input)

**WordPress**:

- Username (text input)
- Application Password (password input)
- Site URL (already captured)

---

## User Workflows

### 1. First-Time Setup

```
User installs plugin
    ↓
Opens Settings tab
    ↓
Enters blog URL (e.g., myblog.substack.com)
    ↓
Plugin detects platform (Substack)
    ↓
Shows Substack auth fields (Session Cookie)
    ↓
User gets cookie from browser
    ↓
Pastes cookie
    ↓
Clicks "Test Connection"
    ↓
✓ Success → Ready to publish
```

### 2. Publishing a Post

```
User opens note in Obsidian
    ↓
Opens SmartWrite sidebar
    ↓
Checks connection status (● Connected)
    ↓
Reviews auto-populated fields:
    ├─ Title (from H1)
    ├─ Subtitle (from paragraph)
    └─ Tags (grayed out for Substack)
    ↓
Clicks "Create Draft" or "Publish Live"
    ↓
Plugin publishes to platform
    ↓
Shows success notification with link
```

### 3. Managing Tags (WordPress/Medium)

```
User opens note
    ↓
Clicks "Manage Tags" in sidebar
    ↓
Modal opens showing existing tags
    ↓
User selects tags or creates new ones
    ↓
Clicks "Close"
    ↓
Selected tags appear in main UI
    ↓
Publishes with selected tags
```

---

## Implementation Notes

### Priority of Implementation

**Phase 1 (v1.1.0)**:

1. Move config to Settings tab
2. Implement connection indicator in sidebar
3. Expand Active Note block with Title/Subtitle
4. Platform detection logic
5. Frontmatter extraction

**Phase 2 (v1.2.0)**:

1. Tag management UI and API integration
2. Category management UI and API integration
3. Author dropdown
4. Visibility controls

**Phase 3 (v1.3.0)**:

1. Scheduling UI and functionality
2. Advanced frontmatter options
3. Batch publishing status selector

### Technical Requirements

**Frontmatter Parser**:

- Use existing library (e.g., `gray-matter`)
- Support YAML and TOML
- Graceful fallback if parsing fails

**Platform Capabilities Manager**:

- Centralized configuration
- Dynamic UI updates based on platform
- Clear error messages when feature unavailable

**API Integration**:

- Fetch tags/categories from platform
- Create new tags/categories via API
- Cache results for performance

---

## Accessibility Considerations

- All fields must have proper labels
- Disabled fields must have accessible tooltips
- Keyboard navigation support
- Screen reader compatibility
- Color contrast for disabled states

---

## Future Enhancements

### Post-v1.3.0

1. **Multi-Platform Publishing**:
    - Select multiple platforms at once
    - Platform-specific overrides (different titles per platform)

2. **Template System**:
    - Save field combinations as templates
    - Quick-apply templates

3. **Revision History**:
    - Track published versions
    - Compare changes

---

## Summary of Changes

| Area                  | Old                        | New                                  |
| --------------------- | -------------------------- | ------------------------------------ |
| **Configuration**     | In sidebar                 | Settings tab only                    |
| **Connection Status** | In settings                | Visual indicator in sidebar          |
| **Active Note**       | Basic (Draft/Live buttons) | Full metadata management             |
| **Tags**              | Not supported              | Full CRUD with platform awareness    |
| **Categories**        | Not supported              | Full CRUD (WordPress only)           |
| **Visibility**        | Not supported              | Radio buttons (platform-aware)       |
| **Scheduling**        | Not supported              | Date/time picker (WordPress only)    |
| **Frontmatter**       | Not used                   | Auto-extraction with manual override |

---

**Document created**: 2026-02-02  
**Last updated**: 2026-02-02  
**Status**: Ready for implementation
