# Feature: Add Items to Collections

## Status

Pending

## Goals

Allow users to assign an item to one or more collections when creating or editing an item.

- Add a **Collections** multi-select field to the **Create Item** form
- Add a **Collections** multi-select field to the **Edit Item** form (inside the drawer)
- Persist the associations via the existing `ItemCollection` join table
- On save/update, replace the item's collection membership with the selected set

## Notes

- Only show collections that belong to the current user
- If the user has no collections, the selector is hidden
- The view-mode collection display in the drawer already exists; keep it unchanged (just update for interface change)
- Do not implement collection detail/browse pages in this feature

## Acceptance Criteria

- [ ] Creating an item with collections selected creates the correct `ItemCollection` rows
- [ ] Editing an item and changing collections replaces the associations
- [ ] Saving with no collections selected removes all associations
- [ ] The selector shows all user collections with a toggle/pill UI
- [ ] Unit tests cover the updated `createItem` and `updateItem` actions

## History
