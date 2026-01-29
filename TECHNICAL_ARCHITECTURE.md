# SmartWrite Publisher - Technical Architecture

**Version**: 0.3.0
**Last Updated**: 29 de janeiro de 2026, 12:47 UTC
**Architecture Pattern**: Modular Service-Based Design

---

## 🏗️ Architecture Overview

SmartWrite Publisher follows a **modular, service-based architecture** with clear separation of concerns. Each component has a single responsibility and can be tested independently.

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Obsidian Plugin Context                                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐       ┌──────────────┐                   │
│  │   View       │       │  Settings    │  (UI Layer)       │
│  │  (view.ts)   │       │  (modal.ts)  │                   │
│  └──────┬───────┘       └──────┬───────┘                   │
│         │                      │                            │
│         │    ┌─────────────────┴────────┐                  │
│         │    │                          │                  │
│         ▼    ▼                          ▼                  │
│    ┌──────────────────────────────────────────┐           │
│    │  SmartWritePublisher (main.ts)           │           │
│    │  - Coordinates plugins & services        │ (Main)    │
│    │  - Manages settings & logger             │           │
│    └─────────┬──────────────────┬─────────────┘           │
│              │                  │                          │
│    ┌─────────▼──┐      ┌────────▼──────┐                 │
│    │  Converter  │      │ SubstackService│(Business Logic)│
│    │ converter.ts│      │  Main Orchestor│                │
│    │             │      └────┬───┬───┬──┘                 │
│    │ • MD→HTML   │           │   │  └──────────┬───┐     │
│    │ • YAML      │           │   │             │   │     │
│    │ • Callouts  │      ┌────▼─┐ │ ┌──────┐ ┌─▼──▼──┐   │
│    │             │      │HTTP  │ │ │Payload│ │Error │   │
│    │             │      │Client│ │ │Builder│ │Handler│  │
│    │             │      └──────┘ │ └──────┘ └──────┘   │
│    │             │               │                      │
│    │             │         ┌─────▼──────────┐          │
│    │             │         │  IdStrategy    │          │
│    │             │         │  Manager       │          │
│    │             │         │  - Multiple    │          │
│    │             │         │    strategies  │          │
│    │             │         └────────────────┘          │
│    └─────────────┘                                      │
│              ▲                                           │
│              │ (Substack REST API)                       │
│              ▼                                           │
│         ┌──────────────────────────────────────────┐   │
│         │  External: Substack API (HTTPS)          │   │
│         │  - /api/v1/drafts                         │   │
│         │  - /api/v1/posts                          │   │
│         │  - /api/v1/user/self                      │   │
│         │  - /api/v1/publications/{id}              │   │
│         └──────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Component Details

### 1. View Layer (`src/view.ts`)

**Responsibility**: UI rendering and user interaction

```typescript
class PublisherView extends ItemView {
  // Properties
  substackService: SubstackService
  converter: MarkdownConverter

  // Main sections
  - Active Note Display
  - Publish Buttons (Draft, Live, Schedule)
  - Batch Publishing (disabled Phase 3)
  - Quick Settings (Cookie, URL)
  - System Logs (copy/clear)

  // Key methods
  onOpen()                    // Initialize view
  configureService(config)    // Setup with credentials
  render()                    // Render UI
  handlePublish(isDraft)      // Publish workflow
  updateConnectionStatus()    // Visual indicator
  refreshLogs()               // Update log display
}
```

**Key Features**:
- Dynamic element references for optimization
- Real-time connection status indicator
- Log console with copy/clear
- Proper state management (isConnected, isPublishing)

**Integration Points**:
- Uses `SubstackService` for API calls
- Uses `MarkdownConverter` for HTML generation
- Uses `Logger` for event tracking

---

### 2. Converter (`src/converter.ts`)

**Responsibility**: Markdown → HTML transformation with Obsidian support

```typescript
class MarkdownConverter {
  convert(markdown: string, filename: string): ConvertedContent {
    // 1. Parse YAML frontmatter
    // 2. Extract title & subtitle
    // 3. Convert Markdown to HTML
    // 4. Handle Obsidian callouts
    // 5. Escape HTML for XSS prevention

    return {
      title: string
      subtitle: string
      html: string
      tags: string[]
    }
  }
}
```

**Supported Elements**:
- Headings (H1-H6)
- Bold, Italic, Strikethrough
- Lists (ordered, unordered, nested)
- Code blocks (inline & block)
- Blockquotes
- Horizontal rules
- Obsidian callouts (info, warning, danger, success, note)
- Links and images
- Tables (basic)

**Security**:
- XSS prevention through HTML escaping
- Safe innerHTML handling
- Content validation before processing

---

### 3. Logger (`src/logger.ts`)

**Responsibility**: Centralized event logging and diagnostics

