# Content Restructuring Migration Plan

## Goal
Flatten URL structure from 3 levels to 1-2 levels for crawl budget optimization while maintaining logical organization.

## Current Structure
```
/resources/customer-acquisition/[slug]  (3 levels)
/resources/operations/[slug]            (3 levels)
/resources/product-development/[slug]   (3 levels)
```

## New Structure (Option A - Recommended)
```
/articles/[slug]                        (1 level)
/whitepapers/[slug]                     (1 level)
/courses/[courseId]                     (1 level)
/courses/[courseId]/module/[moduleId]   (3 levels - acceptable for gated content)
```

---

## Migration Steps

### Phase 1: Backup & Preparation

**Create backup:**
```bash
git checkout -b content-restructure-migration
git add .
git commit -m "Backup before content restructure"
```

**Verify current routes:**
- `/resources/customer-acquisition/*`
- `/resources/operations/*`
- `/resources/product-development/*`

---

### Phase 2: Create New Route Structure

**File Structure Changes:**

```
Before:
src/
├── app/
│   └── (content)/
│       └── resources/
│           ├── customer-acquisition/[slug]/page.tsx
│           ├── operations/[slug]/page.tsx
│           └── product-development/[slug]/page.tsx
└── content/
    └── resources/
        ├── customer-acquisition/*.mdx
        ├── operations/*.mdx
        └── product-development/*.mdx

After:
src/
├── app/
│   ├── (content)/
│   │   ├── articles/
│   │   │   └── [slug]/page.tsx
│   │   ├── whitepapers/
│   │   │   └── [slug]/page.tsx
│   │   └── blog/
│   │       └── [slug]/page.tsx (existing)
│   │
│   ├── (courses)/
│   │   └── courses/
│   │       ├── page.tsx
│   │       └── [courseId]/
│   │           ├── page.tsx
│   │           └── module/
│   │               └── [moduleId]/
│   │                   ├── page.tsx
│   │                   └── slides/
│   │                       └── page.tsx
│   │
│   └── resources/
│       └── page.tsx (new hub page)
│
└── content/
    ├── articles/
    │   ├── customer-acquisition/*.mdx
    │   ├── operations/*.mdx
    │   └── product-development/*.mdx
    │
    ├── whitepapers/
    │   └── (future white papers)
    │
    └── courses/
        └── vcap/
            └── modules/
```

---

### Phase 3: Content Migration

**Move content files:**
```bash
# Move articles (keep categorization in folders)
mv src/content/resources/customer-acquisition src/content/articles/
mv src/content/resources/operations src/content/articles/
mv src/content/resources/product-development src/content/articles/

# Remove empty resources directory
rmdir src/content/resources
```

**Update frontmatter in all articles:**
Add category field to preserve organization:
```yaml
---
title: "Complete Guide"
category: "customer-acquisition"  # NEW
contentType: "article"            # NEW
---
```

---

### Phase 4: Create New Routes

**1. Create `/articles/[slug]/page.tsx`**
- Reads from all category folders
- Generates static params from all articles
- Displays category as metadata

**2. Create `/whitepapers/[slug]/page.tsx`**
- Similar to articles
- Different styling/layout if needed

**3. Create `/resources/page.tsx` (Hub Page)**
- Shows all content types
- Filterable articles by category
- Links to courses, whitepapers

**4. Create `/courses/` structure**
- Course catalog
- Course detail pages
- Module pages with slideshow integration

---

### Phase 5: Update Internal Links

**Find and replace in all MDX files:**
```bash
# Old links
/resources/customer-acquisition/[slug]
/resources/operations/[slug]
/resources/product-development/[slug]

# New links
/articles/[slug]
/articles/[slug]
/articles/[slug]
```

**Script to update:**
```bash
find src/content/articles -name "*.mdx" -exec sed -i '' 's|/resources/customer-acquisition/|/articles/|g' {} +
find src/content/articles -name "*.mdx" -exec sed -i '' 's|/resources/operations/|/articles/|g' {} +
find src/content/articles -name "*.mdx" -exec sed -i '' 's|/resources/product-development/|/articles/|g' {} +
```

---

### Phase 6: Navigation Updates

**Update main navigation:**
```typescript
// Before
Resources (single link)

// After
Resources ▼
  ├─ Articles
  ├─ White Papers
  ├─ Courses
  └─ Blog
```

**Or simplified:**
```typescript
Articles | Courses | White Papers | Blog
```

---

### Phase 7: Create Resources Hub

**New page: `/resources/page.tsx`**

Features:
- Overview of all content types
- Featured articles by category
- Course showcase
- White papers section
- Search/filter functionality

---

### Phase 8: Testing Checklist

- [ ] All article URLs work: `/articles/[slug]`
- [ ] Category filtering works on articles page
- [ ] Internal links work (no 404s)
- [ ] Images load correctly
- [ ] Frontmatter displays properly
- [ ] MDX components render
- [ ] Resources hub page displays all content
- [ ] Navigation works correctly
- [ ] Mobile responsive
- [ ] No console errors

---

### Phase 9: Cleanup

**Remove old route files:**
```bash
rm -rf src/app/(content)/resources/customer-acquisition
rm -rf src/app/(content)/resources/operations
rm -rf src/app/(content)/resources/product-development
```

**Keep resources folder for hub page:**
```bash
# Keep: src/app/resources/page.tsx (the hub)
```

---

## URL Mapping Reference

| Old URL | New URL | Status |
|---------|---------|--------|
| `/resources/customer-acquisition/complete-guide` | `/articles/complete-guide` | ✅ Migrated |
| `/resources/customer-acquisition/seo-lead-generation` | `/articles/seo-lead-generation` | ✅ Migrated |
| `/resources/operations/crm-implementation` | `/articles/crm-implementation` | ✅ Migrated |
| `/resources/product-development/mvp-strategy` | `/articles/mvp-strategy` | ✅ Migrated |

---

## File Count

**Before:**
- 3 route handlers (one per category)
- ~15 MDX articles across 3 categories

**After:**
- 1 article route handler (all articles)
- 1 whitepapers route handler
- 1 resources hub page
- 1 courses structure (new)
- ~15 MDX articles (same content, new location)

---

## Benefits After Migration

✅ **SEO:**
- URLs reduced from 3 levels → 1 level
- Better crawl budget optimization
- Cleaner URL structure
- Easier to share

✅ **User Experience:**
- Clearer content types
- Easier navigation
- Consistent patterns

✅ **Developer Experience:**
- Single route handler for all articles
- Easier to add new content types
- Better organized codebase

✅ **Future-Proof:**
- Easy to add: courses, whitepapers, case studies, webinars
- Scalable structure
- Clear separation of concerns

---

## Rollback Plan

If issues arise:
```bash
git checkout main
git branch -D content-restructure-migration
```

Or cherry-pick specific files back.

---

## Next Steps

1. **Review this plan** - confirm structure works for you
2. **Execute Phase 1** - create backup branch
3. **Execute Phases 2-4** - create routes and move files
4. **Execute Phase 5** - update internal links
5. **Execute Phases 6-7** - navigation and hub page
6. **Execute Phase 8** - thorough testing
7. **Execute Phase 9** - cleanup and merge

**Estimated time:** 2-3 hours for full migration

---

## Questions Before We Start

1. Do you want to keep the pillar pages (like `_pillar.mdx`) or convert them to regular articles?
2. Should we create a `/resources` hub page or go directly to `/articles`?
3. Any other content types to plan for? (case studies, webinars, etc.)
