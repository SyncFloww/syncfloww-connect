import { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface Requirement {
  label: string;
  met: boolean;
}

const getStrength = (password: string): { score: number; label: string; color: string; requirements: Requirement[] } => {
  const requirements: Requirement[] = [
    { label: 'At least 6 characters', met: password.length >= 6 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains a number', met: /[0-9]/.test(password) },
    { label: 'Contains special character', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = requirements.filter((r) => r.met).length;

  if (score <= 1) return { score, label: 'Weak', color: 'bg-destructive', requirements };
  if (score <= 2) return { score, label: 'Fair', color: 'bg-orange-500', requirements };
  if (score <= 3) return { score, label: 'Good', color: 'bg-yellow-500', requirements };
  if (score <= 4) return { score, label: 'Strong', color: 'bg-emerald-500', requirements };
  return { score, label: 'Very Strong', color: 'bg-emerald-600', requirements };
};

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const { score, label, color, requirements } = useMemo(() => getStrength(password), [password]);

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-2"
    >
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i <= score ? color : 'bg-muted'
              }`}
            />
          ))}
        </div>
        <span className={`text-xs font-medium ${score <= 1 ? 'text-destructive' : score <= 3 ? 'text-yellow-600' : 'text-emerald-600'}`}>
          {label}
        </span>
      </div>

      {/* Requirements checklist */}
      <AnimatePresence>
        <div className="space-y-1">
          {requirements.map((req) => (
            <motion.div
              key={req.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1.5"
            >
              {req.met ? (
                <Check className="w-3 h-3 text-emerald-500" />
              ) : (
                <X className="w-3 h-3 text-muted-foreground/50" />
              )}
              <span className={`text-xs ${req.met ? 'text-emerald-600' : 'text-muted-foreground/60'}`}>
                {req.label}
              </span>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </motion.div>
  );
}
