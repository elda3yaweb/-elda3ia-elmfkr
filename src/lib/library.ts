import type { LibraryFolder, LibraryItem, LibrarySection } from './types';

// breadcrumb path from root to a folder
export function folderPath(folders: LibraryFolder[], folderId: string | null): LibraryFolder[] {
  const path: LibraryFolder[] = [];
  let cur = folderId;
  let guard = 0;
  while (cur && guard < 1000) {
    const f = folders.find((x) => x.id === cur);
    if (!f) break;
    path.unshift(f);
    cur = f.parentId;
    guard++;
  }
  return path;
}

// direct children folders of a given folder (or root)
export function childFolders(
  folders: LibraryFolder[],
  section: LibrarySection,
  parentId: string | null
): LibraryFolder[] {
  return folders.filter((f) => f.section === section && f.parentId === parentId);
}

// direct items inside a folder (or root)
export function folderItems(
  items: LibraryItem[],
  section: LibrarySection,
  folderId: string | null
): LibraryItem[] {
  return items.filter((i) => i.section === section && i.folderId === folderId);
}

// all descendant folder ids (for cascade delete)
export function descendantFolderIds(folders: LibraryFolder[], rootId: string): string[] {
  const out: string[] = [];
  const stack = [rootId];
  while (stack.length) {
    const id = stack.pop()!;
    out.push(id);
    folders.filter((f) => f.parentId === id).forEach((f) => stack.push(f.id));
  }
  return out;
}

// visibility filter for a contestant
export function visibleForUser(
  node: { competitions: string[]; subscribersOnly: boolean },
  activeCompetition: string | null,
  isSubscriber: boolean
): boolean {
  const compOk = node.competitions.length === 0 || (activeCompetition ? node.competitions.includes(activeCompetition) : true);
  return compOk;
  // note: subscribersOnly handled at item level with lock UI, not hidden
  void isSubscriber;
}
