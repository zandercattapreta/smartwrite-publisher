# Medium and WordPress API Research

**Research Date**: 2026-02-02  
**Researcher**: Zander Catta Preta  
**Purpose**: Investigate API capabilities for SmartWrite Publisher integration

---

## Table of Contents

1. [Medium API](#medium-api)
2. [WordPress REST API](#wordpress-rest-api)
3. [Feature Comparison](#feature-comparison)
4. [Implementation Recommendations](#implementation-recommendations)

---

## Medium API

### API Status

**IMPORTANT**: The official Medium API is **no longer actively maintained**. The GitHub repository was archived on March 2, 2023, and new integrations using browser-based OAuth authentication are no longer permitted.

### Base URL

```
https://api.medium.com/v1
```

### Authentication

Medium provides two authentication methods:

#### 1. Integration Tokens (Self-issued) - **RECOMMENDED**

**How to obtain**:

1. Log into Medium account
2. Navigate to Settings → Security and apps
3. Scroll to "Integration tokens" section
4. Enter a name for the token
5. Click "Generate token"
6. **Copy immediately** - cannot be viewed again

**Characteristics**:

- Do not expire automatically
- Can be revoked by user at any time
- Best for desktop integrations and plugins
- No browser-based flow required

**Usage**:

```http
Authorization: Bearer YOUR_INTEGRATION_TOKEN
```

#### 2. OAuth 2.0 (Browser-based) - **DEPRECATED**

No longer supported for new integrations.

**Available scopes** (for legacy apps):

- `basicProfile` - Read user profile info
- `listPublications` - List publications user has access to
- `publishPost` - Create posts
- `uploadImage` - Upload images

### Endpoints

#### Get User Info

```http
GET /v1/me
Authorization: Bearer {token}
```

**Response**:

```json
{
	"data": {
		"id": "5303d74c64f66366f00cb9b2a94f3251bf5",
		"username": "majelbstoat",
		"name": "Jamie Talbot",
		"url": "https://medium.com/@majelbstoat",
		"imageUrl": "https://images.medium.com/..."
	}
}
```

#### List User's Publications

```http
GET /v1/users/{userId}/publications
Authorization: Bearer {token}
```

**Response**: Array of publications the user can publish to.

#### Create Post (User Profile)

```http
POST /v1/users/{authorId}/posts
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:

```json
{
	"title": "Your Post Title",
	"contentFormat": "markdown",
	"content": "# Post content in markdown or html",
	"tags": ["tag1", "tag2", "tag3"],
	"canonicalUrl": "https://original-source.com/post",
	"publishStatus": "draft",
	"license": "all-rights-reserved",
	"notifyFollowers": false
}
```

**Parameters**:

- `title` (required) - Post title
- `contentFormat` (required) - "markdown" or "html"
- `content` (required) - Post body in specified format
- `tags` (optional) - Array of strings (only first 3 used, max 25 chars each)
- `canonicalUrl` (optional) - Original source URL
- `publishStatus` (optional) - "public", "draft", or "unlisted" (default: "public")
- `license` (optional) - License type
- `notifyFollowers` (optional) - Whether to notify followers

**Response**:

```json
{
	"data": {
		"id": "e6f36a",
		"title": "Your Post Title",
		"authorId": "5303d74c64f66366f00cb9b2a94f3251bf5",
		"url": "https://medium.com/@username/post-slug-e6f36a",
		"canonicalUrl": "",
		"publishStatus": "draft",
		"publishedAt": 0,
		"license": "all-rights-reserved",
		"licenseUrl": "https://medium.com/policy/9db0094a1e0f"
	}
}
```

#### Create Post (Under Publication)

```http
POST /v1/publications/{publicationId}/posts
Authorization: Bearer {token}
Content-Type: application/json
```

**Same body as user posts**

**Permission Rules**:

- **Editors**: Can create posts with any `publishStatus` (public/draft/unlisted)
- **Writers**: Can only create "draft" posts (pending approval)
- **Others**: Cannot create posts

#### Upload Image

```http
POST /v1/images
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data**:

- `image` - The image file (JPEG, PNG, GIF, TIFF)

**Limitations**:

- Max file size: 25MB
- Allowed formats: JPEG, PNG, GIF, TIFF

**Response**:

```json
{
	"data": {
		"url": "https://images.medium.com/...",
		"md5": "d41d8cd98f00b204e9800998ecf8427e"
	}
}
```

**Note**: Images can also be side-loaded by including `<img>` tags with external URLs in content. Medium will fetch and host them automatically.

### Retrieving Existing Posts

**Critical Limitation**: The official Medium API **does not provide endpoints to retrieve existing user posts**.

#### Alternative Methods:

##### 1. Export from Medium (Official)

**Process**:

1. Click profile photo
2. Go to Settings
3. Select "Security and apps" tab
4. Click "Download your information"
5. Receive email with ZIP file containing all data

**Contents**:

- All articles (HTML format)
- Comments
- Follower information

**Format**: ZIP archive with HTML files

##### 2. RSS Feed (Public Posts)

**URL Pattern**:

```
https://medium.com/feed/@username
```

**Characteristics**:

- Returns latest public posts
- XML format (can be converted to JSON)
- Contains title, content, link, publish date
- Limited to recent posts (~10-50)
- No authentication required for public feeds

**Example using RSS to JSON converter**:

```
https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@username
```

##### 3. Unofficial Medium APIs

**Available on RapidAPI** and other platforms:

- Can fetch user articles
- Can fetch publication articles
- Requires third-party API key
- **Not officially supported - use at own risk**

### API Limitations

**Cannot do**:

- Retrieve existing posts via official API
- Update posts after creation
- Delete posts
- Schedule posts (publish_at is ignored)
- Set post visibility (paid/free) - UI only
- Manage comments
- Access analytics

**Tag limitations**:

- Maximum 5 tags
- Only first 3 are used
- Tags longer than 25 characters are ignored

**Content limitations**:

- Specific HTML tags allowed
- Some markdown features may not render correctly
- No LaTeX/Math support

---

## WordPress REST API

### API Version

**WordPress REST API v2** (included in WordPress core since 4.7)

### Base URL

```
https://yoursite.com/wp-json/wp/v2
```

### Authentication

WordPress supports multiple authentication methods:

#### 1. Application Passwords - **RECOMMENDED for Plugins**

**Requirements**:

- WordPress 5.6+
- SSL/HTTPS required (WordPress enforces this)

**How to generate**:

1. Log into WordPress admin
2. Go to Users → Profile
3. Scroll to "Application Passwords" section
4. Enter application name
5. Click "Add New Application Password"
6. **Copy password immediately** - displayed only once

**Usage**:

```http
Authorization: Basic base64(username:application_password)
```

**Example (Python)**:

```python
import requests
from requests.auth import HTTPBasicAuth

url = "https://yoursite.com/wp-json/wp/v2/posts"
auth = HTTPBasicAuth('username', 'application_password')
response = requests.post(url, json=data, auth=auth)
```

**Characteristics**:

- User-specific permissions
- Can be revoked individually
- Multiple app passwords per user
- Does not expire

#### 2. OAuth 1.0a

Requires WordPress OAuth plugin. More complex setup.

#### 3. JSON Web Tokens (JWT)

Requires JWT authentication plugin. Token-based auth.

### Endpoints

#### Get User Info

```http
GET /wp/v2/users/me
Authorization: Basic {credentials}
```

**Response**:

```json
{
  "id": 1,
  "name": "Admin User",
  "url": "https://yoursite.com",
  "description": "",
  "link": "https://yoursite.com/author/admin/",
  "slug": "admin",
  "avatar_urls": {...},
  "capabilities": {...}
}
```

#### List Posts

```http
GET /wp/v2/posts
```

**Query Parameters**:

- `per_page` (int) - Posts per page (default: 10, max: 100)
- `page` (int) - Page number for pagination
- `search` (string) - Search term
- `author` (int) - Filter by author ID
- `categories` (array) - Filter by category IDs
- `tags` (array) - Filter by tag IDs
- `status` (string) - Filter by status (publish, draft, pending, etc.)
- `orderby` (string) - Sort by field (date, title, author, etc.)
- `order` (string) - Sort order (asc, desc)
- `_fields` (string) - Limit response fields (performance optimization)

**Example**:

```http
GET /wp/v2/posts?per_page=50&page=1&status=publish&_fields=id,title,content,excerpt
```

**Response Headers**:

- `X-WP-Total` - Total number of posts
- `X-WP-TotalPages` - Total number of pages

**Response**:

```json
[
	{
		"id": 123,
		"date": "2026-02-01T10:00:00",
		"title": {
			"rendered": "Post Title"
		},
		"content": {
			"rendered": "<p>Post content...</p>"
		},
		"excerpt": {
			"rendered": "<p>Excerpt...</p>"
		},
		"author": 1,
		"featured_media": 456,
		"categories": [1, 5],
		"tags": [2, 3, 4]
	}
]
```

#### Get Single Post

```http
GET /wp/v2/posts/{post_id}
```

#### Create Post

```http
POST /wp/v2/posts
Authorization: Basic {credentials}
Content-Type: application/json
```

**Request Body**:

```json
{
	"title": "New Post Title",
	"content": "<p>Post content in HTML or Gutenberg blocks JSON</p>",
	"status": "draft",
	"excerpt": "Optional excerpt",
	"author": 1,
	"categories": [1, 5],
	"tags": [2, 3, 4],
	"featured_media": 456,
	"meta": {
		"custom_field": "value"
	}
}
```

**Parameters**:

- `title` (object or string) - Post title
- `content` (object or string) - Post content (HTML or Gutenberg blocks)
- `status` (string) - Post status: "draft", "publish", "pending", "private", "future"
- `excerpt` (object or string) - Post excerpt
- `author` (int) - Author ID
- `categories` (array) - Category IDs
- `tags` (array) - Tag IDs
- `featured_media` (int) - Media ID for featured image
- `meta` (object) - Custom meta fields
- `date` (string) - Publication date (ISO 8601 format for scheduling)
- `password` (string) - Password for password-protected posts

**Gutenberg Blocks Format** (recommended for modern WordPress):

```json
{
	"title": "Post Title",
	"content": "<!-- wp:paragraph -->\n<p>Content here</p>\n<!-- /wp:paragraph -->",
	"status": "draft"
}
```

**Response**: Full post object including ID, URL, etc.

#### Update Post

```http
PUT /wp/v2/posts/{post_id}
// or
POST /wp/v2/posts/{post_id}

Authorization: Basic {credentials}
Content-Type: application/json
```

**Same body as create** - only include fields to update.

#### Delete Post

```http
DELETE /wp/v2/posts/{post_id}
Authorization: Basic {credentials}
```

**Query Parameters**:

- `force` (bool) - Whether to bypass trash and permanently delete

#### Upload Media (Featured Image)

```http
POST /wp/v2/media
Authorization: Basic {credentials}
Content-Type: image/jpeg
Content-Disposition: attachment; filename="image.jpg"

{binary image data}
```

**Response**:

```json
{
	"id": 456,
	"source_url": "https://yoursite.com/wp-content/uploads/2026/02/image.jpg",
	"title": {
		"rendered": "image"
	},
	"media_type": "image"
}
```

**Then set as featured image**:

```http
POST /wp/v2/posts/{post_id}
{
  "featured_media": 456
}
```

#### Get Categories

```http
GET /wp/v2/categories
```

#### Create Category

```http
POST /wp/v2/categories
{
  "name": "New Category",
  "description": "Category description"
}
```

#### Get Tags

```http
GET /wp/v2/tags
```

#### Create Tag

```http
POST /wp/v2/tags
{
  "name": "New Tag"
}
```

### Advanced Features

#### Custom Post Types

WordPress custom post types are also accessible via REST API:

```http
GET /wp/v2/{custom_post_type}
POST /wp/v2/{custom_post_type}
```

#### Multi-site Support

For WordPress multi-site installations, each site has its own API endpoint:

```
https://network.com/site1/wp-json/wp/v2/posts
https://network.com/site2/wp-json/wp/v2/posts
```

#### Pagination for Large Datasets

To retrieve all posts (more than 100):

```javascript
let allPosts = [];
let page = 1;
let totalPages = 1;

while (page <= totalPages) {
	const response = await fetch(
		`https://site.com/wp-json/wp/v2/posts?per_page=100&page=${page}`,
	);

	totalPages = parseInt(response.headers.get("X-WP-TotalPages"));
	const posts = await response.json();
	allPosts = allPosts.concat(posts);
	page++;
}
```

### WordPress API Capabilities

**Can do**:

- Create, read, update, delete posts
- Manage categories and tags
- Upload and manage media
- Schedule posts (future publish dates)
- Set visibility (public, private, password-protected)
- Custom post types
- Custom taxonomies
- Custom fields/meta data
- Revisions
- Comments (via `/wp/v2/comments`)
- Multi-site support

**Cannot do (without plugins)**:

- Direct Gutenberg block manipulation (done through HTML comments)
- Analytics (requires third-party plugins like Jetpack)
- Advanced SEO fields (requires SEO plugin like Yoast)

### WordPress REST API Limitations

**Rate Limiting**:

- No built-in rate limiting in core
- Hosting provider may impose limits
- Can be added via plugins

**Authentication Requirements**:

- HTTPS required for Application Passwords
- User must have appropriate capabilities

**Content Format**:

- Gutenberg blocks stored as HTML comments
- Classic content is plain HTML
- No native markdown support (requires conversion)

---

## Feature Comparison

| Feature             | Medium API                 | WordPress REST API              |
| ------------------- | -------------------------- | ------------------------------- |
| **Authentication**  | Integration Token          | Application Password            |
| **Create Draft**    | ✓ (publishStatus="draft")  | ✓ (status="draft")              |
| **Publish Live**    | ✓ (publishStatus="public") | ✓ (status="publish")            |
| **Update Post**     | ✗ Not supported            | ✓ PUT/POST to /posts/{id}       |
| **Delete Post**     | ✗ Not supported            | ✓ DELETE /posts/{id}            |
| **Schedule Post**   | ✗ Ignored                  | ✓ (date field, status="future") |
| **List Posts**      | ✗ Use RSS/Export           | ✓ GET /posts with pagination    |
| **Get Single Post** | ✗ Not available            | ✓ GET /posts/{id}               |
| **Tags**            | ✓ Max 5, only first 3 used | ✓ Unlimited                     |
| **Categories**      | ✗ Not supported            | ✓ Full support                  |
| **Featured Image**  | ✗ Not supported            | ✓ via featured_media            |
| **Image Upload**    | ✓ POST /images             | ✓ POST /media                   |
| **Canonical URL**   | ✓ canonicalUrl field       | ✓ Via SEO plugins               |
| **Content Format**  | Markdown or HTML           | HTML (Gutenberg blocks)         |
| **Visibility**      | public/draft/unlisted      | publish/draft/private/password  |
| **Multi-site**      | Via publications           | ✓ Network support               |
| **Custom Fields**   | ✗ Not supported            | ✓ meta field                    |
| **Revisions**       | ✗ Not supported            | ✓ Built-in                      |

---

## Implementation Recommendations

### Medium Integration

**Recommended Approach**:

1. **Publishing** (v1.1.0):
    - Use Integration Tokens (easiest, no expiration)
    - Implement POST to `/v1/users/{userId}/posts`
    - Support markdown contentFormat
    - Handle tags (max 3 useful)
    - Support canonical URL
    - Support draft/public/unlisted status
    - Implement image side-loading with `<img>` tags

2. **Import/Export** (v1.2.0):
    - **Option A**: Parse user's RSS feed for public posts
        - Pros: No auth required, simple
        - Cons: Limited to recent posts, public only
    - **Option B**: Instruct user to use Medium's export feature
        - Pros: Complete data, official
        - Cons: Manual process, HTML parsing required
    - **Option C**: Use unofficial API (via RapidAPI)
        - Pros: Programmatic access
        - Cons: Third-party dependency, not officially supported

**Recommended**: Combination of Option A (RSS) for quick import and Option B (export) for complete data.

3. **Limitations to Document**:
    - Cannot update posts after creation
    - Cannot delete posts
    - Cannot retrieve post list programmatically (official API)
    - Tag limit (5 max, 3 useful)
    - No scheduling support

### WordPress Integration

**Recommended Approach**:

1. **Authentication** (v1.1.0):
    - Use Application Passwords
    - Require WordPress 5.6+
    - Validate HTTPS is enabled
    - Store credentials securely

2. **Publishing** (v1.1.0):
    - Implement POST to `/wp/v2/posts`
    - Convert markdown to Gutenberg blocks (HTML with comments)
    - Support categories and tags
    - Support featured image upload
    - Support status: draft, publish, future (scheduling)
    - Support custom post types

3. **Import** (v1.1.0):
    - Implement GET `/wp/v2/posts` with pagination
    - Handle large datasets (100 posts at a time)
    - Use `_fields` parameter for performance
    - Support filtering by author, category, tag, status

4. **Advanced Features** (v1.2.0+):
    - Update existing posts (PUT endpoint)
    - Delete posts (with confirmation)
    - Custom fields/metadata
    - Multi-site support
    - Revisions

**Content Conversion Strategy**:

**Markdown → Gutenberg Blocks**:

```
# Heading         → <!-- wp:heading -->
Paragraph         → <!-- wp:paragraph -->
List              → <!-- wp:list -->
Code block        → <!-- wp:code -->
Image             → <!-- wp:image -->
Quote             → <!-- wp:quote -->
```

Alternative: Support Classic Editor mode (plain HTML) as fallback.

---

## Next Steps

### For v1.1.0 Development:

**Medium**:

1. Create `MediumClient` wrapper class
2. Implement Integration Token authentication
3. Implement `createPost()` method
4. Add image side-loading support
5. Add error handling for 401, 403
6. Create settings UI

**WordPress**:

1. Create `WordPressClient` wrapper class
2. Implement Application Password authentication
3. Implement `createPost()` with Gutenberg blocks
4. Implement `uploadMedia()` for featured images
5. Implement `listPosts()` with pagination
6. Add category/tag management
7. Create settings UI with multi-site support

**Import Feature**:

1. Medium: RSS feed parser
2. WordPress: Pagination handler for large datasets
3. UI for import operation
4. Progress tracking for batch import

### Testing Checklist:

**Medium**:

- [ ] Draft creation
- [ ] Public post creation
- [ ] Post with tags (3)
- [ ] Post with canonical URL
- [ ] Post with images (side-load)
- [ ] Error handling (invalid token, rate limit)

**WordPress**:

- [ ] Draft creation with Gutenberg
- [ ] Published post
- [ ] Scheduled post (future date)
- [ ] Post with categories
- [ ] Post with tags
- [ ] Post with featured image
- [ ] Post update
- [ ] Post deletion
- [ ] List posts with pagination
- [ ] Multi-site switching

---

## References

### Medium API

- Official Documentation: https://github.com/Medium/medium-api-docs
- Status: Archived (no longer maintained)

### WordPress REST API

- Official Handbook: https://developer.wordpress.org/rest-api/
- Reference: https://developer.wordpress.org/rest-api/reference/
- Application Passwords: https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/

---

**Document created**: 2026-02-02  
**Last updated**: 2026-02-02  
**Researcher**: Zander Catta Preta
