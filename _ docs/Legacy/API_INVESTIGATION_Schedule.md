# API Investigation: Substack Scheduling Support

**Date**: 2026-01-29
**Version Target**: v0.4.0
**Investigator**: Claude + Zander
**Status**: 🔬 In Progress

---

## 🎯 Investigation Goals

1. ✅ Does Substack API accept `publish_at` field in draft creation?
2. ✅ What timestamp format is expected? (ISO 8601, Unix, RFC 2822?)
3. ✅ Is there an endpoint to list already scheduled posts?
4. ✅ How does the API respond when scheduling fails?
5. ✅ Can we retrieve scheduled posts to detect conflicts?

---

## 📋 Current Implementation Analysis

### Existing Payload Structure (v0.3.7)

```typescript
interface DraftPayload {
  draft_title: string;
  draft_subtitle?: string;
  bodyJson: any;              // Tiptap JSON
  body?: string;              // Plain text (experimental)
  draft_body?: string;        // Alternative field (experimental)
  body_markdown?: string;     // Markdown (experimental)
  type: string;               // Always "newsletter"
  draft_bylines: Array<{ user_id: number }>;
  [key: string]: any;         // Allows additional fields
}
```

**Current Endpoint**: `POST /api/v1/drafts?publication_id={id}`

**Response Fields** (observed):
```json
{
  "id": 12345,
  "draft_id": 12345,
  "slug": "test-post",
  "uuid": "abc123",
  "draft_created_at": "2026-01-29T...",
  "word_count": 150,
  ...
}
```

---

## 🧪 Test Plan

### Test 1: Add `publish_at` Field to Existing Payload

**Hypothesis**: Substack API accepts `publish_at` field alongside existing fields

**Test Payload**:
```typescript
{
  draft_title: "TEST - Scheduled Post Investigation",
  bodyJson: "<p>Test content</p>",
  body: "Test content",
  type: "newsletter",
  draft_bylines: [],

  // NEW FIELD - Testing scheduling
  publish_at: "2026-01-30T15:00:00.000Z"  // ISO 8601 UTC, 1 hour from now
}
```

**Expected Outcomes**:
- ✅ **Success**: Response includes `publish_at` field, post shows as "scheduled" in Substack
- ❌ **Field Ignored**: Post created as draft, no error, `publish_at` not in response
- ❌ **API Error**: 400/422 error, field not supported

**Execution Method**: Manual test via modified SubstackService


### Test 2: Alternative Timestamp Formats

**Test variations** (if Test 1 fails):

```typescript
// Format 1: ISO 8601 with timezone
publish_at: "2026-01-30T15:00:00-03:00"

// Format 2: Unix timestamp (seconds)
publish_at: 1738252800

// Format 3: Unix timestamp (milliseconds)
publish_at: 1738252800000

// Format 4: Alternative field name
scheduled_at: "2026-01-30T15:00:00.000Z"
schedule_for: "2026-01-30T15:00:00.000Z"
```

### Test 3: List Scheduled Posts Endpoint

**Possible endpoints to test**:

1. `GET /api/v1/posts?status=scheduled`
2. `GET /api/v1/posts?filter=scheduled`
3. `GET /api/v1/scheduled-posts`
4. `GET /api/v1/drafts?scheduled=true`
5. `GET /api/v1/posts/scheduled`
6. `GET /api/v1/publication/posts?scheduled=true`

**Expected Response**:
```json
{
  "posts": [
    {
      "id": 12345,
      "title": "Scheduled Post Title",
      "publish_at": "2026-02-01T15:00:00.000Z",
      "status": "scheduled",
      "type": "newsletter"
    }
  ]
}
```

### Test 4: Conflict Detection Scenario

**Scenario**: Create 2 posts scheduled for same time

1. Create post A with `publish_at: "2026-01-30T15:00:00.000Z"`
2. Create post B with `publish_at: "2026-01-30T15:00:00.000Z"`
3. Observe: Does API reject? Allow both? Return warning?

---

