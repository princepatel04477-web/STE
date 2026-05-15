import Image from 'next/image';
import { Instagram, Facebook, Twitter, Linkedin, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#050505] pt-20 pb-8 px-6 border-t border-expo-border/30 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">

          {/* Brand Col */}
          <div className="col-span-1 md:col-span-1 flex flex-col items-start">
            <Image src="/assets/STE LOGO.jpg" alt="STE Logo" width={100} height={50} className="object-contain mb-6 opacity-90" />
            <p className="text-sm text-expo-warm/50 font-sans mb-6">
              The official digital identity of India&apos;s largest textile sourcing ecosystem. A hyper-premium B2B exhibition.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-expo-border/50 flex items-center justify-center hover:border-expo-gold hover:text-expo-gold transition-colors duration-300">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-expo-border/50 flex items-center justify-center hover:border-expo-gold hover:text-expo-gold transition-colors duration-300">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-expo-border/50 flex items-center justify-center hover:border-expo-gold hover:text-expo-gold transition-colors duration-300">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-expo-border/50 flex items-center justify-center hover:border-expo-gold hover:text-expo-gold transition-colors duration-300">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 flex flex-col">
            <h4 className="font-display text-lg tracking-widest text-expo-warm mb-6">QUICK LINKS</h4>
            <nav className="flex flex-col gap-3 text-sm text-expo-warm/60">
              <a href="#about" className="hover:text-expo-gold transition-colors duration-300 w-max relative group">
                About Exhibition
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-expo-gold transition-all duration-300 group-hover:w-full" />
              </a>
              <a href="#categories" className="hover:text-expo-gold transition-colors duration-300 w-max relative group">
                Textile Categories
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-expo-gold transition-all duration-300 group-hover:w-full" />
              </a>
              <a href="#benefits" className="hover:text-expo-gold transition-colors duration-300 w-max relative group">
                Why Exhibit
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-expo-gold transition-all duration-300 group-hover:w-full" />
              </a>
              <a href="#contact" className="hover:text-expo-gold transition-colors duration-300 w-max relative group">
                Book a Stall
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-expo-gold transition-all duration-300 group-hover:w-full" />
              </a>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="col-span-1 md:col-span-2 flex flex-col">
             <h4 className="font-display text-lg tracking-widest text-expo-warm mb-6">CONTACT US</h4>
             <div className="flex flex-col gap-4 text-sm text-expo-warm/60 font-sans">
               <div className="flex items-start gap-3">
                 <MapPin className="w-5 h-5 text-expo-gold shrink-0 mt-0.5" />
                 <span>SIECC Sarsana Dome,<br/>Surat, Gujarat, India</span>
               </div>
               <div className="flex items-center gap-3">
                 <Phone className="w-5 h-5 text-expo-gold shrink-0" />
                 <span className="text-lg font-display tracking-wider text-expo-warm">9950787787</span>
               </div>
               <div className="flex items-center gap-3">
                 <Mail className="w-5 h-5 text-expo-gold shrink-0" />
                 <span>info@suratexpo.com</span>
               </div>
             </div>
          </div>

        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-expo-border to-transparent mb-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between text-xs text-expo-warm/40 font-sans tracking-wide">
          <p>© {new Date().getFullYear()} Surat Textile Exhibition. All Rights Reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-expo-warm transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-expo-warm transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
