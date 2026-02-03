# SmartWrite Publisher - UI Mockups v1.1.0

**Date**: 2026-02-02  
**Designer**: Zander Catta Preta  
**Version**: 1.1.0

---

## Overview

This document presents the visual mockups for the redesigned SmartWrite Publisher interface, focusing on improved multi-platform support and enhanced user experience.

---

## 1. Sidebar Header

![Sidebar Header](/Users/zander/.gemini/antigravity/brain/23e44ca6-3320-4294-b887-4f28851dde6e/sidebar_header_1770075255367.png)

### Features:

- **Plugin Logo**: Purple abstract pen icon
- **Plugin Name**: SmartWrite Publisher
- **Version**: v1.1.0 (in gray)
- **Connection Status**: Green dot with "Connected (Substack)"

### Design Notes:

- Compact header that doesn't waste vertical space
- Clear visual indication of connection status
- Matches Obsidian's dark theme aesthetic

---

## 2. Settings Tab - Platform Configuration

![Platform Configuration](/Users/zander/.gemini/antigravity/brain/23e44ca6-3320-4294-b887-4f28851dde6e/settings_mockup_1770075204946.png)

### Features:

- **Blog URL Input**: With search/detection icon
- **Auto-Detection**: "✓ Detected: Substack" in green
- **Platform Dropdown**: Override auto-detection if needed
- **Credential Fields**: Dynamic based on platform
    - Substack: Session Cookie
    - Medium: Integration Token
    - WordPress: Username + Application Password
- **Test Connection Button**: Purple, prominent
- **Connection Result**: Success message with user info

### User Flow:

1. User enters blog URL
2. Plugin detects platform automatically
3. Shows platform-specific auth fields
4. User enters credentials
5. Clicks "Test Connection"
6. Shows success/failure with details

---

## 3. Active Note Block - Main Publishing UI

![Active Note Block](/Users/zander/.gemini/antigravity/brain/23e44ca6-3320-4294-b887-4f28851dde6e/sidebar_active_note_1770075223669.png)

### Features:

#### Publish Actions (Top)

- **Create Draft**: Outlined purple button (safe default)
- **Publish Live**: Filled purple button (primary action)
- **Schedule**: Grayed out for Substack (platform limitation)

#### Metadata Fields

- **Title**: Auto-extracted from H1
    - Helper text: "ℹ️ Auto-extracted from H1"
    - Editable by user
- **Subtitle**: Auto-extracted from first paragraph
    - Helper text: "ℹ️ Auto-extracted from first paragraph"
    - Editable by user

- **Tags**: Checkbox list with management
    - Shows existing tags from platform
    - Purple checkmarks for selected
    - "+ Add Tag" button for new tags
    - **For Substack**: Entire section grayed out with lock icon

- **Categories**: WordPress only
    - Completely grayed out for Substack/Medium
    - Lock icon with tooltip: "🔒 Not supported by Substack"
    - Low opacity to indicate disabled state

### Platform-Aware Behavior:

- Disabled features are visually grayed out
- Lock icons indicate platform limitations
- Tooltips explain why features are unavailable

---

## 4. Tag Management Modal

![Tag Management Modal](/Users/zander/.gemini/antigravity/brain/23e44ca6-3320-4294-b887-4f28851dde6e/tag_management_modal_1770075241167.png)

### Features:

- **Your Tags List**: Existing tags with checkboxes
    - Select tags to apply to current post
    - Red "Delete" button for each tag
    - Warning before deleting
- **Create New Tag**:
    - Text input field
    - Purple "Create" button
    - Validates tag name (no duplicates, length limits)

- **Close Button**: Purple, centered at bottom

### User Flow:

1. User clicks "Manage Tags" in Active Note
2. Modal opens showing all tags
3. User can:
    - Select/unselect tags for current post
    - Create new tags
    - Delete existing tags (with confirmation)
4. Clicks "Close" - selections are applied

---

## 5. Complete Sidebar Layout

![Complete Sidebar](/Users/zander/.gemini/antigravity/brain/23e44ca6-3320-4294-b887-4f28851dde6e/complete_sidebar_layout_1770075274319.png)

### Full Layout Structure:

#### Header

- Plugin name, version, connection status

#### Section 1: Active Note

- Collapsible panel (expanded by default)
- Publish action buttons
- Title and subtitle inputs
- Tags with checkboxes
- Categories (grayed for Substack)

