import NavbarComponent from "@/components/navbar/navbar";
import FooterSection from "@/components/footer/footer";
import Glow from "@/components/ui/glow";
import { siteConfig } from "@/config/site";
import { MessageSquare, Mail, Clock, Send } from "lucide-react";

export const metadata = {
  title: `Contact Us ✦ ${siteConfig.name}`,
  description: "Get in touch with the LogicShield team for support, inquiries, or feedback on our debate training platform.",
};


export default async function Contact() {
  return (
    <>

      <main className="min-h-screen w-full overflow-hidden bg-background text-foreground">
        <NavbarComponent />

        <section className="relative mx-auto max-w-5xl px-4 pt-40 pb-16">
          
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Contact Us</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              We'd love to hear from you. Reach out with questions, feedback, or collaboration opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold">Email Us</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  For general inquiries, suggestions, or support
                </p>
                <a
                  href={siteConfig.links.email}
                  className="text-primary text-sm font-medium hover:underline"
                >
                  {siteConfig.links.email.replace('mailto:', '')}
                </a>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold">Response Time</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  We typically respond within 24-48 hours on business days.
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold">Quick Feedback</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Have a quick thought?
                </p>
                <a
                  href="/feedback"
                  className="text-primary text-sm font-medium hover:underline"
                >
                  Leave quick feedback →
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <form className="bg-card border border-border rounded-xl p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" htmlFor="name">
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" htmlFor="subject">
                    Subject
                  </label>
                  <input
                    id="subject"
                    type="text"
                    placeholder="What's this about?"
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" htmlFor="message">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    placeholder="Write your message..."
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary px-5 py-3 text-primary-foreground font-medium shadow hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>

        <FooterSection />
      </main>
    </>
  );
}
