# Recommendation Recompute SSE Notifications

## What changed

- Added a `RecommendationsRecomputedEvent` domain event.
- `ComputeRecommendationsHandler` now publishes that event after a successful score recompute.
- The admin manual endpoint passes `trigger: "admin"` into `ComputeRecommendationsCommand`.
- The daily cron passes `trigger: "cron"` into `ComputeRecommendationsCommand`.
- Added `RecommendationsRecomputedHandler`, registered in `HttpApiModule`, to persist and emit one notification per recomputed student user.

## Files touched

- `backend/src/Application/Features/OfferRecommendationFeature/Commands/compute-recommendations.command.ts`
- `backend/src/Application/Features/OfferRecommendationFeature/Commands/handlers/compute-recommendations.handler.ts`
- `backend/src/Application/Features/OfferRecommendationFeature/Events/handlers/recommendations-recomputed.handler.ts`
- `backend/src/Application/Services/RecommendationService/recommendation-cron.service.ts`
- `backend/src/API/http/admin/admin-recommendations.controller.ts`
- `backend/src/API/http/http.module.ts`
- `backend/src/Domain/events/recommendations-recomputed.event.ts`

## Existing SSE pattern followed

The team notification pattern is:

1. Persist a `Notification` through `INotificationRepository`.
2. Emit the saved notification through `INotificationEmitter.sendToUser`.
3. Frontend receives the payload from `/notifications/stream` and inserts it into the notification store.

The new recommendation notification follows the same pattern as application/offer/interview notifications. It sends:

- `type: "recommendations-recomputed"`
- `title: "Recommendations refreshed"`
- `message: "Your job matches were updated. Open Job Matcher to see the latest ranking."`
- `link: "/services/jobmatcher"`

## Why this implementation

The recompute can be triggered by two paths:

- Admin: `POST /admin/recommendations/compute`
- Cron: `RecommendationCronService.runDailyRecompute`

Both paths already go through `ComputeRecommendationsCommand`, so the notification trigger belongs after the command successfully writes scores. That avoids duplicating notification logic in the admin controller and cron service.

The command handler does not directly know about SSE. It publishes a CQRS event instead. The SSE-specific work stays in a notification event handler registered in `HttpApiModule`, where the existing `INotificationEmitter` provider already lives.

Students only are notified because the recompute command loads `StudentProfile` rows and emits their `student.userId` values. If an admin recomputes one `studentUserId`, only that student's profile is loaded and notified. If the cron recomputes all profiles, every processed student is notified.

The notification handler deduplicates user IDs and catches per-user notification failures so one failed notification does not block notifications for the rest of the students.

## Observable vs Promise in SSE

A `Promise` represents one future value. It resolves once and then it is finished. That fits normal request/response work like fetching a user, writing to the database, or calling an API.

An `Observable` represents a stream of values over time. It can emit notification 1, notification 2, notification 3, and stay open until the client disconnects.

That is why Nest's `@Sse()` endpoint returns an `Observable` instead of a `Promise`.

In `backend/src/API/http/sse/sse.service.ts`, `addClient(userId)` creates a `Subject`, stores it in `clients`, and returns:

```ts
return subject.asObservable()
```

That returned observable is the live SSE pipe for that user. When the backend later calls:

```ts
this.clients.get(userId)?.next({ data: payload })
```

RxJS emits a new value through the subject. Nest receives that value from the observable and writes it to the already-open SSE HTTP connection. The frontend `EventSource` receives it without making a new request.

Short version:

- `Promise`: one value, then closes.
- `Observable`: many values over time, stays open.
- SSE needs `Observable` because notifications are live events, not a single response.
