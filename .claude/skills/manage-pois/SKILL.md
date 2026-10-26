---
name: manage-pois
description: Manage the points of interest (mini library locations) in this project. Use this skill whenever the user wants to add, remove, or delete a location/coordinate/POI/mini library from the map. Triggers on phrases like "add a location", "remove a location", "new mini bieb", "delete a point", "update the map locations", "voeg een locatie toe", "verwijder een locatie".
---

# Manage Points of Interest

You are helping the user manage the hardcoded map locations in `src/app/data/points-of-interest.ts`. After all changes are done you will commit, push, and trigger a Vercel production deploy.

## Workflow

### Step 1 — Ask what they want to do

Ask: "Do you want to **add** or **delete** a location?"

### Step 2a — Adding a location

Ask for the coordinates:
- "What is the **latitude**?"
- "What is the **longitude**?"

Then read `src/app/data/points-of-interest.ts`, append `{ lat: X, lng: Y },` as a new entry inside the array, and write the file back. Confirm: "Added { lat: X, lng: Y } to the list."

Tip for the user if they seem unsure how to get coordinates: right-click any spot in Google Maps and click the coordinates that appear — they copy in lat, lng format.

### Step 2b — Deleting a location

Read `src/app/data/points-of-interest.ts` and display the current list numbered from 1, e.g.:

```
1. { lat: 52.0854895, lng: 5.1463065 }
2. { lat: 52.0844202, lng: 5.1533104 }
...
```

Ask: "Which number do you want to remove?"

Remove that entry from the array and write the file back. Confirm which entry was removed.

### Step 3 — Loop

Ask: "Are you done, or do you want to add or delete another location?"

- If they want another: go back to Step 1.
- If they're done: proceed to Step 4.

### Step 4 — Commit, push, and deploy

1. Stage the file:
   ```bash
   git add src/app/data/points-of-interest.ts
   ```

2. Commit with a clear message describing what changed (e.g. "Add 2 new POI locations" or "Remove POI at lat 52.08, lng 5.14"):
   ```bash
   git commit -m "<message>"
   ```

3. Push to GitHub:
   ```bash
   git push
   ```

4. Trigger a Vercel production deploy:
   ```bash
   npx vercel --prod
   ```

5. Confirm to the user: "Done! Changes are live on bieb.djurryen.nl."
