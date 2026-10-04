import { Link } from 'react-router-dom';
import { MessageCircle, FileText, Building2, ArrowRight } from 'lucide-react';
import { useCurrentBrand } from '@/features/core/useCurrentBrand';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
export default function DashboardPage() {
  const { brands, isLoading, isError } = useCurrentBrand();
  return <div className="max-w-6xl mx-auto p-4 sm:p-10 space-y-8"><header className="rounded-2xl border bg-primary/5 p-6 sm:p-10"><p className="text-primary text-sm font-medium">Your brand workspace</p><h1 className="text-3xl sm:text-4xl font-bold mt-3">What would you like to create today?</h1><p className="text-muted-foreground max-w-xl mt-4">Start with your brand. Give your ideas a clear direction, then turn them into scripts you can review and share.</p><Button asChild className="mt-6"><Link to={brands.length ? '/assistant' : '/onboarding'}>{brands.length ? 'Talk to your brand assistant' : 'Set up your first brand'}<ArrowRight /></Link></Button></header>
    {isError && <p role="alert">Your brands could not load. Please refresh to try again.</p>}
    <div className="grid gap-5 md:grid-cols-3">{[{ icon: Building2, title: 'Teach Syncflow your brand', text: 'Define your audience, offers, voice and goals. Save the details once and keep refining them.', to: '/onboarding' }, { icon: MessageCircle, title: 'Build a content plan', text: 'Ask questions, add brand documents, and shape a practical strategy with your assistant.', to: '/assistant' }, { icon: FileText, title: 'Create your next script', text: 'Generate platform-specific scripts, edit the result, and keep versions in your library.', to: '/ai-studio' }].map(item => <Card key={item.to}><CardContent className="p-6 space-y-4"><item.icon className="text-primary h-7 w-7" /><h2 className="text-lg font-semibold">{item.title}</h2><p className="text-sm text-muted-foreground">{item.text}</p><Button asChild variant="outline"><Link to={item.to}>Open<ArrowRight /></Link></Button></CardContent></Card>)}</div>
    <section><h2 className="text-xl font-semibold mb-4">Your brands</h2>{isLoading ? <p role="status">Loading…</p> : brands.length ? <div className="flex flex-wrap gap-3">{brands.map(b => <Link key={b.id} to="/brands" className="rounded-lg border px-5 py-3 hover:bg-accent">{b.name}</Link>)}</div> : <p className="text-muted-foreground">Create your first brand to get started.</p>}</section>
  </div>;
}
