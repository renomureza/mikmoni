import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(authed)/$routerosId/hotspot/profiles')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(authed)/$routerosId/hotspot/profile"!</div>
}
