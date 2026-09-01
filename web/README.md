# Nodal web app

This is the browser entry point for the shared Nodal React UI. It uses `src/App.tsx` and the shared components, but installs `createDemoApi()` instead of the Electron filesystem API.

## Run locally

From the repository root:

```bash
vite --config web/vite.config.ts
```

Build it with:

```bash
vite build --config web/vite.config.ts
```

The output is written to `dist-web/`. The web app starts with sample folders and notes and keeps browser-side changes in the shared Zustand/localStorage stores.

## Demo content

Demo notes are loaded at build time from `web/demo-content/`. Add Markdown files using this layout:

```text
web/demo-content/
  folder name/
    1735756800000.md
```

The folder name becomes the Nodal folder name. The Markdown filename (without `.md`) becomes the note ID; numeric filenames are used as note timestamps. This makes it possible to author content in a normal Nodal workspace, copy its folder structure into `web/demo-content/`, and rebuild the web demo. The loaded data is copied into memory, so visitors can still create, edit, move, and delete notes during a demo session; those changes are not written back to the source files.
