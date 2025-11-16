"use client";

import Link from "next/link";
import {
  Link2,
  Sparkles,
  Share2,
  Bot,
  BarChart3,
  Plug,
  Users,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="bg-background-dark font-body text-[#D4D4D4] antialiased">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        <Navbar variant="landing" />

        <main className="flex flex-1 flex-col items-center px-6 py-16 sm:py-20">
          <div className="w-full max-w-[1400px]">
            <section className="flex flex-col-reverse items-center gap-12 lg:gap-16 py-10 text-center lg:flex-row lg:text-left">
              <div className="flex flex-col gap-6 lg:w-[45%]">
                <h1 className="text-4xl font-heading font-black leading-tight tracking-tighter sm:text-5xl md:text-6xl text-white">
                  Transform Your Data Into Compelling Stories with AI
                </h1>
                <p className="text-base font-body font-normal leading-normal text-[#D4D4D4] md:text-lg">
                  Our platform automates insights and generates beautiful, interactive reports, helping you communicate your data&apos;s true potential effortlessly.
                </p>
                <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
                  <Link
                    href="/auth/register"
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-background-dark text-base font-heading font-bold leading-normal tracking-[0.015em] hover:bg-opacity-80 transition-opacity"
                  >
                    <span className="truncate">Get Started Free</span>
                  </Link>
                  <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-secondary/20 border border-secondary text-white text-base font-heading font-bold leading-normal tracking-[0.015em] hover:bg-secondary/30 transition-opacity">
                    <span className="truncate">Watch Demo</span>
                  </button>
                </div>
              </div>
              <div className="lg:w-[55%]">
                <div
                  className="aspect-video w-full rounded-xl bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDlZr5I5DzhyoaPZ6gddeoqgo8oxDeLNuowO09eSI1Zolbk7WfZIzNO0BMehVNK1IzzL40BPLcelhwaO0ZfTFjxOVr85zkONNY5x0FfZ4U9EC0EFcKa1OkkwoF0z83YCxFHbL-F3pVPLi7cwadtg5mYJeyKZR8dsTW9-fdkHoDJdX-mJHkbCGxNvuxaMQ4fhWvcJjbJeHp_cA4S0AN3hyxFU32RFjZC3r8a9EyB8P60PRkXzA8ubrB9EDCH3nxEZsXEX5WWYWsgyLCx')",
                  }}
                  aria-label="Glowing, intricate neural network visualization above a digital cityscape."
                />
              </div>
            </section>

            <section className="py-16 sm:py-24">
              <h2 className="text-white text-3xl font-heading font-bold leading-tight tracking-[-0.015em] text-center mb-10">
                How It Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col gap-4 rounded-xl border border-secondary/50 bg-[#0A0A0A] p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Link2 className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-white text-xl font-heading font-bold leading-tight">
                      1. Connect Your Data
                    </h3>
                    <p className="text-[#A0A0A0] text-base font-body font-normal leading-normal">
                      Securely link your data sources in just a few clicks. Our platform supports a wide range of integrations.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-4 rounded-xl border border-secondary/50 bg-[#0A0A0A] p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-white text-xl font-heading font-bold leading-tight">
                      2. AI Generates Insights
                    </h3>
                    <p className="text-[#A0A0A0] text-base font-body font-normal leading-normal">
                      Our advanced AI analyzes your data to uncover hidden patterns and generate actionable narratives automatically.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-4 rounded-xl border border-secondary/50 bg-[#0A0A0A] p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-white text-xl font-heading font-bold leading-tight">
                      3. Share Your Story
                    </h3>
                    <p className="text-[#A0A0A0] text-base font-body font-normal leading-normal">
                      Customize and share your interactive data stories with stakeholders through a simple, shareable link.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section id="features" className="py-16 sm:py-24">
              <div className="flex flex-col gap-4 mb-10 mx-auto max-w-4xl text-center">
                <h2 className="text-white text-4xl font-heading font-black leading-tight tracking-[-0.033em]">
                  Everything you need to tell your data story
                </h2>
                <p className="text-[#D4D4D4] text-lg font-body font-normal leading-normal">
                  From automated analysis to collaborative workspaces, our platform is equipped with all the tools necessary to bring your data to life.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="flex flex-col gap-3 rounded-xl border border-secondary/50 bg-[#0A0A0A] p-6">
                  <Bot className="w-8 h-8 text-primary" />
                  <div className="flex flex-col gap-1">
                    <h3 className="text-white text-lg font-heading font-bold leading-tight">
                      AI-Powered Narrative
                    </h3>
                    <p className="text-[#A0A0A0] text-base font-body font-normal leading-normal">
                      Automatically generate clear and concise text summaries that explain your data&apos;s key takeaways.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 rounded-xl border border-secondary/50 bg-[#0A0A0A] p-6">
                  <BarChart3 className="w-8 h-8 text-primary" />
                  <div className="flex flex-col gap-1">
                    <h3 className="text-white text-lg font-heading font-bold leading-tight">
                      Interactive Dashboards
                    </h3>
                    <p className="text-[#A0A0A0] text-base font-body font-normal leading-normal">
                      Build and customize dynamic dashboards that allow users to explore the data for themselves.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 rounded-xl border border-secondary/50 bg-[#0A0A0A] p-6">
                  <Plug className="w-8 h-8 text-primary" />
                  <div className="flex flex-col gap-1">
                    <h3 className="text-white text-lg font-heading font-bold leading-tight">
                      Seamless Integration
                    </h3>
                    <p className="text-[#A0A0A0] text-base font-body font-normal leading-normal">
                      Connect effortlessly with the tools you already use, from databases to spreadsheets and more.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 rounded-xl border border-secondary/50 bg-[#0A0A0A] p-6">
                  <Users className="w-8 h-8 text-primary" />
                  <div className="flex flex-col gap-1">
                    <h3 className="text-white text-lg font-heading font-bold leading-tight">
                      Collaborative Workspace
                    </h3>
                    <p className="text-[#A0A0A0] text-base font-body font-normal leading-normal">
                      Work with your team in real-time to create, edit, and share data stories together.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section id="pricing" className="py-16 sm:py-24">
              <div className="text-center mb-10">
                <h2 className="text-4xl font-heading font-black text-white">Flexible Pricing</h2>
                <p className="text-lg font-body text-[#D4D4D4] mt-2">
                  Choose the plan that&apos;s right for you.
                </p>
              </div>
              <div className="mb-10 flex items-center justify-center gap-4">
                <span className="font-body font-medium">Monthly</span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input className="peer sr-only" type="checkbox" />
                  <div className="h-6 w-11 rounded-full bg-secondary/50 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-white after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-background-dark" />
                </label>
                <span className="font-body font-medium">
                  Annually <span className="text-primary">(Save 20%)</span>
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col rounded-xl border border-secondary/50 bg-[#0A0A0A] p-8">
                  <h3 className="text-xl font-heading font-bold text-white">Free</h3>
                  <p className="text-4xl font-heading font-black text-white my-4">
                    $0 <span className="text-base font-body font-normal text-[#A0A0A0]">/ month</span>
                  </p>
                  <p className="text-[#A0A0A0] mb-6">
                    For individuals starting out with data storytelling.
                  </p>
                  <ul className="space-y-3 text-[#D4D4D4] flex-grow">
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />1 User
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />2 Data Sources
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />Basic Dashboards
                    </li>
                  </ul>
                  <Link
                    href="/auth/register"
                    className="w-full mt-8 rounded-lg h-12 px-5 bg-secondary/20 border border-secondary text-white text-base font-heading font-bold hover:bg-secondary/30 transition-opacity flex items-center justify-center"
                  >
                    Get Started
                  </Link>
                </div>
                <div className="relative flex flex-col rounded-xl border-2 border-primary bg-[#0A0A0A] p-8">
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-heading font-bold text-background-dark">
                    MOST POPULAR
                  </span>
                  <h3 className="text-xl font-heading font-bold text-white">Pro</h3>
                  <p className="text-4xl font-heading font-black text-white my-4">
                    $49 <span className="text-base font-body font-normal text-[#A0A0A0]">/ month</span>
                  </p>
                  <p className="text-[#A0A0A0] mb-6">
                    For professionals and small teams who need more power.
                  </p>
                  <ul className="space-y-3 text-[#D4D4D4] flex-grow">
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />Up to 5 Users
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />20 Data Sources
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />Advanced Dashboards
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />AI Narrative Generation
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />Collaboration Tools
                    </li>
                  </ul>
                  <Link
                    href="/auth/register"
                    className="w-full mt-8 rounded-lg h-12 px-5 bg-primary text-background-dark text-base font-heading font-bold hover:bg-opacity-80 transition-opacity flex items-center justify-center"
                  >
                    Choose Pro
                  </Link>
                </div>
                <div className="flex flex-col rounded-xl border border-secondary/50 bg-[#0A0A0A] p-8">
                  <h3 className="text-xl font-heading font-bold text-white">Enterprise</h3>
                  <p className="text-4xl font-heading font-black text-white my-4">Custom</p>
                  <p className="text-[#A0A0A0] mb-6">
                    For large organizations with custom needs.
                  </p>
                  <ul className="space-y-3 text-[#D4D4D4] flex-grow">
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />Unlimited Users
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />Unlimited Data Sources
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />Dedicated Support
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />SSO &amp; Advanced Security
                    </li>
                  </ul>
                  <Link
                    href="/auth/register"
                    className="w-full mt-8 rounded-lg h-12 px-5 bg-secondary/20 border border-secondary text-white text-base font-heading font-bold hover:bg-secondary/30 transition-opacity flex items-center justify-center"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </section>

            <section id="testimonials" className="py-16 sm:py-24">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-heading font-black text-white">What Our Users Say</h2>
                <p className="text-lg font-body text-[#D4D4D4] mt-2">
                  Hear from the people who love using DataStory AI.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <div className="flex flex-col rounded-xl border border-secondary/50 bg-[#0A0A0A] p-6">
                  <p className="text-[#D4D4D4] italic flex-grow font-body">
                    "DataStory AI has completely changed how we present our findings. What used to take days of manual work now takes minutes. The AI narratives are spot on!"
                  </p>
                  <div className="flex items-center mt-6">
                    <img
                      className="h-12 w-12 rounded-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2po7D5wbgOHoaO4tPR9vgPlXkXSLa5LcYU9VDe3iWaDxyZWGi1TuAwiv8UPK7-IfLl6qSj6_0buplGc4Nj4MgVbBLIFjaG_RXKeU1kVISdal2JgeL9fmm5YJT2_HT_N1RC8RkpdAMGi3SFyXpiCAD--tS2lPDZ1PMictrBN4nmcPo_kKixhbrjaCZAqNK3z0g77DBIIAT90riobCWlZIkySsz3xIMPX22yRN01efJk7kif8-AYRcjwn8PWUP386FQ-gIG2AYNYdGo"
                      alt="User avatar for Sarah J."
                    />
                    <div className="ml-4">
                      <p className="font-heading font-bold text-white">Sarah J.</p>
                      <p className="text-sm font-body text-[#A0A0A0]">Data Analyst, TechCorp</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col rounded-xl border border-secondary/50 bg-[#0A0A0A] p-6">
                  <p className="text-[#D4D4D4] italic flex-grow font-body">
                    "The interactive dashboards are a game-changer for client presentations. It&apos;s so much more engaging than static slides. Our stakeholders are more involved than ever."
                  </p>
                  <div className="flex items-center mt-6">
                    <img
                      className="h-12 w-12 rounded-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0SF9D_lR1fFbX3NwkrXZsd1FlzSFTdouSOLq1XVrBLXXScETOuQTDZAHVwVoY5BZasOwm1MPOIFwPHo_FPpHx3t_15biLKmL9uP80MwqhP6RKWkUeHdN2_6hm9lfEaqd4oavFaHGHxWwZFQj8U8Gxh9eZfWc4diro718Y2bK2nO3-M0kGLp0kiej23iQ5IhC3hreAqXeygFyy_-EI4WTmEw8g0hmsMhj0kxmLuaVUmiWle4aNQquy0PsxpVU9ZRwPeoKYtJwoyxTb"
                      alt="User avatar for Michael B."
                    />
                    <div className="ml-4">
                      <p className="font-heading font-bold text-white">Michael B.</p>
                      <p className="text-sm font-body text-[#A0A0A0]">Marketing Manager, Innovate Ltd.</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col rounded-xl border border-secondary/50 bg-[#0A0A0A] p-6">
                  <p className="text-[#D4D4D4] italic flex-grow font-body">
                    "As a non-technical founder, I can finally understand our data without needing a translator. The platform makes complex information accessible and beautiful."
                  </p>
                  <div className="flex items-center mt-6">
                    <img
                      className="h-12 w-12 rounded-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmqzdKs8id4FPZ4SMZkUZpJ5I4CXiMvax_lCJlhrbvw3wGWBdGJGcp-C6SOu5qA0sAmXGSt8s557gD-lKwvDn3pRQ3JF2xoz-kbSFy3zZ7VyE4y7fA7ajuIOEauTKE2ua7_libILu8OikmmQa89z-LCx61PU9fOvfGPhcC3aGu-v1x3qMahFjq_sAQ8N-SCflOMGG-7C7A9l1Qkmv5iTWwoNaovDECo-ouzS-1uONxgZLmFlYaXb0KJnQkfwvF_yKQ7sUHZu05UzwR"
                      alt="User avatar for Emily C."
                    />
                    <div className="ml-4">
                      <p className="font-heading font-bold text-white">Emily C.</p>
                      <p className="text-sm font-body text-[#A0A0A0]">CEO, Startup Solutions</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="faq" className="py-16 sm:py-24 mx-auto max-w-5xl">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-heading font-black text-white">Frequently Asked Questions</h2>
              </div>
              <div className="space-y-5">
                <details className="group rounded-lg bg-[#0A0A0A] p-6 [&_summary::-webkit-details-marker]:hidden border border-secondary/50">
                  <summary className="flex cursor-pointer items-center justify-between text-white font-heading font-medium">
                    How secure is my data?
                    <ChevronDown className="ml-4 h-5 w-5 flex-shrink-0 text-primary transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <p className="mt-4 text-[#A0A0A0] font-body">
                    We take data security very seriously. We use industry-standard encryption for data at rest and in transit, and our platform is compliant with major security standards like SOC 2 and GDPR.
                  </p>
                </details>
                <details className="group rounded-lg bg-[#0A0A0A] p-6 [&_summary::-webkit-details-marker]:hidden border border-secondary/50">
                  <summary className="flex cursor-pointer items-center justify-between text-white font-heading font-medium">
                    What data sources can I connect?
                    <ChevronDown className="ml-4 h-5 w-5 flex-shrink-0 text-primary transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <p className="mt-4 text-[#A0A0A0] font-body">
                    DataStory AI supports a wide range of integrations, including SQL databases (PostgreSQL, MySQL), data warehouses (Snowflake, BigQuery), spreadsheets (Google Sheets, Excel), and popular business applications like Salesforce and Google Analytics.
                  </p>
                </details>
                <details className="group rounded-lg bg-[#0A0A0A] p-6 [&_summary::-webkit-details-marker]:hidden border border-secondary/50">
                  <summary className="flex cursor-pointer items-center justify-between text-white font-heading font-medium">
                    Can I cancel my subscription at any time?
                    <ChevronDown className="ml-4 h-5 w-5 flex-shrink-0 text-primary transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <p className="mt-4 text-[#A0A0A0] font-body">
                    Yes, you can cancel your subscription at any time from your account settings. If you cancel, you will retain access to your paid features until the end of your current billing cycle.
                  </p>
                </details>
                <details className="group rounded-lg bg-[#0A0A0A] p-6 [&_summary::-webkit-details-marker]:hidden border border-secondary/50">
                  <summary className="flex cursor-pointer items-center justify-between text-white font-heading font-medium">
                    How does the AI narrative generation work?
                    <ChevronDown className="ml-4 h-5 w-5 flex-shrink-0 text-primary transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <p className="mt-4 text-[#A0A0A0] font-body">
                    Our proprietary AI models analyze your datasets to identify key trends, outliers, correlations, and other significant insights. It then translates these statistical findings into clear, human-readable text, providing a summary of your data&apos;s story automatically.
                  </p>
                </details>
              </div>
            </section>

            <section className="py-16 sm:py-24 text-center">
              <h2 className="text-4xl font-heading font-black text-white">
                Ready to unlock your data&apos;s potential?
              </h2>
              <p className="mt-4 mb-8 mx-auto max-w-3xl text-lg font-body text-[#D4D4D4]">
                Stop staring at spreadsheets. Start telling stories. Sign up for free and see how DataStory AI can transform your data communication.
              </p>
              <Link
                href="/auth/register"
                className="flex min-w-[84px] mx-auto cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-background-dark text-lg font-heading font-bold leading-normal tracking-[0.015em] hover:bg-opacity-80 transition-opacity"
              >
                <span className="truncate">Sign Up Free</span>
              </Link>
            </section>
          </div>
        </main>

        <footer className="bg-[#0A0A0A] text-[#A0A0A0] py-16">
          <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="mb-4">
                <img
                  src="https://res.cloudinary.com/df2oollzg/image/upload/v1763258462/Untitled-2025-09-29-1243-Photoroom_zrs60z.png"
                  alt="DataStory AI"
                  className="h-14 w-auto"
                />
              </div>
              <p className="text-sm font-body">
                Making data accessible and insightful for everyone.
              </p>
            </div>
            <div>
              <h4 className="font-heading font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 font-body">
                <li>
                  <a className="hover:text-primary transition-colors" href="#features">
                    Features
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#pricing">
                    Pricing
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#features">
                    Integrations
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Changelog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 font-body">
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    About Us
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Careers
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Contact
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 font-body">
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

        </footer>
      </div>
    </div>
  );
}
