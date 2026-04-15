#!/usr/bin/env python3
"""
Convert UI-DB-CONNECTION-MAP.md → UI-DB-CONNECTION-MAP.xlsx
One sheet per page/section + Summary sheet.
Run: python3 .planning/convert-map-to-xlsx.py
"""

import re
import os
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

MD_PATH = os.path.join(os.path.dirname(__file__), "UI-DB-CONNECTION-MAP.md")
XLSX_PATH = os.path.join(os.path.dirname(__file__), "UI-DB-CONNECTION-MAP.xlsx")

# Status emoji → text mapping for clean Excel cells
STATUS_MAP = {
    "\u2705": "READY",
    "\u26a0\ufe0f": "PENDING",
    "\u26a0": "PENDING",
    "\U0001f534": "NO DB COLUMN",
    "\U0001f7e1": "NOT IN UI",
    "\U0001f501": "DERIVED",
}

# Colors for status
STATUS_FILLS = {
    "READY": PatternFill(start_color="C6EFCE", end_color="C6EFCE", fill_type="solid"),        # green
    "PENDING": PatternFill(start_color="FFEB9C", end_color="FFEB9C", fill_type="solid"),       # amber
    "NO DB COLUMN": PatternFill(start_color="FFC7CE", end_color="FFC7CE", fill_type="solid"),   # red
    "NOT IN UI": PatternFill(start_color="FFF2CC", end_color="FFF2CC", fill_type="solid"),      # light yellow
    "DERIVED": PatternFill(start_color="D9E2F3", end_color="D9E2F3", fill_type="solid"),       # blue
}

HEADER_FILL = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
HEADER_FONT = Font(bold=True, color="FFFFFF", size=11)
SECTION_FONT = Font(bold=True, size=11, color="1F4E79")
THIN_BORDER = Border(
    left=Side(style="thin", color="D9D9D9"),
    right=Side(style="thin", color="D9D9D9"),
    top=Side(style="thin", color="D9D9D9"),
    bottom=Side(style="thin", color="D9D9D9"),
)


def clean_status(text: str) -> str:
    """Extract status label from a cell that may contain emoji + text."""
    text = text.strip()
    for emoji, label in STATUS_MAP.items():
        if emoji in text:
            # Return the label plus any extra text after it
            remainder = text.replace(emoji, "").strip()
            if remainder:
                return f"{label}: {remainder}"
            return label
    return text


def parse_md_sections(md_text: str):
    """Parse the markdown into numbered sections with their tables."""
    sections = []
    current_section = None
    current_subsection = None
    current_table = None
    table_headers = None

    lines = md_text.split("\n")
    i = 0
    while i < len(lines):
        line = lines[i]

        # H2 = major section
        m = re.match(r"^## (\d+)\.\s+(.+)", line)
        if m:
            if current_section and current_section["tables"]:
                sections.append(current_section)
            current_section = {
                "number": m.group(1),
                "title": m.group(2).strip().split("(")[0].strip(),  # remove (path)
                "path": "",
                "tables": [],
            }
            # Extract path from backticks
            path_m = re.search(r"`([^`]+)`", line)
            if path_m:
                current_section["path"] = path_m.group(1)
            current_subsection = None
            current_table = None
            i += 1
            continue

        # H2 for Summary/Enum sections (no number)
        m2 = re.match(r"^## (Summary|Enum)", line)
        if m2:
            if current_section and current_section["tables"]:
                sections.append(current_section)
            current_section = {
                "number": "S",
                "title": line.lstrip("#").strip(),
                "path": "",
                "tables": [],
            }
            current_subsection = None
            i += 1
            continue

        # H3 = subsection
        if line.startswith("### "):
            current_subsection = line.lstrip("# ").strip()
            current_table = None
            i += 1
            continue

        # Table row
        if line.startswith("|") and current_section:
            cells = [c.strip() for c in line.split("|")[1:-1]]
            if not cells:
                i += 1
                continue

            # Separator row
            if all(re.match(r"^-+$", c) for c in cells):
                i += 1
                continue

            # Header row (if no current table or new header pattern)
            if current_table is None or (table_headers and len(cells) != len(table_headers)):
                current_table = {
                    "subsection": current_subsection or "",
                    "headers": cells,
                    "rows": [],
                }
                table_headers = cells
                current_section["tables"].append(current_table)
                i += 1
                continue

            # Data row
            current_table["rows"].append(cells)
            i += 1
            continue

        # Non-table line resets table context
        if not line.startswith("|") and line.strip() and not line.startswith(">") and not line.startswith("---") and not line.startswith("*"):
            current_table = None
            table_headers = None

        i += 1

    if current_section and current_section["tables"]:
        sections.append(current_section)

    return sections


