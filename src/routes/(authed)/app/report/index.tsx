import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(authed)/app/report/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(authed)/app/report/"!</div>
}
