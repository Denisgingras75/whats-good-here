---
description: "Explain any file, feature, or concept in plain English"
---

# /explain $ARGUMENTS

Denis is a product founder, not an engineer. Explain the requested thing in plain English.

## Rules
- No jargon. If you must use a technical term, define it in parentheses immediately.
- Use analogies to physical things Denis already understands (restaurants, menus, kitchens, etc.)
- Keep it under 10 lines
- If it's a file: what does it DO, not how it works
- If it's a concept: why should Denis CARE, not how it's implemented
- If it's an error: what BROKE and what to tell Claude to fix it

## Examples of good explanations

"schema.sql is like the blueprint of your restaurant. It defines every table (like filing cabinets) and what goes in each drawer. When you change the blueprint, you need to rebuild the cabinet — that's a migration."

"React Query is like a waiter who remembers orders. Instead of going to the kitchen (database) every time someone asks for the menu, it remembers the last answer and serves it from memory. It only goes back to the kitchen when the food might have changed."

## If no argument given
Ask: "What do you want me to explain? Could be a file, a concept, an error message, anything."
