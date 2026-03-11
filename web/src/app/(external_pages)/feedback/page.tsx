import NavbarComponent from "@/components/navbar/navbar";
import FooterSection from "@/components/footer/footer";
import Glow from "@/components/ui/glow";
import { siteConfig } from "@/config/site";
import FeedbackForm from "./feedback-form";

export const metadata = {
  title: `Feedback ✦ ${siteConfig.name}`,
  description: "Share your quick feedback about LogicShield - the AI-powered debate training platform.",
};

export default async function Feedback() {
  return (
    <>

      <main className="min-h-screen w-full overflow-hidden bg-background text-foreground">
        <NavbarComponent />

        <section className="relative mx-auto max-w-2xl px-4 pt-40 pb-16">
          
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Quick Feedback</h1>
            <p className="text-muted-foreground">
              Got a quick thought? Let us know what you think about LogicShield.
            </p>
          </div>

          <FeedbackForm />

          <p className="text-center text-sm text-muted-foreground mt-6">
            For detailed inquiries,{' '}
            <a href="/contact" className="text-primary hover:underline">
              contact us
            </a>
          </p>
        </section>

        <FooterSection />
      </main>
    </>
  );
}