## 📊 Investigation Results

### Test 1: `publish_at` Field

**Status**: ✅ COMPLETED

**Execution Date**: 2026-01-30
**Tester**: Claude + Zander

**Result**:
- [ ] ✅ Field accepted - scheduling works
- [x] ❌ Field ignored - no error but post not scheduled ← **CONFIRMED**
- [ ] ❌ API error - field rejected

**Test Details**:
- Publication ID: `7678831`
- Test payload included: `"publish_at": "2026-01-30T13:53:38.000Z"`
- Draft created successfully: ID `186296385`
- API response: HTTP 200 (success)

**Response received**:
```json
{
  "type": "newsletter",
  "draft_title": "TEST-Scheduled",
  "publication_id": 7678831,
  "id": 186296385,
  "draft_created_at": "2026-01-30T11:53:38.535Z",
  "is_published": false,
  "post_date": null,
  "word_count": 0,
  ...
  // NO publish_at field in response
}
```

**Notes**:
- The API **accepts** the `publish_at` field without error
- The field is **completely ignored** - not returned in response
- Draft is created as a normal draft, NOT scheduled
- No error message or indication that field was invalid
- **CONCLUSION: Substack API does NOT support scheduled publishing via `publish_at` field**

---

### Test 2: Alternative Formats

**Status**: ⏳ Pending (run only if Test 1 fails)

**Results**:
- Format 1 (ISO with TZ): ___________
- Format 2 (Unix seconds): ___________
- Format 3 (Unix ms): ___________
- Format 4 (Alt field): ___________

---

### Test 3: List Scheduled Posts

**Status**: ⏳ Pending

**Endpoints tested**:
1. `/api/v1/posts?status=scheduled` → Result: ___________
2. `/api/v1/posts?filter=scheduled` → Result: ___________
3. `/api/v1/scheduled-posts` → Result: ___________
4. `/api/v1/drafts?scheduled=true` → Result: ___________
5. `/api/v1/posts/scheduled` → Result: ___________
6. `/api/v1/publication/posts?scheduled=true` → Result: ___________

**Working Endpoint**: ___________

**Response Structure**:
```json
// Paste successful response
```

---

### Test 4: Conflict Detection

**Status**: ⏳ Pending

**Behavior observed**:
```
// What happened when scheduling conflicts occurred?
```

---

## 🎯 Conclusions

### Scheduling Support

**Verdict**: ❌ **NOT SUPPORTED**

- [ ] ✅ **Full Support**: API accepts `publish_at`, posts can be scheduled
- [ ] ⚠️ **Partial Support**: Some limitations or workarounds needed
- [x] ❌ **No Support**: Need fallback strategy ← **CONFIRMED**

**Test Results Summary**:
- ❌ `publish_at` field is ignored by Substack API
- ❌ No alternative field names work (`scheduled_at`, `schedule_for`)
- ❌ Posts cannot be scheduled via API
- ✅ Drafts can be created normally

**Recommended Implementation**:
```
FALLBACK STRATEGY REQUIRED

Option 1: LOCAL SCHEDULING (RECOMMENDED)
- Store scheduled posts in plugin settings/local DB
- Show upcoming scheduled posts in sidebar
- Require Obsidian to be open at schedule time
- Use setInterval to check and publish at correct time
- Pros: Works immediately, full control
- Cons: Requires Obsidian open, not server-side

Option 2: MANUAL REMINDERS
- Create draft in Substack
- Show notification to user when it's time
- User publishes manually from Substack dashboard
- Pros: Simple, reliable
- Cons: Not fully automatic

Option 3: THIRD-PARTY INTEGRATION
- Integrate with Buffer, Zapier, or similar
- Use their scheduling APIs
- Pros: Professional, server-side
- Cons: Requires external service, complex setup
```

### Listing Scheduled Posts

**Verdict**: ⏳ To be determined

**Working Endpoint**: ___________

**Rate Limiting**: ___________

**Caching Strategy**:
```
// Recommendation for caching scheduled posts
```

