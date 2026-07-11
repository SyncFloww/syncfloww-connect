import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Send } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import SocialMediaConnectDialog from '@/components/SocialMediaConnectDialog';

type WelcomeStep = 'greeting' | 'brand-form';

export default function Welcome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<WelcomeStep>('greeting');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSocialConnect, setShowSocialConnect] = useState(false);
  const [createdBrandName, setCreatedBrandName] = useState('');

  // Brand form state
  const [brandName, setBrandName] = useState('');
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [hasPermission, setHasPermission] = useState(true);

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleCreateBrand = async () => {
    if (!brandName.trim()) {
      toast({ title: 'Brand name required', description: 'Please enter a name for your brand.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/api/social/brands/', {
        name: brandName,
        industry,
        description,
      });

      toast({ title: 'Brand created!', description: `${brandName} has been set up successfully.` });
      setCreatedBrandName(brandName);
      setShowSocialConnect(true);
    } catch (error: any) {
      toast({
        title: 'Could not create brand',
        description: error.response?.data?.detail || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Simple header */}
      <header className="border-b bg-background px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/Icon.png" alt="SyncFloww" className="w-8 h-8" />
          <span className="font-bold text-lg text-foreground">SyncFloww</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user?.email}</span>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {step === 'greeting' && (
            <motion.div
              key="greeting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-lg"
            >
              <Card className="border-0 shadow-xl bg-background">
                <CardContent className="p-8 md:p-12 text-center space-y-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto"
                  >
                    <Sparkles className="w-8 h-8 text-primary" />
                  </motion.div>

                  <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                      {getGreeting()} {firstName}
                    </h1>
                    <p className="text-muted-foreground text-base">
                      To proceed, kindly create the button below to create a brand.
                    </p>
                    <p className="text-muted-foreground/70 text-sm">
                      You can create multiple brands.
                    </p>
                  </div>

                  <Button
                    size="lg"
                    className="w-full h-14 text-lg rounded-full bg-[hsl(200,80%,55%)] hover:bg-[hsl(200,80%,45%)] text-white shadow-lg"
                    onClick={() => setStep('brand-form')}
                  >
                    Create Brand
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  <button
                    onClick={handleSkip}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
                  >
                    Skip for now
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 'brand-form' && (
            <motion.div
              key="brand-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-2xl"
            >
              <Card className="border-0 shadow-xl bg-background">
                <CardContent className="p-8 md:p-12 space-y-8">
                  <div className="text-center space-y-1">
                    <h1 className="text-3xl font-bold text-foreground">
                      Hi, {firstName}
                    </h1>
                    <p className="text-muted-foreground">Let's get started!</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-foreground font-medium text-sm">
                      Provide answers to the following questions to help us setup your brand:
                    </p>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>What name will you give to this brand?</li>
                      <li>What industry best describe your brand? E.g. Clothing, Public Figure etc.</li>
                      <li>Kindly describe what your brand is about?</li>
                      <li>Confirm if you have permission to manage this brand?</li>
                    </ol>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="brandName">Brand Name *</Label>
                      <Input
                        id="brandName"
                        placeholder="e.g. Evergreen School"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        autoFocus
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        placeholder="e.g. Clothing, Education, Public Figure"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Brand Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe what your brand is about..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="permission"
                        checked={hasPermission}
                        onChange={(e) => setHasPermission(e.target.checked)}
                        className="w-4 h-4 rounded border-border text-primary"
                      />
                      <Label htmlFor="permission" className="text-sm font-normal cursor-pointer">
                        I confirm I have permission to manage this brand
                      </Label>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setStep('greeting')}
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1 bg-primary hover:bg-primary/90"
                      onClick={handleCreateBrand}
                      disabled={isSubmitting || !brandName.trim() || !hasPermission}
                    >
                      {isSubmitting ? 'Creating...' : 'Create Brand'}
                      <Send className="w-4 h-4 ml-2" />
                    </Button>
                  </div>

                  <button
                    onClick={handleSkip}
                    className="block mx-auto text-sm text-muted-foreground hover:text-foreground transition-colors underline"
                  >
                    Skip for now
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <SocialMediaConnectDialog
        open={showSocialConnect}
        onOpenChange={(open) => {
          setShowSocialConnect(open);
          if (!open) navigate('/dashboard');
        }}
        brandName={createdBrandName}
      />
    </div>
  );
}
