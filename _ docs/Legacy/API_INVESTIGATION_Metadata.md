# API Investigation: Substack Metadata Fields

**Date**: 2026-01-30
**Version Target**: v0.4.0
**Status**: ❌ **COMPLETED - NOT SUPPORTED**

---

## 🎯 Investigation Goal

Test if Substack API accepts metadata fields in draft creation:
- Audience (public access control)
- Allow Comments (comment permissions)
- Delivery (send email)
- Free Preview (paywall preview)
- Tags (post categorization)

---

## 🧪 Test Executed

**Date**: 2026-01-30
**Method**: POST to `/api/v1/drafts?publication_id=7678831`

**Payload Sent**:
```json
{
  "draft_title": "TEST-Metadata",
  "bodyJson": {...},
  "type": "newsletter",
  "draft_bylines": [],

  "audience": "everyone",                         // Testing change from default
  "write_comment_permissions": "everyone",        // Testing change from default
  "should_send_email": false,                     // Testing change from default
  "post_preview_limit": 250,                      // Testing free preview
  "tags": ["Fiction", "Literature"]               // Testing tags
}
```

**Response Received**:
```json
{
  "id": 186301223,
  "draft_title": "TEST-Metadata",
  "audience": "only_paid",                        // ❌ Returned to default
  "write_comment_permissions": "only_paid",       // ❌ Returned to default
  "should_send_email": true,                      // ❌ Returned to default
  // post_preview_limit: NOT IN RESPONSE          // ❌ Field ignored
  // tags: NOT IN RESPONSE                        // ❌ Field ignored
}
```

---

## ✅ Manual Verification (Dashboard)

**Draft ID**: 186301223
**Draft Title**: "TEST-Metadata"

**Verified Settings in Substack Dashboard**:

| Field | Sent Value | Dashboard Value | Result |
|-------|-----------|----------------|--------|
| **Audience** | `everyone` | **Paid subscribers only** | ❌ IGNORED |
| **Allow Comments** | `everyone` | **Paid subscribers only** | ❌ IGNORED |
| **Send Email** | `false` | **✓ Send via email** (checked) | ❌ IGNORED |
| **Tags** | `["Fiction", "Literature"]` | **(empty) Select or create tags** | ❌ IGNORED |
| **Free Preview** | `250` chars | **(not configured)** | ❌ IGNORED |

**Screenshot Evidence**: Provided by user showing all fields at default values

---

## 📊 Detailed Results

### Field 1: Audience
- **Test**: Sent `"audience": "everyone"`
- **Expected**: Draft audience set to "Everyone"
- **Actual**: Remained "Paid subscribers only" (blog default)
- **Conclusion**: ❌ **NOT SUPPORTED** - Field is ignored

### Field 2: Allow Comments
- **Test**: Sent `"write_comment_permissions": "everyone"`
- **Expected**: Comments allowed from everyone
- **Actual**: Remained "Paid subscribers only" (blog default)
- **Conclusion**: ❌ **NOT SUPPORTED** - Field is ignored

### Field 3: Delivery (Email)
- **Test**: Sent `"should_send_email": false`
- **Expected**: Email delivery unchecked
- **Actual**: Remained checked "Send via email and Substack app" (blog default)
- **Conclusion**: ❌ **NOT SUPPORTED** - Field is ignored

### Field 4: Free Preview
- **Test**: Sent `"post_preview_limit": 250`
- **Expected**: Preview configured to 250 characters
- **Actual**: No preview configuration visible
- **Conclusion**: ❌ **NOT SUPPORTED** - Field is ignored

### Field 5: Tags
- **Test**: Sent `"tags": ["Fiction", "Literature"]`
- **Expected**: Tags applied to draft
- **Actual**: No tags applied, field shows "Select or create tags"
- **Conclusion**: ❌ **NOT SUPPORTED** - Field is ignored

---

## 🎯 Final Conclusions

### Metadata Support Status

**VERDICT**: ❌ **NO METADATA FIELDS SUPPORTED**

All metadata fields sent in the draft creation payload are **completely ignored** by the Substack API. The API only accepts:

**Supported Fields** (confirmed working):
- ✅ `draft_title` - Post title
- ✅ `bodyJson` - Post content (Tiptap JSON)
- ✅ `type` - Post type ("newsletter")
- ✅ `draft_bylines` - Author information
- ✅ `draft_subtitle` - Post subtitle

**NOT Supported** (all ignored):
- ❌ `audience` - Access control
- ❌ `write_comment_permissions` - Comment permissions
- ❌ `should_send_email` - Email delivery
- ❌ `post_preview_limit` - Preview configuration
- ❌ `tags` - Post categorization
- ❌ Any other metadata fields

---

## 🔍 Why Fields Appear in Response

The response **does return** these fields:
```json
{
  "audience": "only_paid",
  "write_comment_permissions": "only_paid",
  "should_send_email": true
}
```

**BUT**: These are the **publication's default settings**, not the values we sent.

The API:
1. Receives our payload with custom metadata values
2. **Ignores all metadata fields**
3. Creates draft with publication defaults
4. Returns the default values in response

---

## 🚨 Impact on v0.4.0

### Feature Status: BLOCKED

**Post Metadata Fields Feature**: ❌ **NOT IMPLEMENTABLE**

**Reason**: Substack API does not support setting metadata via API

**Affected Features**:
- Audience selection
- Comment permissions
- Email delivery toggle
- Free preview configuration
- Tag assignment

**User Workflow**: All metadata must be configured **manually** in Substack dashboard after draft creation

---

## 🔄 Possible Alternatives (Future Investigation)

### Alternative 1: Different API Endpoint
**Hypothesis**: Maybe there's a separate endpoint to update draft metadata?
- Test: `PATCH /api/v1/drafts/{id}` with metadata
- Test: `POST /api/v1/drafts/{id}/metadata`
- **Status**: Not yet investigated

### Alternative 2: Publish Endpoint
**Hypothesis**: Maybe metadata can be set when publishing (not drafting)?
- Test: `POST /api/v1/posts` instead of drafts
- **Status**: Not yet investigated
- **Risk**: Can't create drafts first, goes live immediately

### Alternative 3: Web Automation
**Hypothesis**: Use browser automation to set metadata
- Use Puppeteer/Selenium to interact with Substack dashboard
- **Status**: Not investigated
- **Complexity**: Very high, fragile

### Alternative 4: Accept Limitation
**Recommendation**: Document that metadata must be set manually
- Create draft via API ✅
- User sets metadata in Substack dashboard manually ✅
- **Status**: Most realistic approach

---

## 📋 Recommendations

### For v0.4.0

**DO NOT implement metadata fields feature** - API does not support it

**Instead, focus on**:
1. ✅ Improve draft creation reliability (fix word_count=0 issue)
2. ✅ Improve UI/UX of existing features
3. ✅ Add basic batch publishing (multiple drafts creation)
4. ✅ Better error handling and logging
5. ✅ Documentation improvements

### Documentation Updates Required

1. Update `PLAN_Post_Metadata_Fields.md` → Mark as BLOCKED
2. Update `ROADMAP.md` → Remove metadata from v0.4.0
3. Create user guide explaining Substack API limitations
4. Add FAQ: "Why can't I set audience/tags/etc?"

---

## 🧹 Cleanup

**Test Drafts Created**: 7 drafts titled "TEST-Metadata"
**Action Required**: Delete all test drafts from Substack dashboard
**Draft IDs**: 186296385, 186301223, and 5 others

---

**Investigation Completed**: 2026-01-30
**Result**: No metadata fields supported
**Next Steps**: Redefine v0.4.0 scope without metadata features
