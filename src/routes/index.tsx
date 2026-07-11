import { createFileRoute } from "@tanstack/react-router";

// The real UI is rendered by <AppRoutes /> (react-router-dom) inside __root.tsx.
// This file exists only so TanStack Router has a matching route for "/".
export const Route = createFileRoute("/")({
  component: () => null,
});
