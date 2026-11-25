# Skeleton React UI

A reusable **Next.js 16** admin dashboard skeleton extracted from the JamiiHunt web app. It includes the full shadcn/ui component library, sidebar layout, dashboard with mock data, theme switching, and bilingual (EN/SW) UI scaffolding — without any backend or auth dependencies.

## What's included

- **59 shadcn/ui components** (`components/ui/`)
- **Admin layout** with collapsible sidebar, breadcrumbs, theme toggle, language switcher, and user menu
- **Dashboard** with stat cards, recent items table, and activity feed (mock data)
- **Sample pages**: Analytics, Users, Roles, Settings
- **State**: Zustand stores for language and demo user
- **Providers**: React Query, next-themes, Sonner toasts

## Quick start

```bash
cd skeleton-react-ui
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/dashboard`.

## Project structure

```
app/
  (admin)/          # Dashboard shell routes
    dashboard/
    analytics/
    users/
    settings/
components/
  ui/               # shadcn/ui primitives
  layouts/          # LayoutClient, breadcrumbs, user menu
  sidebar/          # App sidebar and navigation
  dashboard/        # Dashboard widgets
  headers/          # Page heading
lib/
  menu.ts           # Sidebar navigation config
  mock/             # Placeholder dashboard data
store/              # Zustand stores
hooks/              # use-mobile, etc.
```

## Customization

1. **Rename the app** — update `portalName` in `components/layouts/LayoutClient.tsx` and metadata in `app/layout.tsx`
2. **Navigation** — edit `lib/menu.ts` to add/remove sidebar items
3. **Auth** — replace the demo user in `store/user-store.ts` with your auth provider
4. **API** — add services under `lib/api/` and wire React Query hooks to real endpoints
5. **New pages** — add routes under `app/(admin)/` to inherit the dashboard layout

## Tech stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- shadcn/ui (new-york style)
- TanStack Query
- Zustand
- Lucide icons

## Scripts

| Command       | Description          |
|---------------|----------------------|
| `pnpm dev`    | Start dev server     |
| `pnpm build`  | Production build     |
| `pnpm start`  | Start production     |
| `pnpm lint`   | Run ESLint           |

## License

Use freely as a starting point for new projects.
