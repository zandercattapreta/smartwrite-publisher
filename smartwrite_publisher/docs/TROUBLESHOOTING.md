# SmartWrite Publisher - Troubleshooting Guide

**Version**: 0.3.11 (Updated: January 30, 2026)

Detailed solutions for common problems and error messages.

---

## Table of Contents

1. [Quick Diagnostic Checklist](#quick-diagnostic-checklist)
2. [Connection Problems](#connection-problems)
3. [Publishing Errors](#publishing-errors)
4. [Batch Publishing Issues](#batch-publishing-issues)
5. [Performance Problems](#performance-problems)
6. [UI/UX Issues](#uiux-issues)
7. [Error Code Reference](#error-code-reference)
8. [System Logs Analysis](#system-logs-analysis)
9. [Getting Help](#getting-help)

---

## Quick Diagnostic Checklist

Before diving into specific issues, run through this checklist:

### Basic Checks

- [ ] Plugin version is 0.3.11 or higher (check manifest.json)
- [ ] Obsidian version is 0.15.0 or higher
- [ ] Plugin is enabled in Obsidian settings
- [ ] Internet connection is working
- [ ] Can access Substack in browser
- [ ] Status dot color in plugin (green = OK, red = problem)

### Configuration Checks

- [ ] Cookie is entered (not empty)
- [ ] Cookie includes `s%3A` prefix
- [ ] URL format is correct (`publication.substack.com`)
- [ ] "Test Connection" shows success

### If Still Having Problems

1. Check System Logs in plugin sidebar
2. Find specific error message
3. Search this document for that error
4. Follow the detailed solution

---

## Connection Problems

### Error: "Authentication failed"

**Symptoms**:

- Red status dot
- Cannot publish
- Test connection fails

**Cause**: Cookie is invalid, expired, or incorrectly formatted

**Solutions**:

#### Solution 1: Get Fresh Cookie

```
1. Open browser where you're logged into Substack
2. Open DevTools (F12 or Ctrl+Shift+I)
3. Go to Application/Storage tab
4. Find Cookies → https://substack.com
5. Copy entire value of `substack.sid`
6. Paste in plugin settings
7. Test connection
```

**Important**:

- Copy the ENTIRE value including `s%3A`
- Don't add extra spaces at start/end
- Cookie looks like: `s%3AeyJhbGc...` (very long)

#### Solution 2: Check Cookie Format

**Common mistakes**:

- ❌ Missing `s%3A` prefix
- ❌ Extra spaces
- ❌ Only copied part of cookie
- ❌ Copied cookie name instead of value

**Correct format**:

```
s%3AeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE...
```

#### Solution 3: Clear and Re-enter

```
1. Delete current cookie value completely
2. Clear URL field
3. Close and reopen plugin settings
4. Re-enter URL: publication.substack.com
5. Re-enter fresh cookie
6. Test connection
```

#### Solution 4: Cookie Expired

Substack cookies expire periodically (~30 days).

**Signs of expiry**:

- Worked before, stopped working
- No recent changes to settings
- "Invalid or expired" in logs

**Solution**: Get fresh cookie (Solution 1)

**Prevention**: Get new cookie monthly

---

### Error: "Connection failed" / "Network error"

**Symptoms**:

- Test connection fails
- Publishing fails with network error
- Timeout messages

**Possible Causes**:

1. No internet connection
2. Firewall blocking
3. Proxy/VPN interference
4. Substack servers down

**Solutions**:

#### Solution 1: Check Internet

```
1. Open browser
2. Navigate to https://substack.com
3. Can you load the page?
   - YES: Go to Solution 2
   - NO: Fix internet connection first
```

#### Solution 2: Check Firewall

```
Windows:
1. Open Windows Defender Firewall
2. Allow Obsidian through firewall
3. Restart Obsidian

Mac:
1. System Preferences → Security & Privacy → Firewall
2. Allow Obsidian
3. Restart Obsidian

Linux:
1. Check iptables/ufw rules
2. Allow outbound HTTPS (port 443)
3. Restart Obsidian
```

#### Solution 3: Disable VPN/Proxy

```
1. Temporarily disable VPN
2. Test connection
3. If works: Add exception for substack.com in VPN
4. Re-enable VPN
```

#### Solution 4: Check Substack Status

```
1. Visit https://status.substack.com
2. Check for outages
3. If outage: Wait and retry later
4. If no outage: Check other solutions
```

---

### Error: "Invalid URL format"

**Symptoms**:

- Cannot save URL
- Test connection fails immediately

**Cause**: URL not in correct format

**Solutions**:

**Correct format**:

```
✅ publication.substack.com
✅ mypublication.substack.com
```

**Incorrect formats**:

```
❌ https://publication.substack.com (no https://)
❌ publication.substack.com/ (no trailing slash)
❌ www.publication.substack.com (no www)
❌ publication (missing .substack.com)
```

**Fix**:

```
1. Remove https:// if present
2. Remove trailing / if present
3. Remove www. if present
4. Ensure .substack.com is included
5. Test connection
```

---

## Publishing Errors

### Error: "No title found"

**Symptoms**:

- Publish fails
- Draft created but has no title
- Error mentions missing title

**Cause**: Note doesn't have an H1 heading

**Solution**:

**Add H1 heading to your note**:

```markdown
# This is Your Title

Your content here...
```

**Rules**:

- Must be at top of note (or near top)
- Must be H1 (single #)
- Must be only H1 in note

**Check**:

```
1. Open your note
2. Look for line starting with single #
3. Add if missing:
   # Your Post Title
4. Save
5. Try publishing again
```

---

### Error: "Empty post / word_count: 0"

**Symptoms**:

- Draft created in Substack
- But appears completely empty
- No content visible

**Status**: **FIXED in v0.3.11**

**If still happening**:

#### Solution 1: Update Plugin

```
1. Check current version in manifest.json
2. If < 0.3.11: Update to latest version
3. Restart Obsidian
4. Try publishing again
```

#### Solution 2: Check Note Format

```markdown
# Title Must Be Here

First paragraph after title can be subtitle (optional).

## Regular Content Heading

Your content goes here...
```

**Requirements**:

- H1 heading exists
- Content below H1
- Valid markdown syntax

#### Solution 3: Check for Special Characters

**Problematic**:

- Very long code blocks (>10,000 chars)
- Unusual Unicode characters
- Malformed markdown

**Fix**:

```
1. Create simple test note:
   # Test

   Simple content.

2. Publish test note
3. If works: Issue is in original note content
4. Gradually add content back to identify problem
```

---

### Error: "Rate limit exceeded"

**Symptoms**:

- Multiple publishes fail
- Error mentions "rate limit" or "too many requests"
- Temporary block

**Cause**: Too many API requests in short time

**Solutions**:

#### Solution 1: Wait and Retry

```
1. Wait 5-10 minutes
2. Try publishing again
3. Should work after cooldown
```

#### Solution 2: Reduce Batch Size

```
If doing batch publishing:
1. Select fewer files (5-10 instead of 20-30)
2. Wait between batches (5 minutes)
3. Gradual publishing prevents rate limits
```

#### Solution 3: Check for Automation

**Are you**:

- Running multiple batch operations?
- Using other Substack automation tools?
- Publishing from multiple sources?

**Fix**: Coordinate timing, reduce concurrent requests

---

### Error: "Post too large"

**Symptoms**:

- Very long posts fail to publish
- Error mentions size or length

**Cause**: Post exceeds platform limits

**Solutions**:

#### Solution 1: Check Post Length

```
1. In Obsidian, check word count
2. If >10,000 words: Consider splitting
3. If >50,000 chars: Definitely split
```

#### Solution 2: Split into Series

```
1. Divide post into logical parts
2. Create separate notes:
   - Part 1: Introduction
   - Part 2: Main content
   - Part 3: Conclusion
3. Publish as series
4. Link between posts
```

#### Solution 3: Remove Heavy Content

**Check for**:

- Very long code blocks
- Embedded base64 images
- Huge markdown tables

**Simplify**:

- Extract code to external files, link
- Use image URLs instead of base64
- Break up large tables

---

## Batch Publishing Issues

### Error: "No markdown files found in selected folder"

**Symptoms**:

- Select folder
- Click "Publish all as drafts"
- Error immediately

**Cause**: Folder has no .md files or wrong folder selected

**Solutions**:

#### Solution 1: Verify Folder Contents

```
1. In Obsidian file explorer
2. Navigate to the folder
3. Check for .md files
4. If none: Wrong folder or no files
```

#### Solution 2: Check File Extensions

```
Are files actually .md?
- ✅ note.md (correct)
- ❌ note.markdown (not detected)
- ❌ note.txt (not markdown)
- ❌ note (no extension)

Fix: Rename to .md extension
```

#### Solution 3: Use Browse Button

```
1. Click "Browse" instead of typing
2. Visually select folder from list
3. Confirm folder path is correct
4. Try again
```

---

### Error: "No files selected"

**Symptoms**:

- File selection modal opens
- Click CONFIRM
- Error appears

**Cause**: All checkboxes unchecked

**Solution**:

```
1. Open file selection modal
2. Check at least one file (click checkbox or filename)
3. Click CONFIRM
4. Batch will process checked files only
```

**Tip**: Use "Select All" button to quickly check all files

---

### Batch Stops Mid-Process

**Symptoms**:

- Batch starts processing
- Stops after N files
- Not all files processed

**Possible Causes**:

1. Obsidian closed/crashed
2. Network interruption
3. Authentication expired mid-batch
4. System sleep/shutdown

**Solutions**:

#### Solution 1: Check Results Modal

When batch completes (or stops):

```
1. Results modal shows which files succeeded
2. Note which files failed
3. Check error messages for failed files
4. Process failed files individually or in new batch
```

#### Solution 2: Keep Obsidian Active

```
- Don't close Obsidian during batch
- Don't let computer sleep
- Keep stable internet connection
- For large batches: plug into power
```

#### Solution 3: Process in Smaller Batches

```
Instead of 50 files:
1. First batch: Files 1-15
2. Wait for completion
3. Second batch: Files 16-30
4. Etc.

More reliable for large sets
```

---

### Individual Files Fail in Batch

**Symptoms**:

- Batch completes
- Results show some successes, some failures
- Error messages per file

**Analysis**:

#### Check Results Modal

```
Results modal shows:
- ✓ Success: file1.md, file3.md (green)
- ✗ Failed: file2.md, file4.md (red)
  - file2.md: "No title found"
  - file4.md: "Authentication failed"
```

#### Solution by Error Type

**"No title found"**:

- Open that file
- Add H1 heading
- Retry individual file

**"Authentication failed"**:

- Cookie expired mid-batch
- Get fresh cookie
- Retry failed files

**"Network error"**:

- Internet hiccup
- Simply retry failed files

**"Invalid markdown"**:

- Check file format
- Fix markdown syntax
- Retry

---

## Performance Problems

### Obsidian Runs Slowly with Plugin Active

**Symptoms**:

- Obsidian lag
- Slow typing
- UI freezes

**Solutions**:

#### Solution 1: Close Sidebar When Not in Use

```
1. Click 📡 icon to close sidebar
2. Performance improves immediately
3. Open only when publishing
```

#### Solution 2: Clear System Logs

```
1. Open plugin sidebar
2. Scroll to "System Logs"
3. Click "Clear" button
4. Logs removed, memory freed
```

#### Solution 3: Update to Latest Version

```
1. Check current version
2. Update to 0.3.11 if not already
3. Performance improved in recent versions
```

#### Solution 4: Check System Resources

```
If Obsidian slow in general:
1. Close other apps
2. Check RAM usage
3. Restart Obsidian
4. Restart computer
```

---

### Batch Publishing Takes Forever

**Expected Duration**:

- ~1.5 seconds per file
- 10 files = ~15 seconds
- 20 files = ~30 seconds
- 50 files = ~75 seconds

**If Much Slower**:

#### Check Network Speed

```
1. Test internet speed
2. Slow connection = slower batch
3. Switch to faster network if available
```

#### Check File Sizes

```
1. Very large files take longer to process
2. Convert markdown to HTML takes time
3. Consider splitting very large files
```

#### Check System Load

```
1. Close other heavy apps
2. Free up RAM
3. Stop background downloads
```

---

## UI/UX Issues

### File Selection Modal Empty

**Symptoms**:

- Modal opens
- No files listed
- Just empty space

**Cause**: Folder has no markdown files (see Batch Publishing Issues above)

**Additional Check**:

```
1. Are files excluded by Obsidian?
2. Settings → Files & Links → Excluded files
3. Check if folder is excluded
4. Remove exclusion if needed
```

---

### Folder Not in Autocomplete List

**Symptoms**:

- Type folder name
- No suggestions appear
- Autocomplete seems broken

**Solutions**:

#### Solution 1: Use Browse Button

```
1. Click "Browse" button instead
2. Select folder from modal
3. Works even if autocomplete doesn't
```

#### Solution 2: Type Full Path

```
1. Type exact folder path
2. Example: folder/subfolder
3. Don't rely on autocomplete
4. Press Enter
```

#### Solution 3: Refresh Obsidian

```
1. Close and reopen vault
2. Folder list rebuilds
3. Try autocomplete again
```

---

### Sort Arrow Doesn't Work

**Symptoms**:

- Click "File Name ▲" header
- Files don't reorder
- Arrow doesn't change

**Status**: Should work in v0.3.11

**Solutions**:

#### Solution 1: Update Plugin

```
1. Ensure version is 0.3.11
2. Sorting added in this version
3. Update if on older version
```

#### Solution 2: Hard Refresh

```
1. Close file selection modal
2. Close plugin sidebar
3. Reopen sidebar
4. Start batch publishing again
```

---

## Error Code Reference

### HTTP Error Codes

**200 OK**:

- ✅ Success
- Post created/published
- No action needed

**400 Bad Request**:

- ❌ Invalid data sent
- Check post format
- Check for missing required fields

**401 Unauthorized**:

- ❌ Authentication failed
- Cookie invalid or expired
- Get fresh cookie

**403 Forbidden**:

- ❌ No permission
- Account issue
- Check Substack account status

**404 Not Found**:

- ❌ Publication not found
- Check URL is correct
- Check publication exists

**429 Too Many Requests**:

- ❌ Rate limited
- Wait 5-10 minutes
- Reduce request frequency

**500 Internal Server Error**:

- ❌ Substack server error
- Usually temporary
- Wait and retry
- Check status.substack.com

---

## System Logs Analysis

### Reading System Logs

System Logs in the plugin sidebar show:

- Timestamp
- Log level (INFO, WARN, ERROR)
- Message

**Example log entries**:

```
[14:23:45] INFO: Starting batch publish: 10 files
[14:23:46] INFO: Batch (1/10): post1.md
[14:23:48] INFO: ✓ Draft created: My First Post
[14:23:50] ERROR: ✗ Failed: post2.md - No title found
```

### Common Log Patterns

**Successful publish**:

```
INFO: Publishing to Substack...
INFO: ✓ Draft created: Post Title
```

**Authentication error**:

```
ERROR: Authentication failed
ERROR: Status: 401
```

**Network error**:

```
ERROR: Network error: Failed to fetch
ERROR: Check internet connection
```

**Format error**:

```
WARN: No H1 heading found
ERROR: Cannot extract title
```

### Using Logs for Support

When reporting issues:

```
1. Reproduce the problem
2. Open System Logs
3. Click "Copy" button
4. Paste logs in issue report
5. Include full log output
```

---

## Getting Help

### Before Asking for Help

Complete these steps:

1. ✅ Read this troubleshooting guide
2. ✅ Check FAQ.md
3. ✅ Search GitHub issues
4. ✅ Copy system logs
5. ✅ Try suggested solutions

### Information to Include

When reporting issues, include:

**Required**:

- Plugin version (from manifest.json)
- Obsidian version
- Operating system
- Exact error message
- Steps to reproduce

**Helpful**:

- System logs (copy from sidebar)
- Screenshot of error
- Example markdown that fails
- What you've tried already

### Where to Get Help

1. **Documentation**:
    - USER_GUIDE.md
    - FAQ.md
    - This file

2. **GitHub Issues**:
    - Search existing: https://github.com/zandercpzed/smartwrite-publisher/issues
    - Open new issue if not found

3. **Community**:
    - Obsidian forum (check for plugin threads)
    - Obsidian Discord (community plugins channel)

---

## Common Issue Flowchart

```
Problem Publishing?
├─ Is status dot GREEN?
│  ├─ NO → Fix connection (see Connection Problems)
│  └─ YES → Continue
├─ Does note have H1 heading?
│  ├─ NO → Add H1 heading
│  └─ YES → Continue
├─ Is markdown valid?
│  ├─ NO → Fix markdown syntax
│  └─ YES → Continue
├─ Check System Logs for specific error
│  ├─ "Auth failed" → Get fresh cookie
│  ├─ "Network error" → Check internet
│  ├─ "Rate limit" → Wait and retry
│  └─ Other → Search this guide for error
└─ Still not working?
   └─ Report issue with logs
```

---

## Quick Reference: Most Common Fixes

1. **Connection fails**: Get fresh cookie
2. **Empty posts**: Update to v0.3.11
3. **No title**: Add H1 heading to note
4. **Batch empty**: Select folder with .md files
5. **Slow performance**: Close sidebar, clear logs
6. **Authentication fails**: Cookie expired, get new one

---

**Last Updated**: January 30, 2026
**Document Version**: 1.0
**Plugin Version**: 0.3.11

For additional help, see [FAQ.md](./FAQ.md) or [USER_GUIDE.md](./USER_GUIDE.md).
