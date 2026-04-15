#!/usr/bin/env bash
# sync-tracker-to-issues.sh
#
# Parses UI-DB-CONNECTION-MAP.md and creates/updates GitHub Issues
# on Think-Forward-Studios/Part-61-School, then adds them to Project #5.
#
# Usage: bash .planning/sync-tracker-to-issues.sh [--dry-run]
#
# Categories synced:
#   🔴 NO DB COLUMN    → label: tracker: no-db-column
#   ⚠️  PENDING         → label: tracker: pending-wire
#   🟡 NOT IN UI       → label: tracker: not-in-ui

set -euo pipefail

REPO="Think-Forward-Studios/Part-61-School"
PROJECT_NUM=5
PROJECT_OWNER="Think-Forward-Studios"
MAP_FILE="$(dirname "$0")/UI-DB-CONNECTION-MAP.md"
DRY_RUN="${1:-}"

if [[ ! -f "$MAP_FILE" ]]; then
  echo "ERROR: Connection map not found at $MAP_FILE"
  exit 1
fi

# ── Collect existing tracker issues to avoid duplicates ──
echo "Fetching existing tracker issues..."
EXISTING_ISSUES=$(gh issue list --repo "$REPO" --label "tracker: connection-map" --state all --limit 500 --json title,number,state 2>/dev/null || echo "[]")

issue_exists() {
  local title="$1"
  echo "$EXISTING_ISSUES" | python3 -c "
import sys, json
issues = json.load(sys.stdin)
title = sys.argv[1]
for i in issues:
    if i['title'] == title:
        print(f\"{i['number']}|{i['state']}\")
        sys.exit(0)
print('none')
" "$title"
}

# ── Parse the markdown into actionable items ──
echo "Parsing connection map..."

python3 - "$MAP_FILE" << 'PYEOF'
import re, sys, json

md_path = sys.argv[1]
with open(md_path) as f:
    lines = f.readlines()

items = []
current_section = ""
current_subsection = ""

for i, line in enumerate(lines):
    # Track sections
    m = re.match(r'^## \d+\.\s+(.+)', line)
    if m:
        current_section = m.group(1).strip().split('(')[0].strip()
        current_subsection = ""
        continue

    m = re.match(r'^### (.+)', line)
    if m:
        current_subsection = m.group(1).strip()
        continue

    # Skip non-table lines
    if not line.startswith('|'):
        continue
    cells = [c.strip() for c in line.split('|')[1:-1]]
    if len(cells) < 2:
        continue
    # Skip header/separator rows
    if all(re.match(r'^-+$', c) for c in cells):
        continue
    if cells[0] in ('UI Element', 'UI Enum Values', '#', 'DB Column', 'Metric', 'DB Table', 'Symbol', 'Status'):
        continue

    last_col = cells[-1]

    # Categorize
    category = None
    if '\U0001f534' in last_col or 'NO DB' in last_col.upper():
        category = 'no-db-column'
    elif '\u26a0' in last_col and 'PENDING' not in last_col.upper():
        # ⚠️ lines that have extra context
        category = 'pending-wire'
    elif '\u26a0' in last_col:
        category = 'pending-wire'
    elif '\U0001f7e1' in last_col or 'NOT IN UI' in last_col.upper():
        category = 'not-in-ui'
    # 🟡 items from "DB Columns NOT in UI" tables
    elif cells[0].startswith('\U0001f7e1'):
        category = 'not-in-ui'

    if not category:
        continue

    # Build item
    ui_element = re.sub(r'[`*]', '', cells[0])
    db_ref = re.sub(r'[`*]', '', cells[1]) if len(cells) > 1 else ''
    note = re.sub(r'[`*]', '', cells[-1]) if len(cells) > 2 else ''
    # Clean emojis from note
    for emoji in ['\U0001f534', '\u26a0\ufe0f', '\u26a0', '\U0001f7e1', '\U0001f501']:
        note = note.replace(emoji, '').strip()

    items.append({
        'section': current_section,
        'subsection': current_subsection,
        'ui_element': ui_element,
        'db_ref': db_ref,
        'note': note,
        'category': category,
    })

# Output as JSON
print(json.dumps(items))
PYEOF

ITEMS=$(python3 - "$MAP_FILE" << 'PYEOF2'
import re, sys, json

md_path = sys.argv[1]
with open(md_path) as f:
    lines = f.readlines()

items = []
current_section = ""
current_subsection = ""

for i, line in enumerate(lines):
    m = re.match(r'^## \d+\.\s+(.+)', line)
    if m:
        current_section = m.group(1).strip().split('(')[0].strip()
        current_subsection = ""
        continue
    m = re.match(r'^### (.+)', line)
    if m:
        current_subsection = m.group(1).strip()
        continue
    if not line.startswith('|'):
        continue
    cells = [c.strip() for c in line.split('|')[1:-1]]
    if len(cells) < 2:
        continue
    if all(re.match(r'^-+$', c) for c in cells):
        continue
    if cells[0] in ('UI Element', 'UI Enum Values', '#', 'DB Column', 'Metric', 'DB Table', 'Symbol'):
        continue

    last_col = cells[-1]
    category = None
    if '\U0001f534' in last_col:
        category = 'no-db-column'
    elif '\u26a0' in last_col:
        category = 'pending-wire'
    if cells[0].startswith('\U0001f7e1'):
        category = 'not-in-ui'

    if not category:
        continue
    if not current_section:
        continue

    ui_element = re.sub(r'[`*]', '', cells[0]).replace('\U0001f7e1 ', '').strip()
    db_ref = re.sub(r'[`*]', '', cells[1]) if len(cells) > 1 else ''
    note = re.sub(r'[`*]', '', cells[-1]) if len(cells) > 2 else ''
    for emoji in ['\U0001f534', '\u26a0\ufe0f', '\u26a0', '\U0001f7e1', '\U0001f501', '\u2705']:
        note = note.replace(emoji, '').strip()

    items.append({
        'section': current_section,
        'subsection': current_subsection,
        'ui_element': ui_element,
        'db_ref': db_ref,
        'note': note,
        'category': category,
    })

print(json.dumps(items))
PYEOF2
)

ITEM_COUNT=$(echo "$ITEMS" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))")
echo "Found $ITEM_COUNT actionable items"

