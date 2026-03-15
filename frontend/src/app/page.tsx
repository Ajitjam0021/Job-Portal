"use client";

import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion';
import Button from '@/components/Button';
import JobFilter from '@/components/JobFilter';
import JobCard from '@/components/JobCard';
import FAQAccordion from '@/components/FAQAccordion';
import { MOCK_JOBS } from '@/lib/mock_data';
import { ArrowRight, CheckCircle, TrendingUp, Users, Shield, Zap, Globe, Award, Briefcase } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

// --- Components ---

function CountUp({ to }: { to: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = to / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= to) {
        setCount(to);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [to]);

  return <>{count.toLocaleString()}</>;
}

function InfiniteMarquee({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ overflow: 'hidden', display: 'flex', maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
        style={{ display: 'flex', gap: '4rem', whiteSpace: 'nowrap', paddingRight: '4rem', alignItems: 'center' }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

function TiltCard({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  return (
    <motion.div
      style={{ perspective: 1000 }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(e.clientX - centerX);
        y.set(e.clientY - centerY);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
    >
      <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', overflowX: 'hidden', background: 'var(--background)' }}>

      {/* --- HERO SECTION --- */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: '80px', overflow: 'hidden' }}>

        {/* Tech Mesh Background */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `radial-gradient(#e5e7eb 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
          opacity: 0.5
        }} />

        {/* Gradient Orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
          style={{ position: 'absolute', top: '10%', right: '10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(37,99,235,0.2), transparent 70%)', filter: 'blur(60px)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
          style={{ position: 'absolute', bottom: '10%', left: '10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(147,51,234,0.15), transparent 70%)', filter: 'blur(60px)' }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div style={{ y: heroY, opacity: heroOpacity, margin: '0 auto', textAlign: 'center', maxWidth: '1100px' }}>

            {/* Chip */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '99px', background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '2rem' }}
            >
              <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#18181b' }}>Over 12,000+ New Jobs Added Today</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.5rem', color: '#09090b' }}>
              Find a job that <br className="mobile-hide" />
              <span style={{
                background: 'linear-gradient(135deg, #18181b 0%, #52525b 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>matches your passion.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{ fontSize: '1.25rem', color: '#52525b', marginBottom: '3rem', maxWidth: '650px', marginInline: 'auto', lineHeight: 1.6 }}
            >
              The most advanced AI-powered platform designed to connect top-tier talent with world-class organizations.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '5rem', flexWrap: 'wrap' }}
            >
              <Link href="/jobs">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '1.25rem 3rem', borderRadius: '16px', background: '#18181b', color: 'white',
                    fontSize: '1.1rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)'
                  }}
                >
                  Browse Jobs
                </motion.button>
              </Link>
              <Link href="/companies">
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: '#f4f4f5' }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '1.25rem 3rem', borderRadius: '16px', background: 'white', color: '#18181b',
                    fontSize: '1.1rem', fontWeight: 600, border: '1px solid #e4e4e7', cursor: 'pointer'
                  }}
                >
                  View Companies
                </motion.button>
              </Link>
            </motion.div>

            {/* 3D Filter Container */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.8, type: 'spring' }}
            >
              <JobFilter />
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* --- TRUSTED BRANDS --- */}
      <section style={{ padding: '3rem 0', background: 'white', borderBottom: '1px solid #e4e4e7' }}>
        <p style={{ textAlign: 'center', color: '#71717a', fontSize: '0.9rem', fontWeight: 600, marginBottom: '2rem', letterSpacing: '0.05em' }}>TRUSTED BY TEAM AT WORLD'S BEST COMPANIES</p>
        <InfiniteMarquee>
          {['MICROSOFT', 'GOOGLE', 'AMAZON', 'NETFLIX', 'SPOTIFY', 'META', 'APPLE', 'TESLA', 'OPENAI', 'STRIPE', 'AIRBNB', 'UBER'].map((brand, i) => (
            <span key={i} style={{ fontSize: '2rem', fontWeight: 800, color: '#d4d4d8', letterSpacing: '-0.02em', margin: '0 2rem' }}>{brand}</span>
          ))}
        </InfiniteMarquee>
      </section>

      {/* --- CATEGORIES --- */}
      <section className="container" style={{ padding: '8rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '4rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '3rem', fontWeight: 800, color: '#18181b', lineHeight: 1 }}>Explore by <br /><span style={{ color: '#9333ea' }}>Category</span></h2>
          </div>
          <Link href="/categories" style={{ color: '#18181b', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            View All Categories <ArrowRight size={18} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {[
            { name: 'Engineering', icon: Briefcase, count: '1.2k jobs' },
            { name: 'Design', icon: Award, count: '850 jobs' },
            { name: 'Marketing', icon: TrendingUp, count: '600 jobs' },
            { name: 'Sales', icon: Zap, count: '920 jobs' },
            { name: 'Finance', icon: Shield, count: '340 jobs' },
            { name: 'Remote', icon: Globe, count: '4.5k jobs' },
          ].map((cat, i) => (
            <motion.div
              key={cat.name}
              whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
              style={{
                padding: '2rem', borderRadius: '20px', background: 'white', border: '1px solid #e4e4e7',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <div style={{ width: '50px', height: '50px', background: '#fafafa', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#18181b' }}>
                <cat.icon size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#18181b' }}>{cat.name}</h3>
              <p style={{ color: '#71717a', fontSize: '0.9rem' }}>{cat.count}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- HOW IT WORKS (Dark Mode) --- */}
      <section style={{ padding: 'var(--section-padding) 0', background: '#09090b', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.1)' }} />

        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>How it Works</h2>
            <p style={{ color: '#a1a1aa', fontSize: '1.1rem' }}>Your journey to a better career starts here.</p>
          </div>

          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>
            {[
              { title: 'Create Account', desc: 'Sign up in seconds and build your professional profile.', icon: Users },
              { title: 'Upload Resume', desc: 'Our AI parses your resume to match you with the best roles.', icon: Briefcase },
              { title: 'Get Hired', desc: 'Connect directly with hiring managers and land the job.', icon: CheckCircle }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                style={{ background: 'rgba(255,255,255,0.03)', padding: '3rem 2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
                  <step.icon size={28} color="white" />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>{step.title}</h3>
                <p style={{ color: '#a1a1aa', lineHeight: 1.6 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TRENDING JOBS --- */}
      <section className="container" style={{ padding: '8rem 1.5rem' }}>
        <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', color: '#18181b' }}>Trending Opportunities</h2>
          <p style={{ color: '#71717a', fontSize: '1.1rem' }}>Hand-picked jobs from top companies.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
          {MOCK_JOBS.slice(0, 6).map((job, i) => (
            <TiltCard key={job.id}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', height: '100%', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}
              >
                <JobCard {...job} />
              </motion.div>
            </TiltCard>
          ))}
        </div>

        <div style={{ marginTop: '4rem', textAlign: 'center' }}>
          <Link href="/jobs">
            <Button variant="outline" size="lg">View All Jobs</Button>
          </Link>
        </div>
      </section>

      {/* --- STATS PARALLAX --- */}
      <section style={{ position: 'relative', padding: '10rem 0', overflow: 'hidden', background: '#18181b', color: 'white' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.2 }}>
          <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop" alt="stats-bg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #18181b, transparent, #18181b)' }} />

        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem', textAlign: 'center' }}>
            {[
              { label: 'Active Jobs', value: 12540 },
              { label: 'Companies', value: 850 },
              { label: 'Hires', value: 45000 },
              { label: 'Candidates', value: 120000 }
            ].map((stat, i) => (
              <div key={i}>
                <div style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '0.5rem', background: 'linear-gradient(to bottom, #ffffff, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  <CountUp to={stat.value} />+
                </div>
                <div style={{ color: '#d4d4d8', fontSize: '1.1rem', fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="container" style={{ padding: '8rem 1.5rem', maxWidth: '900px' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 800, color: '#18181b' }}>Common Questions</h2>
          <p style={{ color: '#71717a', marginTop: '1rem', fontSize: '1.1rem' }}>Everything you need to know about the platform.</p>
        </div>
        <FAQAccordion items={[
          { q: "Is this platform really free for job seekers?", a: "Yes, completely. You can create a profile, upload your resume, and apply to as many jobs as you want without paying a dime." },
          { q: "How does the AI matching algorithm work?", a: "Our proprietary AI analyzes your skills, experience, and career goals to match you with roles where you're most likely to succeed. It learns from your interactions to get smarter over time." },
          { q: "Can companies contact me directly?", a: "Yes. If your profile is public, verified recruiters can invite you to apply for roles that match your expertise." },
          { q: "What makes this different from LinkedIn?", a: "We focus purely on hiring. No social feed, no noise. Just high-quality job listings, salary transparency, and direct connections to hiring managers." }
        ]} />
      </section>

      {/* --- CTA SECTION --- */}
      <section style={{ padding: '6rem 0', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem' }}>Ready to shape your future?</h2>
          <p style={{ fontSize: '1.25rem', opacity: 0.9, marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>Join over 100,000 professionals who have found their dream job using our platform.</p>
          <Link href="/auth/signup">
            <button style={{ padding: '1.25rem 3.5rem', background: 'white', color: '#2563eb', border: 'none', borderRadius: '99px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
              Get Started Now
            </button>
          </Link>
        </div>
      </section>

    </div>
  );
}
