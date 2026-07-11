import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import DashboardPage from './DashboardPage';
import logoHeaderBlue from '@/assets/logo-header-blue.png';
import logoBlue from '@/assets/logo-blue.png';
import heroDashboard from '@/assets/hero-dashboard.png';
import howItWorksWoman from '@/assets/how-it-works-woman.png';
import ctaDashboard from '@/assets/cta-dashboard.png';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Sparkles, 
  CalendarClock, 
  BarChart3,
  Users,
  Eye,
  Settings2,
  ArrowRight,
  Check,
  HelpCircle,
  Mail,
  Send,
  Quote,
  Layers,
  Clock,
  BookOpen,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import SafeImage from '@/components/SafeImage';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
};

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
};

const fadeInLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
};

const fadeInRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
};

// Reusable reveal wrapper
const RevealSection = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const features = [
  { icon: Sparkles, title: 'AI-Powered Content Generation', desc: 'Effortlessly create engaging posts with our advanced AI, tailored to your brand voice and audience.' },
  { icon: CalendarClock, title: 'Smart Scheduling & Publishing', desc: 'Optimize post times for maximum reach across all your social platforms automatically.' },
  { icon: BarChart3, title: 'In-Depth Performance Analytics', desc: 'Get actionable insights with comprehensive reports on engagement, reach, and audience growth.' },
  { icon: Users, title: 'Multi-Brand & Team Management', desc: 'Manage multiple brands and collaborate seamlessly with your team under one unified dashboard.' },
  { icon: Eye, title: 'Competitor Monitoring', desc: 'Stay ahead of the curve by tracking competitive strategies and identifying new opportunities.' },
  { icon: Settings2, title: 'Custom Workflow Automation', desc: 'Tailor automation rules to fit your unique social media strategy and operational needs.' },
];

const howItWorksItems = [
  { icon: Layers, title: 'Multi-Platform Management', desc: 'Handle all your social accounts in one place.' },
  { icon: Clock, title: 'Automated Scheduling', desc: 'Plan and publish posts effortlessly.' },
  { icon: BookOpen, title: 'Content Curation', desc: 'Discover and repurpose trending content.' },
];

const pricingTiers = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for trying out SyncFloww',
    features: [
      '5 AI ideas per month',
      'Basic virality scoring',
      '1 brand profile',
      'Community support'
    ],
    cta: 'Get Started',
    popular: false
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'Best for content creators',
    features: [
      'Unlimited AI ideas',
      'Advanced virality scoring',
      '5 brand profiles',
      'Production packages',
      'Priority support',
      'Team collaboration'
    ],
    cta: 'Start Free Trial',
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For agencies & large teams',
    features: [
      'Everything in Pro',
      'Unlimited brands',
      'Custom AI training',
      'API access',
      'Dedicated account manager',
      'SSO & advanced security'
    ],
    cta: 'Contact Sales',
    popular: false
  }
];

