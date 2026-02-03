# Platform Feature Compatibility Matrix

**Last Updated**: 2026-02-02  
**Maintained by**: Zander Catta Preta

---

## Overview

This document tracks the implementation status of features across different blogging platforms supported by SmartWrite Publisher. It serves as a reference for development priorities and platform capabilities.

---

## Feature Status Legend

| Symbol | Meaning                             |
| ------ | ----------------------------------- |
| ✓      | Fully implemented and tested        |
| ◐      | Partially implemented / In progress |
| ○      | Planned but not started             |
| ✗      | Not supported by platform API       |
| ?      | Unknown / Needs research            |

---

## Core Publishing Features

| Feature                  | Substack | Medium | WordPress | Dev.to | Hashnode | Ghost |
| ------------------------ | -------- | ------ | --------- | ------ | -------- | ----- |
| **Draft Creation**       | ✓        | ✓      | ✓         | ?      | ?        | ?     |
| **Live Publishing**      | ✓        | ✓      | ✓         | ?      | ?        | ?     |
| **Update Existing Post** | ✗        | ✗      | ✓         | ?      | ?        | ?     |
| **Delete Post**          | ✗        | ✗      | ✓         | ?      | ?        | ?     |
| **Scheduled Publishing** | ✗        | ✗      | ✓         | ?      | ?        | ?     |
| **Batch Publishing**     | ✓        | ○      | ○         | ?      | ?        | ?     |
| **Import Posts**         | ✗        | ◐      | ✓         | ?      | ?        | ?     |

### Notes:

- **Substack**: Draft creation and live publishing fully functional. API does not support scheduled publishing or post updates/deletion. No import API.
- **Medium**: API supports draft/publish. Tag limit (5 max, only first 3 used). No update/delete/schedule. Import via RSS feed (public posts) or export feature.
- **WordPress**: Full CRUD support. Scheduling via future date. Import via GET `/wp/v2/posts` with pagination (100 posts max per request).
- **Others**: Research needed for API capabilities

---

## Content & Formatting

| Feature                            | Substack | Medium | WordPress | Dev.to | Hashnode | Ghost |
| ---------------------------------- | -------- | ------ | --------- | ------ | -------- | ----- |
| **Markdown Support**               | ✓        | ○      | ○         | ?      | ?        | ?     |
| **HTML Support**                   | ✓        | ○      | ○         | ?      | ?        | ?     |
| **Rich Text (Tiptap/Gutenberg)**   | ✓        | ✗      | ○         | ?      | ?        | ?     |
| **Code Blocks**                    | ✓        | ○      | ○         | ?      | ?        | ?     |
| **Syntax Highlighting**            | ✓        | ○      | ○         | ?      | ?        | ?     |
| **Tables**                         | ✗        | ○      | ○         | ?      | ?        | ?     |
| **Embeds (YouTube, Twitter, etc)** | ✗        | ○      | ○         | ?      | ?        | ?     |
| **Math/LaTeX**                     | ✗        | ✗      | ○         | ?      | ?        | ?     |

### Notes:

- **Substack**: Uses Tiptap JSON format. Our converter handles markdown → Tiptap conversion.
- **WordPress**: Gutenberg blocks required for modern WordPress installations
- **Medium**: Accepts HTML with specific allowed tags

---

## Metadata & Organization

| Feature                 | Substack | Medium | WordPress | Dev.to | Hashnode | Ghost |
| ----------------------- | -------- | ------ | --------- | ------ | -------- | ----- |
| **Title**               | ✓        | ○      | ○         | ?      | ?        | ?     |
| **Subtitle**            | ✓        | ○      | ○         | ?      | ?        | ?     |
| **Tags**                | ✗        | ○      | ○         | ?      | ?        | ?     |
| **Categories**          | ✗        | ✗      | ○         | ?      | ?        | ?     |
| **Custom Taxonomies**   | ✗        | ✗      | ○         | ?      | ?        | ?     |
| **Author**              | ✓        | ○      | ○         | ?      | ?        | ?     |
| **Multiple Authors**    | ✗        | ✗      | ○         | ?      | ?        | ?     |
| **Canonical URL**       | ✗        | ○      | ○         | ?      | ?        | ?     |
| **Excerpt/Description** | ✓        | ○      | ○         | ?      | ?        | ?     |
| **SEO Meta Tags**       | ✗        | ✗      | ○         | ?      | ?        | ?     |

