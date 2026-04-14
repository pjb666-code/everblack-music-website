import ScrollReveal from "@/components/ScrollReveal";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useContactInfo } from "@/hooks/useQueries";
import { Mail, MapPin } from "lucide-react";

export default function Contact() {
  const { data: contactInfo, isLoading } = useContactInfo();

  if (isLoading) {
    return (
      <section id="contact" className="section-default py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <Skeleton className="h-10 w-48 mx-auto mb-4 rounded-md" />
          <Skeleton className="h-0.5 w-20 mx-auto mb-12 rounded-full" />
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Skeleton className="h-44 rounded-lg" />
            <Skeleton className="h-44 rounded-lg" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="section-default py-24 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal direction="up" duration={600}>
            <div className="text-center mb-14">
              <h2 className="text-display text-foreground mb-4">Kontakt</h2>
              <p className="text-body text-muted-foreground text-lg max-w-xl mx-auto mb-6">
                Bereit, deine musikalische Reise zu beginnen? Meld dich einfach
                bei mir.
              </p>
              <div className="w-20 h-0.5 bg-gradient-to-r from-primary to-accent mx-auto" />
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Email card */}
            <ScrollReveal direction="left" duration={550} delay={50}>
              <Card
                className="card-hover text-center group hover:border-primary/40 hover:shadow-medium"
                data-ocid="contact-email-card"
              >
                <CardHeader className="pb-3">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Mail className="w-6 h-6" />
                  </div>
                  <p className="text-subheading text-foreground font-semibold">
                    E-Mail
                  </p>
                </CardHeader>
                <CardContent>
                  {contactInfo?.email ? (
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="text-muted-foreground hover:text-primary transition-colors break-all text-sm"
                      data-ocid="contact-email-link"
                    >
                      {contactInfo.email}
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      info@everblackmusic.com
                    </span>
                  )}
                </CardContent>
              </Card>
            </ScrollReveal>

            {/* Address card */}
            <ScrollReveal direction="right" duration={550} delay={50}>
              <Card
                className="card-hover text-center group hover:border-primary/40 hover:shadow-medium"
                data-ocid="contact-address-card"
              >
                <CardHeader className="pb-3">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <p className="text-subheading text-foreground font-semibold">
                    Adresse
                  </p>
                </CardHeader>
                <CardContent>
                  <p
                    className="text-muted-foreground text-sm whitespace-pre-line"
                    data-ocid="contact-address-text"
                  >
                    {contactInfo?.address || "Bergische Gasse 9\n52064 Aachen"}
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
