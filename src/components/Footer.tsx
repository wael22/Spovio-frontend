import { Video, Instagram, Youtube } from "lucide-react";
import { useTranslation } from "react-i18next";

const socialLinks = [
  { icon: Instagram, href: "https://www.instagram.com/spovio_/", label: "Instagram" },
  { icon: Youtube, href: "https://www.youtube.com/@Spovio-w9j", label: "YouTube" },
];

export function Footer() {
  const { t } = useTranslation();

  const footerLinks = {
    product: [
      { label: t('nav.features'), href: "/ai-features" },
      { label: t('footer.links.pricing'), href: "/#pricing" },
      { label: t('footer.links.forClubs'), href: "/contact?type=club" },
    ],
    company: [
      { label: t('nav.about'), href: "/about" },
    ],
    support: [
      { label: t('nav.contact'), href: "/contact" },
      { label: t('footer.links.community'), href: "/community" },
    ],
    legal: [
      { label: t('footer.links.privacy'), href: "/privacy" },
      { label: t('footer.links.terms'), href: "/terms" },
      { label: t('footer.links.cookies'), href: "/cookies" },
    ],
  };

  return (
    <footer id="contact" className="bg-secondary/30 border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Video className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">
                <span className="gradient-text">Spovio</span>
              </span>
            </a>
            <p className="text-muted-foreground text-sm mb-4 max-w-xs">
              {t("footer.description")}
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all duration-300"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.links.product')}</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t('footer.links.company')}</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t('footer.links.support')}</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t('footer.links.legal')}</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("footer.madeWith")}
          </p>
        </div>
      </div>
    </footer>
  );
}
