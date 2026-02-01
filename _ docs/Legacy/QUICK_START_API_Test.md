# Quick Start: API Investigation Test

**Purpose**: Test if Substack supports scheduled posts via `publish_at` field

---

## 📋 Prerequisites

1. **Your Substack Cookie**
   - Go to your Substack site while logged in
   - Open Browser DevTools (F12)
   - Go to Application → Cookies
   - Copy the value of `substack.sid`

2. **Your Substack URL**
   - Example: `https://yourname.substack.com`

---

## 🚀 How to Run the Test

### Method 1: Using Environment Variables (Recommended)

```bash
# Set your credentials
export SUBSTACK_URL="https://yourname.substack.com"
export SUBSTACK_COOKIE="paste_your_cookie_here"

# Run the test
cd /sessions/affectionate-lucid-euler
node test_schedule_api.js
```

### Method 2: Edit Script Directly

1. Open `/sessions/affectionate-lucid-euler/test_schedule_api.js`
2. Edit the `CONFIG` object:
   ```javascript
   const CONFIG = {
       SUBSTACK_URL: "https://yourname.substack.com",
       COOKIE: "paste_your_cookie_here",
       PUBLICATION_ID: null
   };
   ```
3. Run:
   ```bash
   node /sessions/affectionate-lucid-euler/test_schedule_api.js
   ```

---

## 📊 What the Test Does

1. **Fetches your publication ID** automatically
2. **Creates a test draft** with `publish_at` field set to 2 hours from now
3. **Checks the API response** to see if scheduling is supported
4. **Tests multiple endpoints** to find how to list scheduled posts
5. **Prints a summary** with recommendations

---

## 🎯 Expected Outcomes

### ✅ Best Case: Scheduling Supported

```
TEST 1: Create Scheduled Post
   ✅ Draft created successfully!
   🎉 SUCCESS: publish_at field is supported!
   Scheduled for: 2026-01-30T15:00:00.000Z
```

**This means**: We can implement full scheduling feature in v0.4.0

### ⚠️ Partial: Field Ignored

```
TEST 1: Create Scheduled Post
   ✅ Draft created successfully!
   ⚠️  PARTIAL: Draft created but no publish_at in response
```

**This means**: Need to use fallback strategy (local scheduling or manual reminders)

### ❌ Worst Case: API Error

```
TEST 1: Create Scheduled Post
   ❌ Request failed with status 400
```

**This means**: Substack actively rejects the field, need alternative approach

---

## 📝 After Running the Test

1. Copy the **full output** from the terminal
2. Update `_ docs/API_INVESTIGATION_Schedule.md` with results:
   - Fill in "Test 1: `publish_at` Field" section
   - Fill in "Test 2: Alternative Formats" if needed
   - Fill in "Test 3: List Scheduled Posts" section
   - Update conclusions

3. Update `_ docs/PLAN_Schedule_Feature.md`:
   - Mark investigation as complete
   - Update implementation plan based on findings
   - Adjust timeline if fallback needed

4. Share findings with team/user

---

## 🛠️ Troubleshooting

### "Cannot proceed without publication ID"

- Your cookie might be expired or invalid
- Try logging out and back into Substack
- Get a fresh cookie

### "Request failed with status 403"

- Cookie is expired
- Get a new cookie from browser

### "ECONNREFUSED" or network errors

- Check your internet connection
- Verify SUBSTACK_URL is correct (include `https://`)

---

## 🔍 Manual Testing Alternative

If the script doesn't work, test manually with `curl`:

```bash
curl -X POST 'https://yourname.substack.com/api/v1/drafts?publication_id=YOUR_ID' \
  -H 'Cookie: substack.sid=YOUR_COOKIE' \
  -H 'Content-Type: application/json' \
  -d '{
    "draft_title": "TEST - Scheduled Post",
    "bodyJson": {
      "type": "doc",
      "content": [{
        "type": "paragraph",
        "content": [{"type": "text", "text": "Test"}]
      }]
    },
    "type": "newsletter",
    "draft_bylines": [],
    "publish_at": "2026-01-30T15:00:00.000Z"
  }'
```

Check the response for `publish_at` field.

---

## ✅ Checklist

- [ ] Get Substack cookie from browser
- [ ] Get Substack URL
- [ ] Run test script
- [ ] Copy full output
- [ ] Update API_INVESTIGATION_Schedule.md
- [ ] Update PLAN_Schedule_Feature.md
- [ ] Delete test draft from Substack (cleanup)
- [ ] Proceed with implementation or fallback plan

---

**Created**: 2026-01-29
**For**: SmartWrite Publisher v0.4.0
