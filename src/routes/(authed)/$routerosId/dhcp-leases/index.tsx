import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(authed)/$routerosId/dhcp-leases/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(authed)/$routerosId/dhcp-leases/"!</div>
}
