# Jitter Protocol: Research Plan

*Open questions and next steps before Jitter becomes a standalone product*

---

## 1. Patent Landscape (URGENT — filing window)

**Goal:** Determine if "cumulative cross-site behavioral identity passport" is novel and file provisional patent.

- [ ] **Turnitin / iParadigms patents** — Do they claim portable keystroke identity, or only per-document writing style? Turnitin's Clarity product launched for classrooms — is the scope limited to education?
- [ ] **TypingDNA patents** — What exactly is claimed? They offer keystroke auth API — are their patents per-session authentication only, or do any cover cross-session cumulative identity?
- [ ] **BioCatch patents** — Behavioral biometrics scope. BioCatch focuses on banking fraud — do their claims extend to cross-site portable identity?
- [ ] **Google reCAPTCHA patents** — Any claims on cumulative behavioral scoring?
- [ ] **Prior art search** — Keystroke dynamics research dates to 1980s:
  - Gaines et al. (1980) — first keystroke timing study
  - Monrose & Rubin (1997) — keystroke authentication
  - Killourhy & Maxion (2009) — benchmark dataset, still widely cited
- [ ] **Key legal question:** Is the combination novel? Existing patents are per-session OR per-site OR single-signal. Jitter is cross-session AND cross-site AND multi-signal AND cumulative. This combination likely has no prior art.

**Filing info:** Provisional patent costs $65 (micro-entity). Kit prepared at `/Users/denisgingras/Documents/jitter-patent-filing/`. Clock is ticking — file before any public disclosure outside WGH.

**Next step:** Run USPTO patent search on "keystroke biometric identity portable" + "behavioral cumulative cross-site authentication" and review top 20 results.

---

## 2. Browser API Capabilities by Platform

**Goal:** Map exactly what signals are accessible from a web browser on each platform, so we know what Jitter can capture without native apps.

### Keyboard APIs

| API | Chrome | Firefox | Safari | Edge | What It Gives Us |
|---|---|---|---|---|---|
| KeyboardEvent (keydown/keyup) | Yes | Yes | Yes | Yes | Timing, key identity |
| KeyboardEvent.code | Yes | Yes | Yes | Yes | Physical key position |
| InputEvent.inputType | Yes | Yes | Yes | Yes | Edit actions (insert, delete, etc.) |
| Performance.now() | Yes | Yes | Yes | Yes | Sub-millisecond timing |

**Status:** Core keyboard signals work everywhere. No platform gaps.

### Advanced Input APIs

| API | Chrome | Firefox | Safari | Edge | What It Gives Us |
|---|---|---|---|---|---|
| WebHID | Yes | No | No | Yes | Raw HID device data (Hall effect keyboards) |
| Gamepad API | Yes | Yes | Yes | Yes | Analog triggers/sticks as biometric |
| Touch.force (iOS) | N/A | N/A | Deprecated* | N/A | Press force on touch |
| TouchEvent.radiusX/Y | Yes | Yes | No | Yes | Touch contact area |
| DeviceMotion/Orientation | Yes | Yes | Yes | Yes | Accelerometer/gyroscope during typing |
| PointerEvent.pressure | Yes | Yes | Yes | Yes | Stylus/pen pressure (limited on touch) |

**Open questions:**
- [ ] Can WebHID read Wooting analog data in a web app? Wooting.JS library exists — test if it works
- [ ] iOS 3D Touch was deprecated — does Touch.force still return values on newer iPhones via Haptic Touch?
- [ ] How much variation does DeviceMotion show during normal phone typing? Is it a usable signal?
- [ ] Does PointerEvent.pressure return meaningful values on mobile touchscreens, or only for stylus?

**Next step:** Build a test page that captures all available signals and test on: MacBook (Chrome/Safari), iPhone 15, Pixel 8, Wooting keyboard.

---

## 3. Generative Attack Models

**Goal:** Understand how hard it is to generate realistic fake biometric data, so we can honestly assess Jitter's vulnerability to AI-powered attacks.

