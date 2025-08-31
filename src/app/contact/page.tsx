"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simple mailto fallback for now
    const subject = encodeURIComponent(`Contact from ${formData.name}`);
    const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`);
    const mailtoLink = `mailto:krish.1029.soni@gmail.com?subject=${subject}&body=${body}`;
    
    window.location.href = mailtoLink;
    
    setIsSubmitting(false);
    setSubmitStatus("success");
    
    // Reset form after a delay
    setTimeout(() => {
      setFormData({ name: "", email: "", message: "" });
      setSubmitStatus("idle");
    }, 2000);
  };

  return (
    <main className="mx-auto max-w-4xl px-4 pt-16 pb-12 text-white">
      <div className="space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4 animate-rise">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Let&rsquo;s Connect
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Have a project in mind, want to collaborate, or just say hello? 
            I&rsquo;d love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Contact Form */}
          <div className="space-y-6 animate-rise" style={{ animationDelay: "100ms" }}>
            <h2 className="text-2xl font-bold">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/90 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-white/90 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all resize-none"
                  placeholder="Tell me about your project or just say hello..."
                />
              </div>
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? "Sending..." : submitStatus === "success" ? "Message Sent!" : "Send Message"}
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8 animate-rise" style={{ animationDelay: "200ms" }}>
            <div>
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <a 
                      href="mailto:krish.1029.soni@gmail.com" 
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      krish.1029.soni@gmail.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-white/80">Berkeley, CA</p>
                    <p className="text-white/60 text-sm">Open to relocation or remote work</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Status</h3>
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-green-400 font-medium mb-2">Currently Available</p>
                <p className="text-white/90">
                  I&rsquo;m actively looking for a job as a <strong>Full Stack Developer / Software Engineer</strong>.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-white/5 border border-white/10">
              <p className="text-white/80 italic">
                &ldquo;I believe the best projects come from genuine connections and shared passion for creating something meaningful.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}