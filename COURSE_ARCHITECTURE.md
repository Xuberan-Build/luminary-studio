# Course Platform Architecture Plan
## Visionary Creator's Activation Protocol

## Overview
Integration of the vcap-module-1-slides React app into the luminary-studio Next.js website with full course platform capabilities.

## Current State Analysis

### Existing Slideshow App (vcap-module-1-slides)
- **Framework**: Create React App (React 19)
- **Key Features**:
  - 3 Modules with 125+ total slides
  - Coordinate-based navigation system
  - Keyboard navigation (arrow keys)
  - Progress tracking
  - Beautiful animations (Framer Motion, React Spring)
  - 3D capabilities (React Three Fiber)
  - State management (Zustand + Context API)

### Module Content
1. **Module 1**: Identity & Presuppositions (48 slides)
2. **Module 2**: Vision & Mission (42 slides)
3. **Module 3**: Strategic Thinking & Frameworks (35 slides)

### Quantum Strategies Website
- **Framework**: Next.js 16 (App Router)
- **Current Mode**: Static Export (will change to SSR)
- **Content**: MDX-based resources and blog
- **Structure**: Route groups for marketing and content

## Architecture Decision: CONFIRMED ✅

**Chosen Stack:**
- **Hosting**: Netlify (with Edge Functions for SSR)
- **Database + Auth**: Supabase (free tier)
- **Rendering**: SSR/Dynamic (removing static export)
- **Videos**: Vimeo embeds

**Why Supabase + Netlify:**
- ✅ All-in-one solution (database + auth + storage)
- ✅ Free tier: 500MB database + 1GB storage
- ✅ Built-in authentication (email, OAuth, magic links)
- ✅ Row-level security for course access
- ✅ Real-time capabilities for progress tracking
- ✅ Auto-generated REST APIs
- ✅ Perfect integration with Netlify

## Proposed Directory Structure

```
src/
├── app/
│   ├── (marketing)/          # Public pages
│   ├── (content)/             # Blog, resources
│   ├── (courses)/             # NEW: Course platform
│   │   ├── layout.tsx         # Course platform layout
│   │   ├── page.tsx           # Course catalog
│   │   ├── [courseId]/        # Individual course pages
│   │   │   ├── page.tsx       # Course overview
│   │   │   ├── modules/       # Module list
│   │   │   └── module/[moduleId]/
│   │   │       ├── page.tsx   # Module overview
│   │   │       ├── slides/    # Slideshow viewer
│   │   │       └── lesson/[lessonId]/  # Text/video lessons
│   │   └── dashboard/         # User course dashboard
│   ├── api/                   # NEW: API routes (optional with Supabase)
│   │   ├── courses/          # Course data helpers
│   │   └── webhooks/         # Supabase webhooks (if needed)
│   └── auth/                  # NEW: Auth pages (using Supabase Auth UI)
│       ├── signin/
│       ├── signup/
│       └── callback/         # OAuth callback
│
├── components/
│   ├── course/                # NEW: Course components
│   │   ├── slideshow/        # Migrated slideshow components
│   │   │   ├── Slideshow.tsx
│   │   │   ├── Slide.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── ModuleSelector.tsx
│   │   ├── video/
│   │   │   └── VideoPlayer.tsx
│   │   ├── CourseCard.tsx
│   │   ├── ModuleCard.tsx
│   │   ├── LessonContent.tsx
│   │   └── EnrollButton.tsx
│   └── auth/                  # NEW: Auth components
│       ├── SignInForm.tsx
│       └── ProtectedRoute.tsx
│
├── content/
│   └── courses/               # NEW: Course content
│       └── vcap/              # Visionary Creator's Activation Protocol
│           ├── course.json    # Course metadata
│           ├── modules/
│           │   ├── module1/
│           │   │   ├── config.json
│           │   │   ├── slides/  # Migrated slide data
│           │   │   ├── lessons/
│           │   │   │   ├── 01-intro.mdx
│           │   │   │   └── 02-presuppositions.mdx
│           │   │   └── videos/
│           │   │       └── recitation-1.json
│           │   ├── module2/
│           │   └── module3/
│
├── lib/
│   ├── supabase/             # NEW: Supabase configuration
│   │   ├── client.ts         # Client-side Supabase client
│   │   ├── server.ts         # Server-side Supabase client
│   │   └── middleware.ts     # Auth middleware
│   └── course/               # NEW: Course utilities
│       ├── getCourse.ts
│       ├── getModules.ts
│       └── trackProgress.ts
│
└── types/
    └── course.ts             # NEW: Course type definitions

supabase/
└── migrations/               # NEW: Database migrations
    └── 001_initial_schema.sql
```

## Database Schema (Supabase / PostgreSQL)

**Note**: Supabase provides `auth.users` table automatically. We'll extend it with a profiles table and add course-specific tables.

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles are viewable by everyone, but only updateable by user themselves
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Courses table
CREATE TABLE public.courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) DEFAULT 0,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Courses are viewable by everyone"
  ON public.courses FOR SELECT USING (published = true OR auth.role() = 'authenticated');

-- Modules table
CREATE TABLE public.modules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  total_slides INTEGER NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, slug)
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Modules are viewable by everyone"
  ON public.modules FOR SELECT USING (true);

-- Lessons table
CREATE TABLE public.lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('slides', 'video', 'text', 'quiz')),
  content JSONB,
  "order" INTEGER NOT NULL,
  duration INTEGER, -- in minutes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(module_id, slug)
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lessons are viewable by everyone"
  ON public.lessons FOR SELECT USING (true);

