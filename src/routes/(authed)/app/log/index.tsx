import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(authed)/app/log/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(authed)/$routerosId/log/"!</div>
}
