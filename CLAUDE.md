# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A browsable resource catalog and team directory for the ACM (Advanced Cluster Management) team. Built as a Google Apps Script web app backed by Google Sheets.

- **Primary use case**: browsing/searching/filtering the resource catalog
- **Secondary use case**: maintaining (add/edit/delete) catalog records and team directory data

## Architecture

- **Backend**: Google Sheets (one Sheet, 9 tabs — Catalog + Components reference + 7 Team Directory tables)
- **Frontend**: Google Apps Script HTML Service (served as a web app)
- **Code location**: `apps-script/` directory — manually copied to the Apps Script editor for deployment
- **Auth**: Google Workspace (Sheet sharing controls access)
- **No build system** — plain HTML/CSS/JS served via Apps Script's `HtmlService`

## File Structure

```
apps-script/
  Code.gs              # Entry point: doGet(), include() helper
  SheetService.gs      # Generic CRUD for any Sheet tab
  Index.html           # App shell: header, nav tabs, modal containers, includes
  CatalogBrowse.html   # Filter bar + card grid for browsing resources
  CatalogForm.html     # Modal form for add/edit resource
  TeamDirectory.html   # Tabbed view of 7 team directory sub-tables
  Script.html          # All client-side JavaScript
  Styles.html          # All CSS
  appsscript.json      # Apps Script manifest
```

## Key Patterns

- HTML includes use Apps Script scriptlets: `<?!= include('Styles'); ?>`
- Server calls use `google.script.run.withSuccessHandler(...).functionName()`
- All server functions return `{success, data, error}` objects
- `SheetService.gs` is generic — same CRUD functions work for any tab name
- Multi-value fields (Function Area, Component) use semicolon separators
- Row identity uses 1-based sheet row numbers (`_rowIndex`)

## Deployment

1. Create a Google Sheet with tabs: Catalog, Components, Triad Map, PM Coverage, Guilds, Key Meetings, Slack Channels, Slack Groups, Mailing Lists
2. Import CSV data into the Catalog tab
3. In the Sheet: Extensions > Apps Script
4. Copy each file from `apps-script/` into the Apps Script editor
5. In `SheetService.gs`, replace `YOUR_GOOGLE_SHEET_ID_HERE` with the Sheet ID
6. Deploy > New deployment > Web app > Execute as: Me, Access: Anyone in org

## Data Model

### Catalog (11 columns)
Title, Resource Type, Function Area, Component, System of Record, Link, Owner/DRI, Status, Last Reviewed, Review Cadence, Short Summary

Key filter dimensions:
- **Resource Type**: Reference, Process, How-To, Playbook, Policy, Template
- **Status**: Current, Needs Review, Gap (color-coded: green, amber, red)

### Components (reference table)
The Components tab is the single source of truth for component names. It drives:
- The Component multi-select dropdown in the Catalog add/edit form
- The Component filter dropdown on the browse view
- Validation warnings on catalog cards whose Component value doesn't match the list

First column must be the component name. Additional columns (Description, JIRA Project, etc.) are optional.

### Team Directory (7 sub-tables)
Triad Map, Components, Guilds, Key Meetings, Slack Channels, Slack Groups, Mailing Lists

## Reference

Inspired by [grigz/gemini-gems-notebook-library](https://github.com/grigz/gemini-gems-notebook-library) — a similar Apps Script + Sheets catalog app.
