# SmartWrite Publisher - User Guide

**Version**: 1.0.0 (Updated: February 1, 2026)

Welcome to SmartWrite Publisher! This comprehensive guide will help you get the most out of your multi-platform publishing workflow from Obsidian.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Installation](#installation)
4. [Initial Configuration](#initial-configuration)
5. [Publishing Your First Post](#publishing-your-first-post)
6. [Batch Publishing](#batch-publishing)
7. [Advanced Features](#advanced-features)
8. [Platform-Specific Guides](#platform-specific-guides)
9. [Troubleshooting](#troubleshooting)
10. [Tips & Best Practices](#tips--best-practices)

---

## Introduction

### What is SmartWrite Publisher?

SmartWrite Publisher is an Obsidian plugin that allows you to publish your markdown notes directly to blogging platforms like Substack, Medium, and WordPress. Write once in Obsidian, publish everywhere.

### Key Features

- **Single Note Publishing**: Publish the active note as a draft or live post
- **Batch Publishing**: Select a folder and publish multiple files at once
- **File Selection**: Choose exactly which files to publish with interactive checkboxes
- **Smart Folder Selection**: Autocomplete input with browse modal
- **File Sorting**: Sort files alphabetically (A-Z or Z-A)
- **Progress Tracking**: Real-time progress indicators during batch operations
- **Results Dashboard**: Detailed success/failure summary after publishing
- **Markdown Conversion**: Automatic conversion from Obsidian markdown to platform-compatible HTML (internally converting to Substack's Tiptap JSON format for robust content rendering)
- **Error Handling**: Graceful error handling with detailed error messages
- **Rate Limiting**: Automatic delays to prevent API rate limit issues

### Supported Platforms

**Current (v1.0.0)**:

- ✅ Substack (full support)

**Coming in v0.4.0**:

- 🔜 Medium
- 🔜 WordPress
- 🔜 Ghost
- 🔜 Dev.to

---

## Getting Started

### Prerequisites

Before you begin, make sure you have:

1. **Obsidian** installed (version 0.15.0 or higher)
2. An **Obsidian vault** where you write your content
3. A **Substack account** (or account on your preferred platform)
4. **Basic knowledge** of Markdown formatting

### System Requirements

- **Operating System**: Windows, macOS, or Linux
- **Obsidian Version**: 0.15.0 or higher
- **Internet Connection**: Required for publishing
- **Disk Space**: ~5MB for plugin files

---

## Installation

### Method 1: Using the Installer (Recommended)

**Coming in v0.4.0**: GUI installer that automatically detects your Obsidian vaults.

### Method 2: Manual Installation

1. **Download the Plugin**:
    - Visit the [GitHub releases page](https://github.com/zandercpzed/smartwrite-publisher/releases)
    - Download the latest release ZIP file

2. **Extract to Plugin Folder**:

    ```
    Your-Vault/.obsidian/plugins/smartwrite-publisher/
    ```

3. **Files Required**:
    - `main.js` - Plugin code
    - `manifest.json` - Plugin metadata
    - `styles.css` - Plugin styles

4. **Enable the Plugin**:
    - Open Obsidian
    - Go to `Settings` → `Community plugins`
    - Find "SmartWrite Publisher" in the list
    - Toggle it to **ON**

5. **Verify Installation**:
    - Look for the 📡 broadcast icon in the left sidebar
    - Click it to open the SmartWrite Publisher panel

---

## Initial Configuration

### Step 1: Open SmartWrite Publisher

Click the **📡 broadcast icon** in Obsidian's left sidebar. This opens the SmartWrite Publisher panel.

### Step 2: Configure Substack Connection

1. **Locate the "Substack Connection" Section**
    - This is in the lower part of the sidebar panel
    - Look for the connection status dot (red = disconnected, green = connected)

2. **Get Your Substack Cookie**:

    **Why do we need a cookie?**
    Substack doesn't provide a public API for authentication. We use your browser cookie to authenticate requests.

    **How to get your cookie**:

    a. **Log into Substack** in your web browser

    b. **Open Developer Tools**:
    - Chrome/Edge: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
    - Firefox: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
    - Safari: Enable Developer menu first, then `Cmd+Option+I`

    c. **Go to Application/Storage Tab**:
    - Chrome/Edge: Click "Application" tab
    - Firefox: Click "Storage" tab
    - Safari: Click "Storage" tab

    d. **Find Cookies**:
    - Expand "Cookies" in the left sidebar
    - Click on `https://substack.com`

    e. **Copy the `substack.sid` cookie**:
    - Find the row with name `substack.sid`
    - Copy the entire **Value** (it's a long string starting with `s%3A`)

    **Important**: The cookie includes URL encoding (like `s%3A`). Copy it exactly as shown - the plugin will decode it automatically.

3. **Enter Your Substack URL**:
    - Format: `yourpublication.substack.com`
    - Example: `thebreachrpg.substack.com`
    - Don't include `https://` or trailing slashes

4. **Test Connection**:
    - Click the "Test Connection" button
    - If successful, the status dot turns **green** ✅
    - If failed, see [Troubleshooting](#troubleshooting)

---

## Publishing Your First Post

### Preparing Your Note

1. **Create or Open a Note** in Obsidian

2. **Format Requirements**:
    - **Title**: Use an H1 heading at the top:
        ```markdown
        # Your Post Title
        ```
    - **Subtitle** (optional): First paragraph after title becomes subtitle
    - **Content**: Regular markdown formatting

3. **Example Note Structure**:

    ```markdown
    # My Amazing Blog Post

    This is the subtitle - a brief description of the post.

    ## First Section

    Your content goes here with **bold**, _italic_, and [links](https://example.com).

    - Bullet points
    - Work great too

    ## Second Section

    More content...
    ```

### Publishing as Draft

1. **Open SmartWrite Publisher** sidebar (📡 icon)

2. **In the "Active Note" Section**:
    - Verify the correct note is shown
    - Click **"Create draft"** button

3. **Wait for Confirmation**:
    - You'll see a success notice: "✓ Draft created successfully"
    - Check the "System Logs" section for details

4. **Verify in Substack**:
    - Go to your Substack dashboard
    - Find your draft in the "Drafts" section

### Publishing Live

⚠️ **Warning**: This publishes immediately to your subscribers!

1. **Follow the same steps** as creating a draft
2. Click **"Publish live"** instead of "Create draft"
3. Confirm in the modal that appears
4. Post goes live immediately

**Best Practice**: Always create a draft first, review it in Substack, then publish from there.

---

## Batch Publishing

Batch publishing allows you to create multiple drafts at once from a folder.

### When to Use Batch Publishing

- Migrating content from another platform
- Publishing a series of posts
- Bulk uploading archived content
- Preparing scheduled content in advance

### Step-by-Step Guide

#### Step 1: Organize Your Files

1. **Create a folder** in your vault (e.g., "Posts to Publish")
2. **Add markdown files** to this folder
3. **Ensure each file** has proper formatting:
    - H1 heading for title
    - Content in markdown

#### Step 2: Select Folder

1. **Open SmartWrite Publisher** sidebar
2. **Go to "Batch Publishing" section**
3. **Choose your folder** using one of these methods:

    **Method A: Type with Autocomplete**
    - Start typing the folder name
    - Select from autocomplete suggestions

    **Method B: Browse**
    - Click the "Browse" button
    - Click on your folder in the modal
    - Modal closes with folder selected

#### Step 3: Select Files

1. **Click "Publish all as drafts"**
2. **File Selection Modal Opens**:
    - Shows all markdown files in the folder
    - All files are **pre-checked** by default
    - File list is **sorted alphabetically** (A-Z)

3. **Review and Adjust**:
    - ✅ **Checked** = Will be published
    - ☐ **Unchecked** = Will be skipped

4. **Use Selection Controls**:
    - **"Select All"**: Check all files
    - **"Unselect All"**: Uncheck all files
    - **Click file name**: Toggle that file's checkbox

5. **Sort Files** (optional):
    - Click "File Name ▲" header
    - Toggles between A-Z (▲) and Z-A (▼)

#### Step 4: Confirm and Publish

1. **Click "CONFIRM"** button
2. **Watch Progress**:
    - Notices show progress: "(1/10) Publishing: filename..."
    - Check "System Logs" for detailed progress
    - Average: ~1.5 seconds per file

#### Step 5: Review Results

1. **Results Modal** appears automatically
2. **Summary Section** shows:
    - Total files processed
    - ✓ Success count (green)
    - ✗ Failure count (red)

3. **Details Section** lists each file:
    - ✓ Successful publications
    - ✗ Failed publications with error messages

4. **Check System Logs** for full details

### Batch Publishing Best Practices

✅ **DO**:

- Test with 2-3 files first
- Review each file before batch publishing
- Create drafts (never publish live in batch)
- Check results summary carefully
- Verify drafts in Substack dashboard

❌ **DON'T**:

- Publish 100+ files at once (start small)
- Close Obsidian during batch operation
- Ignore error messages
- Assume all files published successfully

### Error Handling in Batch

**Individual errors don't stop the batch**:

- If file #3 fails, files #4-10 still process
- Each error is logged separately
- Results modal shows which files failed and why

**Common batch errors**:

- Invalid markdown format
- Missing title (H1 heading)
- Network connectivity issues
- Rate limiting (if going too fast)

---

## Advanced Features

### File Sorting

- **Where**: File selection modal in batch publishing
- **How**: Click "File Name ▲" header
- **Toggle**: Between A-Z (▲) and Z-A (▼)
- **Use case**: Find files more easily in large folders

### Progress Tracking

- **Real-time notices**: "(1/10) Publishing: filename..."
- **System logs**: Detailed log of each operation
- **Results modal**: Summary after completion

### System Logs

**Location**: Bottom of SmartWrite Publisher sidebar

**Features**:

- Timestamped log entries
- Color-coded log levels (Info, Warning, Error)
- **Copy** button: Copy all logs to clipboard
- **Clear** button: Clear all logs

**Using logs for troubleshooting**:

1. Reproduce the issue
2. Click "Copy" in System Logs
3. Paste into a text file
4. Share with support or check for error patterns

---

## Platform-Specific Guides

### Substack

#### Content Formatting

**Supported**:

- ✅ Headings (H1-H6)
- ✅ Bold, italic, strikethrough
- ✅ Links
- ✅ Bullet and numbered lists
- ✅ Blockquotes
- ✅ Code blocks
- ✅ Images (with URLs)

**Not Supported**:

- ❌ Obsidian callouts (converted to blockquotes)
- ❌ Wikilinks (use markdown links instead)
- ❌ Embedded files
- ❌ Dataview queries

#### Title and Subtitle

- **Title**: First H1 heading in your note
- **Subtitle**: First paragraph after the title (optional)

**Example**:

```markdown
# This Becomes the Title

This paragraph becomes the subtitle in Substack.

## This is a regular heading

Regular content here...
```

#### Draft vs Live Publishing

- **Draft**: Creates unpublished post in your dashboard
- **Live**: Publishes immediately and sends to subscribers

**⚠️ Important**:

- Batch publishing ALWAYS creates drafts (safety feature)
- Cannot publish live in batch mode
- Review drafts in Substack before publishing

#### Cookie Expiration

**Substack cookies expire periodically** (typically 30 days).

**Symptoms**:

- "Authentication failed" error
- Red status dot
- Failed test connection

**Solution**:

1. Get a fresh cookie (follow [Initial Configuration](#initial-configuration))
2. Paste new cookie in settings
3. Test connection again

---

## Troubleshooting

### Connection Issues

**Problem**: Red status dot, connection fails

**Solutions**:

1. **Check cookie**:
    - Ensure you copied the entire cookie value
    - Include the `s%3A` prefix
    - No extra spaces at start/end

2. **Check URL**:
    - Format: `yourpublication.substack.com`
    - No `https://` prefix
    - No trailing slash `/`

3. **Re-authenticate**:
    - Get a fresh cookie from browser
    - Paste in "Cookie Secret" field
    - Test connection

4. **Check internet**:
    - Ensure you're online
    - Try accessing Substack in browser
    - Check firewall settings

### Publishing Failures

**Problem**: Post fails to publish

**Check**:

1. **Format**:
    - Does note have H1 heading?
    - Is markdown valid?

2. **Connection**:
    - Is status dot green?
    - Test connection first

3. **Content**:
    - Is content too large? (Try shorter post)
    - Any special characters causing issues?

4. **Logs**:
    - Check System Logs for specific error
    - Copy logs for support

### Empty Posts / Missing Content

**Problem**: Draft created but appears empty in Substack

**This should be fixed in v0.3.11**, but if you still see it:

1. **Check markdown format**:
    - Ensure H1 title exists
    - Content below title

2. **Update plugin**:
    - Are you on v1.0.0 or higher?
    - Update to latest version

3. **Report issue**:
    - Include example markdown
    - Include system logs

### Batch Publishing Issues

**Problem**: Batch fails or stops mid-process

**Solutions**:

1. **Check all files**:
    - Do all files have proper format?
    - Any files with special characters in names?

2. **Reduce batch size**:
    - Try 5 files instead of 50
    - Process in smaller batches

3. **Check individual errors**:
    - Results modal shows which files failed
    - Fix those files individually

**Problem**: Can't find folder in autocomplete

**Solutions**:

1. **Use Browse button** instead
2. **Type exact path**: `folder/subfolder`
3. **Check folder exists** in vault

### Performance Issues

**Problem**: Obsidian slow with plugin active

**Solutions**:

1. **Close publisher sidebar** when not in use
2. **Clear system logs** regularly
3. **Update to latest version**

### Common Errors

**"No markdown files found in selected folder"**

- Solution: Ensure folder contains `.md` files

**"Please configure cookie and URL first"**

- Solution: Complete [Initial Configuration](#initial-configuration)

**"Please select a folder first"**

- Solution: Select folder before clicking "Publish all as drafts"

**"No files selected"**

- Solution: Check at least one file in the file selection modal

---

## Tips & Best Practices

### Content Organization

1. **Create a Publishing Folder**:
    - Separate drafts from published content
    - Example: `To Publish/`, `Published/`, `Archived/`

2. **Use Consistent Naming**:
    - `YYYY-MM-DD-title.md` for easy sorting
    - Example: `2026-01-30-my-post.md`

3. **Tag Your Posts**:
    - Use frontmatter or content tags
    - Helps organize in Obsidian
    - Plan for future platform tag support

### Publishing Workflow

1. **Draft → Review → Publish**:
    - Always create draft first
    - Review in Substack dashboard
    - Edit if needed in Substack
    - Publish when ready

2. **Batch Publishing**:
    - Test with 2-3 files first
    - Verify results before larger batches
    - Keep batches under 20 files

3. **Backup Your Content**:
    - Obsidian vault is your source of truth
    - Git version control recommended
    - Regular vault backups

### Markdown Best Practices

1. **Use Proper Heading Hierarchy**:

    ```markdown
    # Post Title (H1 - only one)

    ## Section (H2)

    ### Subsection (H3)
    ```

2. **Avoid Obsidian-Specific Syntax**:
    - Use `[text](url)` instead of `[[wikilinks]]`
    - Use standard markdown instead of callouts
    - Images: `![alt](https://url)` with full URLs

3. **Test Formatting**:
    - Preview in Obsidian reading mode
    - Check how it looks after publishing
    - Adjust as needed

### Security Best Practices

1. **Protect Your Cookie**:
    - Don't share your cookie value
    - Don't commit to Git repositories
    - Rotate periodically (get new cookie)

2. **Review Before Publishing Live**:
    - Always review drafts first
    - Check for sensitive information
    - Verify all links work

3. **Use Drafts by Default**:
    - Batch publishing always uses drafts
    - Manual publishing: prefer drafts
    - Only publish live when certain

---

## Keyboard Shortcuts

**Coming in v0.4.0**: Customizable keyboard shortcuts for common actions.

**Planned shortcuts**:

- `Ctrl/Cmd + Shift + P`: Publish active note as draft
- `Ctrl/Cmd + Shift + L`: Publish active note live
- `Ctrl/Cmd + Shift + B`: Open batch publishing

---

## FAQ

For frequently asked questions, see [FAQ.md](./FAQ.md)

For troubleshooting specific errors, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## Getting Help

### Documentation Resources

- **User Guide**: This document
- **FAQ**: Common questions and answers
- **Troubleshooting**: Detailed error solutions
- **API Docs**: For developers adding features
- **Contributing**: How to contribute to the project

### Support Channels

1. **GitHub Issues**: [Report bugs or request features](https://github.com/zandercpzed/smartwrite-publisher/issues)
2. **Documentation**: Check this guide and FAQ first
3. **System Logs**: Include in support requests

### Reporting Bugs

When reporting a bug, include:

1. Plugin version (check manifest.json)
2. Obsidian version
3. Operating system
4. Steps to reproduce
5. System logs (copy from sidebar)
6. Expected vs actual behavior

---

## What's Next?

### Version v1.2.0: Professional Release (Coming Soon)

**Status**: In Progress
**Timeline**: ~6 weeks

**Vision**: Transform SmartWrite Publisher into a professional-grade multi-platform publishing tool

### Version v1.3.0: Advanced Features (Future)

### Feedback

We value your feedback! Please share:

- Feature requests
- Usability improvements
- Documentation suggestions
- Bug reports

Visit our [GitHub repository](https://github.com/zandercpzed/smartwrite-publisher) to contribute.

---

## Version History

See [CHANGELOG.md](../CHANGELOG.md) for complete version history.

**Current Version**: 1.0.0

- File list sorting
- Enhanced file selection UI
- Batch publishing
- Publish live button fix

---

## Credits

**Author**: Zander Catta Preta
**License**: MIT
**Repository**: https://github.com/zandercpzed/smartwrite-publisher

Built with ❤️ for the Obsidian community.

---

**Last Updated**: February 1, 2026
**Document Version**: 1.0
**Plugin Version**: 1.0.0
