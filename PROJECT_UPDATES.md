# InnovateLK Project Updates

This update focuses on converting the original MVP/demo into a more complete and safer working project.

## What was completed

### Backend
- Added password reset request + reset endpoints.
- Added support ticket backend module.
- Added ownership checks to notifications.
- Restricted user self-update and self-delete routes.
- Removed self-verification from profile updates.
- Hardened chat conversation/message access control.
- Added authenticated Socket.IO handling for chat.
- Added conversation read endpoint.
- Added notification creation for message, interest, and investment events.
- Added innovator analytics endpoint.
- Added backend `.env.example` for required runtime settings.

### Frontend
- Replaced static forgot-password page with working request/reset flow.
- Replaced fake help/support form with real ticket submission.
- Reworked analytics page to use live backend/app data.
- Reworked innovator, investor, and manufacturer dashboards to use real app data instead of placeholders.
- Updated messaging page to mark conversations as read and use real-time socket sends with HTTP fallback.
- Added support service and new auth/chat service methods.
- Fixed dynamic Tailwind class bug in About page and analytics cards.

## Verification completed in this environment
- TypeScript syntax parse passed across `src/` and `backend/src/`.

## What still must be done on a machine with internet access
- Run `npm install` in the root and `backend/` directories.
- Run frontend and backend builds.
- Run the full app against MongoDB.
- Perform browser-based QA for auth, chat, investments, support tickets, and analytics.

The container used for this update could not fetch packages from npm, so full dependency-based build/test execution was not possible here.

## Additional direct messaging and directory improvements
- Added a people directory and individual user profile pages.
- Added direct one-thread-per-user conversation flow via /messages?userId=<id> and backend direct conversation endpoint.
- Fixed conversation display names so chats show participant names instead of generic labels.
- Added patent full-details request workflow with notification and chat handoff.
- Replaced hardcoded navbar notification/message badges with live counts.

## Admin panel update
- Added a single-admin role and seeded admin account: `admin@innovatelk.local` / `password123`.
- Added protected `/admin` APIs and frontend admin panel.
- Added admin user management with verify/suspend controls.
- Added patent moderation with approval/rejection, featured toggle, and admin notes.
- Added investment oversight with status/returns/notes updates.
- Added platform analytics and reporting views for the admin account.
- New patent submissions now enter `pending_review` and are hidden from public listings until approved.

## Deployment Cleanup Pass
- fixed patent detail interest state for non-owner viewers by returning viewer-specific interest membership
- message notifications now deep-link to the correct direct conversation
- reading a conversation now also marks matching message notifications as read
- navbar badges now refresh on focus, visibility changes, and a shorter polling interval
- notifications page now supports open-and-mark-read behavior
- home page removed mock featured fallback and uses public platform stats endpoint
- added public user stats endpoint for home-page reporting
- full-details responses now include a default response note when the innovator does not type one
- patent page now gives approved requesters a clear path back into direct chat
- messages page now auto-scrolls to the newest message

## Final workflow cleanup pass
- clarified the investor/manufacturer proposal workflow inside Investments & Deals
- added role-aware proposal management rules (submit, approve, decline, withdraw, complete)
- added direct patent-detail to investment-workspace linking via prefilled patentId
- restricted innovator-only patent submission and patent-management pages on the frontend
- removed My Patents from non-innovator account navigation
- added auth verification on app startup to reduce stale-session issues
- protected support ticket creation with JWT auth
