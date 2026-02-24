import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Building2,
  User,
  MessageSquare,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { useTranslation } from "react-i18next";

const ContactPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    type: "player",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactInfo = [
    {
      icon: Mail,
      label: t('pages.contact.info.email'),
      value: "contact@spovio.net",
      href: "mailto:contact@spovio.net",
    },
    {
      icon: Phone,
      label: t('pages.contact.info.phone'),
      value: "+216 50 988 787",
      href: "tel:+21650988787",
    },
    {
      icon: MapPin,
      label: t('pages.contact.info.address'),
      value: "Sousse, Tunisie",
      href: "#",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post('/support/contact', formData);

      toast({
        title: t('pages.contact.form.success'),
        description: t('pages.contact.form.messageSentDesc'),
      });

      setFormData({
        name: "",
        email: "",
        company: "",
        type: "player",
        message: "",
      });
    } catch (error: any) {
      toast({
        title: t('modals.common.error'),
        description: error.message || t('pages.contact.form.error'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/15 rounded-full blur-[150px]"
          />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {t('pages.contact.title')} <span className="text-gradient"></span>
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('pages.contact.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="pb-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="p-8 rounded-2xl bg-card border border-border">
                <h2 className="font-display text-2xl font-bold mb-6">
                  {t('pages.contact.form.title')}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Type Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, type: "player" })
                      }
                      className={`p-4 rounded-xl border transition-all flex items-center gap-3 ${formData.type === "player"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-muted-foreground"
                        }`}
                    >
                      <User
                        className={`w-5 h-5 ${formData.type === "player"
                          ? "text-primary"
                          : "text-muted-foreground"
                          }`}
                      />
                      <span
                        className={
                          formData.type === "player"
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        {t('pages.contact.form.type.player')}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: "club" })}
                      className={`p-4 rounded-xl border transition-all flex items-center gap-3 ${formData.type === "club"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-muted-foreground"
                        }`}
                    >
                      <Building2
                        className={`w-5 h-5 ${formData.type === "club"
                          ? "text-primary"
                          : "text-muted-foreground"
                          }`}
                      />
                      <span
                        className={
                          formData.type === "club"
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        {t('pages.contact.form.type.club')}
                      </span>
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('pages.contact.form.name')}
                      </label>
                      <Input
                        placeholder={t('pages.contact.form.namePlaceholder')}
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('pages.contact.form.email')}
                      </label>
                      <Input
                        type="email"
                        placeholder={t('pages.contact.form.emailPlaceholder')}
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  {formData.type === "club" && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('pages.contact.form.company')}
                      </label>
                      <Input
                        placeholder={t('pages.contact.form.companyPlaceholder')}
                        value={formData.company}
                        onChange={(e) =>
                          setFormData({ ...formData, company: e.target.value })
                        }
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('pages.contact.form.message')}
                    </label>
                    <Textarea
                      placeholder={t('pages.contact.form.messagePlaceholder')}
                      rows={5}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      t('pages.contact.form.sending')
                    ) : (
                      <>
                        {t('pages.contact.form.submit')}
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div>
                <h2 className="font-display text-2xl font-bold mb-6">
                  {t('pages.contact.info.title')}
                </h2>
                <div className="space-y-4">
                  {contactInfo.map((info, index) => (
                    <a
                      key={index}
                      href={info.href}
                      className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <info.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          {info.label}
                        </div>
                        <div className="font-medium">{info.value}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Demo Request */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                <MessageSquare className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-display text-xl font-bold mb-2">
                  {t('pages.contact.info.demo.title')}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {t('pages.contact.info.demo.description')}
                </p>
                <Button variant="hero">
                  {t('pages.contact.info.demo.cta')}
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* FAQ Link */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h3 className="font-display text-lg font-bold mb-2">
                  {t('pages.contact.info.faq.title')}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t('pages.contact.info.faq.description')}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;
