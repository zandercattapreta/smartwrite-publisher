# SmartWrite Publisher - Frequently Asked Questions (FAQ)

**Version**: 1.0.0 (Updated: February 2, 2026)

Quick answers to the most common questions about SmartWrite Publisher.

---

## Table of Contents

1. [General Questions](#general-questions)
2. [Installation & Setup](#installation--setup)
3. [Publishing](#publishing)
4. [Batch Publishing](#batch-publishing)
5. [Platform-Specific](#platform-specific)
6. [Troubleshooting](#troubleshooting)
7. [Features & Roadmap](#features--roadmap)
8. [Technical Questions](#technical-questions)

---

## General Questions

### What is SmartWrite Publisher?

SmartWrite Publisher is an Obsidian plugin that lets you publish markdown notes directly to blogging platforms like Substack, Medium, and WordPress - without leaving Obsidian.

### Is it free?

Yes! SmartWrite Publisher is open source and completely free under the MIT license.

### Which platforms are supported?

**Current (v1.0.0)**:

- ✅ Substack (full support)

**Coming in v1.1.0**:

- 🔜 Medium
- 🔜 WordPress
- 🔜 Ghost
- 🔜 Dev.to

### Can I publish to multiple platforms at once?

Not yet, but this is the main feature of v0.4.0! You'll be able to select multiple platforms and publish to all of them simultaneously.

### Do I need to be online to use this plugin?

Yes, you need an internet connection to publish. However, you can write and prepare your posts offline in Obsidian.

### Will this work with Obsidian Sync?

Yes! The plugin works with Obsidian Sync. Your configuration is stored in your vault's `.obsidian` folder.

---

## Installation & Setup

### How do I install the plugin?

**Current Method** (v1.0.0):

1. Download from GitHub releases
2. Extract to `.obsidian/plugins/smartwrite-publisher/`
3. Enable in Obsidian settings

**Coming Soon** (v0.4.0):

- One-click GUI installer that auto-detects your vaults

See [USER_GUIDE.md - Installation](./USER_GUIDE.md#installation) for detailed steps.

### Where do I get my Substack cookie?

1. Log into Substack in your browser
2. Open DevTools (F12)
3. Go to Application/Storage tab
4. Find Cookies → `https://substack.com`
5. Copy the value of `substack.sid`

**Important**: Copy the entire value including `s%3A` prefix.

See [USER_GUIDE.md - Get Your Substack Cookie](./USER_GUIDE.md#step-2-configure-substack-connection) for screenshots and details.

### Does my cookie expire?

Yes, Substack cookies typically expire after ~30 days. When it expires:

- Connection will fail
- Status dot turns red
- You'll need to get a fresh cookie

### Is my cookie secure?

Your cookie is stored locally in Obsidian's settings. It's NOT sent anywhere except to Substack's servers when you publish.

**Security tips**:

- Don't share your cookie
- Don't commit it to Git
- Get a fresh cookie periodically

### Can I use multiple Substack publications?

Currently, you configure one publication at a time. To switch:

1. Change the URL in settings
2. May need a new cookie if it's a different account

**Future**: v0.4.0 will support multiple platform profiles.

### Where are my settings stored?

Settings are stored in:

```
Your-Vault/.obsidian/plugins/smartwrite-publisher/data.json
```

This file is NOT committed to Git by default (it's in `.gitignore`).

---

## Publishing

### What markdown features are supported?

**Supported**:

- ✅ Headings (H1-H6)
- ✅ Bold, italic, strikethrough
- ✅ Links
- ✅ Lists (bullet and numbered)
- ✅ Blockquotes
- ✅ Code blocks
- ✅ Images (with URLs)

**Not Supported** (Obsidian-specific):

- ❌ Wikilinks `[[link]]` - use `[text](url)` instead
- ❌ Callouts - converted to blockquotes
- ❌ Embedded files - use image URLs
- ❌ Dataview queries - not processed

### How do I format titles and subtitles?

```markdown
# This is the Title (H1 heading)

This first paragraph becomes the subtitle.

## This is a regular section heading

Content here...
```

**Rules**:

- **Title**: First H1 (`# Title`) in your note
- **Subtitle**: First paragraph after the title (optional)
- Only use ONE H1 per note

### What happens if I have no H1 heading?

The plugin uses the note filename as the title. However, **best practice** is to always include an H1 heading.

### Can I schedule posts for later?

Not yet. Substack's API doesn't support scheduling. Current workarounds:

1. Create draft → Schedule in Substack dashboard
2. Wait for v0.4.0 local scheduling feature

### Draft vs Live - which should I use?

**Recommended workflow**:

1. ✅ Create draft in Obsidian
2. ✅ Review in Substack dashboard
3. ✅ Edit if needed
4. ✅ Publish from Substack

**Live publishing**:

- ⚠️ Publishes immediately to all subscribers
- ⚠️ No chance to review before sending
- ⚠️ Use with caution

### Can I edit posts after publishing?

Yes, but **not from Obsidian** (yet). Edit in the Substack dashboard.

**Future**: v0.5.0 may include post updating features.

### Can I delete posts from Obsidian?

No, deletion must be done in the platform's dashboard.

---

## Batch Publishing

### What is batch publishing?

Batch publishing lets you create multiple drafts at once by selecting a folder of markdown files.

### How many files can I publish in a batch?

**Technical limit**: No hard limit

**Recommended**:

- Start with 5-10 files to test
- Maximum 20-30 files per batch
- Larger batches: split into multiple batches

**Why?**:

- Rate limiting concerns
- Easier to spot errors
- Less time waiting

### Does batch publishing publish live or create drafts?

Batch publishing **ALWAYS creates drafts** for safety. You cannot publish live in batch mode.

**Reasoning**:

- Prevents accidental mass publication
- Gives you chance to review
- Industry best practice

### What happens if one file fails in a batch?

Individual failures don't stop the batch:

- File #3 fails → Files #4-10 still process
- Each error logged separately
- Results modal shows success/failure per file

### Can I cancel a batch operation?

Not currently. Once started, the batch will complete all selected files.

**Workaround**: Close Obsidian to force-stop (not recommended)

**Future**: v0.4.0 will add a cancel button.

### Why is there a delay between each file?

**Rate limiting protection**: 1.5 second delay prevents API rate limit errors.

This is intentional and cannot be changed. Publishing 10 files takes ~15 seconds.

### Can I select files from multiple folders?

No, batch publishing works on one folder at a time.

**Workaround**:

1. Create temporary folder
2. Copy/move files there
3. Batch publish
4. Move files back

---

## Platform-Specific

### Substack Questions

**Q: Why do I need a cookie instead of API key?**

A: Substack doesn't provide a public API with API keys. The cookie method is the only way to programmatically publish.

**Q: Can I use this with multiple Substack publications?**

A: You can configure one publication at a time. Change URL and cookie to switch publications.

**Q: Does this work with paid subscriptions?**

A: Yes! The plugin creates posts, and you control subscriber settings in Substack.

**Q: Can I set post visibility (public/paid only)?**

A: Not yet. This is an API limitation. Set visibility in Substack dashboard after creating draft.

**Q: Will this send emails to my subscribers?**

A: Only if you use "Publish live". Drafts don't send emails.

### Medium Questions (Coming in v0.4.0)

**Q: Will I need an API token?**

A: Yes, Medium provides proper API keys. Much easier than cookie method!

**Q: Can I select which publication to post to?**

A: Yes, Medium supports multiple publications.

**Q: What about canonical URLs?**

A: v0.4.0 will support setting canonical URLs for cross-posting.

### WordPress Questions (Coming in v0.4.0)

**Q: Self-hosted or WordPress.com?**

A: Both! The plugin will support WordPress REST API available on both.

**Q: What about categories and tags?**

A: v0.4.0 will include category and tag mapping.

**Q: Featured images?**

A: Planned for v0.4.0 with URL-based featured image setting.

---

## Troubleshooting

### Connection fails - what should I check?

1. **Cookie**: Copied correctly with `s%3A` prefix?
2. **URL**: Format `publication.substack.com` (no https:// or /)
3. **Internet**: Can you access Substack in browser?
4. **Cookie expiry**: Get a fresh cookie

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed solutions.

### Posts appear empty in Substack

This was a bug in earlier versions. **Fixed in v0.3.11**.

If still happening:

1. Update to v1.0.0
2. Ensure H1 heading exists
3. Check System Logs for errors
4. Report issue with example markdown

### "Authentication failed" error

Your cookie has expired or is invalid.

**Solution**:

1. Get fresh cookie from browser
2. Paste in settings
3. Test connection

### Batch publishing stops or fails

**Common causes**:

1. Network interruption
2. Rate limiting (too fast)
3. Invalid file format
4. Authentication expired

**Solutions**:

- Check Results modal for specific errors
- Fix failed files individually
- Reduce batch size
- Check internet connection

### Plugin slows down Obsidian

**Solutions**:

1. Close plugin sidebar when not in use
2. Clear System Logs (click "Clear" button)
3. Update to latest version
4. Restart Obsidian

### File selection modal doesn't show files

**Causes**:

- Folder has no `.md` files
- Wrong folder selected
- Files hidden by Obsidian filters

**Solutions**:

- Verify folder has markdown files
- Use Browse button to select folder
- Check Obsidian excluded files settings

---

## Features & Roadmap

### What's coming in v0.4.0?

**Multi-Platform Support**:

- Medium, WordPress, Ghost adapters
- Publish to multiple platforms simultaneously
- Platform-specific settings

**GUI Installer**:

- Auto-detect Obsidian vaults
- One-click installation
- Cross-platform (Windows, Mac, Linux)

**Code Improvements**:

- Performance optimization
- Better error messages
- Loading states and spinners

**Documentation**:

- Complete English documentation
- API docs for developers
- Contributing guide

**Timeline**: ~6 weeks (25 sessions)

### When will scheduling be available?

**Substack**: Never (API doesn't support it)

**Alternative platforms** (Medium, WordPress): v0.4.0+ may include if APIs support it

**Local scheduling**: Possible future feature (v0.5.0)

### Can I request a feature?

Yes! Please:

1. Check [existing issues](https://github.com/zandercpzed/smartwrite-publisher/issues)
2. Open new issue if not exists
3. Describe your use case
4. Explain why it's valuable

### How can I contribute?

See [CONTRIBUTING.md](./CONTRIBUTING.md) for:

- Code contributions
- Documentation improvements
- Bug reports
- Feature ideas

---

## Technical Questions

### What language is it written in?

TypeScript, using the Obsidian Plugin API.

### Can I modify the source code?

Yes! It's open source (MIT license). Fork and modify as you like.

### How does the markdown conversion work?

1. Parse Obsidian markdown
2. Extract title (H1) and metadata
3. Convert to HTML
4. Format for platform API
5. Send to platform

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for technical details.

### Does it work offline?

You can use the plugin interface offline, but publishing requires internet connection.

### How large can my posts be?

**Technical limit**: Depends on platform API limits

**Tested**: Up to 50,000 characters (typical blog post: 1,000-5,000)

**Recommendation**: If post is very large (>10,000 words), consider splitting into series.

### Does it support images?

Yes, if you use **full URLs**:

```markdown
![Alt text](https://example.com/image.jpg)
```

**Not supported**:

- Local images (file paths)
- Obsidian image embeds `![[image.png]]`

**Future**: v0.5.0 may include image upload features.

### Can I run it on mobile?

No, the plugin is desktop-only (`isDesktopOnly: true` in manifest).

**Reasoning**:

- Cookie management difficult on mobile
- File system operations needed
- UI optimized for desktop

### What data does it collect?

**None!** The plugin:

- ✅ Stores settings locally
- ✅ Only sends data to your configured platforms
- ❌ No analytics
- ❌ No telemetry
- ❌ No external tracking

### Is the code audited for security?

The code is open source. You can:

- Review it yourself on GitHub
- Submit security issues privately
- Run your own security audit

**Best practice**: Always review plugins before installing.

### Can I use it in commercial projects?

Yes! MIT license allows:

- ✅ Personal use
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution

**Only requirement**: Keep original license notice.

---

## Still Have Questions?

### Check These Resources

1. **User Guide**: [USER_GUIDE.md](./USER_GUIDE.md) - Comprehensive documentation
2. **Troubleshooting**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
3. **API Docs**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - For developers
4. **GitHub Issues**: Search [existing issues](https://github.com/zandercpzed/smartwrite-publisher/issues)

### Contact Support

- **Bug Reports**: [Open GitHub issue](https://github.com/zandercpzed/smartwrite-publisher/issues/new)
- **Feature Requests**: [Open GitHub issue](https://github.com/zandercpzed/smartwrite-publisher/issues/new)
- **Questions**: Check documentation first, then open issue if needed

**When asking for help, include**:

1. Plugin version
2. Obsidian version
3. Operating system
4. Steps to reproduce
5. System logs (copy from sidebar)

---

## Glossary

**Terms used in this FAQ**:

- **Draft**: Unpublished post saved in platform dashboard
- **Live**: Published post visible to all subscribers
- **Batch Publishing**: Publishing multiple files at once
- **Cookie**: Authentication token from browser
- **API**: Application Programming Interface (how plugin talks to platforms)
- **Markdown**: Plain text formatting syntax used in Obsidian
- **H1, H2, etc.**: Heading levels in markdown
- **Vault**: Obsidian folder containing your notes
- **Adapter**: Code that connects plugin to specific platform

---

**Last Updated**: January 30, 2026
**Document Version**: 1.0
**Plugin Version**: 0.3.11