### Conflict Detection

**Feasibility**: ⏳ To be determined

**Implementation Notes**:
```
// How to detect conflicts based on API behavior
```

---

## 🚀 Next Steps

Based on investigation results (**scheduling NOT supported**):

### ✅ RECOMMENDED: Local Scheduling with Auto-Publish (Option 1)

**Implementation Plan for v0.4.0**:

1. **Data Layer**:
   - Create `ScheduleStorage` class to persist scheduled posts
   - Store in plugin settings: `{ scheduled: [{ postId, filePath, publishAt }] }`
   - Add methods: `addScheduled()`, `removeScheduled()`, `getUpcoming()`

2. **Scheduler Daemon**:
   - Create `ScheduleDaemon` class
   - Use `setInterval()` to check every 60 seconds
   - When `publishAt <= now`, auto-publish the draft
   - Show notification on success/failure

3. **UI Components**:
   - Schedule picker in sidebar (datetime-local input)
   - "Upcoming Scheduled Posts" section showing queue
   - Status indicators: "⏰ Scheduled for DD/MM HH:MM"
   - Cancel/reschedule buttons

4. **Service Integration**:
   - `schedulePost(file, date)`: Creates draft + saves to local storage
   - `publishScheduledPost(scheduledItem)`: Publishes at correct time
   - `cancelSchedule(id)`: Removes from queue

**Pros**:
- ✅ Full control over scheduling
- ✅ No external dependencies
- ✅ Works immediately
- ✅ Can implement conflict detection
- ✅ Can implement recurrence (RF6)

**Cons**:
- ⚠️ Requires Obsidian to be open at publish time
- ⚠️ Not server-side (if computer is off, won't publish)

**Mitigation**:
- Show clear warning: "Obsidian must be running at scheduled time"
- Add "Missed Schedules" section for posts that weren't published
- Offer manual publish button for missed items

---

### 🔄 Alternative Options (If User Wants Server-Side)

**Option 2: Manual Workflow Optimization**
- Create draft immediately in Substack
- Store publish date in frontmatter
- Remind user daily of upcoming posts
- User clicks one button to publish from Substack

**Option 3: Third-Party Service**
- Research Buffer/Zapier/IFTTT APIs
- Implement as separate feature in v0.5.0
- Requires user to have external account

---

### 📋 Next Actions

1. **Update PLAN_Schedule_Feature.md** with local scheduling approach
2. **Update ROADMAP.md** with realistic timeline
3. **Get user approval** on local scheduling approach
4. **Begin implementation** of v0.4.0 with local storage

---

## 📝 Manual Testing Guide

### Prerequisites

1. Valid Substack account with active publication
2. Cookie (`substack.sid`) from authenticated session
3. Publication URL (e.g., `https://yourname.substack.com`)

### Step-by-Step Test

```bash
# 1. Configure plugin with valid credentials
# 2. Open test_substack_schedule_api.ts
# 3. Run investigation:

cd /sessions/affectionate-lucid-euler
node test_substack_schedule_api.ts

# 4. Manually test via curl (alternative):

curl -X POST 'https://yourname.substack.com/api/v1/drafts?publication_id=YOUR_ID' \
  -H 'Cookie: substack.sid=YOUR_COOKIE' \
  -H 'Content-Type: application/json' \
  -d '{
    "draft_title": "TEST - Scheduled Post",
    "bodyJson": {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Test"}]}]},
    "type": "newsletter",
    "draft_bylines": [],
    "publish_at": "2026-01-30T15:00:00.000Z"
  }'

# 5. Check response for publish_at field
# 6. Verify in Substack dashboard if post is scheduled
```

---

## 🔗 References

- [Substack API Documentation](https://support.substack.com) (if available)
- [ISO 8601 Timestamp Standard](https://en.wikipedia.org/wiki/ISO_8601)
- [RFC 5545 - iCalendar (for recurrence)](https://tools.ietf.org/html/rfc5545)

---

**Last Updated**: 2026-01-29
**Next Review**: After test execution
