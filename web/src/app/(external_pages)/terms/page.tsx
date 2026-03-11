import NavbarComponent from "@/components/navbar/navbar";
import FooterSection from "@/components/footer/footer";
import Glow from "@/components/ui/glow";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: `Terms of Service ✦ ${siteConfig.name}`,
  description: "Read the Terms of Service to understand the rules and guidelines for using LogicShield.",
};

export default async function Terms() {
  return (
    <>
      <main className="min-h-screen w-full overflow-hidden ">
        <NavbarComponent />

        <section className="mx-auto max-w-4xl px-12 py-24 pt-32 md:pt-32 sm:gap-48">
          <h1 className="text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-10">Last Updated: October 2025</p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <p>
              Welcome to <strong>{siteConfig.name}</strong> (“the Service”).
              By accessing or using our web application, you agree to the following Terms of Service.
              Please read them carefully.
            </p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By using the Service, you agree to be bound by these Terms.
              If you do not agree, please do not use the Service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              LogicShield is an AI-powered debate training and communication risk analysis platform.
              Features include:
            </p>
            <ul>
              <li>AI Debate Simulation with adversarial opponents and selectable personas</li>
              <li>Automatic Logical Fallacy Detection using transformer-based ML models</li>
              <li>Argument Strength Scoring and analysis</li>
              <li>Reputation Risk Estimation with toxicity and hate speech detection</li>
              <li>Progress Analytics Dashboard</li>
              <li>AI-powered rewrite suggestions</li>
            </ul>
            <p>This Service is intended for educational and training purposes only.</p>

            <h2>3. User Responsibilities</h2>
            <ul>
              <li>You agree to provide accurate information when creating an account.</li>
              <li>You agree not to misuse the Service or attempt to interfere with its functionality.</li>
              <li>You are responsible for your own arguments and communications based on the analysis provided.</li>
              <li>You agree not to use the Service for malicious or harmful purposes.</li>
            </ul>

            <h2>4. Intellectual Property</h2>
            <p>
              All content, branding, and materials provided by the Service are the property of the creators.
              You may not copy, modify, or redistribute them without prior permission.
            </p>

            <h2>5. Disclaimer</h2>
            <ul>
              <li>
                The Service provides <strong>analysis and recommendations only</strong> and does not guarantee that arguments will be free of fallacies or safe for all audiences.
              </li>
              <li>LogicShield provides probabilistic analysis based on NLP models. It does not guarantee real-world outcomes or predict future controversy with certainty.</li>
              <li>We make no warranties regarding accuracy, reliability, or availability.</li>
              <li>Use of the Service is at your own risk.</li>
            </ul>

            <h2>6. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, we are not liable for any direct, indirect, or incidental damages
              arising from use of the Service.
            </p>

            <h2>7. Privacy</h2>
            <p>
              We respect your privacy. Basic user data may be collected for personalization.
              No personal information will be sold or misused.
              See our <a href="/privacy" className="text-primary underline">Privacy Policy</a> for more details.
            </p>

            <h2>8. Changes to Terms</h2>
            <p>
              We may update these Terms at any time.
              Changes will be effective immediately upon posting.
              Continued use of the Service constitutes acceptance of the updated Terms.
            </p>

            <h2>9. Governing Law</h2>
            <p>
              These Terms shall be governed by and interpreted under the laws of India.
            </p>

            <h2>10. Contact</h2>
            <p>
              If you have any questions about these Terms, contact us at:{" "}
              <a href={siteConfig.links.email} className="text-primary underline">
                {siteConfig.links.email.replace('mailto:', '')}
              </a>
            </p>
          </div>
        </section>



        <FooterSection />
      </main>
    </>
  );
}
