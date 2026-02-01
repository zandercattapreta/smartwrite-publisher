# Debug: Empty Posts Issue

## 🔴 Problem

Posts are being created in Substack but arriving **completely empty**.

### Timeline

| Version | Format | Result | Status |
|---------|--------|--------|--------|
| v0.3.1 | HTML | Empty ❌ | Identified issue |
| v0.3.2 | Tiptap JSON | Empty ❌ | Fixed parser validation |
| v0.3.3 | Tiptap JSON | Empty ❌ | Still failing |
| v0.3.4 | Plain Markdown | TBD 🧪 | **Testing now** |

## 🔍 Investigation Steps

### Step 1: Determine Field Name
Substack API changed format:
- ❓ `draft_body` (old, HTML string)
- ❓ `bodyJson` (new, Tiptap JSON)
- ❓ `body` (plain text?)
- ❓ Something else?

### Step 2: Determine Format
What does Substack actually accept?
- ❓ Plain markdown text
- ❓ HTML
- ❓ Tiptap JSON
- ❓ Something custom

### Step 3: Current Approach

**Switched to: PLAIN MARKDOWN**

Why?
- Substack's web UI uses markdown editor
- Markdown is simplest format
- Let Substack handle conversion internally

Implementation:
```typescript
private convertToPlainMarkdown(markdown: string): string {
  // Remove H1 (used as title)
  return markdown.replace(/^# +[^\n]*\n?/, '').trim();
}
```

Result:
- Input: Full markdown content
- Output: Plain markdown text (no HTML, no JSON)
- Sent in: `bodyJson` field (need to verify if correct)

## 🧪 How to Test

### Before Testing
1. Open Obsidian Test Vault
2. Reload SmartWrite Publisher plugin (disable → enable)
3. Verify it's v0.3.4 in settings

### Test Procedure
1. Create simple markdown note with content:
   ```markdown
   # Test Post Title

   This is **bold** text.

   This is *italic* text.

   ## Subheading

   Some content here.
   ```

2. Click "Create Draft"

3. Check Substack:
   - Does draft exist? (should yes)
   - Does draft have content? (looking for this!)
   - Is content readable?
   - Is formatting preserved?

### Success Criteria
- ✅ Draft created
- ✅ Title shows "Test Post Title"
- ✅ Body has text (not empty)
- ✅ Formatting visible (bold, italic, headings)

## 🐛 If Still Empty

If posts are STILL empty with plain markdown:

### Possibility 1: Wrong Field Name
Current: `bodyJson` field

Try investigating:
```bash
# Check what we're actually sending
# Add logging to SubstackPayloadBuilder.buildDraftPayload()
console.log('Payload fields:', Object.keys(payload));
console.log('bodyJson value:', payload.bodyJson);
```

Field candidates:
- `body` (instead of bodyJson)
- `draft_body` (old field name)
- `content` (generic name)
- Something entirely different

### Possibility 2: API Response Not Showing Error
Check if Substack API is returning error but we're ignoring it:
```bash
# Add error logging to SubstackService.createDraft()
# Log full response: status, statusText, body
```

### Possibility 3: Content Being Stripped
Substack might be:
- Rejecting markdown and storing as empty
- Expecting specific format we don't know
- Having validation rule we're violating

### Possibility 4: Field Validation
```bash
# Substack API might require:
- bodyJson to be array (not string)
- bodyJson to be specific JSON structure
- bodyJson to have specific fields
```

## 📋 Debugging Checklist

- [ ] Test with plain markdown (v0.3.4) ← Current
- [ ] Check API response status and body
- [ ] Log payload being sent
- [ ] Try different field names
- [ ] Try different content formats
- [ ] Check Substack API documentation
- [ ] Look at network requests in browser DevTools

## 🎯 Next Actions

1. **Test**: Reload plugin, create draft with simple content
2. **Observe**: Check Substack for post with content
3. **Report**: Tell what you see (empty? has content? error?)
4. **Debug**: Based on results, investigate field name or format

## 📝 Key Files

- `src/converter.ts` - Content conversion (now using plain markdown)
- `src/substack/SubstackPayloadBuilder.ts` - Payload construction
- `src/substack/SubstackService.ts` - API calls

## 🔧 If You Need to Investigate Further

### Add Logging
Edit `src/substack/SubstackPayloadBuilder.ts`:
```typescript
buildDraftPayload(options: PublishOptions, user: SubstackUserInfo | null): DraftPayload {
  // ... validation code ...

  const payload: DraftPayload = {
    draft_title: options.title.trim(),
    bodyJson: options.bodyHtml, // Log this!
    type: 'newsletter',
    draft_bylines: []
  };

  console.log('DEBUG: Payload fields', Object.keys(payload));
  console.log('DEBUG: bodyJson length',
    typeof payload.bodyJson === 'string' ? payload.bodyJson.length : 'not string');

  return payload;
}
```

### Check API Response
Edit `src/substack/SubstackService.ts`:
```typescript
async createDraft(options: PublishOptions): Promise<ServiceResult> {
  // ... existing code ...

  const response = await this.client.post('/api/v1/drafts', payload, publicationId);

  console.log('DEBUG: API response status', response.status);
  console.log('DEBUG: API response body', JSON.stringify(response));

  // ... rest of code ...
}
```

### View Logs
Open Obsidian console:
- Windows: Ctrl + Shift + I → Console tab
- Mac: Cmd + Option + I → Console tab

## 📞 Summary

**Problem**: Posts empty despite multiple format/parser fixes
**Current Try**: Plain markdown text
**Expected**: Content should appear in Substack
**If Fails**: Need to debug field name or API response
**Status**: 🔄 Testing in progress
