---
description: Comprehensive code review
---

Review $ARGUMENTS for:

1. **Security Issues**
   - XSS vulnerabilities
   - Unsafe user input handling
   - API key exposure
   - OWASP Top 10 concerns

2. **Performance**
   - Unnecessary re-renders
   - Missing memoization
   - Large bundle impacts
   - Inefficient algorithms

3. **Type Safety**
   - Missing TypeScript types
   - Unsafe `any` usage
   - Type assertions that could fail

4. **Best Practices**
   - React hooks rules
   - Component composition
   - Error boundaries
   - Accessibility (a11y)

5. **Code Quality**
   - Readability
   - Maintainability
   - DRY principle violations
   - Magic numbers/strings

Provide specific line references and actionable fixes.