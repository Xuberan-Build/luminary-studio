# Course Platform Page Structure
## Based on VCAP Signup Page Reference

## Design Theme Analysis

**VCAP Signup Page Style:**
- **Colors**: Dark brown (#2a1810), Gold (#d4af37, #ffd700)
- **Typography**: Georgia serif for elegance
- **Visual Elements**: Sacred geometry (flower of life, golden circles)
- **Animations**: Framer Motion (fade, slide, scale)
- **Tone**: Consciousness, transformation, spiritual + business

**Quantum Strategies Site Style:**
- **Colors**: Deep purple/navy (#030048), Purple gradients (#5D3FD3)
- **Typography**: Modern sans-serif
- **Visual Elements**: Glassmorphism, gradients, glows
- **Tone**: Strategic, professional, quantum/energy alignment

**Integration Strategy**: Blend both - purple as primary, gold accents for VCAP course, maintaining sacred geometry and consciousness theme

---

## Page Structure Plan

### 1. Course Catalog Page (`/courses`)

**Purpose**: Browse all available courses

**Sections:**
```
┌─────────────────────────────────────────────┐
│ HERO                                         │
│ - "Quantum Learning Experiences"             │
│ - Subtitle about transformation + strategy   │
│ - Trust indicators (students, modules, etc)  │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ COURSE GRID                                  │
│ ┌─────────┐  ┌─────────┐                   │
│ │  VCAP   │  │   QBF   │                   │
│ │  Card   │  │  Card   │                   │
│ └─────────┘  └─────────┘                   │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ WHY QUANTUM STRATEGIES                       │
│ - Our approach to consciousness + commerce   │
│ - Success stories / social proof             │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ CTA                                          │
│ - "Begin Your Transformation"                │
└─────────────────────────────────────────────┘
```

**Course Card Components:**
- Course icon/badge
- Title + tagline
- Module count + duration
- Key outcomes (3 bullets)
- Enrollment status (Free preview / Enroll / Continue)
- Visual: Purple gradient card with hover glow effect

---

### 2. VCAP Course Overview (`/courses/vcap`)

**Purpose**: Detailed course page, conversion to enrollment

**Sections (Based on signup page):**

#### Hero Section
```tsx
- Animated title: "Visionary Creator's Activation Protocol"
- Subtitle: "Reprogram Your Consciousness for Creative Life Mastery"
- Description: 10 presuppositions, consciousness activation
- CTA: "Enroll Now" / "Start Free Preview"
- Trust indicators:
  * 3 Modules
  * 125+ Interactive Slides
  * NLP + Psychocybernetics Framework
  * ∞ Transformation Potential
- Sacred geometry background (purple-tinted)
```

#### What You'll Transform
```tsx
"The Consciousness-to-Success Pipeline"

Card 1: Transform Your Operating System (Module 1)
- Eliminate self-sabotage
- Embody highest values
- Natural confidence

Card 2: Design Your Divine Blueprint (Module 2)
- Discover authentic Life's Task
- Magnetic pull toward desires
- Purpose alignment

Card 3: Build Your Success Architecture (Module 3)
- Predictable results through systems
- Become obvious choice in market
- Consciousness → commerce
```

#### Complete Curriculum
```tsx
Module Timeline with connection lines:

MODULE 01: The Inner Operating System
- Subtitle
- Description
- Key Components:
  * 10 Core Presupposition Shifts
  * Self-Concept Model Integration
  * Value Elicitation & Identity Work
- Outcome: "Become someone who naturally attracts success"
- CTA: "Preview Module 1" → links to /courses/vcap/module/module1

MODULE 02: The Vision Bridge
[Similar structure]

MODULE 03: The Manifestation Engine
[Similar structure]
```

#### The Inevitable Result
```tsx
Outcome section explaining transformation:
- Not just business plan holder
- Consciousness naturally creates value
- Authentic self magnetically attracts opportunities
- Strategic actions manifest desired outcomes
```

#### Enrollment CTA
```tsx
Two options:
1. "Start Free Preview" → Access Module 1 preview
2. "Enroll in Full Course" → (Future: Stripe payment)

Current: Just "Begin Protocol" → Creates enrollment
```

#### FAQ Section
```tsx
Common questions:
- How long does it take?
- Do I need prior experience?
- How is this different from other courses?
- Can I access on mobile?
- etc.
```

---

### 3. Module Overview Page (`/courses/vcap/module/module1`)

**Purpose**: Module landing page before diving into lessons

**Sections:**

#### Module Hero
```tsx
- Module number + icon
- "Module 1: Identity & Presuppositions"
- Subtitle
- Progress indicator (if enrolled)
- Module stats: X lessons, Y slides, Z minutes
```

#### Module Overview
```tsx
What You'll Learn:
- Learning objectives (4-6 bullets)
- Prerequisites (if any)
- Recommended pace
```

#### Lesson Navigator
```tsx
Lessons in this module:

┌──────────────────────────────────────┐
│ 1. Introduction to Identity           │
│    📄 Text Lesson • 10 min            │
│    [Start Lesson →]                   │
└──────────────────────────────────────┘
┌──────────────────────────────────────┐
│ 2. Interactive Slide Presentation     │
│    🎯 Slides • 48 slides              │
│    [Launch Slideshow →]               │
└──────────────────────────────────────┘
┌──────────────────────────────────────┐
│ 3. Video Recitation                   │
│    🎥 Video • 20 min                  │
│    [Watch Video →]                    │
└──────────────────────────────────────┘
┌──────────────────────────────────────┐
│ 4. Integration Exercise               │
│    ✍️ Workbook • 15 min               │
│    [Begin Exercise →]                 │
└──────────────────────────────────────┘

Progress: 2/4 lessons completed (50%)
```

#### Next Steps
```tsx
- Complete module CTA
- Next module preview
- Community/support links (future)
```

---

### 4. Slideshow Viewer (`/courses/vcap/module/module1/slides`)

**Purpose**: Full-screen interactive slideshow experience

**Features:**
- Embedded iframe of vcap-module-1-slides app
  * OR full integration of React components
- Full-screen mode
- Progress auto-saved via postMessage → Supabase
- Exit button → back to module overview
- Keyboard navigation preserved
- All existing animations/interactivity maintained

**Layout:**
```
┌─────────────────────────────────────────────┐
│ [Exit] Module 1: Identity          [1/48]   │ ← Minimal header
├─────────────────────────────────────────────┤
│                                              │
│                                              │
│           SLIDESHOW CONTENT                  │
│         (Your existing slides)               │
│                                              │
│                                              │
└─────────────────────────────────────────────┘
```

---

### 5. Text Lesson Page (`/courses/vcap/module/module1/lesson/intro`)

**Purpose**: Read-through lessons with MDX content

**Layout:**
```tsx
Sidebar (Left - 25%):
- Module navigation
- Lesson list
- Progress tracker
- "Mark complete" button

Content Area (Right - 75%):
- Lesson title
- Estimated time
- MDX content (formatted text, images, embeds)
- Interactive elements (accordions, tabs, etc.)
- Prev/Next lesson navigation
```

---

### 6. Video Lesson Page (`/courses/vcap/module/module1/lesson/recitation`)

**Purpose**: Video recitation playback

**Components:**
- Vimeo player (responsive, 16:9)
- Video title + description
- Transcript (expandable)
- Resources/downloads (if any)
- Prev/Next navigation
- Auto-mark complete on finish
- Sidebar navigation (same as text lesson)

---

### 7. User Dashboard (`/courses/dashboard`)

**Purpose**: Student's course hub

**Sections:**

#### Welcome
```tsx
Welcome back, {firstName}!
Continue where you left off
```

#### Course Progress Cards
```tsx
┌─────────────────────────────────────┐
│ VCAP                                 │
│ Progress: 2/3 modules (67%)         │
│ Last activity: Module 2, Slide 15   │
│ [Continue →]                        │
└─────────────────────────────────────┘
```

#### Quick Links
- All courses
- Settings
- Support
- Resources

#### Activity Feed (Future)
- Recent completions
- Achievements
- Community updates

---

## Component Library Needed

### Shared Components

1. **CourseCard.tsx**
   - Used on catalog page
   - Props: title, tagline, modules, duration, status, href

2. **ModuleCard.tsx**
   - Used on course overview
   - Props: number, title, description, highlights, outcome

3. **LessonCard.tsx**
   - Used on module overview
   - Props: title, type, duration, status, href

4. **ProgressBar.tsx**
   - Linear progress indicator
   - Props: current, total, label

5. **VideoPlayer.tsx**
   - Vimeo embed wrapper
   - Props: videoId, onComplete

6. **LessonLayout.tsx**
   - Sidebar + content area
   - Props: module, lessons, currentLesson, children

7. **EnrollmentButton.tsx**
   - Smart CTA based on enrollment status
   - Props: courseId, userId, status

8. **SacredGeometry.tsx**
   - Decorative background elements
   - Flower of life, golden circles, etc.
   - Purple-tinted for Quantum Strategies

---

## Data Structure

### Course Metadata (`/src/content/courses/vcap/course.json`)

```json
{
  "id": "vcap",
  "slug": "visionary-creators-activation-protocol",
  "title": "Visionary Creator's Activation Protocol",
  "tagline": "Reprogram Your Consciousness for Creative Life Mastery",
  "description": "...",
  "icon": "🧠",
  "status": "active",
  "pricing": {
    "price": 997,
    "currency": "USD",
    "previewAvailable": true
  },
  "stats": {
    "modules": 3,
    "totalSlides": 125,
    "totalDuration": "8 hours",
    "students": "∞"
  },
  "outcomes": [
    "Eliminate self-sabotage at unconscious level",
    "Discover authentic Life's Task",
    "Create predictable results through systems"
  ],
  "modules": [
    {
      "id": "module1",
      "slug": "identity-presuppositions",
      "order": 1
    },
    {
      "id": "module2",
      "slug": "vision-mission",
      "order": 2
    },
    {
      "id": "module3",
      "slug": "strategic-frameworks",
      "order": 3
    }
  ]
}
```

### Module Metadata (`/src/content/courses/vcap/modules/module1/module.json`)

```json
{
  "id": "module1",
  "number": "01",
  "title": "The Inner Operating System",
  "subtitle": "Reprogramming Consciousness for Creative Life Mastery",
  "description": "...",
  "icon": "🧠",
  "color": "#9333EA",
  "outcome": "Become someone who naturally attracts success",
  "highlights": [
    "10 Core Presupposition Shifts",
    "Self-Concept Model Integration",
    "Value Elicitation & Identity Work"
  ],
  "lessons": [
    {
      "id": "intro",
      "title": "Introduction to Identity",
      "type": "text",
      "duration": 10,
      "order": 1
    },
    {
      "id": "slides",
      "title": "Interactive Slide Presentation",
      "type": "slides",
      "slideCount": 48,
      "order": 2
    },
    {
      "id": "recitation",
      "title": "Video Recitation: Key Concepts",
      "type": "video",
      "videoId": "vimeo-id",
      "duration": 20,
      "order": 3
    }
  ]
}
```

---

## Design Tokens

### Colors
```css
/* Quantum Strategies Primary */
--quantum-navy: #030048
--quantum-purple: #5D3FD3
--quantum-purple-light: #9686D6
--quantum-accent: #CEBEFF

/* VCAP Course Accents */
--vcap-gold: #d4af37
--vcap-gold-glow: #ffd700
--vcap-brown: #2a1810

/* Module Colors */
--module1-color: #9333EA  /* Purple */
--module2-color: #0EA5E9  /* Blue */
--module3-color: #10B981  /* Green */
```

### Typography
```css
/* Headings */
font-family: 'Inter', sans-serif
font-weight: 600-700

/* Body */
font-family: 'Inter', sans-serif
font-weight: 400-500

/* Course content */
font-family: Georgia, serif (for VCAP specifically)
```

---

## Next Steps

1. ✅ Set up Supabase (completed in architecture)
2. ✅ Create course route structure
3. Build course catalog page
4. Build VCAP course overview page
5. Build module overview page
6. Integrate slideshow (Option C - iframe)
7. Build text lesson page
8. Build video lesson page
9. Implement enrollment system
10. Build user dashboard

---

## Integration with Existing VCAP Assets

**Slideshow App (`vcap-module-1-slides`):**
- Deploy to `slides.quantumstrategies.com`
- Embed via iframe on `/courses/vcap/module/{moduleId}/slides`
- PostMessage communication for progress tracking

**Signup Page (`vcap-signup-page`):**
- Migrate components to Next.js
- Reuse: Hero animations, module cards, CTA sections
- Adapt colors from brown/gold → purple/gold blend
- Keep sacred geometry backgrounds

**Content:**
- All module descriptions already written
- Slide data exists in vcap-module-1-slides
- Need to add: video IDs, text lesson MDX content

---

## User Flow

```
1. User visits /courses
2. Sees VCAP card → clicks
3. Lands on /courses/vcap (overview)
4. Reads about course → clicks "Begin Protocol"
5. Creates enrollment (Supabase)
6. Redirected to /courses/vcap/module/module1
7. Sees lesson list → clicks "Launch Slideshow"
8. Full-screen slideshow experience
9. Progress auto-saved
10. Completes module → proceeds to Module 2
11. Dashboard shows progress
```

---

## Mobile Considerations

- Responsive course cards (grid → stack)
- Slideshow touch gestures (existing in slides app)
- Sidebar navigation → hamburger menu
- Video player responsive (16:9 aspect ratio)
- Progress bars adapt to small screens
- Sacred geometry backgrounds scale/hide on mobile

---

## Accessibility

- Keyboard navigation throughout
- ARIA labels on interactive elements
- Transcript for videos
- Skip navigation links
- Focus indicators
- Screen reader friendly progress updates
- Color contrast meets WCAG AA

---

This structure balances the spiritual/consciousness theme from your VCAP signup page with the professional, strategic brand of Quantum Strategies!
