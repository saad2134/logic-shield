# LogicShield USP Plan - Unique Selling Propositions

> **Vision:** Transform LogicShield from a debate training tool into an AI Communication Intelligence Platform - the first complete solution for argument construction, real-time coaching, risk assessment, and collaborative debate.

---

## Executive Summary

LogicShield's core value proposition is **"Your AI Debate Coach - Real-Time"**. Unlike competitors that provide post-debate analysis, LogicShield actively coaches users *during* the debate with live suggestions, visual feedback, and progressive learning.

### Primary Differentiation
- **Real-Time Coaching** - Live suggestions as user types (unique in market)
- **Visual Argument Mapping** - See your logical structure
- **Learning Integration** - Structured courses + gamification

---

## Current State vs. Target State

| Aspect | Current | Target (V2.0) |
|--------|---------|---------------|
| Analysis | Real-time (as you type) ✅ | Enhanced with more fallacies |
| Visual | Text-only | Argument trees & graphs |
| Engagement | Solo practice | Multiplayer + tournaments |
| Learning | Self-directed | Structured courses |
| Business | Basic | Risk scanner |

---

## Priority USPs

### Tier 1: Core Differentiators (Must Build)

#### 1. Real-Time Argument Coach
**Status:** ✅ Implemented

**Description:** Live streaming suggestions as user types - not post-analysis.

**Features:**
- Inline highlighting of potential issues (yellow=weak, red=fallacy)
- Suggestion pills on hover: "Add evidence", "Avoid absolute terms", "Rephrase"
- Difficulty toggle: Basic / Intermediate / Advanced feedback
- Debounced API calls (500ms after typing stops)
- Progressive disclosure
- Score penalty system for detected issues

**Implementation:**
```text
User types → API quick-analyze → Detect issues →
Calculate score with penalties → Show feedback panel
```

**Why Unique:** Kialo, Debatewise all analyze *after* submission. No live coaching during typing.

---

#### 2. Visual Argument Mapper
**Status:** ✅ Implemented

**Description:** Auto-generate interactive argument structure from debate text.

**Features:**
- Auto-detect premise → conclusion relationships
- Interactive tree/graph visualization
- Highlight "weak links" in logical chains
- Zoom, pan, focus mode
- Export as PNG/PDF for presentations
- Share link for collaborative editing

**Implementation:**
```text
Parse argument text → Identify claims + premises → Build tree graph →
Render interactive visualization → Add interaction controls
```

**Why Unique:** No mainstream debate tool offers auto-visualization.

---

#### 3. Risk Scanner
**Status:** ✅ Implemented

**Description:** Business-oriented risk analysis for professional communication.

**Features:**
- Copy-paste email, pitch deck, proposal text
- "Publish-safe" score before sending
- Risk breakdown: tone, factuality, sensitivity
- Rewrite suggestions for safer communication
- Quick-fix buttons

**Implementation:**
```text
User pastes text → Analyze for risk factors → Calculate score →
Show risk breakdown → Offer rewrite suggestions
```

**Why Unique:** B2B-focused add-on; existing features are B2C.

---

### Tier 2: Engagement USPs

#### 4. Voice Debate Mode
**Status:** ✅ Implemented

**Description:** Hands-free debate using speech input/output.

**Features:**
- Speech-to-text input via Web Speech API
- Text-to-speech for AI opponent responses
- Practice mode for interviews + oral exams
- Recording + playback for review
- Accessibility: screen reader compatible

**Implementation:**
```text
User clicks mic → Speech recognition → Send to debate API →
Get AI response → Text-to-speech output → Display analysis
```

**Why Unique:** Voice debate is novel; improves accessibility.

---

### Tier 3: Learning USPs

#### 5. Structured Rhetoric Courses
**Status:** ✅ Implemented

**Description:** Brilliant.com-style interactive slide-based courses with animated puzzles, concept explanations, MCQ quizzes, and final course exams with certificate generation.

**Features:**
- 6 full courses with 14 lessons containing detailed slide configurations
- Interactive animated widgets: syllogism builders, dialogue fallacy spotters, causal confounder models, reframe balance scales, rhetoric highlighters, objection resolution handshakes
- Markdown-rendered content with bold/italic support inside slides
- Slide-by-slide progression with step indicator bubbles and transition animations
- MCQ concept-check quizzes per lesson with instant feedback
- Final course exams with 80% passing threshold
- Printable certificates of completion with user name and date
- Progress tracking via backend API (completed lessons persisted in DB)
- Sidebar lock: Course Academy is locked/disabled until onboarding assessment is completed
- Instant unlock via custom window event (`learning-progress-updated`) when quiz is submitted

