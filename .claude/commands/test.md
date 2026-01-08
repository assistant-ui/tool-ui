---
description: Generate comprehensive tests
---

Generate unit tests for $ARGUMENTS covering:

1. **Happy Path** - Normal expected behavior
2. **Edge Cases** - Boundary conditions, empty states, null/undefined
3. **Error Handling** - Failed API calls, invalid inputs, exceptions
4. **User Interactions** - Clicks, inputs, form submissions
5. **State Changes** - Component state updates, prop changes
6. **Async Behavior** - Promises, loading states, race conditions

Use:
- React Testing Library for components
- Mock external dependencies
- Descriptive test names
- Arrange-Act-Assert pattern
- Follow existing test patterns in the codebase
