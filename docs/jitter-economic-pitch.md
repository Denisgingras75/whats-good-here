# Jitter Protocol: The Economic Case for Behavioral Identity

*How keystroke biometrics break the economics of fake reviews, bot accounts, and digital fraud*

---

## 1. The Problem — Quantified

Online trust is broken, and the numbers prove it:

- **30% of online reviews are fake** (DemandSage 2025)
- Fake reviews cost consumers **$787 billion/year** in misguided purchases, projected to **$1.1 trillion by 2030** (Capital One Shopping)
- The average consumer wastes **$125/year** on products bought based on deceptive reviews
- Businesses buying fake reviews see a **1,900% ROI** on their investment (FTC estimate)
- Amazon has sued **10,000+ review brokers** and still can't stop them

The reason? Creating fake identities is absurdly cheap:

| What You're Buying | Cost |
|---|---|
| Fake Google review | $5–$15 |
| Fake account verification (US) | $0.26 |
| Fake account verification (UK) | $0.10 |
| Fake account verification (Russia) | $0.08 |
| CAPTCHA solve (AI-based) | $0.0005–$0.003 |
| 1,000 reCAPTCHA solves | $0.50–$3.00 |

*Sources: Cambridge COTSI Index (2025), 2Captcha/CapSolver pricing*

**The attack side is dirt cheap. The defense side is a $17B+ market that's losing.**

---

## 2. Why Current Defenses Fail

Every major defense system asks the same question: *"Is this a human right now?"* — and all of them can be beaten with a one-time trick.

| Defense | What It Does | Cost to Beat | Why It Fails |
|---|---|---|---|
| **CAPTCHA** | Visual puzzle | $0.001/solve | AI vision beats humans; solving services run 24/7 |
| **Phone verification** | SMS code | $0.08–$0.26/number | SIM farms sell verifications across 500+ platforms |
| **Device fingerprinting** | Browser/hardware ID | $5–$50 (antidetect browser) | GoLogin, Multilogin sell unlimited "clean" devices |
| **IP reputation** | Block known bad IPs | $2–$10/month (residential proxy) | 72M+ residential IPs available for rent |
| **Rate limiting** | Slow down requests | $0 (distributed attack) | Trivially bypassed with multiple accounts |
| **Email verification** | Confirm address | $0.01/email | Disposable email services generate unlimited addresses |

The common failure: all of these are **binary** (pass/fail), **per-session** (no memory), and **commodity** (tools to beat them are sold openly). None of them answer the harder question: *"Is this the same human as last time, and should we trust them?"*

---

## 3. Jitter's Approach — Signal Stack by Input Surface

Jitter doesn't ask "are you human?" It captures **how** you interact — keystroke timing, mouse movement, touch patterns — and builds a behavioral fingerprint that gets stronger with every session.

Here's what's available across every device type and what it costs to fake:

| Input Surface | Signals Available | Spoofing Cost (Single Session) | Spoofing Cost (50 Sessions, Consistent) |
|---|---|---|---|
| **Standard keyboard** (any laptop/desktop) | Flight time, dwell time, digraph intervals, bigram signatures, edit ratio, pause frequency | ~$0 (Puppeteer script) | $500+ (generative model per-target) |
| **Hall effect keyboard** (Wooting, Razer HE) | All above + continuous key depth (0–100% actuation), force curves, analog travel distance | $1,000+ (custom USB HID emulation) | Effectively impossible at scale |
| **Mobile touchscreen** (Android/iOS) | Touch coordinates, radius, pressure, swipe velocity, multi-touch patterns, accelerometer data | $500–$5,000 (device-level malware) | $5,000+ per target |
| **Mouse/trackpad** | Path curvature, velocity curves, micro-corrections, overshoot distance, click timing | ~$0–$100 (basic automation) | $200+ (physics simulation model) |
| **Combined (any 2+ surfaces)** | Cross-signal correlation, device-switching patterns | All individual costs multiplied | Economically unviable at scale |

The key column is the last one. Faking a single session is easy. Faking 50 sessions with consistent behavioral patterns across multiple signal types is a completely different problem.

---

## 4. The Cost Curve — Why Stacking Signals Breaks Bot Economics

Individual signals are weak. Stacked signals are devastating. Here's why: **attacker costs multiply, not add.**

| Attack Sophistication | What the Attacker Must Fake | Estimated Cost Per Target |
|---|---|---|
| Level 0: No biometrics | Just create an account | $0.08–$0.26 |
| Level 1: Keystroke timing only | Realistic key intervals for one session | ~$0 (open source tools exist) |
| Level 2: Keystroke + mouse path | Coordinated timing + realistic cursor movement | $100+ |
| Level 3: Level 2 + cross-session consistency | Same patterns across 10+ sessions with natural variation | $500+ |
| Level 4: Level 3 + multi-device signals | Consistent identity across keyboard, mouse, and touch | $2,000+ |
| Level 5: Level 4 over 50 sessions with natural drift | Generative model maintaining one fake identity over months | $5,000+ |

**The math that matters:** A 1,000-review bot operation today costs $5,000–$15,000. With Level 5 Jitter verification, the same operation costs **$5 million+**. That's a 300–1,000x cost increase.

