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

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "contact@spovio.net",
    href: "mailto:contact@spovio.net",
  },
  {
    icon: Phone,
    label: "Téléphone",
    value: "+216 50 988 787",
    href: "tel:+21650988787",
  },
  {
    icon: MapPin,
    label: "Adresse",
    value: "Sousse, Tunisie",
    href: "#",
  },
];

const ContactPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    type: "player",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/support/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }

      toast({
        title: "Message envoyé !",
        description: "Nous vous répondrons dans les plus brefs délais. Un email de confirmation vous a été envoyé.",
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
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
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
              Nous <span className="text-gradient">Contacter</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Vous avez des questions ? Vous souhaitez une démo pour votre club ? Nous serions ravis de vous entendre.
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
                  Envoyez-nous un message
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
                        Joueur
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
                        Club
                      </span>
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Nom
                      </label>
                      <Input
                        placeholder="Votre nom"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email
                      </label>
                      <Input
                        type="email"
                        placeholder="vous@exemple.com"
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
                        Club / Organisation
                      </label>
                      <Input
                        placeholder="Nom de votre club"
                        value={formData.company}
                        onChange={(e) =>
                          setFormData({ ...formData, company: e.target.value })
                        }
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Message
                    </label>
                    <Textarea
                      placeholder="Dites-nous comment nous pouvons vous aider..."
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
                      "Envoi en cours..."
                    ) : (
                      <>
                        Envoyer le message
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
                  Informations de contact
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
                  Demander une démo
                </h3>
                <p className="text-muted-foreground mb-4">
                  Intéressé par Spovio pour votre club ? Laissez-nous vous montrer comment notre plateforme peut transformer votre expérience sportive.
                </p>
                <Button variant="hero">
                  Planifier une démo
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* FAQ Link */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h3 className="font-display text-lg font-bold mb-2">
                  Vous cherchez des réponses ?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Consultez notre section FAQ pour des réponses rapides aux questions fréquentes sur Spovio.
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