# ── Create issues ──
CREATED=0
SKIPPED=0
ERRORS=0

echo "$ITEMS" | python3 -c "
import sys, json
items = json.load(sys.stdin)
for item in items:
    cat = item['category']
    section = item['section']
    subsection = item['subsection']
    ui_el = item['ui_element']
    db_ref = item['db_ref']
    note = item['note']

    # Build title
    prefix = {'no-db-column': '[Schema Gap]', 'pending-wire': '[Wire Up]', 'not-in-ui': '[Surface in UI]'}[cat]
    title = f\"{prefix} {section}: {ui_el}\"
    if len(title) > 80:
        title = title[:77] + '...'

    # Build body
    label = 'tracker: ' + cat
    loc = f\"{section}\"
    if subsection:
        loc += f\" > {subsection}\"

    body_lines = [
        f'**Category:** {prefix}',
        f'**Page/Section:** {loc}',
        f'**UI Element:** {ui_el}',
    ]
    if db_ref:
        body_lines.append(f'**DB Reference:** `{db_ref}`')
    if note:
        body_lines.append(f'**Details:** {note}')
    body_lines.append('')
    body_lines.append('---')
    body_lines.append('*Auto-generated from UI-DB Connection Map*')

    body = chr(10).join(body_lines)
    print(json.dumps({'title': title, 'body': body, 'label': label}))
" | while IFS= read -r issue_json; do
  TITLE=$(echo "$issue_json" | python3 -c "import sys,json; print(json.load(sys.stdin)['title'])")
  BODY=$(echo "$issue_json" | python3 -c "import sys,json; print(json.load(sys.stdin)['body'])")
  LABEL=$(echo "$issue_json" | python3 -c "import sys,json; print(json.load(sys.stdin)['label'])")

  # Check if issue already exists
  RESULT=$(issue_exists "$TITLE")
  if [[ "$RESULT" != "none" ]]; then
    echo "  SKIP (exists): $TITLE"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  if [[ "$DRY_RUN" == "--dry-run" ]]; then
    echo "  DRY-RUN: Would create: $TITLE [$LABEL]"
    continue
  fi

  # Create issue
  ISSUE_URL=$(gh issue create \
    --repo "$REPO" \
    --title "$TITLE" \
    --body "$BODY" \
    --label "$LABEL" \
    --label "tracker: connection-map" \
    2>&1) || {
    echo "  ERROR creating: $TITLE"
    ERRORS=$((ERRORS + 1))
    continue
  }

  echo "  CREATED: $TITLE → $ISSUE_URL"

  # Add to project
  ISSUE_NUM=$(echo "$ISSUE_URL" | grep -o '[0-9]*$')
  if [[ -n "$ISSUE_NUM" ]]; then
    gh project item-add "$PROJECT_NUM" \
      --owner "$PROJECT_OWNER" \
      --url "$ISSUE_URL" 2>/dev/null || echo "  (could not add to project)"
  fi

  CREATED=$((CREATED + 1))

  # Rate limit: small delay between creates
  sleep 0.5
done

echo ""
echo "=== Sync Complete ==="
echo "Items found: $ITEM_COUNT"
echo "Done."