def write_sheet(ws, section):
    """Write a section's tables to a worksheet."""
    row = 1

    # Section header
    ws.cell(row=row, column=1, value=f"{section['number']}. {section['title']}")
    ws.cell(row=row, column=1).font = Font(bold=True, size=14, color="1F4E79")
    if section["path"]:
        ws.cell(row=row, column=2, value=section["path"])
        ws.cell(row=row, column=2).font = Font(italic=True, color="808080", size=10)
    row += 2

    for table in section["tables"]:
        # Subsection header
        if table["subsection"]:
            ws.cell(row=row, column=1, value=table["subsection"])
            ws.cell(row=row, column=1).font = SECTION_FONT
            row += 1

        # Table headers
        for ci, header in enumerate(table["headers"]):
            cell = ws.cell(row=row, column=ci + 1, value=header)
            cell.fill = HEADER_FILL
            cell.font = HEADER_FONT
            cell.alignment = Alignment(horizontal="center")
            cell.border = THIN_BORDER
        row += 1

        # Table rows
        for data_row in table["rows"]:
            for ci, val in enumerate(data_row):
                clean_val = clean_status(val) if ci == len(data_row) - 1 else val
                # Remove markdown bold/backticks
                clean_val = re.sub(r"\*\*(.+?)\*\*", r"\1", clean_val)
                clean_val = re.sub(r"`(.+?)`", r"\1", clean_val)
                cell = ws.cell(row=row, column=ci + 1, value=clean_val)
                cell.border = THIN_BORDER
                cell.alignment = Alignment(wrap_text=True, vertical="top")

                # Color-code status column
                if ci == len(data_row) - 1:
                    for status_key, fill in STATUS_FILLS.items():
                        if clean_val.startswith(status_key):
                            cell.fill = fill
                            break
            row += 1

        row += 1  # gap between tables

    # Auto-width columns
    for col_idx in range(1, ws.max_column + 1):
        max_len = 12
        for r in range(1, ws.max_row + 1):
            val = ws.cell(row=r, column=col_idx).value
            if val:
                max_len = max(max_len, min(len(str(val)), 60))
        ws.column_dimensions[get_column_letter(col_idx)].width = max_len + 2


def main():
    with open(MD_PATH, "r") as f:
        md_text = f.read()

    sections = parse_md_sections(md_text)
    wb = Workbook()

    # Remove default sheet
    wb.remove(wb.active)

    for section in sections:
        # Sheet name (max 31 chars, no invalid chars)
        name = f"{section['number']}. {section['title']}"
        # Remove chars invalid in Excel sheet names: : \ / ? * [ ]
        name = re.sub(r'[:\\/\?\*\[\]]', '-', name)
        if len(name) > 31:
            name = name[:28] + "..."
        ws = wb.create_sheet(title=name)
        write_sheet(ws, section)

    # Save
    wb.save(XLSX_PATH)
    print(f"Saved: {XLSX_PATH}")
    print(f"Sheets: {len(wb.sheetnames)}")
    for name in wb.sheetnames:
        print(f"  - {name}")


if __name__ == "__main__":
    main()
