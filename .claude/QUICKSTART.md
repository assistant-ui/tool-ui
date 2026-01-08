# Claude Code - Quick Start Guide

## 🎯 What Just Got Installed

You now have a **supercharged** Claude Code setup with:

### 1. Project Memory (`.claude/CLAUDE.md`)
Claude automatically knows your tech stack, commands, and conventions. No need to repeat yourself!

### 2. Slash Commands (`.claude/commands/`)
Time-saving shortcuts for common tasks:

- `/review [file]` - Comprehensive code review (security, performance, types)
- `/test [file]` - Generate complete unit tests
- `/fix [file]` - Debug and fix errors
- `/component [name]` - Create new React component following project patterns
- `/optimize [file]` - Performance analysis and improvements
- `/refactor [file]` - Improve code quality without changing functionality

**Usage**: Just type `/review app/components/MyComponent.tsx` in any Claude conversation.

### 3. Safety Hooks (`.claude/settings.json`)
Automatic protections that run in the background:

- **Auto-lint before commits** - Runs `pnpm lint:fix` before `git add`
- **Secret detection** - Prevents committing API keys, passwords, tokens
- **Environment setup** - Configures NODE_ENV at session start
- **File protection** - Blocks access to .env files, secrets, node_modules

### 4. Enhanced Settings
- Uses Claude Sonnet 4.5 by default
- Adds you as co-author in commits
- Protects sensitive files automatically

## 🚀 Try It Now

1. **Test a slash command**:
   ```
   /review app/api/chat/route.ts
   ```

2. **Ask Claude about your project** (it already knows!):
   ```
   What's our tech stack?
   ```

3. **Create something**:
   ```
   /component UserAvatar
   ```

## 📚 How It Works

- **Memory** loads automatically every session - Claude remembers your preferences
- **Slash commands** save you from repeating instructions
- **Hooks** run silently in the background - set it and forget it
- **Settings** enforce best practices - consistent quality across all sessions

## ⚡ Power Tips

1. **Chain commands**: `/review` then `/fix` then `/test` for complete workflows
2. **Edit commands**: Customize `.claude/commands/*.md` files to match your style
3. **Add more memory**: Put project-specific patterns in `CLAUDE.md`
4. **View loaded memory**: Type `/memory` to see what's active

## 🔧 Customization

All configs are in `.claude/`:
- `CLAUDE.md` - Project context and conventions
- `settings.json` - Team settings (commit this!)
- `settings.local.json` - Your personal settings (git-ignored)
- `commands/*.md` - Slash command definitions

## 🎓 Next Level (When Ready)

- Install MCP servers: `claude mcp add --transport http github https://mcp.github.com/mcp`
- Create user-level memory: `~/.claude/CLAUDE.md` (applies to ALL projects)
- Add custom hooks for your specific workflow
- Build complex multi-step slash commands

## 💡 Remember

- You don't need to explain your project setup anymore - it's in memory!
- Use slash commands for anything you do repeatedly
- Hooks protect you from mistakes automatically
- All configs are just text files - customize freely!

---

**Need help?** Type `/help` or ask Claude "How do I use [feature]?"