**Course Catalog (Fully Built):**
```
1. Introduction to Arguments (3 lessons: Arguments vs Assertions, Premises & Conclusions, Deductive vs Inductive)
2. Logical Fallacies Masterclass (5 lessons: Ad Hominem, Straw Man, False Dilemma, Slippery Slope, Circular Reasoning)
3. Evidence & Support (2 lessons: Correlation vs Causation, Source Credibility)
4. Counter-Argument Strategy (2 lessons: Framing & Reframing, Strategic Concessions)
5. Advanced Persuasion (2 lessons: Ethos/Pathos/Logos, Cognitive Biases)
6. Business Communication (2 lessons: Client Objections & LAER, Interest-Based Bargaining)
```

**Key Files:**
- Course data & schema: `web/src/config/courses.ts`
- Interactive player: `web/src/app/app/academy/[courseId]/course-player-client.tsx`
- Course catalog UI: `web/src/app/app/academy/academy-client.tsx`
- Backend progress API: `backend/api/learning.py`

**Why Unique:** Integrated Brilliant-style interactive learning with animated puzzles keeps users long-term. No competitor offers built-in rhetoric courses with interactive widgets.

---

#### 6. Personalized Learning Path
**Status:** ✅ Implemented

**Description:** Onboarding assessment quiz that identifies weak fallacy types, generates a personalized learning dashboard, and provides spaced repetition flashcard reviews.

**Features:**
- 5-question onboarding assessment covering: Deductive Reasoning, Slippery Slope, False Dilemma, Ad Hominem, Correlation vs Causation
- Automatic skill level classification (Beginner / Intermediate / Advanced) based on score
- Weak fallacy identification with targeted course recommendations linking directly to relevant lessons
- Spaced repetition flashcard system with expandable cards for each weak fallacy
- Retake Assessment button with backend reset endpoint (`POST /learning/reset-assessment`)
- Sidebar ordering: Learning Path appears first, Course Academy second
- Pulsing amber indicator dot on Learning Path sidebar link when assessment is pending
- Course Academy sidebar link is locked (padlock icon, disabled, "LOCKED" badge) until assessment is completed
- Instant sidebar unlock via custom window event when assessment is submitted (no page refresh needed)
- Guard redirects: direct URL access to courses redirects back to Learning Path if assessment is incomplete

**Implementation Flow:**
```text
User opens Learning Path → Take 5-question assessment → Submit →
Calculate score & level → Identify weak fallacies → Show dashboard →
Recommend specific course lessons → Spaced repetition flashcards →
Instantly unlock Course Academy sidebar → Retake available anytime
```

**Key Files:**
- Learning path UI: `web/src/app/app/learning-path/learning-path-client.tsx`
- Sidebar lock/unlock logic: `web/src/app/app/layout.tsx`
- Backend API endpoints: `backend/api/learning.py` (`/progress`, `/assessment`, `/reset-assessment`, `/complete-lesson`, `/spaced-repetition`)
- Frontend API client: `web/src/lib/api-app.ts`

**Why Unique:** Self-improvement drives retention. No competitor offers integrated assessment → personalized recommendations → spaced repetition within the same debate platform.

---

### Tier 4: Enterprise USPs

#### 7. API for Enterprise
**Status:** Not implemented

**Description:** White-label integration for businesses.

**Features:**
- REST API for argument analysis
- Custom model fine-tuning on company data
- Usage analytics dashboard
- SLA guarantees
- Priority support

**Pricing:**
- Free tier: 100 requests/month
- Pro: $99/month (10K requests)
- Enterprise: Custom pricing

---

## Future Enhancements

### 1. Multiplayer Lobbies & Real-Time Collaborative Debates
A multi-user debate mode could be introduced, allowing two or more users to engage in live structured debates with real-time AI moderation, fallacy flagging, and live argument scoring displayed to all participants simultaneously.
- **Features:**
  - Create lobby with 2-8 players
  - Team debates (2v2, 3v3, free-for-all)
  - Bracket-style tournaments and weekly leaderboards
  - Spectator mode with live chat and reaction emojis
- **Status:** [ ] Future Enhancement