const testimonials = [
  {
    name: 'David Brown',
    role: 'Fintech CEO',
    avatar: logoBlue,
    quote: 'The user experience is flawless, and the interface is intuitive. This has improved our workflow significantly, making complex tasks much easier to manage.',
  },
  {
    name: 'David Brown',
    role: 'Company CEO',
    avatar: logoBlue,
    quote: 'The user experience is flawless, and the interface is intuitive. This has improved our workflow significantly, making complex tasks much easier to manage.',
  },
  {
    name: 'David Brown',
    role: 'Startup CTO',
    avatar: logoBlue,
    quote: 'A game-changer for our sales team. The AI-driven insights and powerful AI-agent features that ensured efficiency over collaboration.',
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: 'Message sent!',
      description: 'Thanks for reaching out. We\'ll get back to you within 24 hours.',
    });
    setContactForm({ name: '', email: '', message: '' });
    setIsSubmitting(false);
  };

  // Parallax refs
  const heroRef = useRef(null);
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const heroImageY = useTransform(heroScrollProgress, [0, 1], [0, 80]);
  const heroTextY = useTransform(heroScrollProgress, [0, 1], [0, -30]);
  const heroOpacity = useTransform(heroScrollProgress, [0, 0.8], [1, 0]);

  const ctaRef = useRef(null);
  const { scrollYProgress: ctaScrollProgress } = useScroll({
    target: ctaRef,
    offset: ["start end", "end start"]
  });
  const ctaImageY = useTransform(ctaScrollProgress, [0, 1], [40, -40]);

  return (
    <motion.div 
      className="min-h-screen bg-background overflow-hidden"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <img src={logoHeaderBlue} alt="SyncFloww" className="h-8" />
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('hero')} className="text-sm font-medium text-foreground hover:text-primary transition-colors uppercase tracking-wide">Home</button>
            <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-wide">Features</button>
            <button onClick={() => scrollToSection('contact')} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-wide">About</button>
            <button onClick={() => navigate('/auth?mode=login')} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-wide">Log In</button>
            <Button variant="outline" size="sm" className="rounded-full px-6 uppercase tracking-wide text-xs font-semibold" onClick={() => navigate('/auth?mode=signup')}>
              Get Started
            </Button>
          </nav>

          {/* Mobile hamburger */}
          <button className="md:hidden text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-background border-b border-border overflow-hidden"
            >
              <div className="flex flex-col items-end gap-4 px-6 py-6">
                <button onClick={() => scrollToSection('hero')} className="text-sm font-medium uppercase tracking-wide">Home</button>
                <button onClick={() => scrollToSection('features')} className="text-sm font-medium uppercase tracking-wide">Features</button>
                <button onClick={() => scrollToSection('contact')} className="text-sm font-medium uppercase tracking-wide">About</button>
                <button onClick={() => { navigate('/auth?mode=login'); setMobileMenuOpen(false); }} className="text-sm font-medium uppercase tracking-wide">Log In</button>
                <Button variant="outline" size="sm" className="rounded-full px-6 uppercase tracking-wide text-xs font-semibold" onClick={() => { navigate('/auth?mode=signup'); setMobileMenuOpen(false); }}>
                  Get Started
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        id="hero"
        className="pt-28 pb-16 md:pt-32 md:pb-24 px-6 relative"
        variants={staggerContainer}
      >
        {/* Floating decorative elements */}
        <motion.div 
          className="absolute top-40 right-10 w-20 h-20 rounded-full bg-primary/5 blur-2xl hidden md:block"
          animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 left-10 w-32 h-32 rounded-full bg-primary/8 blur-3xl hidden md:block"
          animate={{ y: [0, 15, 0], scale: [1, 0.95, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <motion.div style={{ y: heroTextY, opacity: heroOpacity }}>
              <motion.h1 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-foreground leading-tight mb-6"
                variants={fadeInUp}
              >
                Revolutionize Your Social Media Marketing with AI Assistance
              </motion.h1>
              <motion.p 
                className="text-base text-muted-foreground mb-8 max-w-lg"
                variants={fadeInUp}
              >
                Automate your marketing tasks, Optimize your Content, and analyze your performance with AI-powered tools.
              </motion.p>
              <motion.div variants={fadeInUp}>
                <Button size="lg" onClick={() => navigate('/auth?mode=signup')} className="rounded-full px-8 gap-2">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </motion.div>
            <motion.div 
              className="relative"
              style={{ y: heroImageY }}
              variants={scaleIn}
            >
              <motion.img 
                src={heroDashboard} 
                alt="SyncFloww Analytics Dashboard" 
                className="w-full rounded-xl shadow-xl"
                whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
              />
              {/* Glow effect behind image */}
              <div className="absolute -inset-4 bg-primary/10 rounded-2xl blur-2xl -z-10 hidden md:block" />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <RevealSection>
        <div className="container mx-auto">
          <div className="text-center mb-14">
            <p className="text-primary font-medium text-sm mb-2">Features</p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Powerful Features for Every Brand
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, i) => (
              <motion.div 
                key={feature.title}
                className="p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -4 }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
        </RevealSection>
      </section>

      {/* How SyncFloww AI Works */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <RevealSection>
            <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-14">
              How Syncfloww AI Works
            </h2>
          </RevealSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <motion.div
              className="relative rounded-2xl overflow-hidden aspect-[4/5] max-w-sm mx-auto md:mx-0"
              initial={{ opacity: 0, x: -60, rotate: -3 }}
              whileInView={{ opacity: 1, x: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            >
              <motion.img 
                src={howItWorksWoman}
                alt="Using SyncFloww on mobile"
                className="w-full h-full object-cover rounded-2xl"
                whileHover={{ scale: 1.03, transition: { duration: 0.4 } }}
              />
              {/* Decorative circle */}
              <motion.div 
                className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-primary/20 blur-xl"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
            <div className="space-y-6">
              {howItWorksItems.map((item, i) => (
                <motion.div
                  key={item.title}
                  className="flex gap-4 items-start p-5 rounded-xl bg-card border border-border hover:shadow-md transition-all"
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                >
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <motion.section 
        id="testimonials"
        className="py-20 px-6 bg-primary/5"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              What Our Client Say About Us
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
              Discover the experiences of our satisfied customers. Read their testimonials to learn how our services have made a positive impact on their businesses.
            </p>
          </div>
          
          <div className="relative max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, i) => (
                <motion.div
                  key={i}
                  className="relative p-6 rounded-2xl bg-background border border-border"
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                  whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.1)", transition: { duration: 0.3 } }}
                >
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-primary/20">
                      <SafeImage src={testimonial.avatar} alt={testimonial.name} className="aspect-square h-full w-full rounded-full" />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">{testimonial.name}</h4>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Navigation arrows */}
            <div className="flex justify-center gap-3 mt-8">
              <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors">
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors">
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section 
        id="pricing"
        className="py-20 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
              Choose the plan that fits your creative workflow. Start free and scale as you grow.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                className={`relative p-6 rounded-2xl border ${
                  tier.popular 
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' 
                    : 'border-border bg-background'
                }`}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                whileHover={{ y: -8, boxShadow: "0 25px 50px rgba(0,0,0,0.12)", transition: { duration: 0.3 } }}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{tier.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                    {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{tier.description}</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant={tier.popular ? 'default' : 'outline'}
                  onClick={() => navigate('/auth?mode=signup')}
                >
                  {tier.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section 
        id="faq"
        className="py-20 px-6 bg-surface/50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <HelpCircle className="w-4 h-4" />
              FAQ
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-sm">
              Got questions? We've got answers.
            </p>
          </div>
          
          <Accordion type="single" collapsible className="w-full space-y-4">
            {[
              { q: 'How does the AI idea generator work?', a: 'Our AI analyzes trending content across platforms, your niche, target audience, and goals to generate unique, tailored video ideas with maximum viral potential.' },
              { q: 'What\'s included in a production package?', a: 'Each production package includes a detailed script with timing, a visual storyboard, shot-by-shot production brief, suggested music/sound effects, caption variations, and thumbnail concepts.' },
              { q: 'Can I use SyncFloww for multiple brands?', a: 'Yes! Our Pro plan supports up to 5 brand profiles, and Enterprise offers unlimited brands with unique voice, tone, and audience settings for each.' },
              { q: 'How accurate is the virality scoring?', a: 'Our virality scoring is based on analysis of millions of viral videos. While no system can guarantee virality, our scoring significantly improves your odds by identifying key success elements.' },
              { q: 'Is there a free trial available?', a: 'Our Starter plan is completely free with 5 AI ideas per month. We also offer a 14-day free trial of Pro for new users.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <AccordionItem value={`item-${i}`} className="border border-border rounded-xl px-6 bg-background">
                  <AccordionTrigger className="text-left font-semibold hover:no-underline text-sm">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section 
        id="contact"
        className="py-20 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Mail className="w-4 h-4" />
              Contact Us
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Get in Touch
            </h2>
            <p className="text-muted-foreground text-sm">
              Have questions or feedback? We'd love to hear from you.
            </p>
          </div>
          
          <motion.form
            onSubmit={handleContactSubmit}
            className="space-y-6 p-8 rounded-2xl border border-border bg-background shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Name</Label>
                <Input
                  id="contact-name"
                  placeholder="Your name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="you@example.com"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-message">Message</Label>
              <Textarea
                id="contact-message"
                placeholder="How can we help you?"
                rows={5}
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : (<>Send Message <Send className="w-4 h-4" /></>)}
            </Button>
          </motion.form>
        </div>
      </motion.section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-20 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center max-w-5xl mx-auto">
            <RevealSection>
              <p className="text-primary text-sm font-medium mb-3">Get the Revolution for your Social Media</p>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6 leading-tight">
                All the power that you need for your Social Media Marketing here!
              </h2>
              <Button size="lg" onClick={() => navigate('/auth?mode=signup')} className="rounded-full px-8 gap-2">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </RevealSection>
            <motion.div className="relative" style={{ y: ctaImageY }}>
              <motion.img 
                src={ctaDashboard} 
                alt="SyncFloww Dashboard Preview" 
                className="w-full rounded-xl shadow-lg"
                whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
              />
              <div className="absolute -inset-4 bg-primary/8 rounded-2xl blur-2xl -z-10 hidden md:block" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-primary/5 border-t border-border">
        <RevealSection>
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <img src={logoHeaderBlue} alt="SyncFloww" className="h-7 mb-4" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-foreground transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-foreground transition-colors">Pricing</button></li>
                <li><button onClick={() => scrollToSection('testimonials')} className="hover:text-foreground transition-colors">Tutorials</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => scrollToSection('contact')} className="hover:text-foreground transition-colors">About Us</button></li>
                <li><button onClick={() => scrollToSection('contact')} className="hover:text-foreground transition-colors">Contact</button></li>
                <li><button className="hover:text-foreground transition-colors">News</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button className="hover:text-foreground transition-colors">Newsletter</button></li>
                <li><button className="hover:text-foreground transition-colors">Help Center</button></li>
                <li><button className="hover:text-foreground transition-colors">Support</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 text-center">
            <p className="text-xs text-muted-foreground">
              © 2025 SyncFloww. All rights reserved.
            </p>
          </div>
        </div>
        </RevealSection>
      </footer>
    </motion.div>
  );
};

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <img src="/Icon.png" alt="SyncFloww" className="w-12 h-12 mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!user ? (
        <LandingPage key="landing" />
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          <DashboardPage />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Index;
