# Fallback Strategy: Local Scheduling Implementation

**Date**: 2026-01-30
**Version Target**: v0.4.0
**Status**: 📋 Proposed - Awaiting User Approval
**Reason**: Substack API does NOT support `publish_at` field

---

## 🎯 Executive Summary

**Discovery**: Substack's API does not support scheduled publishing via `publish_at` field.

**Solution**: Implement **local scheduling** where the plugin:
1. Creates drafts in Substack immediately
2. Stores schedule locally in plugin settings
3. Auto-publishes drafts at scheduled time (if Obsidian is running)

**Trade-off**: Requires Obsidian to be running at publish time (not server-side).

---

## 🏗️ Architecture

### Data Storage

```typescript
interface ScheduledPost {
  id: string;                    // Unique ID (UUID)
  draftId: number;              // Substack draft ID
  filePath: string;             // Obsidian file path
  title: string;                // Post title
  publishAt: string;            // ISO 8601 timestamp (UTC)
  createdAt: string;            // When schedule was created
  status: 'pending' | 'published' | 'failed' | 'missed';
  lastAttempt?: string;         // Last publish attempt time
  error?: string;               // Error message if failed
}

interface ScheduleSettings {
  scheduled: ScheduledPost[];
  checkIntervalSeconds: number;  // Default: 60
  notifyBeforeMinutes: number;   // Default: 15 (notify 15min before)
}
```

**Storage Location**: Plugin settings (`data.json`)

```json
{
  "cookies": "...",
  "substackUrl": "...",
  "scheduleSettings": {
    "scheduled": [
      {
        "id": "uuid-1234",
        "draftId": 186296385,
        "filePath": "Posts/My Article.md",
        "title": "My Article",
        "publishAt": "2026-02-01T15:00:00.000Z",
        "status": "pending"
      }
    ],
    "checkIntervalSeconds": 60,
    "notifyBeforeMinutes": 15
  }
}
```

---

### Core Components

```
src/
├── schedule/
│   ├── ScheduleStorage.ts       [NEW]  - Persist/load scheduled posts
│   ├── ScheduleDaemon.ts        [NEW]  - Background checker/publisher
│   ├── ScheduleUI.ts            [NEW]  - UI components for scheduling
│   └── types.ts                 [NEW]  - Interfaces
├── substack/
│   └── SubstackService.ts       [MODIFY] - Add publishDraft(draftId)
└── view.ts                      [MODIFY] - Add schedule UI
```

---

## 📦 Implementation Details

### 1. ScheduleStorage Class

```typescript
export class ScheduleStorage {
  private plugin: SmartWritePublisher;

  constructor(plugin: SmartWritePublisher) {
    this.plugin = plugin;
  }

  /**
   * Add a post to schedule queue
   */
  async addScheduled(post: Omit<ScheduledPost, 'id' | 'createdAt' | 'status'>): Promise<string> {
    const scheduled: ScheduledPost = {
      ...post,
      id: this.generateUUID(),
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    this.plugin.settings.scheduleSettings.scheduled.push(scheduled);
    await this.plugin.saveSettings();

    return scheduled.id;
  }

  /**
   * Get all pending scheduled posts
   */
  getPending(): ScheduledPost[] {
    return this.plugin.settings.scheduleSettings.scheduled
      .filter(p => p.status === 'pending')
      .sort((a, b) => new Date(a.publishAt).getTime() - new Date(b.publishAt).getTime());
  }

  /**
   * Get posts ready to publish (publishAt <= now)
   */
  getReadyToPublish(): ScheduledPost[] {
    const now = new Date();
    return this.getPending().filter(p => new Date(p.publishAt) <= now);
  }

  /**
   * Update post status
   */
  async updateStatus(id: string, status: ScheduledPost['status'], error?: string): Promise<void> {
    const post = this.plugin.settings.scheduleSettings.scheduled.find(p => p.id === id);
    if (post) {
      post.status = status;
      post.lastAttempt = new Date().toISOString();
      if (error) post.error = error;
      await this.plugin.saveSettings();
    }
  }

  /**
   * Remove from schedule
   */
  async remove(id: string): Promise<void> {
    this.plugin.settings.scheduleSettings.scheduled =
      this.plugin.settings.scheduleSettings.scheduled.filter(p => p.id !== id);
    await this.plugin.saveSettings();
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
```

