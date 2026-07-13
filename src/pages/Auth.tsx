import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, X, Mic, MicOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import logoBlue from '@/assets/logo-blue.png';
import logoHeaderBlue from '@/assets/logo-header-blue.png';
import { getAuthErrorMessage, getSuccessMessage } from '@/lib/authErrors';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';
import { AnimatePresence, motion } from 'framer-motion';
import ConnectionStatusIndicator from '@/components/ConnectionStatusIndicator';

type AuthView = 'login' | 'signup' | 'forgot-password' | 'email-sent';

// Define the field sequence for each form
const formFieldSequence: Record<string, string[]> = {
  login: ['email'],
  signup: ['firstName', 'lastName', 'email'],
  'forgot-password': ['email'],
};

export default function Auth() {
  const { user, signIn, signUp, signInWithGoogle, signInWithFacebook, signInWithApple, resetPassword, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const initialRef = searchParams.get('ref') || '';
  const [view, setView] = useState<AuthView>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [referralCode, setReferralCode] = useState(initialRef);
  const [referralValid, setReferralValid] = useState<boolean | null>(initialRef ? null : null);
  const [referralChecking, setReferralChecking] = useState(false);
  const [referrerName, setReferrerName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailValid, setEmailValid] = useState(false);
  // Voice input state - now form-level instead of field-level
  const [voiceModeActive, setVoiceModeActive] = useState(false);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  // Text-to-speech function
  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
      } else {
        resolve();
      }
    });
  }, []);

  // Get current field based on view and index
  const getCurrentField = useCallback(() => {
    const fields = formFieldSequence[view] || [];
    return fields[currentFieldIndex] || null;
  }, [view, currentFieldIndex]);

  // Get field prompt for voice guidance
  const getFieldPrompt = (field: string): string => {
    switch (field) {
      case 'email':
        return "Please say your email address. Say 'at' for @ and 'dot' for periods.";
      case 'firstName':
        return "Please say your first name.";
      case 'lastName':
        return "Please say your last name.";
      default:
        return "Please speak now.";
    }
  };

  // Format spoken text based on field type
  const formatSpokenText = (text: string, field: string): string => {
    const cleanText = text.toLowerCase().trim();

    if (field === 'email') {
      return cleanText
        .replace(/\s+at\s+/g, '@')
        .replace(/\s*at\s*/g, '@')
        .replace(/\s+dot\s+/g, '.')
        .replace(/\s*dot\s*/g, '.')
        .replace(/\s/g, '');
    }

    // Capitalize names
    if (field === 'firstName' || field === 'lastName') {
      return cleanText.charAt(0).toUpperCase() + cleanText.slice(1);
    }

    return cleanText;
  };

  // Set field value
  const setFieldValue = useCallback((field: string, value: string) => {
    switch (field) {
      case 'email':
        setEmail(value);
        break;
      case 'firstName':
        setFirstName(value);
        break;
      case 'lastName':
        setLastName(value);
        break;
    }
  }, []);

  // Move to next field or complete
  const moveToNextField = useCallback(async () => {
    const fields = formFieldSequence[view] || [];
    const nextIndex = currentFieldIndex + 1;

    if (nextIndex < fields.length) {
      setCurrentFieldIndex(nextIndex);
      const nextField = fields[nextIndex];
      await speak(getFieldPrompt(nextField));
      // Start listening for next field
      setTimeout(() => {
        if (recognitionRef.current && voiceModeActive) {
          setIsListening(true);
          recognitionRef.current.start();
        }
      }, 500);
    } else {
      // All fields complete
      await speak("Voice input complete. Please enter your password manually and submit the form.");
      setVoiceModeActive(false);
      setCurrentFieldIndex(0);
    }
  }, [view, currentFieldIndex, voiceModeActive, speak]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        const currentField = getCurrentField();

        if (currentField) {
          const formattedValue = formatSpokenText(transcript, currentField);
          setFieldValue(currentField, formattedValue);

          // Speak confirmation
          const fieldName = currentField === 'firstName' ? 'first name' :
            currentField === 'lastName' ? 'last name' : currentField;
          await speak(`Got it. Your ${fieldName} is ${formattedValue}.`);

          // Move to next field
          await moveToNextField();
        }

        setIsListening(false);
      };

      recognitionRef.current.onerror = async () => {
        setIsListening(false);
        await speak("Sorry, I couldn't understand that. Please try again.");

        // Retry listening if voice mode is still active
        setTimeout(() => {
          if (recognitionRef.current && voiceModeActive) {
            setIsListening(true);
            recognitionRef.current.start();
          }
        }, 500);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [getCurrentField, setFieldValue, moveToNextField, voiceModeActive, speak]);

  // Toggle voice mode for the entire form
  const toggleVoiceMode = async () => {
    if (!recognitionRef.current) {
      toast({
        title: 'Voice Not Supported',
        description: 'Voice recognition is not supported in your browser.',
        variant: 'destructive',
      });
      return;
    }

    if (voiceModeActive) {
      // Deactivate voice mode
      recognitionRef.current.abort();
      window.speechSynthesis.cancel();
      setVoiceModeActive(false);
      setIsListening(false);
      setCurrentFieldIndex(0);
      await speak("Voice mode deactivated.");
    } else {
      // Activate voice mode
      setVoiceModeActive(true);
      setCurrentFieldIndex(0);

      const fields = formFieldSequence[view] || [];
      if (fields.length > 0) {
        const firstField = fields[0];
        await speak(`Voice mode activated. ${getFieldPrompt(firstField)}`);

        // Start listening
        setTimeout(() => {
          if (recognitionRef.current) {
            setIsListening(true);
            recognitionRef.current.start();
          }
        }, 500);
      }
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          title: 'Unable to Sign In',
          description: getAuthErrorMessage(error),
          variant: 'destructive',
        });
      } else {
        const { title, description } = getSuccessMessage('login');
        toast({ title, description });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Unable to Sign In',
        description: 'Something went wrong. Please check your connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords Don\'t Match',
        description: 'Please make sure both passwords are identical.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Password Too Short',
        description: 'Your password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await signUp(
        email,
        password,
        confirmPassword,
        firstName,
        lastName,
        referralCode.trim() || undefined,
      );
      if (error) {
        toast({
          title: 'Unable to Create Account',
          description: getAuthErrorMessage(error),
          variant: 'destructive',
        });
      } else {
        const { title, description } = getSuccessMessage('signup');
        toast({ title, description });
        navigate('/welcome');
      }
    } catch (error) {
      toast({
        title: 'Unable to Create Account',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await resetPassword(email);
      if (error) {
        toast({
          title: 'Unable to Send Reset Link',
          description: getAuthErrorMessage(error),
          variant: 'destructive',
        });
      } else {
        setView('email-sent');
      }
    } catch (error) {
      toast({
        title: 'Unable to Send Reset Link',
        description: 'Something went wrong. Please check your email and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    setIsSubmitting(true);
    try {
      let result;
      switch (provider) {
        case 'google':
          result = await signInWithGoogle();
          break;
        case 'facebook':
          result = await signInWithFacebook();
          break;
        case 'apple':
          result = await signInWithApple();
          break;
      }
      if (result?.error) {
        const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
        toast({
          title: `Unable to Sign In with ${providerName}`,
          description: getAuthErrorMessage(result.error),
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Unable to Sign In',
        description: 'Could not connect to the authentication service. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setReferralCode('');
    setReferralValid(null);
    setReferrerName('');
    setEmailError('');
    setEmailValid(false);
    setVoiceModeActive(false);
    setCurrentFieldIndex(0);
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    // Auto-focus first field after view switch
    setTimeout(() => {
      const firstInput = document.querySelector<HTMLInputElement>('form input:first-of-type');
      firstInput?.focus();
    }, 100);
  };

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError('');
      setEmailValid(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
      setEmailValid(false);
    } else {
      setEmailError('');
      setEmailValid(true);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    validateEmail(value);
  };

  // Voice wave animation component
  const VoiceWaves = () => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full border-2 border-primary/40 animate-ping"
          style={{
            width: `${(i + 2) * 20}px`,
            height: `${(i + 2) * 20}px`,
            animationDelay: `${i * 0.3}s`,
            animationDuration: '2s',
          }}
        />
      ))}
      {/* Sound wave bars */}
      <div className="absolute flex items-center gap-1" style={{ top: '-30px' }}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-1 bg-primary rounded-full animate-bounce"
            style={{
              height: `${Math.random() * 16 + 8}px`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: '0.6s',
            }}
          />
        ))}
      </div>
    </div>
  );

  // Voice mode button component - one per form
  const VoiceModeButton = () => (
    <div className="relative">
      {voiceModeActive && isListening && <VoiceWaves />}
      <button
        type="button"
        onClick={toggleVoiceMode}
        className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${voiceModeActive
          ? 'bg-primary text-primary-foreground scale-110'
          : 'bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground'
          } ${isListening ? 'ring-4 ring-primary/30 ring-offset-2' : ''}`}
        title={voiceModeActive ? 'Deactivate voice mode' : 'Activate voice mode'}
      >
        {voiceModeActive ? (
          <MicOff className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </button>
    </div>
  );

  // Voice status indicator
  const VoiceStatusIndicator = () => {
    if (!voiceModeActive) return null;

    const currentField = getCurrentField();
    const fieldName = currentField === 'firstName' ? 'First Name' :
      currentField === 'lastName' ? 'Last Name' :
        currentField === 'email' ? 'Email' : '';

    return (
      <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
        <div className="flex items-center justify-center gap-2 text-primary">
          {isListening ? (
            <>
              <Mic className="w-5 h-5 animate-pulse" />
              <span className="text-sm font-medium">Listening for {fieldName}...</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
              <span className="text-sm font-medium">Voice mode active</span>
            </>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <img src={logoBlue} alt="SyncFloww" className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Social login buttons component
  const SocialButtons = () => (
    <div className="flex items-center justify-center gap-6 my-4">
      <button
        type="button"
        onClick={() => handleSocialLogin('facebook')}
        disabled={isSubmitting}
        className="w-14 h-14 rounded-full border-2 border-border flex items-center justify-center hover:bg-accent hover:scale-105 transition-all"
      >
        <svg className="w-7 h-7" fill="#1877F2" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => handleSocialLogin('apple')}
        disabled={isSubmitting}
        className="w-14 h-14 rounded-full border-2 border-border flex items-center justify-center hover:bg-accent hover:scale-105 transition-all"
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => handleSocialLogin('google')}
        disabled={isSubmitting}
        className="w-14 h-14 rounded-full border-2 border-border flex items-center justify-center hover:bg-accent hover:scale-105 transition-all"
      >
        <svg className="w-7 h-7" viewBox="0 0 24 24">
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        </svg>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Header with logo */}
      <div className="absolute top-6 left-6 z-20">
        <img src={logoHeaderBlue} alt="SyncFloww" className="h-8 md:h-10" />
      </div>

      {/* Hero content - hidden on mobile */}
      <div className="hidden lg:flex absolute left-8 top-1/2 -translate-y-1/2 max-w-md flex-col">
        <img src={logoBlue} alt="SyncFloww" className="w-20 h-20 mb-6" />
        <h1 className="text-4xl xl:text-5xl font-bold text-foreground mb-4 leading-tight">
          Revolutionize Your<br />
          Social Media Marketing<br />
          <span className="text-primary">with AI Agents</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Automate your marketing and boost your performance with AI-powered insights.
        </p>
      </div>

      {/* Modal Card */}
      <div className="min-h-screen flex items-center justify-center p-4 lg:justify-end lg:pr-20">
        <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md relative z-10 border border-border/50 backdrop-blur-sm">
          {/* Close button */}
          <button
            className="absolute right-4 top-4 w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors"
            onClick={() => navigate('/')}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-8">
            {/* Mobile logo */}
            <div className="flex justify-center mb-6 lg:hidden">
              <img src={logoBlue} alt="SyncFloww" className="w-16 h-16" />
            </div>



            {/* Login View */}
            {view === 'login' && (
              <>
                <h2 className="text-2xl font-bold text-center mb-6">Welcome Back!</h2>
                

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-sm text-muted-foreground">Email</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        className={`border-primary/30 focus:border-primary pr-8 ${voiceModeActive && currentFieldIndex === 0 ? 'ring-2 ring-primary' : ''} ${emailError ? 'border-destructive' : emailValid ? 'border-emerald-500' : ''}`}
                        placeholder="name@example.com"
                        required
                      />
                      <AnimatePresence>
                        {emailValid && (
                          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute right-3 top-1/2 -translate-y-1/2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <AnimatePresence>
                      {emailError && (
                        <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-destructive mt-1">{emailError}</motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="password" className="text-sm text-muted-foreground">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border-primary/30 focus:border-primary pr-10"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-5"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Logging in...' : 'Log in'}
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <SocialButtons />

                {(import.meta.env.VITE_DEMO_EMAIL || import.meta.env.DEV) && (
                  <button
                    type="button"
                    data-testid="use-demo-credentials"
                    onClick={() => {
                      const demoEmail = import.meta.env.VITE_DEMO_EMAIL || 'demo@syncfloww.com';
                      const demoPassword = import.meta.env.VITE_DEMO_PASSWORD || 'demo-password';
                      setEmail(demoEmail);
                      setPassword(demoPassword);
                      validateEmail(demoEmail);
                      toast({
                        title: 'Demo credentials filled',
                        description: 'Click Sign In to continue.',
                      });
                    }}
                    className="mt-4 w-full text-xs text-muted-foreground hover:text-primary underline-offset-4 hover:underline transition-colors"
                  >
                    Use demo credentials
                  </button>
                )}

                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rememberMe}
                      onCheckedChange={setRememberMe}
                      className="data-[state=checked]:bg-success"
                    />
                    <span className="text-sm text-muted-foreground">Remember me</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { resetForm(); setView('forgot-password'); }}
                    className="text-sm text-destructive font-medium hover:underline"
                  >
                    Forgotten Password?
                  </button>
                </div>

                <div className="mt-8 text-left">
                  <button
                    type="button"
                    onClick={() => { resetForm(); setView('signup'); }}
                    className="text-primary font-semibold hover:underline text-sm"
                  >
                    New User? Sign Up
                  </button>
                </div>

                <VoiceStatusIndicator />

                {/* Voice mode button at bottom */}
                <div className="flex justify-center mt-6">
                  <VoiceModeButton />
                </div>
              </>
            )}

            {/* Signup View */}
            {view === 'signup' && (
              <>
                <h2 className="text-2xl font-bold text-center mb-2">Create Account</h2>
                <p className="text-center text-muted-foreground mb-6 text-sm">Join SyncFloww and start creating</p>

                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="firstName" className="text-sm text-muted-foreground">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={`border-muted-foreground/30 ${voiceModeActive && currentFieldIndex === 0 ? 'ring-2 ring-primary' : ''}`}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="lastName" className="text-sm text-muted-foreground">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={`border-muted-foreground/30 ${voiceModeActive && currentFieldIndex === 1 ? 'ring-2 ring-primary' : ''}`}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="signup-email" className="text-sm text-muted-foreground">Email Address</Label>
                    <div className="relative">
                      <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        className={`border-muted-foreground/30 pr-8 ${voiceModeActive && currentFieldIndex === 2 ? 'ring-2 ring-primary' : ''} ${emailError ? 'border-destructive' : emailValid ? 'border-emerald-500' : ''}`}
                        placeholder="name@example.com"
                        required
                      />
                      <AnimatePresence>
                        {emailValid && (
                          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute right-3 top-1/2 -translate-y-1/2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          </motion.div>
                        )}
                        {emailError && (
                          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute right-3 top-1/2 -translate-y-1/2">
                            <AlertCircle className="w-4 h-4 text-destructive" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <AnimatePresence>
                      {emailError && (
                        <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-destructive mt-1">{emailError}</motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="signup-password" className="text-sm text-muted-foreground">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border-muted-foreground/30 pr-10"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <PasswordStrengthIndicator password={password} />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="confirm-password" className="text-sm text-muted-foreground">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`border-muted-foreground/30 pr-10 ${confirmPassword && password && confirmPassword === password ? 'border-emerald-500' : confirmPassword && password && confirmPassword !== password ? 'border-destructive' : ''}`}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <AnimatePresence>
                      {confirmPassword && password && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={`text-xs mt-1 flex items-center gap-1 ${confirmPassword === password ? 'text-emerald-500' : 'text-destructive'}`}
                        >
                          {confirmPassword === password ? (
                            <><CheckCircle2 className="w-3 h-3" /> Passwords match — you're all set!</>
                          ) : (
                            <><AlertCircle className="w-3 h-3" /> Passwords don't match yet</>
                          )}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Optional Referral Code */}
                  <div className="space-y-1">
                    <Label htmlFor="referral-code" className="text-sm text-muted-foreground">
                      Referral Code <span className="text-xs opacity-60">(optional)</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="referral-code"
                        type="text"
                        value={referralCode}
                        onChange={(e) => {
                          const val = e.target.value.trim().toUpperCase();
                          setReferralCode(val);
                          setReferralValid(null);
                          setReferrerName('');
                          if (val.length >= 3) {
                            setReferralChecking(true);
                            fetch(`/api/auth/referral/validate/?code=${val}`)
                              .then((r) => r.json())
                              .then((d) => {
                                setReferralValid(d.valid);
                                setReferrerName(d.referrer_name || '');
                              })
                              .catch(() => setReferralValid(false))
                              .finally(() => setReferralChecking(false));
                          }
                        }}
                        className={`border-muted-foreground/30 pr-8 uppercase tracking-widest ${
                          referralValid === true
                            ? 'border-emerald-500'
                            : referralValid === false
                            ? 'border-destructive'
                            : ''
                        }`}
                        placeholder="e.g. GRT7KQ92"
                        maxLength={16}
                      />
                      <AnimatePresence>
                        {referralChecking && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          </motion.div>
                        )}
                        {!referralChecking && referralValid === true && (
                          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute right-3 top-1/2 -translate-y-1/2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          </motion.div>
                        )}
                        {!referralChecking && referralValid === false && (
                          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute right-3 top-1/2 -translate-y-1/2">
                            <AlertCircle className="w-4 h-4 text-destructive" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <AnimatePresence>
                      {referralValid === true && referrerName && (
                        <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Referred by {referrerName} — nice!
                        </motion.p>
                      )}
                      {referralValid === false && (
                        <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-destructive mt-1">
                          That referral code doesn't exist
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-5"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating account...' : 'Create account'}
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <SocialButtons />

                <div className="mt-6 text-center">
                  <span className="text-muted-foreground text-sm">Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => { resetForm(); setView('login'); }}
                    className="text-primary font-medium hover:underline text-sm"
                  >
                    Log in
                  </button>
                </div>

                <VoiceStatusIndicator />

                {/* Voice mode button at bottom */}
                <div className="flex justify-center mt-6">
                  <VoiceModeButton />
                </div>
              </>
            )}

            {/* Forgot Password View */}
            {view === 'forgot-password' && (
              <>
                <h2 className="text-2xl font-bold text-center mb-2">Reset Password</h2>
                <p className="text-center text-muted-foreground mb-6 text-sm">
                  Enter your email and we'll send you a reset link
                </p>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="reset-email" className="text-sm text-muted-foreground">Email Address</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`border-primary/30 focus:border-primary ${voiceModeActive && currentFieldIndex === 0 ? 'ring-2 ring-primary' : ''}`}
                      placeholder="name@example.com"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-5"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => { resetForm(); setView('login'); }}
                    className="text-primary font-medium hover:underline text-sm"
                  >
                    Back to Login
                  </button>
                </div>

                <VoiceStatusIndicator />

                {/* Voice mode button at bottom */}
                <div className="flex justify-center mt-6">
                  <VoiceModeButton />
                </div>
              </>
            )}

            {/* Email Sent Confirmation */}
            {view === 'email-sent' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <img src={logoBlue} alt="SyncFloww" className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
                <p className="text-muted-foreground mb-6">
                  We've sent a confirmation link to<br />
                  <span className="text-foreground font-medium">{email}</span>
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Click the link in the email to complete your registration.
                </p>
                <Button
                  variant="outline"
                  onClick={() => { resetForm(); setView('login'); }}
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
