import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import confetti from 'canvas-confetti';

export default function CompletionStep({ onboarding }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <Card className="border-2 border-green-500">
      <CardContent className="text-center py-12">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
        
        <h2 className="text-3xl font-bold text-slate-900 mb-3">
          🎉 Congratulations!
        </h2>
        <p className="text-lg text-slate-600 mb-6">
          Your partner account is now fully set up and ready to go
        </p>

        <div className="max-w-md mx-auto mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <h3 className="font-semibold mb-3 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            What's Next?
          </h3>
          <ul className="text-left space-y-2 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Submit your first lead through the portal</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Track referral progress in real-time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Access analytics and performance insights</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Earn commissions on successful enrollments</span>
            </li>
          </ul>
        </div>

        <Button
          size="lg"
          onClick={() => navigate(createPageUrl('PartnerPortal'))}
          className="bg-education-blue hover:bg-blue-700"
        >
          Go to Partner Portal
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>

        <p className="text-sm text-slate-500 mt-4">
          Need help? Contact our support team anytime
        </p>
      </CardContent>
    </Card>
  );
}