```typescript
class Logger {
  log(message: string, level?: 'INFO' | 'WARN' | 'ERROR'): void
  getFormattedLogs(): string
  getLogs(): LogEntry[]
  clear(): void
}

interface LogEntry {
  timestamp: string
  level: string
  message: string
}
```

**Integration**: Used across all components for audit trail

---

### 4. Main Plugin (`src/main.ts`)

**Responsibility**: Plugin lifecycle and coordination

```typescript
class SmartWritePublisher extends Plugin {
  // Lifecycle
  onload()              // Initialize plugin
  onunload()            // Cleanup

  // Properties
  substackService: SubstackService
  logger: Logger
  settings: PluginSettings

  // Methods
  loadSettings()        // Load from disk
  saveSettings()        // Save to disk
  testConnection()      // Verify API
  registerView()        // Add sidebar
  setupCommands()       // Add commands
}
```

**Responsibilities**:
- Plugin initialization
- Settings persistence
- Service coordination
- View registration

---

### 5. SubstackService (`src/substack/SubstackService.ts`)

**Responsibility**: Main orchestrator for Substack integration

```typescript
class SubstackService {
  // Configuration
  configure(config: ConnectionConfig): void
  isConfigured(): boolean

  // Connection testing
  testConnection(): Promise<TestResult>

  // Publishing
  publishPost(options: PublishOptions): Promise<PublishResult>
  publishDraft(draftId: number): Promise<PublishResult>

  // Private orchestration
  private getPublicationId(): Promise<number>
  private detectUserInfo(): Promise<SubstackUserInfo>
}
```

**Key Pattern**: Orchestrator using composition (not inheritance)

```typescript
constructor(logger: Logger) {
  this.logger = logger;
  // Components lazy-initialized in configure()
  this.client = new SubstackClient(...)
  this.payloadBuilder = new PayloadBuilder(...)
  this.errorHandler = new ErrorHandler(...)
  this.idManager = new IdStrategyManager(...)
}
```

**Error Handling**: Delegates to ErrorHandler
**Payload Creation**: Delegates to PayloadBuilder
**HTTP Calls**: Delegates to SubstackClient
**ID Discovery**: Delegates to IdStrategyManager

---

### 6. SubstackClient (`src/substack/SubstackClient.ts`)

**Responsibility**: HTTP communication with centralized header management

```typescript
class SubstackClient {
  private baseUrl: string
  private cookie: string

  async get(endpoint: string): Promise<HttpResponse>
  async post(endpoint: string, body: any): Promise<HttpResponse>

  private getHeaders(): Record<string, string> {
    return {
      'Cookie': `connect.sid=${this.cookie}`,
      'Content-Type': 'application/json'
    };
  }
}
```

**Critical Fix in v0.3.0**:
```typescript
// ❌ Before (v0.2.6.10):
const cookie = `substack.sid=${...}`  // WRONG!
const headers = { /* missing Content-Type */ }

// ✅ After (v0.3.0):
'Cookie': `connect.sid=${this.cookie}`,
'Content-Type': 'application/json'
```

**Features**:
- Centralized header management
- Response validation before JSON access
- Error handling delegation
- Request logging

---

### 7. PayloadBuilder (`src/substack/SubstackPayloadBuilder.ts`)

**Responsibility**: Single factory for consistent payload construction

```typescript
class PayloadBuilder {
  buildDraftPayload(
    options: PublishOptions,
    user: SubstackUserInfo
  ): DraftPayload {
    // Ensures consistent structure
    // draft_bylines ALWAYS present
    // Empty fields properly handled

    return {
      draft_title: options.title,
      draft_body: options.bodyHtml,
      draft_bylines: user.id ? [{ user_id: user.id }] : [],
      draft_subtitle: options.subtitle || undefined,
      type: 'newsletter',
      audience: 'everyone'
    };
  }
}
```

**Critical Fix in v0.3.0**:
```typescript
// ❌ Before (v0.2.6):
// Payload created in 2 places (lines 377-386 and 434-444)
// Inconsistent draft_bylines handling

// ✅ After (v0.3.0):
// Single source of truth
// draft_bylines ALWAYS present
// Validated before return
```

---

### 8. ErrorHandler (`src/substack/SubstackErrorHandler.ts`)

**Responsibility**: Intelligent error analysis and recovery suggestions

```typescript
class ErrorHandler {
  handle(
    response: HttpResponse,
    context: string
  ): SubstackError | null {
    if (response.status === 400) {
      return new SubstackError(
        "Payload inválido",
        400,
        false,  // not retryable
        "Verifique campos obrigatórios: draft_bylines, draft_title, draft_body"
      );
    }
    if (response.status === 401) {
      return new SubstackError(
        "Cookie expirado",
        401,
        true,   // retryable with new cookie
        "Capture novo cookie do browser"
      );
    }
    // ... more specific handling
  }
}
```

