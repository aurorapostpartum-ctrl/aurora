# SiteVault

A premium construction documentation platform for Expo (iOS, Android, and
web). Every job gets one permanent digital Job Folder: documents & prints
with revision tracking, checklists, hazard assessments, photos,
deficiencies, notes, announcements, activity history, and project
completion — all in one place, for both office managers and field crews.

SiteVault is intentionally focused. It is not a full construction
management platform — no payroll, accounting, estimating, invoicing, CRM,
or complex scheduling.

## Design language

- Premium industrial SaaS: strong typography, generous spacing, restrained
  color
- Dark charcoal foundation for chrome and working screens
- Warm, paper-like surfaces for the Job Folder itself — documents, and
  anything meant to feel like physical site paperwork
- A restrained construction-inspired copper/amber accent
- Native-feeling motion via Reanimated, with haptic feedback throughout

## Stack

- **Expo Router** (file-based navigation, typed routes, web + tablet support)
- **TypeScript** (strict mode)
- **React Native Reanimated 4** for premium micro-animations
- **TanStack React Query** for async data plumbing
- Local mock authentication and a seeded company dataset — no backend
  required to run the demo (see below)

## Getting started

```bash
npm install
npm run start           # or: npm run ios / npm run android / npm run web
```

Sign in with any of the seeded Northline Construction accounts (tap one on
the sign-in screen for a one-tap demo login), or type the email with the
shared demo password `sitevault`:

- Sarah Miller — Project Manager (`sarah.miller@northlineconstruction.com`)
- Daniel Brooks — Site Superintendent (`daniel.brooks@northlineconstruction.com`)
- John Smith — Plumbing Foreman (`john.smith@northlineconstruction.com`)
- Mike Johnson — Carpenter (`mike.johnson@northlineconstruction.com`)
- Alex Turner — Electrician (`alex.turner@northlineconstruction.com`)

Managers see the whole company; employees see only their assigned jobs.

## Responsive application shell

The signed-in app is wrapped in a single custom `AppShell`
(`src/components/shell/`) that switches layout at the `laptop` breakpoint
(1024px, see `src/theme/breakpoints.ts` / `src/hooks/useBreakpoint.ts`):

- **Desktop / laptop** — a persistent left `Sidebar` with the role's nav
  items, and a `Header` with page title, global search, notifications, and
  the user profile menu.
- **Tablet / mobile** — the sidebar collapses into a bottom `BottomNav`, and
  the `Header` shows the SiteVault wordmark instead of a page title.

Navigation is role-aware (`src/navigation/navConfig.ts`):

- **Manager** — Dashboard, Jobs, Employees, Templates, Search
- **Employee** — Home, My Jobs, Assessments, More

`RoleGate` (`src/navigation/RoleGate.tsx`) enforces this at the route level —
visiting a route your role doesn't own redirects you to your own landing
page — while the nav config only controls what each role *sees*. Job Folder
detail and other drill-in views (`job/[id]`, `person/[id]`, template detail,
settings, notifications) push full-screen outside the shell.

## Project structure

```
app/                        Expo Router routes
  _layout.tsx                 Root layout — providers, auth-guarded navigator
  (auth)/                      Sign in, forgot password
  (app)/                       Signed-in app
    (shell)/                    Routes rendered inside AppShell
      index.tsx                   Redirects to the signed-in person's landing route
      dashboard.tsx, jobs.tsx, employees.tsx, templates.tsx, search.tsx    (manager)
      home.tsx, my-jobs.tsx, assessments.tsx, more.tsx                    (employee)
    job/[id].tsx                 Job Folder — Overview, Documents & Prints,
                                  Checklists, Hazard Assessments, Photos,
                                  Deficiencies, Notes, Announcements,
                                  Activity History, Project Completion
    checklist-template/[id].tsx  Company checklist template detail
    hazard-template/[id].tsx     Company hazard assessment template detail
    person/[id].tsx               Manager or employee profile
    settings.tsx                  Account settings (opened from the profile menu)
    notifications.tsx             Notifications

src/
  theme/                     Design tokens: colors, typography, spacing, radius,
                              shadows, motion, breakpoints
  components/ui/             Design system: Button, TextField, Card, Table, Modal,
                              BottomSheet, Tabs, SegmentedControl, StatusBadge,
                              ProgressBar, Avatar, Skeleton, LoadingState,
                              EmptyState, ErrorState, Toast, Screen, etc.
  components/shell/           AppShell, Sidebar, BottomNav, Header, ProfileMenu
  navigation/                  navConfig (role → nav items) and RoleGate
  hooks/useBreakpoint.ts        Responsive layout breakpoint hook
  providers/                  AuthProvider (local mock session), AppProviders
  data/                        Seeded company dataset (company.ts) and selectors
  types/                       Domain types: Company, Job, Document, Checklist,
                                HazardAssessment, Deficiency, Activity, etc.
  features/jobs/                JobFolderCard, JobFolderGrid — the central,
                                 recurring visual unit of the app
  features/job/sections/        One component per Job Folder section
```

## The Job Folder concept

Every job gets one permanent Job Folder. Company-wide checklist and hazard
assessment templates stay unchanged; generating one for a job creates a
job-specific copy that lives permanently inside that Job Folder, e.g.:

```
TEMPLATE
Commercial Plumbing Final Checklist

GENERATED RECORD (inside the job's folder)
Riverstone Development — Commercial Plumbing Final Checklist — July 28, 2026
```
