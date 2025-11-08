'use client';

import Link from 'next/link';
import { ChefHat, Sparkles, Clock, Award, ArrowRight, Star, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-slideUp">
              <Sparkles className="h-4 w-4" />
              Delivering Exceptional Flavors
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground animate-slideUp" style={{ animationDelay: '0.1s' }}>
              Savor Every{' '}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Moment
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-slideUp" style={{ animationDelay: '0.2s' }}>
              Experience culinary excellence with fresh ingredients, crafted by master chefs, delivered to your doorstep
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-slideUp" style={{ animationDelay: '0.3s' }}>
              <Link href="/menu">
                <Button size="xl" variant="gradient" shape="pill" className="group">
                  Explore Menu
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="xl" variant="outline" shape="pill" className="border-2 hover:bg-accent/10 hover:border-accent transition-all">
                  Our Story
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground mt-1">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">200+</div>
                <div className="text-sm text-muted-foreground mt-1">Menu Items</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">4.9★</div>
                <div className="text-sm text-muted-foreground mt-1">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Why Choose <span className="text-primary">Moringa</span>
            </h2>
            <p className="text-lg text-muted-foreground">Excellence in every detail</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: ChefHat,
                title: 'Master Chefs',
                description: 'Expertly crafted dishes by culinary professionals with years of experience',
                color: 'text-primary'
              },
              {
                icon: Clock,
                title: 'Fast Delivery',
                description: 'Hot, fresh meals delivered to your door in 30 minutes or less',
                color: 'text-accent'
              },
              {
                icon: Award,
                title: 'Premium Quality',
                description: 'Locally sourced ingredients and sustainable practices',
                color: 'text-primary'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative bg-card border border-border rounded-2xl p-8 hover:border-primary/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="absolute -top-4 left-8 w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary to-accent rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Ready to Experience Perfection?
              </h2>
              <p className="text-lg md:text-xl opacity-95 mb-8">
                Join thousands of satisfied customers and taste the difference
              </p>
              <Link href="/menu">
                <Button size="xl" shape="pill" className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                  Order Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