**Error Types**:
- `400`: Payload validation error (not retryable)
- `401`: Authentication expired (retryable)
- `403`: Permission denied (not retryable)
- `404`: Endpoint not found (strategy should change)
- `500`: Server error (retryable)

**Critical Fix in v0.3.0**:
```typescript
// ❌ Before (v0.2.6):
return { success: true, error: 'Erro 400' };  // Confusing!

// ✅ After (v0.3.0):
throw new SubstackError({
  message: "Clear error description",
  status: 400,
  retryable: false,
  suggestion: "Actionable fix"
});
```

---

### 9. IdStrategy (`src/substack/SubstackIdStrategy.ts`)

**Responsibility**: Flexible, strategy-based publication ID discovery

```typescript
interface IdStrategy {
  execute(): Promise<IdStrategyResult>
}

class PublicationEndpointStrategy implements IdStrategy {
  // Try: GET /api/v1/publications/{hostname}
  // Extract: data.id
}

class ArchiveStrategy implements IdStrategy {
  // Try: GET /api/v1/archive?limit=1
  // Extract: publications[0].id
}

class UserSelfStrategy implements IdStrategy {
  // Try: GET /api/v1/user/self
  // Extract: publications[0].id
}

class IdStrategyManager {
  async findPublicationId(
    strategies: IdStrategy[]
  ): Promise<number | null> {
    for (const strategy of strategies) {
      const result = await strategy.execute();
      if (result.success) return result.id;
    }
    return null;
  }
}
```

**Critical Fix in v0.3.0**:
```typescript
// ❌ Before (v0.2.6):
// 6 nested conditionals in main service (lines 319-336)
// Hard to maintain, hard to test

// ✅ After (v0.3.0):
// Each strategy is independent
// Easy to add new strategies
// Easy to test each strategy
// Clear order of precedence
```

---

### 10. Types (`src/substack/types.ts`)

**Responsibility**: Centralized TypeScript interfaces

```typescript
interface ConnectionConfig {
  cookie: string
  substackUrl: string
}

interface PublishOptions {
  title: string
  subtitle?: string
  bodyHtml: string
  isDraft?: boolean
}

interface DraftPayload {
  draft_title: string
  draft_body: string
  draft_bylines: Array<{ user_id: number }>
  draft_subtitle?: string
  type: 'newsletter'
  audience: 'everyone'
}

interface SubstackError extends Error {
  status: number
  retryable: boolean
  suggestion: string
}

// ... more interfaces
```

---

## 🔄 Data Flow: Publishing a Draft

### Sequence Diagram

```
User                View            Converter       SubstackService
  │                  │                  │                  │
  ├─ Click "Draft" ─>│                  │                  │
  │                  │                  │                  │
  │                  ├─ getFile ──────>│                  │
  │                  │                  │                  │
  │                  │<─ HTML ─────────┤                  │
  │                  │                  │                  │
  │                  ├─ publishPost ───────────────────>│
  │                  │                  │                  │
  │                  │                  │   getPublicationId
  │                  │                  │   (IdStrategyManager)
  │                  │                  │     │
  │                  │                  │     ├─ Try PublicationEndpointStrategy
  │                  │                  │     ├─ Try ArchiveStrategy
  │                  │                  │     └─ Try UserSelfStrategy
  │                  │                  │   <─ ID ─
  │                  │                  │                  │
  │                  │                  │   buildDraftPayload
  │                  │                  │   (PayloadBuilder)
  │                  │                  │   <─ Payload ─
  │                  │                  │                  │
  │                  │                  │   POST /api/v1/drafts
  │                  │                  │   (SubstackClient)
  │                  │                  │     │
  │                  │                  │     ├─ setHeaders (CORRECT!)
  │                  │                  │     ├─ setBody (JSON)
  │                  │                  │     └─ makeRequest
  │                  │                  │   <─ Response ─
  │                  │                  │                  │
  │                  │                  │   handle errors
  │                  │                  │   (ErrorHandler)
  │                  │                  │   <─ Result ─
  │                  │<─ Success ───────────────────────┤
  │                  │                  │                  │
  │<─ Notification ──│                  │                  │
  │                  ├─ updateStatus    │                  │
  │                  │                  │                  │
  │                  ├─ refreshLogs     │                  │
  │                  │                  │                  │
```

### Code Flow

```typescript
// 1. View calls service
const result = await this.substackService.publishPost({
  title: converted.title,
  subtitle: converted.subtitle,
  bodyHtml: converted.html,
  isDraft: true
});

// 2. Service orchestrates
publishPost(options) {
  // Get pub ID
  const pubId = await this.getPublicationId()

  // Build payload
  const payload = this.payloadBuilder.buildDraftPayload(options, user)

  // Make request
  const response = await this.client.post(`/api/v1/drafts`, payload)

  // Handle errors
  if (!response.ok) {
    const error = this.errorHandler.handle(response, 'draft creation')
    return { success: false, error: error.message }
  }

  return { success: true, postUrl: response.data.post_url }
}

// 3. Each component does one thing
// SubstackClient: HTTP only
// PayloadBuilder: Payload structure only
// ErrorHandler: Error analysis only
// IdStrategyManager: ID discovery only
```

