# Favorite Item Toggle

## Overview

Make the existing Favorite button in ItemDrawer functional. The button renders and reflects `isFavorite` state but has no `onClick` handler and no server action exists for toggling item favorites.

## Requirements

- Create `toggleFavoriteItem` server action
- Make Favorite button in ItemDrawer clickable
- Optimistic UI updates for instant feedback
- Toast notification on success/error
- Follow Pin Button pattern (just implemented)
- Items only (not collections — `toggleFavoriteCollection` already exists)