---

### 2. ScheduleDaemon Class

```typescript
export class ScheduleDaemon {
  private plugin: SmartWritePublisher;
  private storage: ScheduleStorage;
  private intervalId: number | null = null;
  private isRunning: boolean = false;

  constructor(plugin: SmartWritePublisher, storage: ScheduleStorage) {
    this.plugin = plugin;
    this.storage = storage;
  }

  /**
   * Start the daemon
   */
  start(): void {
    if (this.isRunning) return;

    const intervalSeconds = this.plugin.settings.scheduleSettings.checkIntervalSeconds || 60;
    this.intervalId = window.setInterval(() => this.check(), intervalSeconds * 1000);
    this.isRunning = true;

    this.plugin.logger.log(`Schedule daemon started (checks every ${intervalSeconds}s)`, 'INFO');
  }

  /**
   * Stop the daemon
   */
  stop(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      this.plugin.logger.log('Schedule daemon stopped', 'INFO');
    }
  }

  /**
   * Check for posts ready to publish
   */
  private async check(): Promise<void> {
    const ready = this.storage.getReadyToPublish();

    if (ready.length === 0) return;

    this.plugin.logger.log(`Found ${ready.length} post(s) ready to publish`, 'INFO');

    for (const post of ready) {
      await this.publishScheduledPost(post);
    }
  }

  /**
   * Publish a scheduled post
   */
  private async publishScheduledPost(post: ScheduledPost): Promise<void> {
    try {
      this.plugin.logger.log(`Publishing scheduled post: ${post.title} (Draft ID: ${post.draftId})`, 'INFO');

      // Call Substack API to publish the draft
      const result = await this.plugin.substackService.publishDraft(post.draftId);

      if (result.success) {
        this.plugin.logger.log(`✅ Published: ${post.title}`, 'INFO');
        new Notice(`✅ Published: ${post.title}`);
        await this.storage.updateStatus(post.id, 'published');
      } else {
        throw new Error(result.error || 'Unknown error');
      }

    } catch (error: any) {
      this.plugin.logger.log(`❌ Failed to publish: ${post.title}`, 'ERROR', error);
      new Notice(`❌ Failed to publish: ${post.title}`);
      await this.storage.updateStatus(post.id, 'failed', error.message);
    }
  }
}
```

---

### 3. SubstackService.publishDraft()

```typescript
/**
 * Publish an existing draft (for scheduled publishing)
 */
async publishDraft(draftId: number): Promise<PublishResult> {
  if (!this.isConnected()) {
    return {
      success: false,
      error: 'Service not configured or not connected'
    };
  }

  try {
    this.logger.log(`Publishing draft ID: ${draftId}`, 'INFO');

    const pubId = await this.getPublicationId();
    if (!pubId) {
      return {
        success: false,
        error: 'Publication not found'
      };
    }

    // Endpoint to publish a draft
    const response = await this.client!.post(
      `/api/v1/drafts/${draftId}/publish?publication_id=${pubId}`,
      { /* empty body or any required params */ }
    );

    if (response.status === 200 || response.status === 201) {
      const data = response.json;
      const postUrl = data.canonical_url || data.url;

      this.logger.log(`Draft ${draftId} published successfully`, 'INFO');
      if (postUrl) {
        this.logger.log(`URL: ${postUrl}`, 'INFO');
      }

      return {
        success: true,
        postId: String(data.id),
        postUrl
      };
    } else {
      const errorMsg = this.errorHandler!.handleError(response);
      return {
        success: false,
        error: errorMsg
      };
    }

  } catch (error: any) {
    this.logger.log('Error publishing draft', 'ERROR', error);
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
}
```

---

## 🎨 UI Components

### Schedule Picker in Sidebar

```typescript
// In view.ts - Active Note section

const scheduleContainer = activeNoteContent.createDiv({ cls: "schedule-container" });

// Date/time picker
const dateLabel = scheduleContainer.createEl("label", { text: "Schedule publish:", cls: "schedule-label" });
const dateInput = scheduleContainer.createEl("input", {
  attr: {
    type: "datetime-local",
    min: new Date().toISOString().slice(0, 16) // Prevent past dates
  },
  cls: "schedule-datetime-input"
});

// Schedule button
const scheduleBtn = scheduleContainer.createEl("button", {
  text: "📅 Schedule Post",
  cls: "schedule-btn"
});

scheduleBtn.onclick = async () => {
  if (!dateInput.value) {
    new Notice("Please select a date and time");
    return;
  }

  const scheduledDate = new Date(dateInput.value);
  await this.handleSchedulePost(scheduledDate);
};
```

