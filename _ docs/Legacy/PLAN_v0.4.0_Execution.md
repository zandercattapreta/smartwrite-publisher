# Plan: v0.4.0 Execution Strategy

**Date**: 2026-01-30
**Strategy**: A → C → B (Quality First, Document, Then Explore)
**Status**: 📋 Planning

---

## 🎯 Vision for v0.4.0

**Goal**: Deliver a **solid, well-documented, reliable** draft creation tool

**NOT in scope** (API limitations confirmed):
- ❌ Scheduled publishing (API doesn't support)
- ❌ Metadata fields (API doesn't support)

**IN scope**:
- ✅ Reliable draft creation (fix word_count=0)
- ✅ Batch publishing (multiple drafts at once)
- ✅ Improved UI/UX
- ✅ Comprehensive documentation
- 🔍 Explore alternative API endpoints

---

## 📦 Execution Phases

### PHASE A: Quality Improvements ⭐ PRIORITY
**Timeline**: 3-4 sessions
**Focus**: Make existing features rock-solid

### PHASE C: Documentation & Limitations
**Timeline**: 1-2 sessions
**Focus**: Clear user guidance and expectations

### PHASE B: Alternative Exploration
**Timeline**: 2-3 sessions
**Focus**: Investigate if there are other API approaches

---

## 🚀 PHASE A: Quality Improvements (Sessions 1-4)

### A1: Fix word_count=0 Issue (Session 1) 🔥 CRITICAL

**Problem**: Posts arrive empty in Substack despite content being sent

**Investigation steps**:
1. Review current payload structure
2. Check Tiptap JSON format
3. Test different content field names
4. Analyze Substack's expected format
5. Test with minimal content
6. Test with rich content

**Possible solutions**:
- Use different content field (body_html vs bodyJson)
- Fix Tiptap JSON structure
- Send plain HTML instead of Tiptap
- Add required fields we're missing

**Success criteria**: Draft created with word_count > 0 in Substack

---

### A2: Batch Publishing (Session 2)

**Feature**: Create multiple drafts from a folder

**Implementation**:
```typescript
// New feature in view.ts - Batch section

async handleBatchPublish(folderPath: string): Promise<void> {
  // 1. Get all markdown files from folder
  const files = this.app.vault.getMarkdownFiles()
    .filter(f => f.path.startsWith(folderPath));

  if (files.length === 0) {
    new Notice("No files found in selected folder");
    return;
  }

  // 2. Confirm with user
  const confirmed = await this.confirmBatchPublish(files.length);
  if (!confirmed) return;

  // 3. Create drafts one by one
  const results = [];
  for (const file of files) {
    const result = await this.createDraftFromFile(file);
    results.push({ file: file.basename, success: result.success });

    // Small delay to avoid rate limiting
    await this.sleep(1000);
  }

  // 4. Show summary
  this.showBatchResults(results);
}
```

**UI Changes**:
- Enable "Publish all" button
- Add progress indicator (1/10, 2/10, etc)
- Show summary modal at end
- Handle errors gracefully

**Success criteria**: Can publish 10 posts in batch successfully

---

### A3: UI/UX Improvements (Session 3)

**Improvements**:

1. **Loading States**
   - Show spinner during API calls
   - Disable buttons during operation
   - "Creating draft..." progress text

2. **Better Error Messages**
   - User-friendly error text
   - Actionable suggestions
   - Copy error to clipboard button

3. **Success Feedback**
   - ✅ Green checkmark animation
   - Link to draft in Substack
   - Toast notification with undo option

4. **Status Indicators**
   - Connection status: 🟢 Connected / 🔴 Disconnected
   - Last sync time
   - Draft count indicator

5. **Keyboard Shortcuts**
   - Cmd/Ctrl + Enter → Create draft
   - Cmd/Ctrl + Shift + Enter → Publish live (when enabled)

**CSS Improvements**:
```css
/* Loading spinner */
.loading-spinner { ... }

/* Success animation */
@keyframes success-checkmark { ... }

/* Error states */
.error-banner { ... }

/* Progress bar */
.batch-progress { ... }
```

---

### A4: Error Handling & Logging (Session 4)

**Robust Error Handling**:

```typescript
class ErrorHandler {
  handlePublishError(error: SubstackError): UserMessage {
    switch (error.status) {
      case 403:
        return {
          title: "Authentication Failed",
          message: "Your Substack cookie has expired. Please update it in settings.",
          action: "Open Settings",
          severity: "error"
        };

      case 429:
        return {
          title: "Rate Limited",
          message: "Too many requests. Please wait a moment and try again.",
          action: "Retry in 60s",
          severity: "warning"
        };

      case 500:
        return {
          title: "Substack Server Error",
          message: "Substack is experiencing issues. Your draft was saved locally.",
          action: "Retry",
          severity: "error"
        };

      default:
        return {
          title: "Unknown Error",
          message: error.message,
          action: "Copy Error Details",
          severity: "error"
        };
    }
  }
}
```

**Enhanced Logging**:
- Log levels: DEBUG, INFO, WARN, ERROR
- Structured logs (JSON format)
- Export logs to file
- Filter by level in UI

**Retry Logic**:
```typescript
async publishWithRetry(options: PublishOptions, maxRetries = 3): Promise<PublishResult> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await this.publishPost(options);
    } catch (error) {
      if (!this.isRetryable(error) || attempt === maxRetries) {
        throw error;
      }

      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
      await this.sleep(delay);
      this.logger.log(`Retry attempt ${attempt}/${maxRetries}`, 'WARN');
    }
  }
}
```

---

## 📚 PHASE C: Documentation (Sessions 5-6)

### C1: User Guide (Session 5)

**Create**: `USER_GUIDE.md`

**Contents**:
1. **Getting Started**
   - Installation
   - Configuration (cookie, URL)
   - First draft

2. **Features**
   - Create draft
   - Publish live (when working)
   - Batch publishing
   - Logs and debugging

3. **Best Practices**
   - Markdown formatting tips
   - Title and subtitle conventions
   - Testing drafts before publishing

4. **Troubleshooting**
   - Cookie expired
   - Connection issues
   - Empty posts
   - Common errors

---

### C2: API Limitations Documentation (Session 6)

**Create**: `API_LIMITATIONS.md`

**Contents**:
1. **What Works**
   - ✅ Create drafts
   - ✅ Set title and subtitle
   - ✅ Set content (when fixed)
   - ✅ Set author byline

2. **What Doesn't Work**
   - ❌ Scheduled publishing
   - ❌ Audience control
   - ❌ Comment permissions
   - ❌ Email delivery toggle
   - ❌ Tags
   - ❌ Free preview settings

3. **Workarounds**
   - Create draft via plugin
   - Configure metadata in Substack dashboard
   - Schedule manually in Substack

4. **Why These Limitations Exist**
   - API investigation results
   - Evidence (test logs, screenshots)
   - Alternative approaches explored

**Create**: `FAQ.md`

**Common Questions**:
- Q: Why can't I schedule posts?
  - A: Substack API doesn't support `publish_at` field (tested on 2026-01-30)

- Q: Why can't I set tags?
  - A: API ignores `tags` field (tested on 2026-01-30)

- Q: Can I set audience to "Everyone" via plugin?
  - A: No, API ignores `audience` field. Set manually in Substack dashboard.

---

## 🔍 PHASE B: Alternative Exploration (Sessions 7-9)

### B1: Test PATCH Endpoint (Session 7)

**Hypothesis**: Maybe we can UPDATE draft metadata after creation?

**Test**:
```bash
# Create draft first
draft_id=123456

# Try to update metadata
curl -X PATCH "https://thebreachrpg.substack.com/api/v1/drafts/$draft_id" \
  -H "Cookie: ..." \
  -d '{"audience": "everyone", "tags": ["Fiction"]}'
```

**Test cases**:
1. Update audience
2. Update tags
3. Update comment permissions
4. Update email delivery

**Expected**: If works → ✅ Implement metadata feature
**If not**: Document and move on

---

### B2: Test Publish Endpoint (Session 8)

**Hypothesis**: Maybe metadata works when publishing directly (not drafting)?

**Test**:
```bash
# Publish directly without draft
curl -X POST "https://thebreachrpg.substack.com/api/v1/posts" \
  -H "Cookie: ..." \
  -d '{
    "title": "Test",
    "body": "...",
    "audience": "everyone",
    "tags": ["Fiction"],
    "publish_immediately": true
  }'
```

**Risk**: Goes live immediately (can't review)

**Mitigation**: Test on staging/test publication if available

**Expected**: Probably also ignored, but worth testing

---

### B3: Alternative Approaches (Session 9)

**Explore**:

1. **GraphQL API**
   - Does Substack have a GraphQL endpoint?
   - Check browser DevTools on Substack dashboard
   - Might have more fields than REST API

2. **Browser Extension Approach**
   - Could we build a browser extension?
   - Inject metadata form into Obsidian?
   - More complex but might work

3. **Hybrid Workflow**
   - Create draft via API ✅
   - Open draft in browser automatically
   - Use keyboard shortcuts to set metadata quickly

**Outcome**: Document findings, implement if viable

---

## 📊 Success Metrics

### Phase A Success:
- [ ] word_count > 0 for all drafts created
- [ ] Batch publish works for 10+ posts
- [ ] Zero crashes or unhandled errors
- [ ] User can understand all error messages

### Phase C Success:
- [ ] USER_GUIDE.md complete and clear
- [ ] API_LIMITATIONS.md comprehensive
- [ ] FAQ answers top 10 questions
- [ ] User knows exactly what to expect

### Phase B Success:
- [ ] All alternative endpoints tested
- [ ] Results documented
- [ ] If any work → Implemented
- [ ] If none work → Clearly documented why

---

## 🎯 v0.4.0 Release Criteria

**Must Have**:
- ✅ Drafts created successfully with content (word_count > 0)
- ✅ Batch publishing works
- ✅ No critical bugs
- ✅ Comprehensive documentation

**Nice to Have**:
- ✅ Improved UI/UX
- ✅ Better error handling
- ✅ Keyboard shortcuts

**Out of Scope** (unless Phase B succeeds):
- ⏸️ Scheduled publishing
- ⏸️ Metadata fields

---

## 📅 Timeline

| Phase | Sessions | Weeks | Status |
|-------|----------|-------|--------|
| **A: Quality** | 4 | 1-2 | ⏳ Next |
| **C: Docs** | 2 | 1 | ⏳ Pending |
| **B: Explore** | 3 | 1-2 | ⏳ Pending |
| **Testing & Polish** | 2 | 1 | ⏳ Pending |
| **Total** | **11 sessions** | **3-5 weeks** | 📋 Planned |

---

## 🚀 Next Immediate Action

**START PHASE A - Session 1: Fix word_count=0**

1. Analyze current payload structure
2. Test different content formats
3. Find why Substack sees word_count=0
4. Implement fix
5. Test with 5 different posts

**Ready to begin?** 🎯
