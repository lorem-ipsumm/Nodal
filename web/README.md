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
