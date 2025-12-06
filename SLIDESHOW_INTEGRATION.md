# VCAP Slideshow Integration Plan (Option C - Hybrid)

## Overview
Keep your beautifully styled slideshow app separate while integrating it seamlessly into the Quantum Strategies course platform.

## Architecture

### Two Separate Apps

**App 1: Quantum Strategies (Main Site)**
- Domain: `quantumstrategies.com`
- Framework: Next.js 16
- Purpose: Marketing, course catalog, lessons, auth
- Hosts: Course overview, module pages, text lessons, videos

**App 2: VCAP Slideshow (Standalone)**
- Domain: `slides.quantumstrategies.com` OR `quantumstrategies.com/slides-app`
- Framework: Create React App (existing)
- Purpose: Interactive slideshow presentations
- Keeps: All your custom styling, animations, Three.js graphics

---

## Integration Method: **PostMessage Communication**

### How It Works

```
┌─────────────────────────────────────────────┐
│  Main Site (Next.js)                        │
│  quantumstrategies.com/courses/vcap/module1 │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  <iframe> or <webview>                │ │
│  │  src="slides.quantumstrategies.com"   │ │
│  │                                       │ │
│  │  ┌─────────────────────────────────┐ │ │
│  │  │  Your Styled Slideshow          │ │ │
│  │  │  (CRA - no changes needed!)     │ │ │
│  │  │                                 │ │ │
│  │  │  ← postMessage →                │ │ │
│  │  │  (progress, completion, auth)   │ │ │
│  │  └─────────────────────────────────┘ │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## Deployment Options

### Option A: Subdomain (Recommended)
```
Main: quantumstrategies.com
Slides: slides.quantumstrategies.com
```

**Setup:**
- Deploy slideshow to Netlify (separate site)
- Configure custom subdomain
- Enable CORS for postMessage

**Pros:**
- ✅ Clean separation
- ✅ Independent deployments
- ✅ Can use different build processes
- ✅ Easy to maintain

### Option B: Separate Path on CDN
```
Main: quantumstrategies.com
Slides: quantumstrategies.com/vcap-slides
```

**Setup:**
- Build slideshow separately
- Deploy to `/public/vcap-slides` or CDN
- Serve as static files

**Pros:**
- ✅ Same domain (no CORS issues)
- ✅ Simpler auth token passing

---

## Implementation Plan

### Phase 1: Prepare Slideshow for Embedding

**Update slideshow app:**

```javascript
// src/App.js (in vcap-module-1-slides)

useEffect(() => {
  // Listen for messages from parent
  window.addEventListener('message', handleParentMessage);

  // Send ready signal
  window.parent.postMessage({
    type: 'SLIDESHOW_READY',
    moduleId: currentModule
  }, '*');

  return () => {
    window.removeEventListener('message', handleParentMessage);
  };
}, []);

function handleParentMessage(event) {
  // Verify origin for security
  if (event.origin !== 'https://quantumstrategies.com') return;

  const { type, payload } = event.data;

  switch(type) {
    case 'SET_MODULE':
      setCurrentModule(payload.moduleId);
      break;
    case 'AUTH_TOKEN':
      setUserToken(payload.token);
      break;
    case 'LOAD_PROGRESS':
      loadUserProgress(payload.progress);
      break;
  }
}

// Send progress updates to parent
function updateProgress(slideCoords) {
  window.parent.postMessage({
    type: 'PROGRESS_UPDATE',
    payload: {
      moduleId: currentModule,
      coordinates: slideCoords,
      timestamp: Date.now()
    }
  }, 'https://quantumstrategies.com');
}
```

---

### Phase 2: Create Iframe Wrapper Component

**New component in main site:**

```typescript
// src/components/course/slideshow/SlideshowEmbed.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { useSupabase } from '@/lib/supabase/client'

interface SlideshowEmbedProps {
  moduleId: string
  userId: string
  courseId: string
}

