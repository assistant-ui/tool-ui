---
description: Debug and fix errors
---

Debug and fix the issue in $ARGUMENTS:

1. **Analyze** the error/bug carefully
2. **Identify** root cause (don't just treat symptoms)
3. **Fix** the issue with minimal changes
4. **Verify** the fix doesn't break existing functionality
5. **Explain** what was wrong and why the fix works

If TypeScript errors exist, run `pnpm exec tsc --noEmit` to verify the fix.

Prioritize:
- Type safety
- Backward compatibility
- Clean, readable solutions
- Proper error handling