```
Cost to Create One Fake Verified Identity

$5,000+ |                                          ___/
        |                                      ___/
$2,000  |                                  ___/
        |                              ___/
$500    |                          ___/
        |                     ____/
$100    |                ____/
        |          _____/
$0      |_________/
        +----+----+----+----+----+----+----+----+
        1    5    10   15   20   25   35   50
                  Accumulated Sessions
```

The curve is exponential because each additional session adds data the attacker must remain consistent with. After 50 sessions, the attacker is maintaining a generative model that produces typing patterns consistent with one specific fake identity, with realistic drift, across different content types. **No tool does this today.**

---

## 5. The Passport — Why Cumulative Identity Is the Moat

This is the fundamental difference between Jitter and everything that came before:

| | reCAPTCHA | Jitter |
|---|---|---|
| **Type** | Binary gate | Gradient confidence score |
| **Memory** | Per-session (forgotten immediately) | Cumulative (every session adds data) |
| **Cost to beat** | $0.001 (static) | Scales with number of sessions |
| **What it asks** | "Human right now?" | "Same human as last time? How confident?" |

After 50 sessions, a Jitter identity has:
- Hundreds of keystroke timing samples across different words and phrases
- Mouse movement patterns in different contexts
- Natural behavioral drift that matches how real humans change over time
- Cross-session consistency that would require a per-target generative AI model to fake

**The only true bypass is Mechanical Turk** — hiring real humans to type. But at $1–$5 per session across 50 sessions, that's $50–$250 per fake identity. Compare that to $0.08 for a fake account today. **That's a 600–3,000x cost increase** — and it requires hiring and managing actual humans, which doesn't scale.

---

## 6. The Login Anchor

Behavioral biometrics alone can be defeated by starting fresh. Jitter solves this with a persistent identity anchor — any SSO login (Google OAuth, Apple, etc.):

- **One Google account = one biometric passport**
- Behavioral data accumulates against that identity with every session
- Confidence score rises over time — new accounts start at zero trust
- No new accounts = no fresh start for attackers
- "Login with Google" already exists in most apps — zero integration friction

The combination is what creates the moat: the **login pins your identity**, the **biometrics prove it's really you**. Neither alone is sufficient. Together, they're the strongest passive identity verification available.

---

## 7. Market Opportunity

Jitter sits at the intersection of three growing markets:

| Market | 2025 Size | Projected | CAGR |
|---|---|---|---|
| Behavioral biometrics | $2.4–$3.1B | $14–$18B by 2032–2033 | 23–27% |
| Identity verification | $14.2B | $26.8B by 2031 | 11% |
| Digital ad fraud detection | $12.9B | $14.6B by 2033 | 13% |

### Comparable Companies

| Company | What They Do | Revenue/Pricing | Limitation |
|---|---|---|---|
| **BioCatch** | Mouse/touch biometrics for banks | $185M+ ARR (2025), 280+ banks | Banking only, not portable |
| **TypingDNA** | Keystroke auth API | Starting at $0.20/user/month | Single-signal, per-session |
| **Turnitin** | Writing style analysis | $2.59–$7/student/year | Education only, content-based |
| **Worldcoin** | Iris scan for global identity | $300M+ raised | Requires hardware, privacy concerns |

**Jitter's position:** Cheaper than BioCatch (no custom hardware), broader than TypingDNA (multi-signal), more portable than Turnitin (cross-site), less invasive than Worldcoin (no biometric hardware). Passive, cumulative, and works on any device with a keyboard or touchscreen.

---

## 8. What Makes Jitter Different

| | reCAPTCHA | Turnitin Clarity | BioCatch | Worldcoin | **Jitter** |
|---|---|---|---|---|---|
| **Question answered** | Human now? | Same writer? | Same user? | Unique human? | Same human, how confident? |
| **Scope** | Per-session | Per-document | Per-bank session | Global | Cross-site, cumulative |
| **Signal source** | Visual puzzle | Writing style | Mouse + touch | Iris scan | Keystroke + mouse + touch + force |
| **Portable** | No | No | No | Yes | Yes |
| **Privacy model** | Tracking cookies | Content stored | Session data | Biometric hash | Behavioral patterns only (no content) |
| **User friction** | High (puzzles) | None (passive) | None (passive) | High (hardware) | None (passive) |
| **Gets stronger over time** | No | Per-user corpus | Per-session | Static | Yes — every session compounds |

---

## 9. The Line

> "We don't have to block bots. We just have to reveal them."
>
> Once you can see who's real and who's not, every platform gets to make its own decision about what to do with that information. Jitter doesn't censor, filter, or gatekeep. It provides the signal. Platforms provide the policy.
>
> reCAPTCHA built a gate. Jitter builds a reputation.

---

## 10. What Exists Today

Jitter isn't theoretical. The core system is already built and running inside **What's Good Here**, a dish-level food discovery app launching Memorial Day 2026 on Martha's Vineyard:

- **8 biometric signals** captured passively during normal text input
- Keystroke timing (flight time, dwell time, digraph intervals)
- Edit behavior (backspace frequency, correction patterns)
- Session-level and cross-session consistency scoring
- "Jitter Verified" badge displayed on trusted contributions
- Full database schema, API layer, React hooks, and E2E tests — production-ready

WGH is the proof-of-concept. Jitter is the platform.

---

*Document version: February 2026*
*Contact: Denis Gingras — denis@whatsgoodhere.com*
