# BEAD Signal Platform — Live Deployment Guide

## What This Document Is

This is a step-by-step implementation guide for converting the BEAD Signal proof-of-concept into a live, data-driven deployment. It is organized into 6 phases, each building on the previous. You can stop after any phase and have a working system — earlier phases provide the most value per effort.

No coding knowledge is required for most steps. Where technical configuration is needed, exact settings are provided.

---

## What You Need Before Starting

| Item | Purpose | How to Get It | Cost |
|------|---------|---------------|------|
| Supabase account | Database for prospect data | [supabase.com](https://supabase.com) — sign up | Free (up to 500MB) |
| Netlify account | Hosts the platform + serverless API | [netlify.com](https://netlify.com) — sign up | Free (125K function calls/mo) |
| n8n instance | Runs automated data collection workflows | [n8n.io](https://n8n.io) — cloud or self-hosted | Free (self-hosted) or $20/mo (cloud) |
| Adzuna developer account | Job posting data for workforce signals | [developer.adzuna.com](https://developer.adzuna.com) — sign up | Free (250 API calls/day) |
| Anthropic API key | AI-generated outreach briefs (Phase 4 only) | [console.anthropic.com](https://console.anthropic.com) | ~$0.15/month at this scale |
| GitHub account | Version control and deployment pipeline | [github.com](https://github.com) | Free |

**Total monthly cost**: $0.15 to $20 depending on whether you self-host n8n.

---

## Phase 1: Set Up the Database

**Time estimate**: 30-45 minutes
**What you get**: A structured database ready to hold prospect data, intel feed events, competitor intelligence, and scoring history.

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Name it `bead-signal` (or whatever you prefer)
4. Choose a strong database password — save it somewhere secure
5. Select the region closest to you
6. Click **Create new project** and wait ~2 minutes for provisioning

### Step 2: Create the Database Tables

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New query**
3. You will need to create 4 tables. Ask Claude Code to generate the SQL by saying: *"Generate the Supabase schema SQL for the BEAD Signal platform with tables for prospects, intel_feed, competitors, and score_history"*
4. The `prospects` table must have these columns (matching the existing data structure):
   - `name`, `state`, `award`, `locs`, `tech`, `ceo`, `contact`, `tier`
   - `founded`, `subs`, `notes`
   - Six scoring factors: `gvi`, `oms`, `ttc`, `wsi`, `dtp`, `sqds`
   - `decision_month`, `services` (array), `source_url`
   - Timestamps: `created_at`, `updated_at`
5. The `intel_feed` table must have: `time_label`, `type`, `agent`, `text`, `prospect_name`, `impact`, `created_at`
6. The `competitors` table must have: `name`, `partners`, `states`, `strength`, `weakness`, `threat`
7. The `score_history` table must have: `prospect_id` (foreign key), `score`, `factors` (JSON), `scored_at`
8. Run the SQL. You should see "Success" for each table creation.

### Step 3: Seed the Database with Existing Data

The proof-of-concept contains 15 prospects, 10 intel feed items, and 4 competitors. These need to be inserted into the database as your starting dataset.

1. In the SQL Editor, ask Claude Code: *"Generate INSERT statements to seed the Supabase database with the 15 PROSPECTS, 10 INTEL_FEED items, and 4 COMPETITORS from data.js"*
2. Run the INSERT statements
3. Verify: Click **Table Editor** in the sidebar, select `prospects` — you should see 15 rows

### Step 4: Save Your Supabase Credentials

You will need two values from Supabase for later steps:

1. Go to **Settings** > **API** in the Supabase dashboard
2. Copy the **Project URL** (looks like `https://abcdef123.supabase.co`)
3. Copy the **service_role key** (under "Project API keys" — the one marked `service_role`, NOT `anon`)
4. Store both securely — you will add them as environment variables in Netlify

---

## Phase 2: Connect the Platform to the Database

**Time estimate**: 45-60 minutes
**What you get**: The platform loads live data from your database instead of hardcoded values. If the database is unreachable, it falls back to the hardcoded defaults seamlessly.

### Step 1: Create Netlify Serverless Functions

The platform needs API endpoints that sit between the frontend and Supabase. These are small serverless functions that Netlify runs for you.

1. Ask Claude Code: *"Create the Netlify Functions for the BEAD Signal platform: prospects.js, intel.js, and competitors.js that read from Supabase and return data in the same format as data.js"*
2. Claude Code will create a `netlify/functions/` directory with 3 files
3. Each function connects to Supabase using environment variables (never hardcoded credentials)

### Step 2: Create the Netlify Configuration

1. Ask Claude Code: *"Create a netlify.toml that publishes ctg-intel-platform/, maps /api/* to Netlify Functions, and handles SPA routing"*
2. This replaces the existing `_redirects` file with a more capable configuration

### Step 3: Add a Package File for the Supabase Dependency

The Netlify Functions need one dependency: the Supabase client library.

1. Ask Claude Code: *"Create a package.json with @supabase/supabase-js as the only dependency for the Netlify Functions"*
2. This is the only npm dependency in the entire project

### Step 4: Modify the Frontend to Fetch Live Data

1. Ask Claude Code: *"Add a non-blocking fetch-from-API block to data.js that silently refreshes PROSPECTS, INTEL_FEED, and COMPETITORS from /api/ endpoints after the hardcoded defaults load"*
2. This is a small addition at the bottom of `data.js` — the hardcoded data stays as the fallback
3. When the API responds, data updates in memory and a `data-updated` event fires

### Step 5: Deploy to Netlify

1. Push your code to a GitHub repository
2. In Netlify, click **Add new site** > **Import an existing project**
3. Connect your GitHub repo
4. Netlify will auto-detect `netlify.toml` settings
5. Before deploying, go to **Site settings** > **Environment variables** and add:
   - `SUPABASE_URL` = your Supabase project URL from Phase 1, Step 4
   - `SUPABASE_SERVICE_KEY` = your Supabase service_role key from Phase 1, Step 4
6. Trigger a deploy

### Step 6: Verify

1. Visit your Netlify URL
2. The platform should load instantly with the hardcoded data (same as before)
3. Within 1-2 seconds, data should silently refresh from the database
4. Open browser DevTools > Network tab — you should see 3 successful API calls to `/api/prospects`, `/api/intel`, `/api/competitors`
5. If the API calls fail, the platform should still work perfectly with hardcoded data

**Checkpoint**: At this point, you have a live platform backed by a real database. The data is still the same 15 prospects, but it's now editable via Supabase and served via API.

---

## Phase 3: Start Collecting Real Data — BEAD Subgrantees

**Time estimate**: 1-2 hours
**What you get**: Automated weekly ingestion of BEAD subgrantee data from state broadband office portals. This is the primary source of new prospects.

### Step 1: Set Up n8n

Choose one:
- **n8n Cloud**: Sign up at [n8n.io](https://n8n.io), get 5 active workflows free on trial
- **Self-hosted**: Run n8n on your own server (Docker recommended): `docker run -it --rm -p 5678:5678 n8nio/n8n`

### Step 2: Connect n8n to Supabase

1. In n8n, go to **Credentials** > **Add credential**
2. Search for "Supabase"
3. Enter your Supabase project URL and service_role key

### Step 3: Build the BEAD Subgrantee Scraper Workflow

This workflow downloads published BEAD subgrantee lists from state broadband offices and imports them into your database.

1. Ask Claude Code: *"Create an n8n workflow that scrapes BEAD subgrantee CSV data from Missouri, Nevada, and Colorado broadband office portals, normalizes the data to match the prospects table schema, and upserts to Supabase"*
2. The workflow should:
   - Run on a **weekly schedule** (Sunday 2am)
   - Download CSV files from each state portal
   - Parse and normalize field names to match your `prospects` table
   - Set default scoring factors for new prospects (all signals start at 0)
   - Upsert to Supabase (update existing, insert new)
   - Create an intel feed entry for each new prospect found

**Note**: State portal URLs change. You may need to update URLs periodically. The workflow should handle download failures gracefully (skip that state, try next week).

### Step 4: Build a Manual Import Endpoint

For states where data isn't available as downloadable CSV, you'll want a way to manually import prospects.

1. Ask Claude Code: *"Create a Netlify Function at /api/import-prospects that accepts a POST with a JSON array of prospects and upserts them to Supabase, protected by an API key header"*
2. Set an `IMPORT_API_KEY` environment variable in Netlify
3. You can then use this endpoint from n8n or from any HTTP client to add prospects manually

### Step 5: Verify

1. Trigger the n8n workflow manually
2. Check Supabase Table Editor — new prospects should appear
3. Refresh the platform — new prospects should appear in the Command Center and Pipeline views

**Checkpoint**: You now have an automated pipeline that discovers new BEAD subgrantees weekly and adds them to your platform. The prospect count should grow over time.

---

## Phase 4: Add Signal Detection — Scoring Factor Sources

**Time estimate**: 2-3 hours (can be done incrementally)
**What you get**: Automated daily scoring of prospects based on real external signals — FCC complaints, job postings, and industry news.

Each signal source updates one or more of the 6 scoring factors. You can add them one at a time.

### Signal Source A: FCC Consumer Complaints → SQDS Score

**What it does**: Checks the FCC public complaints database for complaints filed against your prospects. More complaints = higher Service Quality / Delivery Strain score.

**Data source**: FCC SODA API (free, no API key needed)

1. Ask Claude Code: *"Create an n8n workflow that queries the FCC Consumer Complaints API at opendata.fcc.gov for complaints mentioning each prospect name, calculates a SQDS score (0-10 based on complaint count), updates the prospect in Supabase, and creates intel feed entries for significant changes"*
2. Schedule: **Daily at 6am**
3. The SQDS scoring logic:
   - 0 complaints = score 0
   - 1-3 complaints = score 2-4
   - 4-6 complaints = score 5-6
   - 7-10 complaints = score 7-8
   - 10+ complaints = score 9-10

### Signal Source B: Job Postings → WSI Score (Workforce Strain Indicator)

**What it does**: Searches job boards for operations/NOC/technician roles posted by your prospects. More open roles = higher workforce strain = more likely to need outsourced help.

**Data source**: Adzuna Jobs API (free tier: 250 calls/day)

1. Sign up at [developer.adzuna.com](https://developer.adzuna.com) to get your App ID and App Key
2. Add these as n8n credentials
3. Ask Claude Code: *"Create an n8n workflow that searches Adzuna for each prospect's open NOC/operations/technician positions, calculates a WSI score (0-20 based on posting count), updates prospects in Supabase, and creates intel feed entries when WSI changes by more than 3 points"*
4. Schedule: **Daily at 7am**
5. The WSI scoring logic:
   - 0 postings = score 0-3
   - 1-3 postings = score 5-10
   - 4-8 postings = score 12-16
   - 8+ postings = score 17-20

### Signal Source C: Industry RSS Feeds → DTP Score + Intel Feed

**What it does**: Monitors telecom industry news for mentions of your prospects, BEAD program updates, and regulatory changes.

**Data sources** (all free, no API key):
- Fierce Telecom RSS
- Broadband Breakfast RSS
- NTIA News RSS
- Telecompetitor RSS

1. Ask Claude Code: *"Create an n8n workflow that monitors 4 telecom RSS feeds for mentions of prospect names and BEAD-related keywords, creates intel feed entries in Supabase, and adjusts DTP scores based on deadline/compliance/approval language"*
2. Schedule: **Every 4 hours**
3. The DTP adjustment logic:
   - Mentions of "deadline", "compliance", "reporting" → DTP +2
   - Mentions of "delay", "extension" → DTP -1
   - Mentions of "approval", "awarded" → DTP +1

### Step 5: Create the Auto-Score Function

After any signal source updates a prospect's scoring factors, the composite score and tier need to be recalculated.

1. Ask Claude Code: *"Create a Netlify Function at /api/auto-score that recalculates a prospect's composite score using the same formula as data.js calcScore(), determines the tier, detects tier changes, logs to score_history, and creates intel feed entries for tier crossings"*
2. Add a step at the end of each n8n workflow (A, B, C) to call this endpoint after updating scoring factors
3. The scoring formula must match exactly:
   - GVI score (max 20) + OMS score (max 20) + TTC score (max 15) + WSI + DTP + SQDS = composite (max 100)
   - Tiers: hot >= 80, warm >= 60, nurture >= 40, strategic < 40

### Verify

1. Trigger each n8n workflow manually
2. Check Supabase — scoring factors should have changed for at least some prospects
3. Check the `intel_feed` table — new entries should appear
4. Refresh the platform — the Command Center should show updated scores and new intel items

**Checkpoint**: Your platform now has real, daily-updated scoring based on actual external signals. The intelligence feed shows genuine events, not hardcoded examples.

---

## Phase 5: Enable AI-Generated Outreach Briefs

**Time estimate**: 30-45 minutes
**What you get**: On-demand or automatic AI-generated executive outreach briefs for hot prospects, using Claude to synthesize prospect data and recent signals into actionable sales content.

### Step 1: Get an Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account and add a payment method (pay-as-you-go)
3. Generate an API key
4. Add it as `ANTHROPIC_API_KEY` in your Netlify environment variables

### Step 2: Create the Brief Generator

1. Ask Claude Code: *"Create a Netlify Function at /api/generate-brief that fetches a prospect and their recent intel feed items from Supabase, calls the Claude API (claude-haiku-4-5) to generate a 3-paragraph executive outreach brief with channel recommendation, timing, and talking points, then saves the brief to an outreach_briefs table in Supabase"*
2. You will also need to create the `outreach_briefs` table in Supabase (ask Claude Code to generate the SQL)

### Step 3: Wire the Auto-Trigger

In the auto-score function from Phase 4, add a step: when a prospect crosses into the `hot` tier, automatically call the brief generator.

1. Ask Claude Code: *"Modify the auto-score Netlify Function to call /api/generate-brief when a prospect's tier changes to 'hot'"*

### Step 4: Update the Agent Simulation

The agents view currently shows a hardcoded 10-step simulation. Replace it with real intel feed data.

1. Ask Claude Code: *"Modify agents.js so the 'Run Simulation' button fetches the 10 most recent intel feed items from /api/intel and displays them as the simulation log with staggered animation, instead of using hardcoded strings"*
2. The button label changes from "RUN AGENT CHAIN SIMULATION" to "REFRESH LIVE FEED"

### Verify

1. Manually trigger a brief generation: call `/api/generate-brief?prospect_id=5` (Maverix Broadband)
2. Check Supabase `outreach_briefs` table — a brief should appear
3. On the platform, go to Agent Architecture and click "REFRESH LIVE FEED" — real intel items should appear

**Checkpoint**: The Strategist agent now generates real, actionable outreach content using AI. The agent simulation displays actual system activity.

---

## Phase 6: Live Data Refresh in the UI

**Time estimate**: 15-30 minutes
**What you get**: When the API returns fresh data, the currently-visible view re-renders automatically. No manual page refresh needed.

### Step 1: Add Event Listeners to the App Shell

1. Ask Claude Code: *"Modify app.js to listen for the 'data-updated' custom event and re-render the current active view module, plus update the 3 header stat values (total market, hot count, warm count)"*
2. Ensure the event listener is cleaned up when switching between views (no memory leaks)

### Verify

1. Open the platform to the Command Center view
2. Directly modify a prospect in Supabase (e.g., change an award amount)
3. Refresh the page — within 1-2 seconds, the updated value should appear
4. Rapidly switch between all 7 tabs 3 times — no console errors, no performance degradation

---

## Phase 7 (Optional): Company Enrichment

**Time estimate**: 1-2 hours
**What you get**: Automated weekly enrichment of prospect profiles — CEO names, employee counts, technology details scraped from company websites and summarized by AI.

### Step 1: Build the Enrichment Workflow

1. Ask Claude Code: *"Create an n8n workflow that loops through prospects in Supabase, scrapes each prospect's website (from source_url field), extracts CEO name and company details, calls Claude Haiku to generate a 2-sentence company summary, and updates the prospect record"*
2. Schedule: **Weekly**
3. Add `source_url` values to your prospects in Supabase (the company website for each)

### Step 2: Build the Competitive Monitor

1. Ask Claude Code: *"Create an n8n workflow that monitors competitor activity by searching news and job boards for NorthStar BPO, TeleCom Ops Inc, ConnectCare Services, and Rural Support Group, then updates the competitors table and creates intel feed entries"*
2. Schedule: **Weekly**

---

## Maintenance

### Ongoing Tasks

| Task | Frequency | How |
|------|-----------|-----|
| Check n8n workflow executions | Weekly | n8n dashboard > Executions |
| Review new prospects in Supabase | Weekly | Table Editor > prospects > sort by created_at |
| Update state portal URLs if broken | As needed | Edit n8n BEAD scraper workflow |
| Add new state portals | As states publish | Add HTTP Request nodes to BEAD scraper |
| Review Anthropic API usage | Monthly | console.anthropic.com > Usage |
| Review Netlify function usage | Monthly | Netlify dashboard > Functions |

### Adding New Data Sources

To add a new signal source:

1. Identify which scoring factor it feeds (GVI, OMS, TTC, WSI, DTP, or SQDS)
2. Create an n8n workflow that fetches the data on a schedule
3. Map the data to a numeric score within the factor's range
4. Update the prospect in Supabase
5. Call `/api/auto-score` to recalculate the composite score
6. The platform automatically displays the updated data on next page load

### Troubleshooting

| Problem | Check |
|---------|-------|
| Platform shows stale data | Browser DevTools > Network — are API calls succeeding? |
| API returns errors | Netlify dashboard > Functions > check logs |
| n8n workflows failing | n8n > Executions > check error messages |
| Scores not updating | Check that auto-score function is being called after data updates |
| New prospects not appearing | Check Supabase Table Editor — is the data there? |
| Platform won't load at all | Check Netlify deploy status — is the build passing? |

---

## Architecture Summary

```
State Portals ──┐
FCC Complaints ─┤
Job Boards ─────┤──→ n8n Workflows ──→ Supabase Database
RSS Feeds ──────┤                          │
Company Sites ──┘                          │
                                           ▼
                                    Netlify Functions
                                    (/api/prospects)
                                    (/api/intel)
                                    (/api/competitors)
                                    (/api/auto-score)
                                    (/api/generate-brief)
                                           │
                                           ▼
                                    BEAD Signal Platform
                                    (ctg-intel-platform/)
                                           │
                               ┌───────────┼───────────┐
                               ▼           ▼           ▼
                         Loads with    Fetches API   Re-renders
                         hardcoded     data silently  on data
                         defaults      in background  update
```

**Key design principle**: The frontend always works. If the database is empty, it shows hardcoded data. If the API is down, it shows hardcoded data. If everything is working, it shows live data. There is never a loading spinner or error state visible to the user.

---

## Proposed Data Sources — POC Audit

The Scout agent description (agents.js:12) is the most explicit statement, claiming it "monitors 50+ data sources" and naming these categories:

### 1. Job Postings / Workforce Data
- LinkedIn job listings (referenced directly in the simulation: "Maverix Broadband posts VP Operations on LinkedIn")
- General hiring activity (the WSI factor is described as "job postings, hiring gaps")
- Example intel feed items cite specific postings: "Wisper ISP lists 12 NOC technician openings"

### 2. FCC Complaints
- Named explicitly in the Scout description: "FCC complaints"
- The SQDS scoring factor is described as "FCC complaints, reviews, outages"

### 3. Press Releases
- Named in the Scout description: "press releases"

### 4. Conference Calendars
- Named in the Scout description: "conference calendars"
- Example feed item: "SkyFiber CEO confirmed speaker at Fiber Connect 2026"

### 5. Regulatory Filings / NTIA Data
- Named in the Scout description: "regulatory filings"
- Feed item: "NTIA issues updated BEAD reporting requirements"
- Feed item: "Arkansas announces BEAD subgrantee list — 14 new ISPs identified"
- Roadmap Phase 1 task: "Scrape and normalize all BEAD subgrantee data"

### 6. RSS Feeds
- Listed in the Scout's "triggers" field: "RSS feeds"

### 7. Web Scrapes (general)
- Listed in the Scout's "triggers" field: "web scrapes"
- Roadmap Phase 1: "Company intelligence enrichment from public sources"

### 8. API Monitors
- Listed in the Scout's "triggers" field: "API monitors"

### 9. Sales Outcome Data
- Listed in the Monitor agent's triggers: "Sales outcome data"
- Roadmap Phase 4: "Model calibration from outreach outcomes"

### 10. Engagement / Account Health Metrics
- Feed item: "Pine Telephone engagement metrics declining 12% QoQ"
- Roadmap Phase 3: "Partner Lifecycle Intelligence — health scoring, churn prediction"

### 11. Claude API (for output generation, not signal detection)
- Strategist description: "Generates contextual executive outreach briefs using Claude API"
- Roadmap Phase 2: "Claude API-powered contextual outreach briefs"

### 12. n8n Workflow Orchestration (proposed execution layer)
- Roadmap Phase 2: "Configure n8n monitoring workflows — continuous signal detection across 50+ sources"

### Scoring Factors and Their Implied Data Sources

| Factor | Label | Implied Source |
|--------|-------|---------------|
| GVI | Growth Velocity Index | BEAD award data, location counts, subscriber estimates |
| OMS | Organizational Maturity | Company age, public filings, organizational structure |
| TTC | Technology Transition Complexity | Technology type from BEAD applications |
| WSI | Workforce Strain Index | Job postings, LinkedIn, hiring gap analysis |
| DTP | Deployment Timeline Pressure | BEAD milestone deadlines, construction schedules |
| SQDS | Service Quality Degradation | FCC complaints, customer reviews, outage reports |

### Key Distinction

All of these are proposed in descriptive text strings within the UI. None are implemented as actual integrations. The platform names specific, plausible data sources — many of which are publicly accessible (NTIA BEAD data, FCC complaint databases, LinkedIn job APIs, conference schedules) — but every reference exists solely as hardcoded label text, not as a configured or configurable connection point.