### 2. Custom Persona Builder & Expanded Persona Library
The debate simulation module can be extended with a broader range of AI personas representing diverse cultural, political, and philosophical viewpoints. This would expose users to a wider variety of argumentative styles and rhetorical strategies, providing a more comprehensive and realistic debate training experience.
- **Features:**
  - Select traits: aggressive, diplomatic, technical, emotional, humorous
  - Set knowledge domains (legal, scientific, political, general) and adjust difficulty levels
  - Save, name, and share custom personas with the community gallery
- **Status:** [ ] Future Enhancement

---

## Implementation Roadmap

### Phase 1: Core (Weeks 1-4)
- [x] Real-Time Coach with local model
- [x] Basic Visual Argument Mapper
- [x] Risk Scanner

### Phase 2: Engagement (Weeks 5-8)
- [x] Voice debate mode

### Phase 3: Learning (Weeks 9-12)
- [x] Course framework (Brilliant-style slide player with 6 interactive widget types)
- [x] All 6 courses fully built (14 lessons, puzzles, quizzes, final exams, certificates)
- [x] Learning path engine (assessment quiz, weak fallacy detection, spaced repetition, retake)

### Phase 4: Enterprise (Weeks 13-16)
- [ ] REST API documentation
- [ ] Usage dashboard
- [ ] Enterprise onboarding

### Phase 5: Future Enhancements (TBD)
- [ ] Multiplayer lobbies (Real-Time Collaborative Debates)
- [ ] Custom persona builder (Expanded Persona Library)

---

## Technical Requirements

### New Dependencies
| Category | Library/Tool | Purpose |
|----------|-------------|---------|
| Visual | D3.js / React Flow | Argument tree rendering |
| Visual | html2canvas | Export as image |
| Voice | Web Speech API | Speech recognition |
| Voice | speak-tts | Text-to-speech |
| Real-time | ONNX Runtime | Lightweight local inference |
| Multiplayer | Socket.io / Pusher | Real-time lobby sync |

### API Enhancements
- `POST /analyze/realtime` - Debounced quick analysis
- `POST /debate/lobby/create` - Create multiplayer room
- `POST /debate/lobby/join` - Join existing room
- `GET /visualize/argument` - Generate argument map

---

## Monetization Strategy

### Freemium Model
| Tier | Price | Features |
|------|------|----------|
| Free | $0 | 3 debates/day, basic analysis, demo mode |
| Pro | $9.99/mo | Unlimited debates, real-time coach, all personas, exports |
| Enterprise | Custom | API access, white-label, SLA |

---

## Competitor Analysis

| Competitor | Strength | LogicShield Advantage |
|------------|----------|-------------------|
| **Kialo** | Structured debates | AI coaching, real-time feedback |
| **Debatewise** | Community | Visual mapper, learning system |
| **Talkwalker** | Enterprise | B2C focus, debate training |
| **GMUD** | Academic | Web-based, freemium, accessible |

---

## Success Metrics

### Key KPIs
- Daily Active Users (DAU)
- Debates per user per week
- Return rate (30-day)
- Average session duration
- Course completion rate
- NPS score

### Targets (Year 1)
- 10K registered users
- 2K monthly active
- 500 course completions
- NPS > 50

---

## Open Questions

1. **Target market priority:** Students, professionals, or both?
2. **Monetization approach:** Freemium vs. subscription vs. enterprise-first?
3. **Timeline:** MVP first (Phase 1) or full rollout?
4. **Tech stack:** Keep local ONNX or use API-only for real-time?

---

## Appendix: Feature Priority Matrix

| Priority | Feature | Impact | Effort | Score | Status |
|----------|---------|--------|--------|-------|--------|
| P0 | Real-Time Coach | High | Medium | 9 | ✅ Done |
| P0 | Visual Mapper | High | Medium | 8 | ✅ Done |
| P1 | Risk Scanner | High | Low | 8 | ✅ Done |
| P1 | Multiplayer | Medium | High | 6 | Future Enhancement |
| P2 | Voice Mode | Medium | Medium | 6 | ✅ Done |
| P2 | Persona Builder | Medium | Medium | 5 | Future Enhancement |
| P3 | Courses | Medium | High | 5 | ✅ Done |
| P3 | Learning Path | Medium | High | 4 | ✅ Done |
| P4 | Enterprise API | Low | High | 3 | Pending |

---

*Document Version: 2.0*
*Last Updated: June 2026*