export const SITE_CONTACT = {
  whatsappNumber: "916387456172",
  phoneDisplay: "+91 63874 56172",
  phoneHref: "tel:+916387456172",
  whatsappHref: "https://wa.me/916387456172",
  email: "katiyarnursery@gmail.com",
  emailHref: "mailto:katiyarnursery@gmail.com",
  instagramHref:
    "https://www.instagram.com/katiyardragonfruitnursery?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
  facebookHref:
    "https://www.facebook.com/people/Katiyar-Nursery/100089996597437/?sk=about",
  locationLabel: "Kanpur, Uttar Pradesh",
} as const;

const ORDER_WHATSAPP_NUMBER = "918112929020";

export function createWhatsAppOrderUrl(message: string) {
  return `https://wa.me/${ORDER_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