### Notes:

- **Substack**: Supports title, subtitle, and author. No tag support via API.
- **WordPress**: Full metadata support including custom fields
- **Medium**: Supports tags (max 5), canonical URL, and licenses

---

## Media Management

| Feature                | Substack | Medium | WordPress | Dev.to | Hashnode | Ghost |
| ---------------------- | -------- | ------ | --------- | ------ | -------- | ----- |
| **Image Upload**       | ✗        | ○      | ○         | ?      | ?        | ?     |
| **Featured Image**     | ✗        | ✗      | ○         | ?      | ?        | ?     |
| **Image URL Support**  | ✓        | ○      | ○         | ?      | ?        | ?     |
| **Image Optimization** | ✗        | ○      | ○         | ?      | ?        | ?     |
| **Image Alt Text**     | ✓        | ○      | ○         | ?      | ?        | ?     |
| **Video Embed**        | ✗        | ○      | ○         | ?      | ?        | ?     |
| **Audio Embed**        | ✗        | ○      | ○         | ?      | ?        | ?     |
| **File Attachments**   | ✗        | ✗      | ○         | ?      | ?        | ?     |

### Notes:

- **Substack**: Image URLs in markdown work, but no direct upload via API
- **WordPress**: Complete media library support via REST API
- **Medium**: Has dedicated image upload endpoint

---

## Visibility & Access Control

| Feature                  | Substack | Medium | WordPress | Dev.to | Hashnode | Ghost |
| ------------------------ | -------- | ------ | --------- | ------ | -------- | ----- |
| **Public Posts**         | ✓        | ○      | ○         | ?      | ?        | ?     |
| **Private Posts**        | ✗        | ✗      | ○         | ?      | ?        | ?     |
| **Password Protected**   | ✗        | ✗      | ○         | ?      | ?        | ?     |
| **Paid/Premium Content** | ✗        | ○      | ○         | ?      | ?        | ?     |
| **Members Only**         | ✗        | ○      | ○         | ?      | ?        | ?     |
| **Draft Visibility**     | ✓        | ○      | ○         | ?      | ?        | ?     |

### Notes:

- **Substack**: API does not expose audience/visibility controls (free vs paid)
- **WordPress**: Full visibility control (public, private, password)
- **Medium**: Can set visibility and publication status

---

## Distribution & Engagement

| Feature                     | Substack | Medium | WordPress | Dev.to | Hashnode | Ghost |
| --------------------------- | -------- | ------ | --------- | ------ | -------- | ----- |
| **Email Notification**      | ✗        | ✗      | ○         | ?      | ?        | ?     |
| **Social Sharing**          | ✗        | ✗      | ○         | ?      | ?        | ?     |
| **Comments**                | ✗        | ○      | ○         | ?      | ?        | ?     |
| **Comment Moderation**      | ✗        | ✗      | ○         | ?      | ?        | ?     |
| **Post Series/Collections** | ✗        | ○      | ○         | ?      | ?        | ?     |
| **Cross-posting**           | ✗        | ✗      | ✗         | ?      | ?        | ?     |

### Notes:

- **Substack**: Email sending not controllable via API
- **Medium**: Can submit to publications
- **WordPress**: Extensive engagement features

---

## Advanced Features

| Feature                | Substack | Medium | WordPress | Dev.to | Hashnode | Ghost |
| ---------------------- | -------- | ------ | --------- | ------ | -------- | ----- |
| **Custom Domains**     | ✗        | ✗      | ○         | ?      | ?        | ?     |
| **Custom CSS**         | ✗        | ✗      | ○         | ?      | ?        | ?     |
| **Custom Templates**   | ✗        | ✗      | ○         | ?      | ?        | ?     |
| **Multi-site Support** | ✗        | ✗      | ○         | ?      | ?        | ?     |
| **Post Revisions**     | ✗        | ✗      | ○         | ?      | ?        | ?     |
| **Custom Post Types**  | ✗        | ✗      | ○         | ?      | ?        | ?     |
| **Webhooks**           | ✗        | ✗      | ○         | ?      | ?        | ?     |

### Notes:

- **WordPress**: Most advanced platform with extensive customization
- **Substack/Medium**: Limited customization options

---

## Analytics & Metrics

