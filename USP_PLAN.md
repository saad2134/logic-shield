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
| Analysis | Post-hoc (after submit) | Real-time (as you type) |
| Visual | Text-only | Argument trees & graphs |
| Engagement | Solo practice | Multiplayer + tournaments |
| Learning | Self-directed | Structured courses |
| Business | None | Communication risk scanner |

---

## Priority USPs

### Tier 1: Core Differentiators (Must Build)

#### 1. Real-Time Argument Coach
**Status:** Not implemented

**Description:** Live streaming suggestions as user types - not post-analysis.

**Features:**
- Inline highlighting of potential issues (yellow=weak, red=fallacy)
- Suggestion pills on hover: "Add evidence", "Avoid absolute terms", "Rephrase"
- Difficulty toggle: Basic / Intermediate / Advanced feedback
- Debounced API calls (300ms after typing stops)
- Progressive disclosure

**Implementation:**
```text
User types → Local lightweight model quick-check → Highlight issues →
Show suggestion pill on hover → User clicks for full explanation
```

**Why Unique:** Kialo, Debatewise all analyze *after* submission. No live coaching during typing.

---

#### 2. Visual Argument Mapper
**Status:** Not implemented

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

#### 3. Communication Risk Scanner
**Status:** Not implemented

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

#### 4. Multiplayer Tournaments
**Status:** Not implemented

**Description:** Collaborative debate features for competitive engagement.

**Features:**
- Create lobby with 2-8 players
- Team debates (2v2, 3v3, free-for-all)
- Public matchmaking queue
- Bracket-style tournaments
- Weekly leaderboards
- Spectator mode with live chat
- Reaction emojis

**Implementation:**
```text
User creates/joins lobby → Wait for players → Start round →
Debate with turn-based argument exchange → Vote/AI judge →
Show winner → Update rankings
```

**Why Unique:** Social debate is underserved in current market.

---

#### 5. Voice Debate Mode
**Status:** Not implemented

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

#### 6. Custom AI Persona Builder
**Status:** Basic (predefined personas); Upgrade to buildable

**Description:** Users create custom debate opponents.

**Features:**
- Select traits: aggressive, diplomatic, technical, emotional, humorous
- Set knowledge domain: legal, scientific, political, general, custom
- Adjust difficulty: easy, medium, hard, expert
- Save + name custom personas
- Share with community (gallery)
- Import community personas

**Implementation:**
```text
User selects traits → Configure parameters →
Name persona → Test in preview → Save to library
```

**Why Unique:** Community-created personas drive engagement.

---

### Tier 3: Learning USPs

#### 7. Structured Rhetoric Courses
**Status:** Not implemented

**Description:** Built-in lessons on argumentation and logical fallacies.

**Features:**
- Course catalog: Fallacy Master, Persuasion 101, Business Comm
- Interactive lessons with examples
- Quizzes with real debate transcripts
- Progressive difficulty
- Certificates upon completion
- Progress tracking

**Course Outline:**
```
1. Introduction to Arguments (2 lessons)
2. Logical Fallacies (9 fallacy types)
3. Evidence & Support (3 lessons)
4. Counter-Argument Strategy (4 lessons)
5. Advanced Persuasion (5 lessons)
6. Business Communication (4 lessons)
```

**Why Unique:** Integrated learning keeps users long-term.

---

#### 8. Personalized Learning Path
**Status:** Not implemented

**Description:** AI-driven recommendations based on user performance.

**Features:**
- Onboarding assessment
- Identify weak fallacy types
- Recommend practice sessions
- Spaced repetition system
- Achievement badges + streaks
- Weekly progress email

**Implementation:**
```text
Onboarding quiz → Identify gaps → Recommend courses →
Track completion → Identify weak areas → Repeat with variation
```

**Why Unique:** Self-improvement drives retention.

---

### Tier 4: Enterprise USPs

#### 9. API for Enterprise
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

## Implementation Roadmap

### Phase 1: Core (Weeks 1-4)
- [ ] Real-Time Coach with local model
- [ ] Basic Visual Argument Mapper
- [ ] Communication Risk Scanner

### Phase 2: Engagement (Weeks 5-8)
- [ ] Multiplayer lobbies
- [ ] Voice debate mode
- [ ] Custom persona builder

### Phase 3: Learning (Weeks 9-12)
- [ ] Course framework
- [ ] First 3 courses
- [ ] Learning path engine

### Phase 4: Enterprise (Weeks 13-16)
- [ ] REST API documentation
- [ ] Usage dashboard
- [ ] Enterprise onboarding

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
| Pro | $9.99/mo | Unlimited debates, real-time coach, all personas |
| Teams | $29.99/mo | Multiplayer, custom personas, exports |
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

| Priority | Feature | Impact | Effort | Score |
|----------|---------|--------|--------|-------|
| P0 | Real-Time Coach | High | Medium | 9 |
| P0 | Visual Mapper | High | Medium | 8 |
| P1 | Risk Scanner | High | Low | 8 |
| P1 | Multiplayer | Medium | High | 6 |
| P2 | Voice Mode | Medium | Medium | 6 |
| P2 | Persona Builder | Medium | Medium | 5 |
| P3 | Courses | Medium | High | 5 |
| P3 | Learning Path | Medium | High | 4 |
| P4 | Enterprise API | Low | High | 3 |

---

*Document Version: 1.0*
*Last Updated: April 2026*