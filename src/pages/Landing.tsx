import { useEffect, useState } from 'react'
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
import { useI18n } from '../hooks/useI18n'
import { useAuth } from '../hooks/useAuth'
import { PLAN_ORDER, PLANS } from '../config/plans'
import { defaultPlanPrices, getPlanPriceInfo } from '../services/planPrices'
import { DEFAULT_BRANDING, getBranding } from '../services/branding'
import type { AppBranding, PlanPrices } from '../types'

export default function Landing() {
  const { t } = useI18n()
  const { user } = useAuth()
  const [prices, setPrices] = useState<PlanPrices>(defaultPlanPrices())
  const [prevPrices, setPrevPrices] = useState<PlanPrices>(defaultPlanPrices())
  const [brand, setBrand] = useState<AppBranding>(DEFAULT_BRANDING)

  useEffect(() => {
    getPlanPriceInfo()
      .then(({ current, previous }) => {
        setPrices(current)
        setPrevPrices(previous)
      })
      .catch((error) => console.error(error))
    getBranding()
      .then(setBrand)
      .catch((error) => console.error(error))
  }, [])

  const features = [
    { icon: Users, title: t('landing.feature.clients'), description: t('landing.feature.clients.desc') },
    { icon: FolderKanban, title: t('landing.feature.projects'), description: t('landing.feature.projects.desc') },
    { icon: Wallet, title: t('landing.feature.payments'), description: t('landing.feature.payments.desc') },
    { icon: LayoutDashboard, title: t('landing.feature.dashboard'), description: t('landing.feature.dashboard.desc') },
    { icon: Download, title: t('landing.feature.export'), description: t('landing.feature.export.desc') },
    { icon: Palette, title: t('landing.feature.themes'), description: t('landing.feature.themes.desc') },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            {brand.logo_url ? (
              <img
                src={brand.logo_url}
                alt={brand.brand_name}
                className="h-8 w-8 rounded object-contain"
              />
            ) : (
              <Briefcase className="h-6 w-6 text-primary" />
            )}
            <span className="text-lg font-bold">{brand.brand_name}</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              {t('landing.seeFeatures')}
            </a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              {t('landing.pricing.title')}
            </a>
          </nav>
          <div className="flex items-center gap-2">
            {!user && (
              <Link to="/auth" className="rounded-md px-4 py-2 text-sm font-medium hover:bg-accent">
                {t('common.signIn')}
              </Link>
            )}
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              {t('landing.openApp')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full bg-gradient-to-b from-primary/10 via-background to-background" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 md:grid-cols-2 md:py-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t('landing.badge')}
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            {t('landing.hero.title')}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">{t('landing.hero.subtitle')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              {t('landing.getStartedFree')}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#features" className="inline-flex items-center gap-2 rounded-md border px-5 py-3 text-sm font-medium hover:bg-accent">
              {t('landing.seeFeatures')}
            </a>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border bg-background p-4">
              <p className="text-xs text-muted-foreground">{t('dashboard.totalReceived')}</p>
              <p className="mt-1 text-2xl font-bold">৳1,24,800</p>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <p className="text-xs text-muted-foreground">{t('dashboard.pending')}</p>
              <p className="mt-1 text-2xl font-bold">৳32,000</p>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <p className="text-xs text-muted-foreground">{t('dashboard.activeProjects')}</p>
              <p className="mt-1 text-2xl font-bold">6</p>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <p className="text-xs text-muted-foreground">{t('dashboard.totalClients')}</p>
              <p className="mt-1 text-2xl font-bold">9</p>
            </div>
          </div>
        </div>
        </div>
      </section>

      <section id="features" className="scroll-mt-20 border-t py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight">{t('landing.features.title')}</h2>
            <p className="mt-4 text-muted-foreground">{t('landing.features.subtitle')}</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </span>
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-20 border-t py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight">{t('landing.pricing.title')}</h2>
            <p className="mt-4 text-muted-foreground">{t('landing.pricing.subtitle')}</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PLAN_ORDER.map((key) => {
              const plan = PLANS[key]
              return (
                <div
                  key={key}
                  className={`flex flex-col rounded-xl border p-6 shadow-sm ${
                    key === 'pro' ? 'border-primary ring-1 ring-primary' : 'bg-card'
                  }`}
                >
                  {key === 'pro' && (
                    <span className="mb-3 inline-flex w-fit rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                      {t('landing.mostPopular')}
                    </span>
                  )}
                  <h3 className="text-xl font-semibold">{t(`plan.${key}`)}</h3>
                  <p className="mt-2 flex items-baseline gap-2 text-2xl font-bold">
                    ৳{prices[key]}
                    {prevPrices[key] > prices[key] && (
                      <span className="text-base font-normal text-muted-foreground line-through">
                        ৳{prevPrices[key]}
                      </span>
                    )}
                    <span className="text-sm font-normal text-muted-foreground">
                      {t('plan.perMonth')}
                    </span>
                  </p>
                  <ul className="mt-6 flex-1 space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      {t('plan.upTo')} {plan.limits.clients} {t('plan.clients')}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      {t('plan.upTo')} {plan.limits.projects} {t('plan.projects')}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      {plan.limits.exports} {t('plan.exports')}
                    </li>
                    {plan.features.analytics && (
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        {t('plan.feature.analytics')}
                      </li>
                    )}
                    {plan.features.notifications && (
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        {t('plan.feature.notifications')}
                      </li>
                    )}
                    {plan.features.branding && (
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        {t('plan.feature.branding')}
                      </li>
                    )}
                  </ul>
                  <Link
                    to="/auth"
                    className={`mt-8 inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-medium hover:opacity-90 ${
                      key === 'pro' ? 'bg-primary text-primary-foreground' : 'border hover:bg-accent'
                    }`}
                  >
                    {t('common.getStarted')}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-10 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            {brand.logo_url ? (
              <img src={brand.logo_url} alt={brand.brand_name} className="h-6 w-6 rounded object-contain" />
            ) : (
              <Briefcase className="h-5 w-5 text-primary" />
            )}
            <span className="font-bold">{brand.brand_name}</span>
          </div>
          <p className="text-sm text-muted-foreground">{t('landing.cta.subtitle')}</p>
        </div>
      </footer>
    </div>
  )
}