| Feature              | Substack | Medium | WordPress | Dev.to | Hashnode | Ghost |
| -------------------- | -------- | ------ | --------- | ------ | -------- | ----- |
| **View Count**       | ✗        | ○      | ○         | ?      | ?        | ?     |
| **Read Time**        | ✗        | ○      | ○         | ?      | ?        | ?     |
| **Engagement Stats** | ✗        | ○      | ○         | ?      | ?        | ?     |
| **Subscriber Count** | ✗        | ○      | ○         | ?      | ?        | ?     |
| **Analytics API**    | ✗        | ✗      | ○         | ?      | ?        | ?     |

### Notes:

- Analytics are generally not available via public APIs
- WordPress: Requires plugins (Jetpack, Google Analytics)

---

## Authentication Methods

| Feature                  | Substack | Medium | WordPress | Dev.to | Hashnode | Ghost |
| ------------------------ | -------- | ------ | --------- | ------ | -------- | ----- |
| **Cookie-based**         | ✓        | ✗      | ✗         | ✗      | ✗        | ✗     |
| **API Key/Token**        | ✗        | ○      | ✗         | ?      | ?        | ?     |
| **OAuth 2.0**            | ✗        | ✗      | ✗         | ?      | ?        | ?     |
| **Application Password** | ✗        | ✗      | ○         | ✗      | ✗        | ✗     |
| **JWT**                  | ✗        | ✗      | ○         | ?      | ?        | ?     |

### Notes:

- **Substack**: Unofficial API, uses session cookies
- **Medium**: Integration Token (self-issued)
- **WordPress**: Application Passwords (WordPress 5.6+)

---

## Platform-Specific Limitations

### Substack

- No official public API (using internal endpoints)
- Cannot set post visibility (free vs paid)
- Cannot add tags to posts
- Cannot schedule posts
- Cannot update or delete posts after creation
- Image upload not supported (URL references only)
- Cookie expires periodically (~30 days)

### Medium

- Official API archived (no longer maintained)
- Tag limit: 5 tags maximum (only first 3 used, max 25 chars each)
- Cannot update posts after publishing
- Cannot delete posts
- Cannot schedule posts
- Cannot retrieve post list via official API (use RSS feed or export)
- Limited content formatting (specific HTML tags only)
- No draft preview URL before publishing
- Image side-loading supported (Medium fetches external URLs)
- Content format: Markdown or HTML

### WordPress

- Requires Application Password feature (WordPress 5.6+)
- Requires HTTPS for Application Passwords
- Multi-site complexity (separate endpoints per site)
- Gutenberg blocks vs Classic Editor compatibility
- Plugin dependencies may affect API
- Full REST API with comprehensive features
- Pagination required for large datasets (100 posts max per request)
- Content stored as Gutenberg blocks (HTML with comments)

### Dev.to

- Research needed

### Hashnode

- Research needed

### Ghost

- Research needed

---

## Implementation Priority

Based on feature availability and demand:

### High Priority (v1.1.0)

1. Medium - Draft/Publish with tags
2. WordPress - Draft/Publish with Gutenberg blocks

### Medium Priority (v1.2.0)

1. Batch publishing for Medium/WordPress
2. Image upload for all platforms
3. Content synchronization (update posts)

### Low Priority (v1.3.0+)

1. Dev.to integration
2. Hashnode integration
3. Ghost integration
4. Advanced scheduling
5. Analytics dashboard

---

## Research Needed

The following platforms require API research:

- [ ] **Dev.to**: Authentication, post creation, features
- [ ] **Hashnode**: GraphQL API capabilities
- [ ] **Ghost**: Content API vs Admin API
- [ ] **LinkedIn Articles**: API availability and limitations
- [ ] **Blogger**: Google API requirements
- [ ] **Tumblr**: OAuth requirements

---

## Update History

| Date       | Platform         | Changes                                                     |
| ---------- | ---------------- | ----------------------------------------------------------- |
| 2026-02-02 | All              | Initial matrix created                                      |
|            | Substack         | Marked all v1.0.0 features as complete                      |
|            | Medium/WordPress | Updated with API research findings and detailed limitations |
|            | All              | Added "Import Posts" feature row                            |
|            |                  |                                                             |

---

## Contributing

When implementing new features:

1. Update this matrix with actual implementation status
2. Document any API limitations discovered
3. Add notes about workarounds or special considerations
4. Update the "Implementation Priority" section as needed

---

**Document maintained by**: Zander Catta Preta  
**Last updated**: 2026-02-02  
**Next review**: After each platform integration milestone
