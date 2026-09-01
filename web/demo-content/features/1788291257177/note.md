You can even write code blocks that you want to keep track of
```typescript
export type WorkspaceMetadata = {
  version: 1;
  categories: {
    id: string;
    name: string;
    collapsed: boolean;
    folderNames: string[];
  }[];
  uncategorizedFolders: string[];
};
```