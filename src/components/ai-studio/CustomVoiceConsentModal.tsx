import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ShieldCheck } from 'lucide-react';
import { aiStudioApi } from '@/services/aiStudioService';

interface CustomVoiceConsentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConsentSuccess?: () => void;
}

export const CustomVoiceConsentModal: React.FC<CustomVoiceConsentModalProps> = ({
  open,
  onOpenChange,
  onConsentSuccess,
}) => {
  const [signatureName, setSignatureName] = useState('');
  const [voiceName, setVoiceName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!signatureName || !agreed || !voiceName) return;
    setLoading(true);
    try {
      // Create custom voice profile
      await aiStudioApi.recordVoiceConsent({
        signature_name: signatureName,
        statement: `I, ${signatureName}, explicitly grant permission to Syncfloww AI Studio to process and synthesize my voice for profile '${voiceName}'.`,
      });
      if (onConsentSuccess) onConsentSuccess();
      onOpenChange(false);
    } catch (e) {
      console.error('Voice consent error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShieldCheck className="w-5 h-5 text-indigo-500" /> Explicit Custom Voice Consent
          </DialogTitle>
          <DialogDescription>
            To prevent unauthorized voice cloning, Syncfloww requires explicit consent verification before enabling custom voice synthesis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Custom Voice Profile Name</Label>
            <Input
              placeholder="e.g. My Personal Brand Voice"
              value={voiceName}
              onChange={(e) => setVoiceName(e.target.value)}
            />
          </div>

          <div className="p-3 bg-muted/50 rounded-lg border text-xs text-muted-foreground leading-relaxed">
            "I explicitly verify that I am the rightful owner of this voice recording and I grant Syncfloww AI Studio permission to generate synthetic audio models for my workspace content creation."
          </div>

          <div className="space-y-2">
            <Label>Full Legal Signature Name</Label>
            <Input
              placeholder="Type your full name as signature"
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
            />
          </div>

          <div className="flex items-start space-x-2 pt-2">
            <Checkbox id="consent-check" checked={agreed} onCheckedChange={(c) => setAgreed(!!c)} />
            <label htmlFor="consent-check" className="text-xs text-muted-foreground leading-snug cursor-pointer">
              I acknowledge and agree to the voice safety guidelines and confirm this consent record will be logged with my workspace ID.
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!agreed || !signatureName || !voiceName || loading} className="bg-indigo-600 hover:bg-indigo-700">
            Verify & Save Voice Consent
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
