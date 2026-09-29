# kitshelf-ui

Theme, components and helpers shared by the [KitShelf](https://kitshelf.app) kits: free, account-free PWAs that
work offline and keep their data on the device. TripKit is the first; every new kit starts from
[kit-template](https://github.com/TolgaSenerHollyPalm/kit-template).

The package ships as **source** (TypeScript and CSS Modules). Each kit's own Vite build compiles it, so there is no
build step here.

## Install

```json
"dependencies": {
  "kitshelf-ui": "github:TolgaSenerHollyPalm/kitshelf-ui#v0.1.0"
}
```

Every kit pins an exact tag. Then, in the kit:

- `vite.config.ts`: `optimizeDeps: { exclude: ['kitshelf-ui'] }`, so Vite serves the sources instead of pre-bundling
  them. Keep `woff2` in the service worker's precache (`workbox: { globPatterns: ['**/*.{js,css,html,woff2}'] }`),
  or the fonts are missing offline.
- `tsconfig.app.json`: keep `vite/client` in `types` and the same strictness as this package's `tsconfig.json`.
  `tsc -b` checks these `.ts`/`.tsx` files with the kit's settings; `skipLibCheck` does not cover them.
- Styles, once, in this order:

  ```ts
  import 'kitshelf-ui/styles/fonts.css'
  import 'kitshelf-ui/styles/tokens.css'
  import 'kitshelf-ui/styles/base.css'
  ```

- Imports name the file: `import { Button } from 'kitshelf-ui/ui/Button.tsx'`.

### Working on the package and a kit together

`npm install ../kitshelf-ui` in the kit links this folder. Its own `node_modules` then brings a second React, so add
`resolve: { dedupe: ['react', 'react-dom'] }` to the kit's `vite.config.ts`. **Go back to the tag before
committing** (GitHub Actions cannot see a local path) and try the tagged install once more.

If they come up:

- Vitest in a kit does not transform the package → `test: { server: { deps: { inline: ['kitshelf-ui'] } } }`.
- `npm ci` in GitHub Actions trips over a `git+ssh` address in the lock file → a workflow step before it:
  `git config --global url."https://github.com/".insteadOf ssh://git@github.com/`.

## Versions

Tags are `v0.x.y`. A breaking change raises `x`, a fix raises `y`, and every tag gets a line in
[CHANGELOG.md](CHANGELOG.md).

## Colours

`styles/tokens.css` holds every colour, size and radius, with a dark list under `:root[data-scheme='dark']`. The
default kit colour is TripKit's teal.

**Kit colour.** A kit overrides four tokens in its own CSS, for both schemes:

```css
:root {
  --color-primary: …; /* buttons, ticks, progress */
  --color-primary-dark: …; /* text and icons in the kit colour */
  --color-primary-soft: …; /* chosen options, tiles */
  --color-on-primary: …; /* text on --color-primary */
}
:root[data-scheme='dark'] {
  /* the same four */
}
```

Rule: button text needs at least **4.5:1** against `--color-primary`, in both schemes. On a light colour such as
amber, `--color-on-primary` has to be dark.

**Accent.** A second colour for part of a screen (TripKit: each trip's colour). Set `--accent-color`, `--accent-soft`,
`--accent-ink` and `--accent-on` on a parent — for example a class passed as `theme` to `Screen` or `Tile`. The
`accent` tone and `<Chip tone="accent">` read them and fall back to the kit colour.

**Dark scheme.** `data-scheme="dark"` on `<html>` switches the tokens; there is no `prefers-color-scheme` media query
in the CSS. An inline script in the kit's `index.html` sets the attribute before the first paint, and
`watchAppearance({ key, themeColors })` from `app/appearance.ts` keeps it in step. Both use the same localStorage key
and page colours.

Contrast: text at least 4.5:1, icons and field edges at least 3:1, in both schemes.

## Contents

Components take **addresses** (`'#/settings'`), never a kit's own route type.

| Folder | What |
| --- | --- |
| `styles/` | `tokens.css`, `base.css` (element defaults), `fonts.css` (Bricolage Grotesque and Figtree, latin and latin-ext, from `@fontsource-variable`) |
| `ui/` | `Screen`, `Button` / `LinkButton`, `IconButton` / `IconLink` (with `badge`), `ListCard` / `LinkRow` / `ItemRow`, `Tile`, `CheckButton`, `Chip`, `ChoiceGroup`, `ConfirmDialog`, `DeleteButton`, `Disclosure`, `Menu`, `ProgressBar`, `SegmentedTabs`, `Stepper`, `AddField`, `RequiredMark`, `Avatar`, `Missing`, `OnlineBadge` + `useOnline`, `IosInstallHint` + `installHint.ts`, `InfoDialog`, `ToastProvider` / `Toasts` / `useToast`, `SettingsFooter` |
| `ui/` (styles and helpers) | `tone.ts` + `tones.module.css` (teal, coral, amber, neutral, accent), `text.module.css`, `turkish.ts` (`locative`: "Deniz’de") |
| `ui/icons.tsx` | Back, Plus, Check, Close, Gear, Sliders, ChevronRight, ChevronDown, Dots, ArrowRight, Refresh, Auto, Sun, Moon, Share, Download, History, File, Alert. A kit draws its own with `lineIcon()` from `ui/iconBase.ts`. |
| `app/` | `appearance.ts`, `hashRouter.ts` (`useHash()`, `go(href, { replace })`), `ConnectionNotice`, `UpdateToast`, `toast.module.css` (`stack`, `toast`, `actions`) |
| `storage/` | `wipe.ts`: `wipeDevice({ databaseNames, ownKeys, beforeDelete, appShell, scope })` |
| `backup/` | the file format, saving, reading, restoring, merging, the reminder, storage status and their texts; `BackupCard`, `RestoreSheet`, `BackupReminder`, `StorageStatus` (see Backups) |

## Backups

A kit's data leaves the device only as a file the user keeps: shared through the phone's share sheet or downloaded,
and read back the same way. There is no server, no account and no syncing.

**File.** `tripkit-yedek-2026-09-29.json` (the phone's own date), an envelope around the kit's data:

```json
{
  "format": "kitshelf-backup", "formatVersion": 1,
  "kit": "tripkit", "kitName": "TripKit", "dataVersion": 4,
  "exportedAt": "…", "appBuild": "…",
  "summary": { "trips": 3, "packs": 2 },
  "data": { }
}
```

`formatVersion` is the envelope's and stays 1; `dataVersion` is the kit's own. `summary` is for people opening the
file; the preview counts the data again. Device preferences such as the appearance setting stay out.

**Adapter.** A kit describes its data with `BackupAdapter` from `backup/format.ts`: `exportData()` reads memory and
is synchronous, because the share sheet only opens right after the tap; `validate()` checks structure only and must
accept the kit's own older records; `migrate()` throws for a version it does not know; `restore()` writes in a single
transaction, so a failure changes nothing.

| Function | What it does |
| --- | --- |
| `saveBackup(adapter)` | Shares the file where `navigator.canShare` allows files, otherwise downloads it. A closed share sheet is `cancelled` and records nothing; a refused share falls back to the download. Call it straight from the tap, with no `await` before it. |
| `readBackup(file, adapter)` | Over 20 MB or not JSON or not a KitShelf backup → `not-backup`; another kit → `other-kit` (checked before the versions); a newer envelope or data version → `too-new`; a single broken record or a repeated id → `damaged`. Nothing is written. |
| `restoreBackup(backup, adapter, mode)` | `merge` or `replace` through the adapter; the last backup date becomes the later of the saved one and the file's. |
| `mergeById(local, incoming, { newer })` | Adds what the device lacks and keeps the newer of what both have (by `updatedAt`, missing = oldest; a tie keeps the device's). |
| `backupDue(…)` | Due after 7 × 24 hours of data with no backup, or 30 × 24 hours after the last one if something changed since; a snooze hides the banner for a week, not the dot. |
| `storageStatus()` | `granted`, `not-granted` or `unknown` (then the row stays hidden). |

State lives in localStorage under `<kit>-last-backup`, `<kit>-data-since` and `<kit>-backup-snoozed-until`. Add
`backupKeyList(kit)` to the keys the kit's wipe removes, and call `trackDataSince()` whenever the data changes.

**Parts.** `BackupCard`, `RestoreSheet`, `BackupReminder` and `StorageStatus` in `backup/`; `InfoDialog`,
`ToastProvider` / `Toasts` / `useToast` and `SettingsFooter` in `ui/`. The shared Turkish texts are in
`backup/texts.ts`; what names the kit's own data ("seyahat…") comes in as props.

**Limits.** Chrome's list of file types it will share leaves out `.json`, so on Android the file is most likely
downloaded rather than shared; keep the extension anyway. Deletions do not travel: merging an old backup brings back
what was deleted since. A record changed on two devices keeps the newer copy as a whole, by each device's clock.

## Checks

```sh
npm test
npm run lint
npm run typecheck
```
