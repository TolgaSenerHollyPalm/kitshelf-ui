# Changelog

## v0.2.1 — 2026-09-30

A backup date ("27 Ağustos") no longer breaks across two lines on a narrow screen.

## v0.2.0 — 2026-09-29

Backups: the file format and its reading (`backup/format.ts`), saving through the share sheet or a download,
restoring, `mergeById`, the reminder and its stored state, persistent storage status and the shared texts; the parts
that show them — `BackupCard`, `RestoreSheet`, `BackupReminder`, `StorageStatus`, `InfoDialog`, toasts and
`SettingsFooter`; an `amber` Chip and `AlertIcon`.

## v0.1.0 — 2026-09-29

First release, taken out of TripKit with no change to how it looks: tokens (light and dark), element defaults and
fonts; the shared components and icons, taking addresses instead of TripKit's routes and a general `accent` tone
instead of the trip colour; a `badge` on `IconLink`; share, download, history and file icons; appearance, the hash
router core, the connection and update notices, the iOS install hint and `wipeDevice`, each taking the kit's own
name, keys and colours.
