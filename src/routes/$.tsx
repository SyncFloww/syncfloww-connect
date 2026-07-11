import { createFileRoute } from "@tanstack/react-router";

// Splat catch-all so TanStack Router matches every path.
// Real routing happens in <AppRoutes /> via react-router-dom in __root.tsx.
export const Route = createFileRoute("/$")({
  component: () => null,
});
