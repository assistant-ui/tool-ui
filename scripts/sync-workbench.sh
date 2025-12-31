#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOOL_UI_ROOT="$(dirname "$SCRIPT_DIR")"

# Default to sibling directory (../../../create-chatgpt-app relative to tool-ui)
# Assumes: tool-ui is at ~/Code/aui/tool-ui and create-chatgpt-app is at ~/Code/create-chatgpt-app
DEFAULT_CREATE_CHATGPT_APP="$(cd "$TOOL_UI_ROOT/../../create-chatgpt-app" 2>/dev/null && pwd)"
CREATE_CHATGPT_APP="${CREATE_CHATGPT_APP:-$DEFAULT_CREATE_CHATGPT_APP}"

if [ ! -d "$CREATE_CHATGPT_APP" ]; then
  echo "Error: create-chatgpt-app not found at $CREATE_CHATGPT_APP"
  echo "Set CREATE_CHATGPT_APP env var to override"
  exit 1
fi

echo "Syncing workbench from $CREATE_CHATGPT_APP"

# Preserve demo-specific files
DEMO_LAYOUT="$TOOL_UI_ROOT/app/workbench/layout.tsx"
DEMO_LAYOUT_BACKUP=$(mktemp)
if [ -f "$DEMO_LAYOUT" ]; then
  cp "$DEMO_LAYOUT" "$DEMO_LAYOUT_BACKUP"
fi

# Clean target directories (except layout.tsx and page.tsx)
echo "Cleaning target directories..."
find "$TOOL_UI_ROOT/app/workbench/components" -type f \( -name "*.tsx" -o -name "*.ts" \) -delete 2>/dev/null || true
find "$TOOL_UI_ROOT/app/workbench/lib" -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.md" \) -delete 2>/dev/null || true

# Copy components (excluding export-popover.tsx which is product-specific)
echo "Copying components..."
rsync -av \
  --exclude='export-popover.tsx' \
  --include='*/' --include='*.tsx' --include='*.ts' --exclude='*' \
  "$CREATE_CHATGPT_APP/components/workbench/" \
  "$TOOL_UI_ROOT/app/workbench/components/"

# Copy lib
echo "Copying lib..."
rsync -av --include='*/' --include='*.tsx' --include='*.ts' --include='*.md' --exclude='*' \
  "$CREATE_CHATGPT_APP/lib/workbench/" \
  "$TOOL_UI_ROOT/app/workbench/lib/"

# Restore demo layout
if [ -f "$DEMO_LAYOUT_BACKUP" ]; then
  cp "$DEMO_LAYOUT_BACKUP" "$DEMO_LAYOUT"
  rm "$DEMO_LAYOUT_BACKUP"
  echo "Restored demo layout.tsx"
fi

# Copy API route
echo "Copying API route..."
mkdir -p "$TOOL_UI_ROOT/app/api/sdk-guide"
cp "$CREATE_CHATGPT_APP/app/api/sdk-guide/route.ts" "$TOOL_UI_ROOT/app/api/sdk-guide/route.ts"

# Patch workbench-shell.tsx to remove ExportPopover (demo-specific)
echo "Applying demo patches..."
SHELL_FILE="$TOOL_UI_ROOT/app/workbench/components/workbench-shell.tsx"
if [ -f "$SHELL_FILE" ]; then
  # Remove ExportPopover import
  sed -i '' '/import { ExportPopover } from "\.\/export-popover";/d' "$SHELL_FILE"
  # Remove ExportPopover usage
  sed -i '' '/<ExportPopover \/>/d' "$SHELL_FILE"
  echo "Patched workbench-shell.tsx"
fi

echo "Done! Run 'pnpm build' to verify."