- [ ] **LLM-generated keystroke timing** — Can GPT-4/Claude produce realistic inter-key intervals given a target profile? Test: feed a real typing profile and ask for 100 synthetic sessions.
- [ ] **GAN-generated sequences** — Academic papers exist on generating fake keystroke data. Key papers:
  - Agrafioti & Hatzinakos (2014) — keystroke synthesis
  - Search for "GAN keystroke dynamics spoofing" in recent (2023–2025) literature
- [ ] **Minimum training data** — How many real sessions does an attacker need to train a per-target model? If it takes 20+ sessions of stolen data, the attack requires prior access.
- [ ] **Liveness detection** — What separates replayed (recorded and played back) sequences from live typing? Key signals:
  - Micro-variations between identical words typed in different contexts
  - Response to unexpected events (popups, autocomplete suggestions)
  - Natural fatigue patterns within a session
- [ ] **Cross-signal correlation** — If an attacker fakes keystroke timing perfectly, does their mouse movement break the illusion? Hypothesis: coordinating multiple generative models is orders of magnitude harder than a single one.

**Next step:** Literature review — search Google Scholar for "keystroke dynamics spoofing attack" published 2022–2026. Summarize top 10 papers.

---

## 4. Cross-Session Consistency Research

**Goal:** Establish baselines for how real human typing changes over time, so Jitter can distinguish "natural drift" from "different person."

- [ ] **Natural drift rate** — How much does a person's typing pattern change over weeks and months? Key variables:
  - Time of day (morning vs. late night)
  - Day of week
  - Fatigue level
  - Content type (casual vs. formal text)
  - Emotional state
- [ ] **Profile stability threshold** — Our current setting is 15 sessions before a profile is "stable." Is this backed by literature?
  - Search: "keystroke dynamics enrollment samples" — how many samples do published systems use?
  - Killourhy & Maxion (2009) used 400 samples per user — but that's for authentication, not identity
- [ ] **Equal Error Rate (EER) benchmarks** — What EER do state-of-the-art keystroke systems achieve?
  - Literature suggests 2–10% EER for keystroke-only systems
  - Multi-modal (keystroke + mouse) systems report 1–3% EER
  - What EER does Jitter achieve with its current 8-signal stack?
- [ ] **Device switching impact** — When a user switches from laptop to phone, how much does their profile break? Can we maintain continuity or do we need per-device profiles?

**Next step:** Design a data collection protocol. Capture typing data from 10 WGH beta users over 4 weeks, with time-of-day and device metadata. Analyze variance.

---

## 5. Mobile-Specific Signals

**Goal:** Identify mobile-only signals that can strengthen Jitter on phones (where most WGH usage will happen).

- [ ] **Accelerometer/gyroscope during typing** — Available via DeviceMotion API on all mobile browsers. Questions:
  - Does phone orientation shift predictably while typing?
  - Is the signal unique per user or just per device?
  - Battery and performance impact of continuous motion sampling?
- [ ] **Swipe patterns as biometric** — Research exists on using unlock gestures as identity:
  - Search: "swipe pattern biometric authentication mobile"
  - Applicable to Jitter? Users swipe through dish cards in WGH
- [ ] **Pressure sensitivity across Android OEMs** — Touch.force varies by device:
  - Samsung Galaxy S series — supported?
  - Google Pixel — supported?
  - OnePlus — supported?
  - Older/budget devices — fallback to touch radius only?
- [ ] **Virtual keyboard layout as signal** — Different keyboards (Gboard, SwiftKey, Samsung Keyboard) have different key spacing, which affects timing patterns. Can we detect which keyboard is in use from timing alone?

**Next step:** Document which signals the current WGH Jitter implementation captures on mobile vs. desktop. Identify gaps.

---

## 6. Economic Validation

**Goal:** Verify the cost-curve claims in the pitch document with real-world data.

- [ ] **Bot farm operator interviews** — What does it actually cost to run a review farm today?
  - Sources: Dark web forums, Reddit r/slavelabour, Fiverr gig analysis
  - Key question: What's the per-review cost breakdown (account creation, CAPTCHA solving, proxy, labor)?
