#!/bin/bash
# CLAUDE.md automated violation checker
# Runs on pre-commit to catch what eslint can't
# Only checks staged files (passed as arguments from lint-staged)

ERRORS=0

# Get staged .js/.jsx files (or use arguments from lint-staged)
if [ $# -gt 0 ]; then
  FILES="$@"
else
  FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|jsx)$' | grep '^src/')
fi

if [ -z "$FILES" ]; then
  exit 0
fi

# 1.3: No hardcoded Tailwind color classes in JSX
# Allowed: layout/spacing (flex, p-, m-, w-, h-, grid, gap, etc.)
# Forbidden: text-gray, text-white, bg-gray, bg-blue, border-gray, etc.
COLOR_VIOLATIONS=$(echo "$FILES" | xargs grep -n -E '(text-(gray|white|black|red|blue|green|yellow|orange|purple|pink|indigo|emerald|amber|slate|zinc|neutral|stone|sky|cyan|teal|lime|fuchsia|violet|rose)|bg-(gray|white|black|red|blue|green|yellow|orange|purple|pink|indigo|emerald|amber|slate|zinc|neutral|stone|sky|cyan|teal|lime|fuchsia|violet|rose)|border-(gray|red|blue|green|yellow|orange|purple))' 2>/dev/null | grep -v 'node_modules' | grep -v '.test.')

if [ -n "$COLOR_VIOLATIONS" ]; then
  echo "❌ CLAUDE.md 1.3: Hardcoded Tailwind color classes found (use CSS variables):"
  echo "$COLOR_VIOLATIONS"
  ERRORS=$((ERRORS + 1))
fi

# 1.4: No direct supabase imports in components or pages
SUPABASE_VIOLATIONS=$(echo "$FILES" | grep -E 'src/(pages|components)/' | xargs grep -n "from.*['\"].*lib/supabase" 2>/dev/null)

if [ -n "$SUPABASE_VIOLATIONS" ]; then
  echo "❌ CLAUDE.md 1.4: Direct Supabase import in component/page (use src/api/ layer):"
  echo "$SUPABASE_VIOLATIONS"
  ERRORS=$((ERRORS + 1))
fi

if [ $ERRORS -gt 0 ]; then
  echo ""
  echo "Fix the above CLAUDE.md violations before committing."
  exit 1
fi

exit 0