---

## 🔒 Security Considerations

### Cookie Handling
- ✅ Normalized on input (strip prefixes)
- ✅ Stored as `connect.sid` (correct name)
- ✅ Never logged in full
- ✅ Timeout handling for expired cookies

### XSS Prevention
- ✅ HTML escaping in converter
- ✅ textContent instead of innerHTML
- ✅ No eval() or Function()
- ✅ Safe template literals

### API Communication
- ✅ HTTPS only (enforced by Obsidian requestUrl)
- ✅ Request validation before send
- ✅ Response validation before use
- ✅ Error details without sensitive info leakage

---

## 🧪 Testing Strategy

### Unit Testing (v0.4.0+)
```typescript
// Each component tested independently
describe('SubstackClient', () => {
  it('sets correct headers', () => {
    const client = new SubstackClient(...)
    const headers = client['getHeaders']()

    expect(headers['Cookie']).toBe('connect.sid=...')
    expect(headers['Content-Type']).toBe('application/json')
  })
})

describe('PayloadBuilder', () => {
  it('always includes draft_bylines', () => {
    const payload = builder.buildDraftPayload(options, user)

    expect(payload.draft_bylines).toBeDefined()
    expect(Array.isArray(payload.draft_bylines)).toBe(true)
  })
})
```

### Integration Testing (v0.4.0+)
- Mock Substack API
- Test full publish workflow
- Verify error handling
- Validate edge cases

### E2E Testing (v0.4.0+)
- Real Obsidian vault
- Real test file
- Real Substack account
- Monitor all workflows

---

## 📈 Performance Characteristics

### Time Complexity
- Draft creation: O(3) - 3 API calls (ID + publish + verify)
- Batch creation: O(n) - n drafts = n API calls

### Space Complexity
- Per request: O(1) - constant memory
- Logs: O(n) - n log entries

### Network I/O
- Connection test: 1 request
- Draft creation: 3 requests (ID detection + publish)
- Optimization potential: Cache ID per session

---

## 🚀 Performance Optimization (Future)

### Caching Strategy (v0.5.0)
```typescript
class SubstackService {
  private publicationIdCache?: number
  private cacheTimestamp?: number
  private readonly CACHE_TTL = 3600000 // 1 hour

  private getPublicationId(): Promise<number> {
    if (this.isCacheValid()) {
      return this.publicationIdCache
    }
    // Fetch and cache
  }
}
```

### Request Batching (v0.5.0+)
- Queue multiple publish requests
- Batch execute with rate limiting
- Reduce API call overhead

---

## 📚 Module Exports

### Main Export (`src/substack/index.ts`)
```typescript
export { SubstackService, type ConnectionConfig }
export { SubstackClient }
export { ErrorHandler }
export { PayloadBuilder }
export { IdStrategyManager }
export * from './types'
```

---

## 🔄 Dependency Graph

```
view.ts
  ├─ SubstackService
  │  ├─ SubstackClient
  │  ├─ PayloadBuilder
  │  ├─ ErrorHandler
  │  ├─ IdStrategyManager
  │  └─ Logger
  │
  ├─ MarkdownConverter
  │
  ├─ Logger
  │
  └─ Obsidian API

main.ts
  ├─ SubstackService
  ├─ Logger
  ├─ PublisherView
  ├─ SmartWriteSettingTab
  └─ Obsidian API
```

---

## 📝 Development Guidelines

### Adding a New Feature
1. Define types in `types.ts`
2. Create component if needed (SRP)
3. Use dependency injection
4. Log all operations
5. Handle errors explicitly
6. Document with comments
7. Update CHANGELOG.md

### Debugging Workflow
1. Enable logs in sidebar
2. Capture full error messages
3. Review API requests in network panel
4. Test with mock data
5. Verify type safety

---

## 🎯 Future Improvements

### Architecture
- [ ] Reactive state management (RxJS)
- [ ] Event-driven architecture
- [ ] Plugin configuration system
- [ ] Middleware chain for requests

### Features
- [ ] Webhook support
- [ ] Custom templates
- [ ] Multi-publication support
- [ ] Analytics dashboard

### Quality
- [ ] 80% test coverage
- [ ] Performance profiling
- [ ] Memory leak detection
- [ ] Accessibility audit

---

**Document Version**: 1.0
**Last Updated**: 29 de janeiro de 2026, 12:47 UTC
**Author**: Zander Catta Preta
**Status**: ✅ v0.3.0 Stable
