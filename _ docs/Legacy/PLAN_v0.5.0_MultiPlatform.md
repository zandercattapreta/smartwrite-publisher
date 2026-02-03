# Plan: v0.5.0 - Multi-Platform Publishing

**Date**: 2026-01-30
**Status**: 📋 Backlog
**Priority**: Future

---

## 🎯 Vision for v0.5.0

**Goal**: Extend SmartWrite Publisher to support multiple blogging platforms simultaneously

**Current State**:
- ✅ Substack integration working (v1.0.0 - lançamento oficial)
- ✅ Draft creation, batch publishing, file selection
- ✅ Solid UI/UX foundation
- ✅ Repositório refatorado para estrutura monorepo

**Future State**:
- 🎯 Publish to multiple platforms from a single source
- 🎯 Platform-specific formatting adapters
- 🎯 Unified publishing workflow

---

## 🌐 Target Platforms (Potential)

### Tier 1 - Priority Platforms
- **Substack** (✅ Already implemented)
- **Medium** - API available, popular platform
- **WordPress** - REST API, widely used
- **Ghost** - Modern API, good documentation
- **Dev.to** - Developer-focused, simple API

### Tier 2 - Secondary Platforms
- **Hashnode** - Developer blogging platform
- **Blogger** - Google's platform
- **Tumblr** - API available
- **LinkedIn Articles** - Professional network

### Tier 3 - Consideration
- **Custom platforms** - User-defined endpoints
- **Static site generators** - Export to Markdown/HTML

---

## 🏗️ Architecture Design

### Challenge: Platform-Specific Packaging

Each platform has different:
- **Authentication methods** (API keys, OAuth, cookies)
- **Content formats** (HTML, Markdown, JSON, XML)
- **Field requirements** (title, subtitle, tags, categories)
- **API structures** (REST, GraphQL, custom)
- **Rate limits** (requests per minute/hour)

### Proposed Solution: Adapter Pattern

```typescript
// Core abstraction
interface BlogPlatformAdapter {
  name: string;
  authenticate(credentials: any): Promise<boolean>;
  publish(post: UniversalPost, options: PublishOptions): Promise<PublishResult>;
  createDraft(post: UniversalPost): Promise<DraftResult>;
  testConnection(): Promise<boolean>;
}

// Universal post format
interface UniversalPost {
  title: string;
  subtitle?: string;
  content: string;          // Markdown source
  contentHtml?: string;      // HTML version
  tags?: string[];
  category?: string;
  author?: string;
  metadata?: Record<string, any>;
}

// Platform-specific adapters
class SubstackAdapter implements BlogPlatformAdapter { /* ... */ }
class MediumAdapter implements BlogPlatformAdapter { /* ... */ }
class WordPressAdapter implements BlogPlatformAdapter { /* ... */ }
```

---

## 📋 Implementation Phases

### Phase 1: Architecture Refactoring (2-3 sessions)
**Goal**: Prepare current code for multi-platform support

**Tasks**:
1. Extract Substack-specific code into `SubstackAdapter`
2. Create `BlogPlatformAdapter` interface
3. Build `UniversalPost` abstraction
4. Create `PlatformManager` to handle multiple platforms
5. Refactor UI to be platform-agnostic

**Success Criteria**:
- Current Substack functionality unchanged
- Code prepared for new platforms
- Clean separation of concerns

---

### Phase 2: Second Platform Integration (3-4 sessions)
**Goal**: Prove multi-platform architecture with a second platform

**Recommended**: Medium or WordPress (good APIs, popular)

**Tasks**:
1. Research platform API
2. Implement adapter
3. Add authentication UI
4. Test publishing workflow
5. Handle platform-specific features

**Success Criteria**:
- Publish to 2 platforms successfully
- UI supports platform selection
- Error handling for both platforms

---

### Phase 3: Batch Multi-Platform Publishing (2-3 sessions)
**Goal**: Publish same content to multiple platforms simultaneously

**Features**:
- **Platform Selection**: Checkboxes for each configured platform
- **Platform-Specific Options**: Per-platform settings (tags, categories)
- **Parallel Publishing**: Async publishing to all selected platforms
- **Results Dashboard**: Show success/failure per platform
- **Conflict Resolution**: Handle platform-specific requirements

**UI Mock**:
```
┌─────────────────────────────────────────┐
│ Publish To:                             │
│ ☑ Substack                              │
│ ☑ Medium                                │
│ ☐ WordPress                             │
│                                         │
│ [Publish to Selected Platforms]        │
└─────────────────────────────────────────┘
```

---

### Phase 4: Platform-Specific Features (2-3 sessions)
**Goal**: Support unique features per platform