export default function SlideshowEmbed({
  moduleId,
  userId,
  courseId
}: SlideshowEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isReady, setIsReady] = useState(false)
  const supabase = useSupabase()

  useEffect(() => {
    // Listen for messages from slideshow
    window.addEventListener('message', handleSlideshowMessage)
    return () => window.removeEventListener('message', handleSlideshowMessage)
  }, [])

  useEffect(() => {
    if (isReady && iframeRef.current) {
      // Send auth and module info to slideshow
      sendMessage({
        type: 'SET_MODULE',
        payload: { moduleId }
      })
    }
  }, [isReady, moduleId])

  function sendMessage(message: any) {
    iframeRef.current?.contentWindow?.postMessage(
      message,
      'https://slides.quantumstrategies.com'
    )
  }

  async function handleSlideshowMessage(event: MessageEvent) {
    // Verify origin
    if (event.origin !== 'https://slides.quantumstrategies.com') return

    const { type, payload } = event.data

    switch(type) {
      case 'SLIDESHOW_READY':
        setIsReady(true)
        break

      case 'PROGRESS_UPDATE':
        // Save progress to Supabase
        await saveProgress(payload)
        break

      case 'MODULE_COMPLETE':
        await markModuleComplete(payload)
        break
    }
  }

  async function saveProgress(data: any) {
    await supabase
      .from('progress')
      .upsert({
        user_id: userId,
        module_id: moduleId,
        lesson_id: `${moduleId}-slides`,
        last_position: data.coordinates,
        updated_at: new Date().toISOString()
      })
  }

  async function markModuleComplete(data: any) {
    await supabase
      .from('progress')
      .update({
        completed: true,
        completed_at: new Date().toISOString()
      })
      .match({
        user_id: userId,
        lesson_id: `${moduleId}-slides`
      })
  }

  return (
    <div className="slideshow-container" style={{
      width: '100%',
      height: '100vh',
      position: 'relative'
    }}>
      {!isReady && (
        <div className="loading">Loading slideshow...</div>
      )}

      <iframe
        ref={iframeRef}
        src={`https://slides.quantumstrategies.com?module=${moduleId}`}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: isReady ? 'block' : 'none'
        }}
        allow="fullscreen"
        title="Course Slideshow"
      />
    </div>
  )
}
```

---

### Phase 3: Create Slideshow Route

```typescript
// src/app/(courses)/courses/[courseId]/module/[moduleId]/slides/page.tsx
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import SlideshowEmbed from '@/components/course/slideshow/SlideshowEmbed'

export default async function SlidesPage({
  params
}: {
  params: Promise<{ courseId: string; moduleId: string }>
}) {
  const { courseId, moduleId } = await params
  const supabase = await createServerClient()

  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')

  // Check enrollment
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('*')
    .match({ user_id: user.id, course_id: courseId })
    .single()

  if (!enrollment) redirect(`/courses/${courseId}`)

  return (
    <div className="slides-fullscreen">
      <SlideshowEmbed
        moduleId={moduleId}
        userId={user.id}
        courseId={courseId}
      />
    </div>
  )
}
```

---

### Phase 4: Deploy Slideshow

**Build and deploy slideshow separately:**

```bash
cd /Users/studio/Projects/vcap-module-1-slides

# Update package.json homepage (if using subdirectory)
# "homepage": "https://slides.quantumstrategies.com"

# Build
npm run build

# Deploy to Netlify
# Option 1: Separate site on subdomain
# Option 2: Deploy to /vcap-slides path
```

**Netlify Configuration for Subdomain:**

1. Create new Netlify site from vcap-module-1-slides
2. Configure custom domain: `slides.quantumstrategies.com`
3. Add environment variables if needed
4. Set up CORS headers in `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Access-Control-Allow-Origin = "https://quantumstrategies.com"
    X-Frame-Options = "ALLOW-FROM https://quantumstrategies.com"
```

---

## Security Considerations

**1. Origin Verification**
```javascript
// Always verify message origin
if (event.origin !== 'https://quantumstrategies.com') return
```

**2. Authentication**
```javascript
// Pass auth token via postMessage (not URL)
sendMessage({
  type: 'AUTH_TOKEN',
  payload: { token: sessionToken }
})
```

**3. Frame Ancestors**
```
Content-Security-Policy: frame-ancestors 'self' https://quantumstrategies.com
```

---

## User Flow

1. User navigates to `/courses/vcap/module/module1/slides`
2. Main site checks authentication and enrollment
3. Loads SlideshowEmbed component
4. Iframe loads slideshow from subdomain
5. PostMessage handshake establishes connection
6. Main site sends module ID and user context
7. User interacts with slideshow
8. Progress updates sent to main site via postMessage
9. Main site saves progress to Supabase
10. On completion, main site marks module complete

---

## Benefits of This Approach

✅ **Preserve Your Work**: No need to refactor styled slideshow
✅ **Independent Updates**: Deploy slideshow without touching main site
✅ **Better Performance**: Each app optimized separately
✅ **Easier Testing**: Test slideshow in isolation
✅ **Flexible Hosting**: Can use different CDNs/hosts
✅ **Unified Experience**: Seamless to user (no visible iframe)
✅ **Shared Data**: Progress tracked in main database

---

## Next Steps

1. **Choose deployment option:** Subdomain vs. path
2. **Update slideshow:** Add postMessage handlers
3. **Create embed component:** Build iframe wrapper
4. **Test communication:** Verify messages flow correctly
5. **Deploy slideshow:** Set up on subdomain
6. **Integrate:** Add slideshow routes to main site
7. **Test end-to-end:** Full user flow with auth + progress

**Estimated Time:** 4-6 hours

---

## URL Structure (Final)

```
quantumstrategies.com/courses                          ← Course catalog
quantumstrategies.com/courses/vcap                     ← Course overview
quantumstrategies.com/courses/vcap/module/module1      ← Module overview
quantumstrategies.com/courses/vcap/module/module1/slides ← SLIDESHOW (iframe)
quantumstrategies.com/courses/vcap/module/module1/lesson/intro ← Text lesson
slides.quantumstrategies.com                           ← Slideshow app (embedded)
```

**Clean, shallow URLs + your beautiful slideshow preserved!** 🎉
