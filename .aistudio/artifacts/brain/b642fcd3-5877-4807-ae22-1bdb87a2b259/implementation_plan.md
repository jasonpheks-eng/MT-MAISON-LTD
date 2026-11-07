# Dynamic Experience Gallery Implementation Plan

To replace the 9 fixed image slots with a flexible, user-managed gallery, I will implement the following changes:

## 1. Backend Refactor (`server.ts` & `src/types.ts`)
- **Data Structure**: Update `ImageSlots` to remove `experience_1` through `experience_9` and replace them with `experience_gallery: string[]`.
- **API Updates**: Update `boutique_store.json` migration logic to preserve current experience images in the new array format.
- **Admin Endpoints**: Ensure `api/image-slots` handles array updates for the new `experience_gallery` field.

## 2. Admin Page UI Refactor (`AdminModal.tsx`)
- **Gallery Manager**: Replace the 9 static `ImageSlotEditor` components with a single `ExperienceGalleryEditor`.
- **Drag-and-Drop**: Implement a multi-file drag-and-drop zone.
- **Reordering**: Add drag-and-drop reordering functionality for existing gallery items (using a library like `dnd-kit` or native browser APIs).
- **Deletion**: Add a "delete" (trash icon) button to each image thumbnail.

## 3. Frontend Refactor (`ExperiencesSection.tsx`)
- Update the component to map through the `imageSlots.experience_gallery` array dynamically to render the gallery.

## 4. Verification
- Test file uploads, reordering, and deletion in the Admin Portal.
- Verify real-time synchronization across browser sessions.
- Run `compile_applet` and `lint_applet` to ensure type safety.
