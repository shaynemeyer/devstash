# Refactor: FileUpload

## Status

Planned

## Goals

Split `FileUpload.tsx` (192 lines) into a custom hook and two focused UI components. The file currently mixes XHR upload logic, drag-and-drop state, progress tracking, image preview management, and rendering all in one component.

## Planned Split

### 1. `useFileUpload()` hook — `src/hooks/useFileUpload.ts`

Extract all upload mechanics:

- State: `uploading`, `progress`, `error`, `previewUrl`
- `handleUpload(file: File)` — XHR POST to `/api/upload`, tracks progress, sets `previewUrl` for images via `URL.createObjectURL`
- Cleanup: `URL.revokeObjectURL` on unmount
- Returns `{ uploading, progress, error, previewUrl, handleUpload }`

### 2. `FilePreview.tsx` — `src/components/ui/FilePreview.tsx`

Renders a successfully uploaded file or image:

- Receives `fileUrl`, `fileName`, `fileSize`, `previewUrl?` as props
- Image: shows preview thumbnail
- File: shows file info card (name, size, extension icon)
- Reusable in `ItemDrawer` view mode (currently duplicates this rendering)

### 3. `FileUploadInput.tsx` — `src/components/ui/FileUploadInput.tsx`

Renders the drag-and-drop upload target:

- Receives `onFile`, `accept`, `maxSize`, `uploading`, `progress`, `error` as props
- Handles `dragover`/`dragleave`/`drop` events
- Renders the dashed border zone with upload icon, hint text, and progress bar

### 4. `FileUpload.tsx` (reduced)

Becomes a thin orchestrator (~40 lines):

- Uses `useFileUpload()` hook
- Shows `FileUploadInput` when no file uploaded yet
- Shows `FilePreview` when upload is complete
- Calls `onUpload` callback with result

## Notes

- No behavior changes — pure structural refactor
- `FilePreview` can replace the duplicated image/file rendering in `ItemDrawer` view mode
- `useFileUpload` makes XHR logic unit-testable
- `FileUploadInput` can be reused for bulk upload or drag-drop zones in future

## History

- Feature planned
