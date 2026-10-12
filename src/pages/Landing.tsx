import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Briefcase,
  Check,
  Download,
  FolderKanban,
  LayoutDashboard,
  Palette,
  ShieldCheck,
  Users,
  Wallet,
} from 'lucide-react'
import { PLANS } from '../config/plans'

const features = [
  {
    icon: Users,
    title: 'Client management',
    description:
      'Keep every client, contact detail, and note organised in one searchable place.',
  },
  {
    icon: FolderKanban,
    title: 'Project tracking',
    description:
      'Track projects from kickoff to completion with amounts, advances, and status.',
  },
  {
    icon: Wallet,
    title: 'Payments & balances',
    description:
      'Record payments and instantly see what is paid, pending, or overdue.',
  },
  {
    icon: LayoutDashboard,
    title: 'Revenue dashboard',
    description:
      'See total and active revenue across projects at a glance, updated live.',
  },
  {
    icon: Download,
    title: 'Import & export',
    description:
      'Bring your data in and take it with you with CSV import and export.',
  },
  {
    icon: Palette,
    title: 'Themes & branding',
    description:
      'Light, dark, or system themes with a custom primary colour of your choice.',
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">SKLedger</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/auth"
              className="rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              Sign in
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Open app
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 md:grid-cols-2 md:py-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Built for freelancers &amp; studios
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            Track your freelance revenue without the spreadsheet chaos
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            SKLedger brings clients, projects, advances and payments together so
            you always know what you have earned and what is still pending.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-md border px-5 py-3 text-sm font-medium transition-colors hover:bg-accent"
            >
              See features
            </a>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border bg-background p-4">
              <p className="text-xs text-muted-foreground">Total revenue</p>
              <p className="mt-1 text-2xl font-bold">$12,480</p>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="mt-1 text-2xl font-bold">$3,200</p>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <p className="text-xs text-muted-foreground">Active projects</p>
              <p className="mt-1 text-2xl font-bold">6</p>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <p className="text-xs text-muted-foreground">Clients</p>
              <p className="mt-1 text-2xl font-bold">9</p>
            </div>
          </div>
          <div className="mt-4 rounded-lg border bg-background p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Website redesign</p>
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                In progress
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-3/4 rounded-full bg-primary" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              $1,800 of $2,400 paid
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="border-t py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight">
              Everything you need to run your books
            </h2>
            <p className="mt-4 text-muted-foreground">
              Simple, focused tools that stay out of your way so you can focus on
              the work.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-xl border bg-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="border-t py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight">
              Simple, scalable plans
            </h2>
            <p className="mt-4 text-muted-foreground">
              Start free and upgrade as your client list grows.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {Object.entries(PLANS).map(([key, plan]) => (
              <div
                key={key}
                className={`flex flex-col rounded-xl border p-6 ${
                  key === 'pro' ? 'border-primary ring-1 ring-primary' : 'bg-card'
                }`}
              >
                {key === 'pro' && (
                  <span className="mb-3 inline-flex w-fit rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                    Most popular
                  </span>
                )}
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <ul className="mt-6 flex-1 space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Up to {plan.limits.clients} clients
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Up to {plan.limits.projects} projects
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    {plan.limits.exports} exports / month
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    {plan.limits.imports} imports / month
                  </li>
                </ul>
                <Link
                  to="/auth"
                  className={`mt-8 inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-medium transition-opacity hover:opacity-90 ${
                    key === 'pro'
                      ? 'bg-primary text-primary-foreground'
                      : 'border hover:bg-accent'
                  }`}
                >
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-16 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Ready to tidy up your finances?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Sign in with Google and start tracking in seconds.
            </p>
          </div>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Get started free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">SKLedger</span>
          </div>
          <p>Track your freelance revenue with confidence.</p>
        </div>
      </footer>
    </div>
  )
}
