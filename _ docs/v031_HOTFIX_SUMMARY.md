# v0.3.1 Hotfix Summary

**Date**: 29 de janeiro de 2026, 12:59 UTC
**Version**: 0.3.1 (Hotfix from 0.3.0)
**Status**: ✅ Complete and deployed

---

## 🐛 Bug Fixed

### Markdown Title Extraction

**Problem**:
```
Original: # CR-3-876043749-05: THE INTERVIEWER
          ## The Perfect Opportunity
          [content...]

Published: <h2>The Perfect Opportunity</h2>
           [content...]  ← Body was missing H2!
```

**Root Cause**:
```typescript
// Old (WRONG)
html = html.replace(/^#\s+.+\n?/, '');  // Matches # ## ### etc
// Removes: # CR-3-... AND ## The Perfect...

// New (CORRECT)
html = html.replace(/^# +[^\n]*\n?/, '');  // Matches exactly one #
// Removes: only # CR-3-...
```

**Impact**: Markdown files with H1 title + H2 first section had H2 disappear from body

---

## ✅ Fix Applied

**File**: `src/converter.ts` line 104

Changed regex from `/^#\s+.+\n?/` to `/^# +[^\n]*\n?/`

This ensures:
- ✅ H1 is removed (used as title)
- ✅ H2, H3, etc remain in body
- ✅ Heading hierarchy respected

---

## 📦 Version Update

- manifest.json: 0.3.0 → 0.3.1
- package.json: 0.3.0 → 0.3.1
- versions.json: Added 0.3.1

---

## 🔧 Build Status

✅ Build: SUCCESS (25KB main.js)
✅ Deploy: Obsidian
✅ Backup: v0.3.1_20260129_125932.tar.gz (165 KB)

---

## 📋 Testing

**Expected Result**:
When publishing 13_The-Interviewer.md:
- ✅ Title: "CR-3-876043749-05: THE INTERVIEWER"
- ✅ Subtitle: "The Perfect Opportunity"
- ✅ Body: Starts with "Reconstructed from..." not with H2 heading

---

## 📝 Git Info

- Commit: fa3e88a
- Message: "release: Version 0.3.1 - Markdown title extraction hotfix"
- Tag: (will be v0.3.1 after QA)

---

**Status**: ✅ Ready for QA testing with 13_The-Interviewer.md
