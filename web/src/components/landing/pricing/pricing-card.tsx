"use client";
import React from 'react';
import { Check, Sparkles, Zap, Users, TrendingUp, Shield, Award, Rocket } from 'lucide-react';

const freemiumFeatures = [
  'AI Debate Simulation (3 sessions/day)',
  'Basic Logical Fallacy Detection',
  'Argument Strength Analysis',
  '5 Persona Types (Logical, Aggressive, Skeptical)',
  'Session History (last 5 debates)',
  'Basic Reputation Risk Check',
  'Community Forum Access',
  'Mobile App Access'
];

const premiumFeatures = [
  'Everything in Freemium, plus:',
  'Unlimited AI Debate Sessions',
  'Advanced Fallacy Detection (15+ types)',
  'Full Reputation Risk Analysis',
  'All 4 Persona Types + Custom',
  'Unlimited Session History',
  'Progress Analytics Dashboard',
  'AI-Powered Rewrite Suggestions',
  'Priority Support (24-hour response)',
  'Export Debate Reports (PDF)',
  'Custom Persona Creation',
  'Team Collaboration Features',
  'API Access for Developers'
];

interface PricingCardsProps {
  className?: string;
  compact?: boolean;
}

export const PricingCards: React.FC<PricingCardsProps> = ({ className = "", compact = false }) => {
  return (
    <div className={className}>
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch">
        {/* Freemium Card */}
        <div className="flex-1 bg-card text-card-foreground rounded-2xl border border-border overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
          <div className={compact ? "p-5 lg:p-6" : "p-6 lg:p-8"}>
            {/* Card Header */}
            <div className="mb-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-muted rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 lg:w-6 lg:h-6 text-muted-foreground" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold">Freemium</h2>
              </div>
              
              <div className="mb-5">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl lg:text-5xl font-bold">$0</span>
                  <span className="text-muted-foreground text-lg">/forever</span>
                </div>
                <p className="text-muted-foreground mt-2 text-sm lg:text-base">Perfect for testing and getting started with debate training</p>
              </div>

              <button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold py-3 lg:py-4 px-5 lg:px-6 rounded-xl transition-all duration-200 border border-border hover:border-primary/30">
                Get Started Free
              </button>

              <p className="text-center text-muted-foreground text-xs lg:text-sm mt-3">
                Free Forever
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-center gap-2 mb-4 lg:mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Features</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
              </div>
              
              {freemiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center mt-0.5 group-hover:bg-muted/80 transition-colors">
                    <Check className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <span className="text-sm lg:text-base leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Premium Card */}
        <div className="flex-1 bg-gradient-to-br from-primary/10 via-card to-card rounded-2xl border-2 border-primary/30 overflow-hidden relative hover:shadow-xl hover:border-primary/50 transition-all duration-300">
          {/* Popular Badge */}
          <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-xs font-bold px-4 lg:px-6 py-1.5 lg:py-2 rounded-bl-xl lg:rounded-bl-2xl flex items-center gap-1">
            <Award className="w-3 h-3" />
            MOST POPULAR
          </div>

          <div className={compact ? "p-5 lg:p-6" : "p-6 lg:p-8"}>
            {/* Card Header */}
            <div className="mb-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Rocket className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold">Premium</h2>
              </div>
              
              <div className="mb-5">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl lg:text-5xl font-bold">$15</span>
                  <span className="text-primary text-lg">/month</span>
                </div>
                <p className="text-primary/80 mt-2 text-sm lg:text-base">For serious debaters ready to sharpen their argument skills</p>
              </div>

              <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 lg:py-4 px-5 lg:px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                <Zap className="w-4 h-4 lg:w-5 lg:h-5" />
                Start Premium Trial
              </button>
              
              <p className="text-center text-muted-foreground text-xs lg:text-sm mt-3">
                14-day free trial • Cancel anytime
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-center gap-2 mb-4 lg:mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                <span className="text-xs text-primary/80 uppercase tracking-wider font-semibold">Everything Included</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
              </div>
              
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 group-hover:bg-primary/30 transition-colors">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className={`text-sm lg:text-base leading-relaxed ${index === 0 ? 'font-semibold' : ''}`}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* Value Highlight */}
            <div className="mt-6 lg:mt-8 p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Premium Value</span>
              </div>
              <p className="text-xs lg:text-sm text-muted-foreground">
                Includes 1 free coaching session worth $199 + unlimited access to all premium features
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-center text-muted-foreground">
        Not satisfied? Check our{' '}
        <a href="/refunds" className="text-primary hover:text-primary/80 underline underline-offset-2">
          Refunds Policy
        </a>
        {' '}for information on cancellations and refunds.
      </p>
    </div>
  );
};

interface PricingSectionProps {
  showHeader?: boolean;
  showBottom?: boolean;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ 
  showHeader = true, 
  showBottom = true 
}) => {
  return (
    <section id="pricing" className="w-full">
      {showHeader && (
        <div className="relative overflow-hidden py-12 lg:py-14">
          <div className="absolute inset-0 "></div>
          <div className="relative max-w-4xl mx-auto px-4 lg:px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Simple, Transparent Pricing</span>
            </div>
            
            <h1 className="text-2xl lg:text-4xl md:text-3xl font-bold mb-3">
              Pricing
            </h1>
            
            <p className="text-sm lg:text-base text-muted-foreground max-w-xl mx-auto">
              Choose the plan that fits your debate training needs. Start free, upgrade when you&apos;re ready.
            </p>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-4 lg:px-6 pb-10 lg:pb-14">
        <PricingCards />

        {showBottom && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-full px-3 py-1.5">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">
                All plans include SSL encryption
              </span>
            </div>
            
            <p className="mt-4 text-muted-foreground max-w-sm mx-auto text-sm">
              Need an enterprise solution? 
              <a href="/contact" className="text-primary hover:text-primary/80 ml-1 font-semibold underline underline-offset-4">
                Contact us
              </a>
            </p>
          </div>
        )}
      </div>

      {showBottom && (
        <div className="">
          <div className="max-w-6xl mx-auto px-4 lg:px-6 py-4 pb-12 ">
            <h3 className="text-xl lg:text-2xl font-bold text-center mb-8 lg:mb-12">
              Why Upgrade to Premium?
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              <div className="text-center p-5 lg:p-6 bg-card border border-border rounded-2xl hover:border-primary/30 transition-colors">
                <div className="w-10 lg:w-12 h-10 lg:h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-5 lg:w-6 h-5 lg:h-6 text-primary" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Advanced Fallacy Detection</h4>
                <p className="text-sm text-muted-foreground">
                  Identify 15+ types of logical fallacies including ad hominem, strawman, false dilemma, and slippery slope arguments
                </p>
              </div>
              
              <div className="text-center p-5 lg:p-6 bg-card border border-border rounded-2xl hover:border-primary/30 transition-colors">
                <div className="w-10 lg:w-12 h-10 lg:h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-5 lg:w-6 h-5 lg:h-6 text-primary" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Reputation Risk Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Evaluate how your arguments might be perceived publicly with toxicity and hate speech detection
                </p>
              </div>
              
              <div className="text-center p-5 lg:p-6 bg-card border border-border rounded-2xl hover:border-primary/30 transition-colors">
                <div className="w-10 lg:w-12 h-10 lg:h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Award className="w-5 lg:w-6 h-5 lg:h-6 text-primary" />
                </div>
                <h4 className="text-lg font-semibold mb-2">AI Rewrite Suggestions</h4>
                <p className="text-sm text-muted-foreground">
                  Get AI-powered suggestions to strengthen and clarify your arguments for maximum impact
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PricingSection;
