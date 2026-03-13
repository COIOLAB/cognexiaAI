import Link from 'next/link';
import { Brain, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">CognexiaAI</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Enterprise-Grade Industry 5.0 ERP Platform with CMMI Level 5 Certification
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:sales@cognexiaai.com" className="hover:text-blue-600">
                  sales@cognexiaai.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href="tel:+919167422630" className="hover:text-blue-600">
                  +91-9167422630
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>Mumbai, India</span>
              </div>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-blue-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-blue-600 transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-600 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/partners" className="hover:text-blue-600 transition-colors">
                  Partners
                </Link>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Products</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/products" className="hover:text-blue-600 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-blue-600 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/documentation" className="hover:text-blue-600 transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/enterprise" className="hover:text-blue-600 transition-colors">
                  Enterprise Solutions
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/support" className="hover:text-blue-600 transition-colors">
                  Support Center
                </Link>
              </li>
              <li>
                <Link href="/trust-center" className="hover:text-blue-600 transition-colors">
                  Trust Center
                </Link>
              </li>
              <li>
                <Link href="/system-status" className="hover:text-blue-600 transition-colors">
                  System Status
                </Link>
              </li>
              <li>
                <Link href="/sla" className="hover:text-blue-600 transition-colors">
                  Service Level Agreement
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-blue-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-blue-600 transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-blue-600 transition-colors">
                  Security & Compliance
                </Link>
              </li>
              <li>
                <Link href="/dpa" className="hover:text-blue-600 transition-colors">
                  Data Processing Agreement
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="hover:text-blue-600 transition-colors">
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground text-center md:text-left">
                &copy; 2026 CognexiaAI. All rights reserved. CMMI Level 5 Certified | ISO 27001 | SOC 2 Type II
              </p>
              {/* Subtle Super Admin Access - Hidden in plain sight */}
              <Link 
                href="/admin-access" 
                className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400 transition-colors"
                title="Authorized Personnel Only"
              >
                •
              </Link>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
                99.9% Uptime
              </span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                24/7 Support
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
