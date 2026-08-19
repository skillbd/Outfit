import React, { useState } from 'react';
import { ArrowRight, Mail, Phone, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onNavigateCategory: (category: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateCategory, onOpenAdmin }) => {
  const { branding } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-[#111111] text-gray-400 pt-16 pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-800">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <BrandLogo dark size="lg" />
            </div>
            
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-sm font-light">
              {branding.websiteDescription ||
                'Outfit delivers timeless high-fashion tailoring, sculptural silhouettes, and refined luxury essentials.'}
            </p>
            
            <div className="pt-2 flex flex-col space-y-2 text-xs text-gray-400">
              {branding.contactEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#FACC15]" />
                  <a href={`mailto:${branding.contactEmail}`} className="hover:text-white transition-colors">
                    {branding.contactEmail}
                  </a>
                </div>
              )}
              {branding.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#FACC15]" />
                  <a href={`tel:${branding.contactPhone}`} className="hover:text-white transition-colors">
                    {branding.contactPhone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-xs font-bold tracking-widest text-white uppercase mb-4">
              Catalog
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <button
                  onClick={() => onNavigateCategory('All')}
                  className="hover:text-[#FACC15] transition-colors cursor-pointer"
                >
                  All Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory('Apparel')}
                  className="hover:text-[#FACC15] transition-colors cursor-pointer"
                >
                  Apparel & Tailoring
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory('Accessories')}
                  className="hover:text-[#FACC15] transition-colors cursor-pointer"
                >
                  Leather & Accessories
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory('Footwear')}
                  className="hover:text-[#FACC15] transition-colors cursor-pointer"
                >
                  Footwear
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory('Living')}
                  className="hover:text-[#FACC15] transition-colors cursor-pointer"
                >
                  Studio & Living
                </button>
              </li>
            </ul>
          </div>

          {/* Concierge / Customer Care */}
          <div>
            <h4 className="text-xs font-bold tracking-widest text-white uppercase mb-4">
              Concierge
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>Complimentary White-Glove Care</li>
              <li>Doorstep Inspection & Exchange</li>
              <li>Master Tailoring Standards</li>
              <li>Bespoke Sizing Consultation</li>
              <li>Priority Client Inquiries</li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div>
            <h4 className="text-xs font-bold tracking-widest text-white uppercase mb-4">
              Private Release
            </h4>
            <p className="text-xs text-gray-400 mb-3 leading-relaxed">
              Receive private preview invitations and seasonal lookbooks.
            </p>
            {subscribed ? (
              <div className="bg-gray-900 border border-gray-800 p-3 rounded-xl text-xs text-[#FACC15] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FACC15] shrink-0" />
                <span>You are on the private lookbook list.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="space-y-2">
                <div className="flex bg-black/60 border border-gray-800 rounded-xl overflow-hidden focus-within:border-[#FACC15] transition-colors">
                  <input
                    type="email"
                    required
                    placeholder="Enter email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-transparent text-white placeholder-gray-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 bg-[#FACC15] text-[#111111] hover:bg-[#EAB308] transition-colors flex items-center justify-center cursor-pointer font-bold"
                    aria-label="Subscribe"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[10px] text-gray-500 block">Confidential & curated. Unsubscribe anytime.</span>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar with Server Status & Hidden Mahfuz Entry */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FACC15] animate-pulse"></span>
            <span>Outfit Atelier • Verified Luxury Standards</span>
          </div>
          <p>© {new Date().getFullYear()} Outfit. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-gray-400 cursor-pointer">Privacy</span>
            <span className="hover:text-gray-400 cursor-pointer">Terms</span>
            {/* Hidden Mahfuz Admin Entry */}
            <button
              id="footer-hidden-admin-entry-btn"
              onClick={onOpenAdmin}
              className="text-gray-600 hover:text-gray-400 text-xs transition-colors cursor-pointer focus:outline-none select-none"
              title="Admin Portal Entry"
            >
              Mahfuz
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
