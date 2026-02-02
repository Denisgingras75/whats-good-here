# Claude Expert Tips

How to get the most out of working with Claude Code on this project. Updated whenever patterns emerge that could save time.

---

## Writing Better Prompts

### Describe the full scope upfront
Bad: "Fix the back button on the share prompt"
Better: "Browser back button should navigate through ALL vote flow steps (rating, review, share prompt) instead of leaving the dish page"

Why: Partial requests lead to partial solutions that need rework when the full scope emerges.

### Use the "When I / I expect / But instead" pattern
Bad: "The flow doesn't work still"
Better: "When I hit back on the rating step, I expect to go back to the yes/no step, but instead it goes to the seafood category page"

Why: This gives the trigger, expected outcome, and actual bug in one sentence. No extra rounds needed to diagnose.

### Mention relevant architecture constraints
Bad: "Add a way to block navigation during voting"
Better: "Add a way to block navigation during voting — we use BrowserRouter in App.jsx, not createBrowserRouter"

Why: Knowing constraints upfront prevents building solutions that won't work with the existing setup.

## Working Efficiently

### Group related changes into one request
Instead of asking for one fix, testing, then asking for a related fix, batch them: "The back button should work for all vote steps AND the share prompt."

### Share error messages immediately
When something breaks, paste the exact error or describe what you see on screen. Screenshots or dev tools output save multiple rounds of "what happened?"

### Say "test it" when you want browser testing
Saying "test it on the app" or "let's test in the browser" is a clear signal to use browser automation. This works well.
