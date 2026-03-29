"use client";
import React from 'react';
import Link from 'next/link';
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
  const p = compact ? "p-4 lg:p-5" : "p-6 lg:p-8";
  const mb = compact ? "mb-4" : "mb-5";
  const gap = compact ? "gap-4" : "gap-6 lg:gap-8";
  const featureGap = compact ? "space-y-2" : "space-y-3 lg:space-y-4";
  const featureIcon = compact ? "w-4 h-4" : "w-5 h-5";
  const featureText = compact ? "text-xs" : "text-sm lg:text-base";
  const badge = compact ? "text-[10px] px-2 py-1" : "text-xs px-4 lg:px-6 py-1.5 lg:py-2";
  const iconSize = compact ? "w-8 h-8" : "w-10 h-10 lg:w-12 lg:h-12";
  const iconInner = compact ? "w-4 h-4" : "w-5 h-5 lg:w-6 lg:h-6";
  const priceSize = compact ? "text-3xl lg:text-4xl" : "text-4xl lg:text-5xl";
  const valueHighlight = compact ? "mt-4 p-3" : "mt-6 lg:mt-8 p-4";
  
  return (
    <div className={className}>
      <div className={`flex flex-col lg:flex-row ${gap} items-stretch`}>
        {/* Freemium Card */}
        <div className="flex-1 bg-card text-card-foreground rounded-2xl border border-border overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
          <div className={p}>
            {/* Card Header */}
            <div className={mb}>
              <div className={`flex items-center gap-2 mb-3`}>
                <div className={`${iconSize} bg-muted rounded-lg flex items-center justify-center`}>
                  <Users className={`${iconInner} text-muted-foreground`} />
                </div>
                <h2 className="text-xl lg:text-2xl font-bold">Freemium</h2>
              </div>
              
              <div className={mb}>
                <div className="flex items-baseline gap-2">
                  <span className={`${priceSize} font-bold`}>$0</span>
                  <span className="text-muted-foreground text-sm">/forever</span>
                </div>
                <p className="text-muted-foreground mt-1 text-xs lg:text-sm">Perfect for testing and getting started</p>
              </div>

              <Link href="/auth" className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold py-2.5 lg:py-3 px-4 rounded-lg transition-all duration-200 border border-border hover:border-primary/30 text-sm flex items-center justify-center">
                Get Started Free
              </Link>

              <p className="text-center text-muted-foreground text-[10px] lg:text-xs mt-2">
                Try It Out • Free Forever
              </p>
            </div>

            {/* Features List */}
            <div className={featureGap}>
              <div className="flex items-center gap-2 mb-2 lg:mb-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Features</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
              </div>
              
              {freemiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-2 group">
                  <div className={`${featureIcon} rounded-full bg-muted flex items-center justify-center mt-0.5 group-hover:bg-muted/80 transition-colors`}>
                    <Check className="w-2.5 h-2.5 text-muted-foreground" />
                  </div>
                  <span className={`${featureText} leading-tight`}>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Premium Card */}
        <div className="flex-1 bg-gradient-to-br from-primary/10 via-card to-card rounded-2xl border-2 border-primary/30 overflow-hidden relative hover:shadow-xl hover:border-primary/50 transition-all duration-300">
          {/* Popular Badge */}
          <div className={`absolute top-0 right-0 bg-gradient-to-r from-primary to-primary/50 text-primary-950 font-bold ${badge} rounded-bl-xl lg:rounded-bl-2xl flex items-center gap-1 px-8`}>
            <Award className="w-3 h-3" />
            MOST POPULAR
          </div>

          <div className={p}>
            {/* Card Header */}
            <div className={mb}>
              <div className={`flex items-center gap-2 mb-3`}>
                <div className={`${iconSize} bg-primary/20 rounded-lg flex items-center justify-center`}>
                  <Rocket className={`${iconInner} text-primary`} />
                </div>
                <h2 className="text-xl lg:text-2xl font-bold">Premium</h2>
              </div>
              
              <div className={mb}>
                <div className="flex items-baseline gap-2">
                  <span className={`${priceSize} font-bold`}>$15</span>
                  <span className="text-primary text-sm">/month</span>
                </div>
                <p className="text-primary/80 mt-1 text-xs lg:text-sm">For serious debaters ready to sharpen skills</p>
              </div>

              <Link href="/auth" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 lg:py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm">
                <Zap className="w-4 h-4" />
                Start Premium Trial
              </Link>
              
              <p className="text-center text-muted-foreground text-[10px] lg:text-xs mt-2">
                14-day Free Trial • Cancel Anytime
              </p>
            </div>

            {/* Features List */}
            <div className={featureGap}>
              <div className="flex items-center gap-2 mb-2 lg:mb-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                <span className="text-[10px] text-primary/80 uppercase tracking-wider font-semibold">Everything Included</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
              </div>
              
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-2 group">
                  <div className={`${featureIcon} rounded-full bg-primary/20 flex items-center justify-center mt-0.5 group-hover:bg-primary/30 transition-colors`}>
                    <Check className="w-2.5 h-2.5 text-primary" />
                  </div>
                  <span className={`${featureText} leading-tight ${index === 0 ? 'font-semibold' : ''}`}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* Value Highlight */}
            <div className={`${valueHighlight} bg-primary/5 border border-primary/20 rounded-lg`}>
              <div className="flex items-center gap-2 mb-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">Premium Value</span>
              </div>
              <p className="text-[10px] lg:text-xs text-muted-foreground">
                Includes 1 free coaching session worth $199
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
  compact?: boolean;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ 
  showHeader = true, 
  showBottom = true,
  compact = false
}) => {
  return (
    <section id="pricing" className="w-full px-4">
      {showHeader && (
        <div className="relative overflow-hidden py-8 lg:py-10">
          <div className="absolute inset-0 "></div>
          <div className="relative max-w-4xl mx-auto px-4 lg:px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Simple, Transparent Pricing</span>
            </div>
            
            <h1 className="text-2xl lg:text-3xl md:text-3xl font-bold mb-2">
              Pricing
            </h1>
            
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Choose the plan that fits your debate training needs. Start free, upgrade when you&apos;re ready.
            </p>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-4 lg:px-6 pb-8 lg:pb-10">
        <PricingCards compact={compact} />

        {showBottom && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-full px-3 py-1.5">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">
                All plans include SSL encryption
              </span>
            </div>
            
            <p className="mt-3 text-muted-foreground max-w-sm mx-auto text-sm">
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
          <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6 pb-8 ">
            <h3 className="text-lg lg:text-xl font-bold text-center mb-6 lg:mb-8">
              Why Upgrade to Premium?
            </h3>
            
            <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
              <div className="text-center p-4 lg:p-5 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors">
                <div className="w-9 lg:w-10 h-9 lg:h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-4 lg:w-5 h-4 lg:h-5 text-primary" />
                </div>
                <h4 className="text-base font-semibold mb-1.5">Advanced Fallacy Detection</h4>
                <p className="text-xs text-muted-foreground">
                  Identify 15+ types of logical fallacies including ad hominem, strawman, false dilemma, and slippery slope arguments
                </p>
              </div>
              
              <div className="text-center p-4 lg:p-5 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors">
                <div className="w-9 lg:w-10 h-9 lg:h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-4 lg:w-5 h-4 lg:h-5 text-primary" />
                </div>
                <h4 className="text-base font-semibold mb-1.5">Reputation Risk Analysis</h4>
                <p className="text-xs text-muted-foreground">
                  Evaluate how your arguments might be perceived publicly with toxicity and hate speech detection
                </p>
              </div>
              
              <div className="text-center p-4 lg:p-5 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors">
                <div className="w-9 lg:w-10 h-9 lg:h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Award className="w-4 lg:w-5 h-4 lg:h-5 text-primary" />
                </div>
                <h4 className="text-base font-semibold mb-1.5">AI Rewrite Suggestions</h4>
                <p className="text-xs text-muted-foreground">
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