**Examples**:
- Medium: Publication selection, canonical URLs
- WordPress: Categories, featured images
- Dev.to: Series, organization posting
- Substack: Newsletter sending (if API supports)

**Implementation**:
- Optional fields per platform
- Platform-specific UI panels
- Intelligent defaults

---

### Phase 5: Advanced Features (3-4 sessions)
**Goal**: Power user features

**Features**:
- **Cross-posting Rules**: "Always publish to Substack + Medium"
- **Platform Profiles**: Save different settings per platform
- **Content Transformations**: Platform-specific formatting adjustments
- **Scheduling**: If platforms support it
- **Analytics**: Track which platforms perform best
- **Template System**: Different templates for different platforms

---

## 🎨 UI/UX Considerations

### Settings Panel Updates
```
┌─────────────────────────────────────────┐
│ Platform Configurations                 │
│                                         │
│ ► Substack                              │
│   Cookie: [************]                │
│   URL: thebreachrpg.substack.com        │
│   Status: ✓ Connected                   │
│                                         │
│ ► Medium                                │
│   API Token: [************]             │
│   User ID: @username                    │
│   Status: ✓ Connected                   │
│                                         │
│ ► WordPress                             │
│   Site URL: [mysite.wordpress.com]      │
│   Username: [username]                  │
│   App Password: [************]          │
│   Status: ✗ Not configured              │
│                                         │
│ [+ Add Platform]                        │
└─────────────────────────────────────────┘
```

### Publishing Section Updates
```
┌─────────────────────────────────────────┐
│ Active Note: "My Blog Post"             │
│                                         │
│ Publish to:                             │
│ ☑ Substack (as draft)                   │
│ ☑ Medium (public)                       │
│ ☐ WordPress (draft)                     │
│                                         │
│ [Publish to Selected]                   │
└─────────────────────────────────────────┘
```

---

## 🧪 Testing Strategy

### Unit Tests
- Each adapter tested independently
- Universal post conversion tests
- Error handling tests

### Integration Tests
- Multi-platform publishing
- Batch operations
- Error recovery

### Manual Testing
- Real accounts on each platform
- Test posts validation
- UI flow testing

---

## 📊 Success Metrics

### v0.5.0 Release Criteria
- ✅ At least 3 platforms supported (Substack + 2 others)
- ✅ Batch multi-platform publishing works
- ✅ UI supports platform selection
- ✅ Error handling per platform
- ✅ Documentation for each platform
- ✅ User guide updated

### Quality Metrics
- Zero regressions in Substack functionality
- <5% error rate in multi-platform publishing
- All platforms have working authentication
- Clean, maintainable adapter code

---

## 📝 Documentation Requirements

### User Documentation
- "How to connect [Platform]" guides
- Multi-platform publishing tutorial
- Troubleshooting per platform
- FAQ updates

### Developer Documentation
- Adapter pattern explanation
- How to add new platforms
- API structure documentation
- Contributing guide for new adapters

---

## ⚠️ Risks & Mitigation

### Risk 1: Platform API Changes
**Impact**: High
**Mitigation**:
- Version-specific adapters
- API change monitoring
- Graceful degradation

### Risk 2: Authentication Complexity
**Impact**: Medium
**Mitigation**:
- OAuth library integration
- Secure credential storage
- Clear setup instructions

### Risk 3: Rate Limiting
**Impact**: Medium
**Mitigation**:
- Per-platform rate limit tracking
- Queuing system
- User warnings

### Risk 4: Platform-Specific Bugs
**Impact**: Low
**Mitigation**:
- Comprehensive testing
- Platform-specific error logs
- Quick rollback capability

---

## 🚀 Future Possibilities

Beyond v0.5.0:
- **Analytics Dashboard**: Compare performance across platforms
- **Content Sync**: Keep posts updated across platforms
- **A/B Testing**: Different titles/content per platform
- **Automated Cross-posting**: Rules-based publishing
- **Platform Templates**: Pre-configured platform combos
- **Image Optimization**: Platform-specific image handling

---

## 📅 Estimated Timeline

**Total**: 12-15 sessions (3-4 weeks)

- Phase 1: 2-3 sessions
- Phase 2: 3-4 sessions
- Phase 3: 2-3 sessions
- Phase 4: 2-3 sessions
- Phase 5: 3-4 sessions

**Dependencies**:
- v1.0.0 completion (lançamento oficial)
- Platform API research
- User feedback on platform priorities

---

## 📌 Notes

- This is a **major feature** requiring architectural changes
- Should be tackled after v0.4.0 is stable
- User feedback will guide platform priorities
- Consider creating separate plugin versions if needed
- May require Obsidian plugin review for new APIs