- [ ] **Cost with Jitter-like requirements** — If a platform required 15+ sessions of consistent behavioral data before accepting a review, what would that cost an attacker?
  - Mechanical Turk rate for "type naturally for 5 minutes": ~$1–$3/session
  - 15 sessions minimum = $15–$45 per identity (vs. $0.08 today)
  - 50 sessions for high confidence = $50–$150 per identity
- [ ] **Break-even analysis** — At what $/identity does a review farm become unprofitable?
  - Average revenue per fake review to the broker: $5–$15
  - If identity costs $50+, profit margin goes negative for volume operations
  - Only high-value targeted attacks (single competitor takedown) remain viable
- [ ] **Platform comparison** — What detection rates do current platforms achieve?
  - Yelp claims ~25% of reviews filtered
  - Amazon's rate is unknown but estimated at 30–40% catch rate
  - Google Maps has no published detection rate
  - With Jitter: what catch rate could we achieve? (Hypothesis: 80%+ for automated, 50%+ for Mechanical Turk)

**Next step:** Price out a 1,000-review bot operation on Fiverr/similar platforms. Document actual costs. Then model the same operation with Jitter requirements.

---

## 7. Privacy and Legal

**Goal:** Ensure Jitter's data collection is defensible under GDPR, CCPA, and emerging biometric privacy laws.

- [ ] **BIPA (Illinois Biometric Information Privacy Act)** — Does keystroke timing qualify as "biometric identifier"?
  - BIPA covers fingerprints, voiceprints, retinal scans
  - Keystroke dynamics are not explicitly listed — but "biometric identifier" is broadly defined
  - Texas, Washington state have similar laws
- [ ] **GDPR Article 9** — "Special categories" include biometric data "for the purpose of uniquely identifying a natural person"
  - Jitter patterns identify behavior, not body parts — is this biometric under GDPR?
  - Key: we store timing patterns, not keystrokes. No content is captured.
- [ ] **Consent model** — Options:
  - Opt-in with clear disclosure (safest, lowest adoption)
  - Opt-out with prominent notice (moderate risk, higher adoption)
  - Passive collection with ToS disclosure (highest risk, maximum adoption)
- [ ] **Data retention** — How long should behavioral profiles persist?
  - Active users: indefinitely (value compounds)
  - Inactive users: 12 months? 24 months?
  - Right to deletion: must be supported (GDPR Article 17)

**Next step:** Consult a privacy attorney familiar with biometric data laws. Budget: $500–$1,000 for initial opinion.

---

## 8. Competitive Intelligence

**Goal:** Understand what existing players are doing and where Jitter has white space.

| Company | Watch For | Why It Matters |
|---|---|---|
| **BioCatch** | Expansion beyond banking | If they go cross-industry, they're a direct competitor |
| **TypingDNA** | Cross-session or cross-site features | Currently per-session — if they go cumulative, our moat shrinks |
| **Turnitin Clarity** | Portable identity outside education | Currently classroom-only — watch for enterprise pivot |
| **Worldcoin** | Privacy backlash or regulatory action | Could create openings for privacy-first alternatives |
| **Google** | reCAPTCHA behavioral scoring evolution | Google has the data to build this — are they? |
| **Apple** | Private identity features in Safari/iOS | Apple's privacy stance could either help or block us |

**Next step:** Set up Google Alerts for "behavioral biometrics portable identity" and "keystroke dynamics cross-site."

---

## Priority Order

1. **Patent filing** — File provisional before any public presentation ($65, do it this week)
2. **Browser API test page** — Know exactly what signals we can capture (2 days)
3. **Literature review on attack models** — Understand our actual vulnerability (3 days)
4. **Economic validation** — Real costs, not estimates (1 week)
5. **Cross-session data collection** — Start capturing from WGH beta users (ongoing)
6. **Privacy legal review** — Before any standalone launch ($500–$1,000)
7. **Mobile signal testing** — Optimize for where users actually are (1 week)
8. **Competitive monitoring** — Ongoing, low effort

---

*Document version: February 2026*
*Next review: Before any external presentation of Jitter*
