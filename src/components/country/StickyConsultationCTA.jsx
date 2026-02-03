import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Phone, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function StickyConsultationCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 800 && !isDismissed) {
        setIsVisible(true);
      } else if (window.scrollY <= 800) {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  return (
    <AnimatePresence>
      {isVisible && !isDismissed && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl shadow-2xl p-4 pr-12 relative">
            <button
              onClick={() => setIsDismissed(true)}
              className="absolute top-2 right-2 text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-lg">Need Help?</p>
                <p className="text-sm text-orange-100">Talk to our experts</p>
              </div>
            </div>

            <Link to={createPageUrl('Contact')}>
              <Button 
                size="lg" 
                className="w-full mt-4 bg-white text-orange-600 hover:bg-orange-50 shadow-lg"
              >
                <Phone className="w-5 h-5 mr-2" />
                Book Free Consultation
              </Button>
            </Link>

            <p className="text-xs text-center text-orange-100 mt-2">
              ⚡ Response within 1 hour
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}