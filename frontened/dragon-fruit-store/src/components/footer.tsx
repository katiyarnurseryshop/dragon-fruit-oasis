import { Link } from "wouter";
import {
  Instagram,
  Facebook,
  MessageCircle,
  Mail,
  Phone,
} from "lucide-react";
import { SITE_CONTACT } from "@/lib/site-contact";

export function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white pt-20 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img
                src="/logo.png"
                alt="Katiyar Nursery"
                className="w-14 h-14 rounded-full shadow-lg shadow-primary/30 object-cover"
              />
              <div>
                <span className="font-heading font-bold text-2xl tracking-tight text-white block">
                  Katiyar Nursery
                </span>
                <span className="text-zinc-400 text-sm">
                  {SITE_CONTACT.locationLabel}
                </span>
              </div>
            </div>
            <p className="text-zinc-400 max-w-sm mb-8 leading-relaxed text-lg">
              Premium organic dragon fruit plants and nursery selections grown
              with care and shared directly from Katiyar Nursery.
            </p>
            <div className="flex gap-4">
              <a
                href={SITE_CONTACT.instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-zinc-800/80 flex items-center justify-center hover:bg-primary transition-colors text-white hover:scale-105"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={SITE_CONTACT.facebookHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-zinc-800/80 flex items-center justify-center hover:bg-primary transition-colors text-white hover:scale-105"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href={SITE_CONTACT.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-zinc-800/80 flex items-center justify-center hover:bg-secondary transition-colors text-white hover:scale-105"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-xl mb-6 text-white">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-4 text-zinc-400">
              <li>
                <a
                  href="#home"
                  className="hover:text-primary transition-colors inline-block"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="hover:text-primary transition-colors inline-block"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#products"
                  className="hover:text-primary transition-colors inline-block"
                >
                  Shop Fruits
                </a>
              </li>
              <li>
                <a
                  href="#gallery"
                  className="hover:text-primary transition-colors inline-block"
                >
                  Farm Gallery
                </a>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="hover:text-primary transition-colors inline-block"
                >
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-xl mb-6 text-white">
              Contact Info
            </h4>
            <ul className="flex flex-col gap-4 text-zinc-400">
              <li className="flex flex-col">
                <span className="text-zinc-500 text-sm mb-1">
                  Call / WhatsApp
                </span>
                <a
                  href={SITE_CONTACT.phoneHref}
                  className="text-white inline-flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {SITE_CONTACT.phoneDisplay}
                </a>
              </li>
              <li className="flex flex-col">
                <span className="text-zinc-500 text-sm mb-1">Email</span>
                <a
                  href={SITE_CONTACT.emailHref}
                  className="text-white inline-flex items-center gap-2 hover:text-primary transition-colors break-all"
                >
                  <Mail className="w-4 h-4" />
                  {SITE_CONTACT.email}
                </a>
              </li>
              <li className="flex flex-col">
                <span className="text-zinc-500 text-sm mb-1">Social Profiles</span>
                <a
                  href={SITE_CONTACT.instagramHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-primary transition-colors"
                >
                  Instagram
                </a>
                <a
                  href={SITE_CONTACT.facebookHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-primary transition-colors"
                >
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row items-center justify-between text-zinc-500 text-sm">
          <p>
            © {new Date().getFullYear()} Katiyar Nursery,{" "}
            {SITE_CONTACT.locationLabel}. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
