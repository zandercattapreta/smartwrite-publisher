# SmartWrite Publisher - API Documentation

**Version**: 0.3.11 (Updated: January 30, 2026)

Technical documentation for developers who want to understand, modify, or extend SmartWrite Publisher.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Components](#core-components)
3. [Substack Service](#substack-service)
4. [Markdown Converter](#markdown-converter)
5. [UI Components](#ui-components)
6. [Data Flow](#data-flow)
7. [Platform Adapter Pattern](#platform-adapter-pattern)
8. [API Endpoints](#api-endpoints)
9. [Configuration](#configuration)
10. [Extension Guide](#extension-guide)

---

## Architecture Overview

### High-Level Structure

```
SmartWrite Publisher
├── Core Plugin (main.ts)
├── UI Layer (view.ts)
├── Services
│   ├── SubstackService
│   ├── SubstackClient
│   ├── SubstackPayloadBuilder
│   ├── SubstackErrorHandler
│   └── SubstackIdStrategy
├── Converters
│   └── MarkdownConverter
└── Types (types.ts)
```

### Design Principles

1. **Separation of Concerns**: Each module has single responsibility
2. **Strategy Pattern**: ID discovery, error handling
3. **Factory Pattern**: Payload building
4. **Adapter Pattern** (v0.4.0): Platform abstraction

---

## Core Components

### Main Plugin Class

**File**: `src/main.ts`

```typescript
export default class SmartWritePublisherPlugin extends Plugin {
    settings: SmartWriteSettings
    substackService: SubstackService
    logger: Logger

    async onload(): Promise<void>
    async onunload(): Promise<void>
    async loadSettings(): Promise<void>
    async saveSettings(): Promise<void>
}
```

**Responsibilities**:

- Plugin lifecycle management
- Settings persistence
- Service initialization
- View registration

**Key Methods**:

#### `onload()`

```typescript
async onload(): Promise<void> {
    await this.loadSettings();

    // Initialize services
    this.logger = new Logger();
    this.substackService = new SubstackService();

    // Register views
    this.registerView(
        VIEW_TYPE_PUBLISHER,
        (leaf) => new PublisherView(leaf, this)
    );

    // Add ribbon icon
    this.addRibbonIcon('broadcast', 'SmartWrite Publisher', () => {
        this.activateView();
    });

    // Register settings tab
    this.addSettingTab(new SettingTab(this.app, this));
}
```

#### `loadSettings()`

```typescript
async loadSettings(): Promise<void> {
    this.settings = Object.assign(
        {},
        DEFAULT_SETTINGS,
        await this.loadData()
    );
}
```

#### `saveSettings()`

```typescript
async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
}
```

---

### Settings Structure

**File**: `src/settings.ts`

```typescript
interface SmartWriteSettings {
    substackCookie: string // Authentication cookie
    substackUrl: string // Publication URL
    publisherId?: string // Publisher ID (auto-detected)
}

const DEFAULT_SETTINGS: SmartWriteSettings = {
    substackCookie: '',
    substackUrl: '',
    publisherId: undefined,
}
```

**Storage Location**:

```
.obsidian/plugins/smartwrite-publisher/data.json
```

---

## Substack Service

### Service Architecture

**File**: `src/substack/SubstackService.ts`

The SubstackService orchestrates all Substack operations:

```typescript
class SubstackService {
    private client: SubstackClient
    private payloadBuilder: SubstackPayloadBuilder
    private errorHandler: SubstackErrorHandler
    private idStrategy: SubstackIdStrategy

    constructor()
    configure(config: ConnectionConfig): void
    isConfigured(): boolean
    async testConnection(): Promise<boolean>
    async publishPost(post: PublishRequest): Promise<PublishResult>
}
```

### SubstackClient

**File**: `src/substack/SubstackClient.ts`

HTTP wrapper with correct headers:

```typescript
class SubstackClient {
    private cookie: string
    private hostname: string

    async request(
        endpoint: string,
        method: string,
        body?: any
    ): Promise<Response>
    async get(endpoint: string): Promise<any>
    async post(endpoint: string, body: any): Promise<any>
}
```

**Request Headers**:

```javascript
{
    'Content-Type': 'application/json',
    'Cookie': `connect.sid=${decodedCookie}`,
    'User-Agent': 'SmartWrite Publisher',
    'Accept': 'application/json'
}
```

**Cookie Normalization**:

```typescript
private normalizeCookie(cookie: string): string {
    // Remove 'substack.sid=' if present
    let cleaned = cookie.replace(/^substack\.sid=/, '');

    // Decode URL encoding (s%3A → s:)
    if (cleaned.startsWith('s%3A')) {
        cleaned = decodeURIComponent(cleaned);
    }

    return cleaned;
}
```

---

### SubstackPayloadBuilder

**File**: `src/substack/SubstackPayloadBuilder.ts`

Factory for API payloads:

```typescript
class SubstackPayloadBuilder {
    buildDraftPayload(post: PublishRequest): DraftPayload
    buildPublishPayload(post: PublishRequest): PublishPayload
    validatePayload(payload: any): boolean
}
```

**Draft Payload Structure**:

```typescript
interface DraftPayload {
    title: string
    subtitle?: string
    bodyJson: TiptapDocument | string // Tiptap JSON or plain markdown
    draft_bylines: Array<{ user_id?: number }>
    publication_id?: number
}
```

**Tiptap JSON Format**:

```typescript
interface TiptapDocument {
    type: 'doc'
    attrs?: any
    content: TiptapNode[]
}

interface TiptapNode {
    type: string // 'paragraph', 'heading', 'text', etc.
    attrs?: any
    content?: TiptapNode[]
    text?: string
    marks?: TiptapMark[]
}

interface TiptapMark {
    type: string // 'bold', 'italic', 'link', etc.
    attrs?: any
}
```

---

### SubstackIdStrategy

**File**: `src/substack/SubstackIdStrategy.ts`

Strategy pattern for ID discovery:

```typescript
interface IdDiscoveryStrategy {
    async discoverIds(client: SubstackClient): Promise<IdDiscoveryResult>
}

class SubstackIdStrategy implements IdDiscoveryStrategy {
    async discoverIds(client: SubstackClient): Promise<IdDiscoveryResult> {
        // Try multiple endpoints
        const strategies = [
            () => this.tryPublicationEndpoint(client),
            () => this.tryUserEndpoint(client),
            () => this.tryPostsEndpoint(client)
        ];

        for (const strategy of strategies) {
            const result = await strategy();
            if (result.success) return result;
        }

        return { success: false, publicationId: 0, userId: 0 };
    }
}
```

**Endpoints Tried**:

1. `/api/v1/publication` - Publication info
2. `/api/v1/user/self` - User info
3. `/api/v1/posts` - Posts list (fallback)

---

## Markdown Converter

**File**: `src/converter.ts`

Converts Obsidian markdown to HTML:

```typescript
class MarkdownConverter {
    convert(markdown: string, filename?: string): ConversionResult

    private extractTitle(markdown: string): string
    private extractSubtitle(markdown: string): string
    private convertToHtml(markdown: string): string
    private escapeHtml(text: string): string
}
```

### Conversion Result

```typescript
interface ConversionResult {
    title: string
    subtitle: string
    html: string
    wordCount: number
}
```

### Supported Markdown Features

**Headings**:

```markdown
# H1 → <h1>H1</h1>

## H2 → <h2>H2</h2>
```

**Text Formatting**:

```markdown
**bold** → <strong>bold</strong>
_italic_ → <em>italic</em>
~~strikethrough~~ → <del>strikethrough</del>
```

**Links**:

```markdown
[text](url) → <a href="url">text</a>
```

**Lists**:

```markdown
- Item → <ul><li>Item</li></ul>

1. Item → <ol><li>Item</li></ol>
```

**Code**:

````markdown
`inline` → <code>inline</code>

````code
block
``` → <pre><code>block</code></pre>
````
````

**Blockquotes**:

```markdown
> Quote → <blockquote>Quote</blockquote>
```

**Images**:

```markdown
![alt](url) → <img src="url" alt="alt">
```

---

## UI Components

### Publisher View

**File**: `src/view.ts`

Main sidebar view:

```typescript
class PublisherView extends ItemView {
    plugin: SmartWritePublisherPlugin
    substackService: SubstackService
    converter: MarkdownConverter
    publishBtns: HTMLButtonElement[]

    getViewType(): string
    getDisplayText(): string
    async onOpen(): Promise<void>
    async onClose(): Promise<void>

    // Publishing
    async handlePublish(isDraft: boolean): Promise<void>
    async handleBatchPublish(folderPath: string): Promise<void>

    // Modals
    async showFileSelectionModal(files: TFile[]): Promise<TFile[]>
    async showFolderBrowseModal(folders: string[]): Promise<string>
    async confirmBatchPublish(fileCount: number): Promise<boolean>
    showBatchResults(results: BatchResult[]): void

    // Helpers
    createDraftFromFile(file: TFile): Promise<PublishResult>
    setPublishButtonsState(disabled: boolean): void
    refreshLogs(): void
    sleep(ms: number): Promise<void>
}
```

### View Rendering

```typescript
async onOpen(): Promise<void> {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass('smartwrite-publisher-sidebar');

    // Header
    this.renderHeader(container);

    // Active Note Section
    this.renderActiveNoteSection(container);

    // Batch Publishing Section
    this.renderBatchSection(container);

    // Settings Section
    this.renderSettingsSection(container);

    // Logs Section
    this.renderLogsSection(container);
}
```

---

## Data Flow

### Single Note Publishing

```
User clicks "Publish"
    ↓
view.ts: handlePublish(isDraft)
    ↓
Get active file
    ↓
Read file content
    ↓
converter.ts: convert(markdown)
    ├─ Extract title
    ├─ Extract subtitle
    └─ Convert to HTML
    ↓
SubstackService.publishPost({
    title, subtitle, html, isDraft
})
    ↓
SubstackPayloadBuilder.buildPayload()
    ↓
SubstackClient.post('/api/v1/drafts')
    ↓
Success → Show notice
Error → Log error
```

### Batch Publishing

```
User selects folder
    ↓
view.ts: handleBatchPublish(folder)
    ↓
Get all .md files in folder
    ↓
Show file selection modal
    ↓
User selects files
    ↓
For each selected file:
    ├─ Read file
    ├─ Convert markdown
    ├─ Publish as draft
    ├─ Sleep 1.5s (rate limiting)
    └─ Track result
    ↓
Show results modal
```

---

## Platform Adapter Pattern

**Coming in v0.4.0**

### Interface Definition

```typescript
interface BlogPlatformAdapter {
    // Metadata
    name: string
    displayName: string
    icon: string

    // Authentication
    authenticate(credentials: any): Promise<boolean>
    testConnection(): Promise<boolean>
    isAuthenticated(): boolean

    // Publishing
    createDraft(post: UniversalPost): Promise<DraftResult>
    publishPost(post: UniversalPost): Promise<PublishResult>
    updatePost(postId: string, post: UniversalPost): Promise<UpdateResult>
    deletePost(postId: string): Promise<boolean>

    // Platform-specific
    getPlatformCapabilities(): PlatformCapabilities
    mapUniversalPost(post: UniversalPost): any
}
```

### Universal Post Format

```typescript
interface UniversalPost {
    // Core fields (all platforms)
    title: string
    subtitle?: string
    content: string // Markdown source
    contentHtml?: string // HTML version

    // Metadata
    tags?: string[]
    category?: string
    author?: string
    publishDate?: Date

    // Platform-specific
    metadata?: Record<string, any>
}
```

### Substack Adapter Example

```typescript
class SubstackAdapter implements BlogPlatformAdapter {
    name = 'substack'
    displayName = 'Substack'
    icon = '📰'

    private service: SubstackService

    async authenticate(credentials: SubstackCredentials): Promise<boolean> {
        this.service.configure({
            cookie: credentials.cookie,
            hostname: credentials.url,
        })
        return await this.service.testConnection()
    }

    async createDraft(post: UniversalPost): Promise<DraftResult> {
        const mapped = this.mapUniversalPost(post)
        return await this.service.publishPost({
            ...mapped,
            isDraft: true,
        })
    }

    mapUniversalPost(post: UniversalPost): SubstackPost {
        return {
            title: post.title,
            subtitle: post.subtitle || '',
            bodyHtml: post.contentHtml || post.content,
            // Substack doesn't support tags in API
        }
    }

    getPlatformCapabilities(): PlatformCapabilities {
        return {
            supportsTags: false,
            supportsCategories: false,
            supportsScheduling: false,
            supportsDrafts: true,
            supportsUpdate: false,
            supportsDelete: false,
        }
    }
}
```

---

## API Endpoints

### Substack API (Unofficial)

**Base URL**: `https://{hostname}`

**Authentication**: Cookie-based (`connect.sid`)

#### Get Publication Info

```
GET /api/v1/publication

Response:
{
    "id": 7678831,
    "name": "The Breach RPG",
    "subdomain": "thebreachrpg",
    "author_name": "Zander",
    ...
}
```

#### Create Draft

```
POST /api/v1/drafts?publication_id={id}

Headers:
    Content-Type: application/json
    Cookie: connect.sid={cookie}

Body:
{
    "title": "Post Title",
    "subtitle": "Optional subtitle",
    "bodyJson": "<html>...</html>" or TiptapDocument,
    "draft_bylines": [{ "user_id": 123 }]
}

Response:
{
    "id": 123456,
    "title": "Post Title",
    "post_date": "2026-01-30T...",
    "word_count": 500,
    ...
}
```

#### Publish Post

```
Same as draft creation, but with additional step
in Substack dashboard (API limitation)
```

### API Limitations

**Substack API does NOT support**:

- ❌ Scheduled publishing (`publish_at` field ignored)
- ❌ Post tags (`tags` field ignored)
- ❌ Audience selection (`audience` field ignored)
- ❌ Comment settings (`write_comment_permissions` ignored)
- ❌ Email sending control (`should_send_email` ignored)
- ❌ Free preview limit (`post_preview_limit` ignored)

See `_ docs/API_INVESTIGATION_*.md` for detailed testing.

---

## Configuration

### Plugin Settings

Stored in `data.json`:

```json
{
    "substackCookie": "s:eyJhbGc...",
    "substackUrl": "publication.substack.com",
    "publisherId": "7678831"
}
```

### Environment Variables

None currently. All configuration through Obsidian settings.

---

## Extension Guide

### Adding a New Platform Adapter (v0.4.0)

1. **Create Adapter File**:

```typescript
// src/adapters/MediumAdapter.ts
export class MediumAdapter implements BlogPlatformAdapter {
    name = 'medium'
    displayName = 'Medium'

    // Implement all interface methods
}
```

2. **Register in Platform Manager**:

```typescript
// src/core/PlatformManager.ts
platformManager.register(new MediumAdapter())
```

3. **Add Settings UI**:

```typescript
// src/settings.ts
// Add Medium-specific settings fields
```

4. **Update UI**:

```typescript
// src/view.ts
// Add Medium checkbox in platform selection
```

5. **Test**:

- Authentication
- Draft creation
- Error handling

### Adding a New Converter Feature

Example: Add support for tables

```typescript
// src/converter.ts
private convertToHtml(markdown: string): string {
    let html = markdown;

    // Existing conversions...

    // Add table support
    html = this.convertTables(html);

    return html;
}

private convertTables(markdown: string): string {
    // Implement table parsing
    const tableRegex = /\|(.+)\|/g;
    return markdown.replace(tableRegex, (match) => {
        // Convert markdown table to HTML table
        return `<table>${this.parseTableRows(match)}</table>`;
    });
}
```

---

## Testing

### Manual Testing Checklist

**Publishing**:

- [ ] Single note as draft
- [ ] Single note live
- [ ] Batch publishing (5 files)
- [ ] Batch publishing (20 files)
- [ ] Error handling (invalid note)
- [ ] Progress indicators
- [ ] Results modal

**UI**:

- [ ] File selection modal
- [ ] Folder browse modal
- [ ] Sort functionality
- [ ] Select all/unselect all
- [ ] System logs

**Configuration**:

- [ ] Cookie authentication
- [ ] Test connection
- [ ] Settings persistence

### Test Data

**Sample Note**:

```markdown
# Test Post Title

This is a test subtitle.

## Introduction

This is test content with **bold** and _italic_ text.

- Bullet point 1
- Bullet point 2

## Conclusion

[Link test](https://example.com)
```

**Expected Result**:

- Title: "Test Post Title"
- Subtitle: "This is a test subtitle."
- HTML with proper formatting
- Word count > 0

---

## Performance Optimization

### Current Performance

- **Markdown conversion**: ~10ms per note
- **HTTP request**: ~500-1000ms
- **Batch publishing**: ~1.5s per file

### Optimization Opportunities

1. **Caching**: Cache converted HTML
2. **Parallel requests**: Publish multiple files concurrently (with rate limiting)
3. **Lazy loading**: Don't build UI until sidebar opened

---

## Error Handling

### Error Types

```typescript
enum ErrorType {
    NETWORK_ERROR,
    AUTHENTICATION_ERROR,
    VALIDATION_ERROR,
    RATE_LIMIT_ERROR,
    UNKNOWN_ERROR,
}
```

### Error Handling Pattern

```typescript
try {
    const result = await substackService.publishPost(post)
    if (result.success) {
        logger.log(`✓ Success: ${result.postUrl}`)
    } else {
        logger.log(`✗ Failed: ${result.error}`, 'ERROR')
    }
} catch (error) {
    const errorMsg = error?.message || String(error)
    logger.log(`✗ Exception: ${errorMsg}`, 'ERROR')
}
```

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for:

- Code style guidelines
- Pull request process
- Testing requirements
- Documentation standards

---

## Version History

**v0.3.11** (Current):

- File sorting
- Enhanced file selection
- Batch publishing
- Refactored Substack service

**v0.4.0** (Planned):

- Multi-platform support
- Platform adapter pattern
- GUI installer
- Performance optimizations

See [CHANGELOG.md](../CHANGELOG.md) for complete history.

---

**Last Updated**: January 30, 2026
**Document Version**: 1.0
**Plugin Version**: 0.3.11

For user documentation, see [USER_GUIDE.md](./USER_GUIDE.md).