-- Enrollments table
CREATE TABLE public.enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own enrollments"
  ON public.enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own enrollments"
  ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Progress table
CREATE TABLE public.progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT false,
  last_position TEXT, -- For slides: "3,2" coordinates
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own progress"
  ON public.progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress"
  ON public.progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress"
  ON public.progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

## Course Content Structure

### Course Metadata (course.json)
```json
{
  "id": "vcap",
  "slug": "visionary-creators-activation-protocol",
  "title": "Visionary Creator's Activation Protocol",
  "subtitle": "Reprogramming Consciousness for Creative Life Mastery",
  "description": "Transform your mindset and activate your creative potential through NLP, psychocybernetics, and strategic frameworks.",
  "price": 997,
  "currency": "USD",
  "instructor": {
    "name": "Your Name",
    "bio": "...",
    "image": "/images/instructor.jpg"
  },
  "thumbnail": "/images/courses/vcap-thumbnail.jpg",
  "trailer": "/videos/vcap-trailer.mp4",
  "features": [
    "125+ Interactive Slides",
    "Video Recitations",
    "3 Comprehensive Modules",
    "Lifetime Access"
  ],
  "learningOutcomes": [
    "Master NLP presuppositions for success",
    "Develop a powerful self-concept",
    "Create and align with your vision",
    "Apply strategic thinking frameworks"
  ]
}
```

### Module Config (module1/config.json)
```json
{
  "id": "module1",
  "slug": "identity-presuppositions",
  "title": "Module 1: Identity & Presuppositions",
  "description": "Establish an optimal mindset using NLP, psychocybernetics, and the self-concept model",
  "color": "#9333EA",
  "icon": "🧠",
  "order": 1,
  "totalSlides": 48,
  "lessons": [
    {
      "id": "intro-lesson",
      "slug": "introduction",
      "title": "Introduction to Identity",
      "type": "text",
      "order": 1,
      "duration": 10
    },
    {
      "id": "slides-1",
      "slug": "interactive-slides",
      "title": "Interactive Slide Presentation",
      "type": "slides",
      "order": 2,
      "duration": 45
    },
    {
      "id": "video-recitation-1",
      "slug": "recitation-session",
      "title": "Video Recitation: Key Concepts",
      "type": "video",
      "order": 3,
      "duration": 20,
      "videoUrl": "/videos/module1/recitation-1.mp4"
    }
  ]
}
```

## Integration Steps

### Phase 1: Foundation
1. Remove static export from next.config.ts
2. Set up Supabase project and get credentials
3. Install Supabase client libraries (@supabase/supabase-js, @supabase/ssr)
4. Configure Supabase clients (client-side and server-side)
5. Run database migrations (create tables with SQL)
6. Set up Supabase Auth with email/password
7. Build authentication UI (signin/signup pages)
8. Test authentication flow

### Phase 2: Course Structure
1. Create (courses) route group and layouts
2. Seed database with VCAP course data
3. Build course catalog page (list all courses)
4. Create course detail pages ([courseId]/page.tsx)
5. Implement enrollment system (no payment yet)
6. Build user dashboard showing enrolled courses
7. Add protected routes middleware

### Phase 3: Slideshow Integration
1. Copy slideshow components from vcap-module-1-slides
2. Convert to Next.js client components ("use client")
3. Handle Three.js with dynamic imports
4. Migrate slide data structure to new format
5. Integrate with Supabase progress tracking
6. Test keyboard navigation and animations
7. Ensure coordinate-based navigation works

### Phase 4: Content & Video
1. Create MDX lesson templates
2. Build Vimeo video player component
3. Add lesson navigation (prev/next)
4. Implement module completion tracking
5. Create progress indicators and progress bars
6. Build module overview pages

### Phase 5: Polish & Testing
1. Responsive design for all course pages
2. Test user flows (signup → enroll → complete module)
3. Add loading states and error handling
4. Optimize performance (lazy loading, prefetching)
5. Test on mobile devices
6. Configure Netlify deployment
7. Set up environment variables
8. Deploy to production

### Phase 6: Future Enhancements
- Payment integration (Stripe)
- Course certificates
- Discussion forums
- Downloadable resources
- Email notifications
- Admin dashboard for content management

## Technical Considerations

### Slideshow Migration Challenges
1. **CRA to Next.js**: Convert to client components with "use client"
2. **Three.js**: May need dynamic imports to avoid SSR issues
3. **Zustand**: Works fine in Next.js client components
4. **Navigation Map**: Keep existing coordinate system intact

### Performance Optimization
- Lazy load slideshow components
- Prefetch course data
- Optimize video delivery (HLS streaming)
- Image optimization for course thumbnails

### Security
- Row-level security (RLS) policies in Supabase
- Server-side auth validation for course access
- Vimeo privacy settings (domain restrictions)
- Rate limiting on Supabase (built-in)
- Secure environment variables (.env.local)

## Implementation Checklist

**Before Starting:**
- [ ] Create Supabase account and project
- [ ] Get Supabase URL and anon key
- [ ] Create Vimeo account for video hosting
- [ ] Review current website structure

**Ready to Start:**
- Phase 1: Foundation (Supabase setup + Auth)
- Phase 2: Course structure and routing
- Phase 3: Slideshow integration
- Phase 4: Content and video
- Phase 5: Polish and deployment

## Questions to Address

1. Do you want to host videos yourself or use a platform (Vimeo, YouTube unlisted)?
2. Should course progress sync across devices?
3. Do you want to offer course previews (free sample lessons)?
4. Should there be a course completion certificate?
5. Do you want analytics on user progress and engagement?