### Upcoming Scheduled Posts Section

```typescript
// New section in sidebar

const scheduledSection = container.createDiv({ cls: "publisher-section scheduled-section" });
scheduledSection.createEl("h5", { text: "⏰ Upcoming Scheduled" });

const scheduledList = scheduledSection.createDiv({ cls: "scheduled-list" });

// Render pending posts
const pending = this.plugin.scheduleStorage.getPending();

if (pending.length === 0) {
  scheduledList.createEl("p", { text: "No scheduled posts", cls: "empty-state" });
} else {
  pending.forEach(post => {
    const item = scheduledList.createDiv({ cls: "scheduled-item" });

    const title = item.createDiv({ text: post.title, cls: "scheduled-title" });
    const time = item.createDiv({
      text: new Date(post.publishAt).toLocaleString(),
      cls: "scheduled-time"
    });

    const cancelBtn = item.createEl("button", {
      text: "Cancel",
      cls: "scheduled-cancel-btn"
    });

    cancelBtn.onclick = async () => {
      await this.plugin.scheduleStorage.remove(post.id);
      this.render(); // Refresh UI
      new Notice("Schedule cancelled");
    };
  });
}
```

---

## ⚠️ Limitations & Warnings

### User Must Understand

**Clear Warning in UI**:
```
⚠️ IMPORTANT: Obsidian must be running at the scheduled time
to automatically publish. If Obsidian is closed, the post will
be marked as "Missed" and you can publish it manually later.
```

### Missed Schedules Handling

```typescript
/**
 * Detect missed schedules (publishAt in past but status still pending)
 */
getMissed(): ScheduledPost[] {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  return this.plugin.settings.scheduleSettings.scheduled
    .filter(p =>
      p.status === 'pending' &&
      new Date(p.publishAt) < now &&
      new Date(p.publishAt) > oneDayAgo // Within last 24h
    );
}
```

**UI for Missed Posts**:
```
┌─────────────────────────────────────┐
│ ⚠️ Missed Schedules (2)             │
├─────────────────────────────────────┤
│ • "My Post" - was due 2 hours ago   │
│   [Publish Now] [Delete]            │
│                                     │
│ • "Another" - was due yesterday     │
│   [Publish Now] [Delete]            │
└─────────────────────────────────────┘
```

---

## ✅ Benefits of This Approach

1. **No External Dependencies**: Pure plugin implementation
2. **Full Control**: Can implement all RF5/RF6 features (conflict detection, recurrence)
3. **Immediate Availability**: Works without waiting for Substack to add API support
4. **User Visibility**: Clear queue of upcoming posts
5. **Error Handling**: Can retry failed publishes, show clear errors

---

## 🚀 Implementation Timeline

**Estimated**: 3-4 sessions

### Session 1: Core Infrastructure
- Create `ScheduleStorage` class
- Update plugin settings schema
- Add `publishDraft()` to SubstackService
- Basic tests

### Session 2: Daemon & Auto-Publish
- Create `ScheduleDaemon` class
- Implement check loop
- Test auto-publishing
- Error handling

### Session 3: UI Components
- Schedule picker in sidebar
- Upcoming schedules list
- Missed schedules handling
- Cancel/reschedule buttons

### Session 4: Polish & Testing
- Timezone handling
- Conflict detection (RF5)
- Documentation
- User testing

---

## 📋 User Decision Required

**Question**: Is local scheduling (Obsidian must be running) acceptable?

**Options**:
1. ✅ **Yes, proceed with local scheduling** → Implement v0.4.0 as described
2. ⏸️ **No, need server-side** → Defer to v0.5.0, research third-party services
3. 🔄 **Hybrid approach** → Local scheduling now + explore server-side later

---

**Status**: Awaiting user approval to proceed with implementation
**Next**: User decides on approach → Begin v0.4.0 development