#### Section 2: Batch Publishing

- Collapsible panel
- Folder selector with browse icon
- "Select Files to Publish" button
- Status selector: Draft/Live/Scheduled
    - Scheduled grayed for Substack/Medium

#### Section 3: System Logs

- Collapsible panel
- "Copy" and "Clear" buttons in header
- Timestamped log entries
- Scrollable area
- Color-coded messages:
    - Green: Success
    - Red: Errors
    - Gray: Info

---

## Design Principles

### 1. Platform-Aware UI

- Features unavailable on current platform are visually disabled
- Lock icons and tooltips explain limitations
- No feature removal - just visual indication

### 2. Smart Defaults

- Auto-extraction from markdown frontmatter
- Fallback to content parsing (H1, first paragraph)
- Sensible defaults reduce user friction

### 3. Visual Consistency

- Purple as primary accent color
- Dark theme matching Obsidian
- Consistent spacing and typography
- Clear visual hierarchy

### 4. Accessibility

- Proper contrast ratios
- Keyboard navigation support
- Screen reader compatible
- Clear focus states

### 5. Responsive Feedback

- Loading states for async operations
- Success/error messages with context
- Progress indicators for batch operations

---

## Color Palette

| Element        | Color                  | Usage                               |
| -------------- | ---------------------- | ----------------------------------- |
| Primary Action | `#8B5CF6` (Purple)     | Buttons, accents, checkboxes        |
| Success        | `#10B981` (Green)      | Connection status, success messages |
| Error          | `#EF4444` (Red)        | Delete buttons, error messages      |
| Background     | `#1E1E1E` (Dark)       | Main background                     |
| Surface        | `#2D2D2D` (Dark Gray)  | Cards, inputs                       |
| Text Primary   | `#FFFFFF` (White)      | Main text                           |
| Text Secondary | `#9CA3AF` (Light Gray) | Helper text, labels                 |
| Disabled       | `#4B5563` (Gray)       | Disabled elements                   |

---

## Typography

- **Headers**: 16px, bold, white
- **Body**: 14px, regular, white
- **Helper Text**: 12px, regular, light gray
- **Labels**: 13px, medium, light gray
- **Buttons**: 14px, medium, white

**Font Family**: System UI font stack (matches Obsidian)

---

## Interactive States

### Buttons

**Normal**:

- Purple fill or outline
- White text
- Slight rounded corners

**Hover**:

- Slightly lighter purple
- Subtle shadow

**Disabled**:

- Gray background
- Lower opacity (0.5)
- Cursor: not-allowed

**Loading**:

- Spinner overlay
- Text: "Publishing..." or "Loading..."

### Input Fields

**Normal**:

- Dark gray background
- Purple border on focus
- White text

**Filled**:

- Same as normal
- Value displayed

**Error**:

- Red border
- Error message below

---

## Implementation Notes

### Phase 1: Core Structure (Week 1-2)

- Sidebar header with connection indicator
- Settings tab reorganization
- Platform detection logic

### Phase 2: Active Note Block (Week 3-4)

- Title/subtitle auto-extraction
- Frontmatter parsing
- Basic input fields

### Phase 3: Platform Features (Week 5-6)

- Tag management UI and API
- Category management (WordPress)
- Platform-aware disable states

### Phase 4: Polish (Week 7-8)

- Animations and transitions
- Error handling improvements
- Accessibility testing

---

## User Testing Checklist

- [ ] Can user configure Substack easily?
- [ ] Platform auto-detection works?
- [ ] Disabled features are clearly indicated?
- [ ] Title/subtitle auto-extraction works?
- [ ] Tag management is intuitive?
- [ ] Batch publishing flow is clear?
- [ ] Error messages are helpful?
- [ ] Connection status is always visible?
- [ ] Mobile/small screen support (if applicable)

---

## Mockup Files

All mockup images are saved in the artifacts directory:

1. `sidebar_header_*.png` - Connection status header
2. `settings_mockup_*.png` - Platform configuration
3. `sidebar_active_note_*.png` - Main publishing interface
4. `tag_management_modal_*.png` - Tag CRUD modal
5. `complete_sidebar_layout_*.png` - Full sidebar view

---

**Mockups created**: 2026-02-02  
**Ready for**: Development implementation  
**Next step**: User feedback and iteration
