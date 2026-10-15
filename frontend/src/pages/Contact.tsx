import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { SectionContainer } from '../components/layout/SectionContainer';
import { SectionHeading } from '../components/layout/SectionHeading';

interface FormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface ErrorsState {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
}

export const Contact: React.FC = () => {
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiries',
    message: '',
  });

  const [errors, setErrors] = useState<ErrorsState>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const errs: ErrorsState = {};

    if (!form.name.trim()) {
      errs.name = 'Please provide your full name.';
    }

    if (!form.email.trim()) {
      errs.email = 'Please provide your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (form.phone.trim() && !/^[+0-9\s-()]{7,20}$/.test(form.phone.trim())) {
      errs.phone = 'Please enter a valid phone number.';
    }

    if (!form.message.trim()) {
      errs.message = 'Please share your thoughts or questions.';
    } else if (form.message.trim().length < 10) {
      errs.message = 'Message must be at least 10 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setSubmitted(true);
      // Reset after showing feedback
      setTimeout(() => {
        setForm({
          name: '',
          email: '',
          phone: '',
          subject: 'General Inquiries',
          message: '',
        });
      }, 500);
    }
  };

  return (
    <main className="pt-24 sm:pt-28 pb-12 sm:pb-16">
      <SectionContainer bg="cream" className="!py-0">
        
        <SectionHeading
          overline="Get in Touch"
          title="We Welcome Your Voice"
          subtitle="Whether you have questions about our seasonal roasts, private café hire, wholesale partnerships, or just want to say hello."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start max-w-6xl mx-auto">
          
          {/* Left Column: Form with Complete Frontend Validation */}
          <div className="lg:col-span-7 bg-[#F7F1E6] p-6 sm:p-10 rounded-3xl border border-[#EFE2CF] shadow-sm">
            
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#5C6B4E] text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#2B1B14]">
                  Message Received with Warmth
                </h3>
                <p className="text-xs sm:text-sm text-[#5A3B2E]/80 max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out to Brew &amp; Bloom. Our café team will respond to your note within one business day.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-6 py-2.5 rounded-full bg-[#2B1B14] text-white text-xs font-semibold uppercase tracking-wider"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#5A3B2E] flex justify-between">
                    <span>Full Name *</span>
                    {errors.name && <span className="text-rose-600 font-normal lowercase flex items-center gap-1"><AlertCircle className="w-3 h-3 inline" /> {errors.name}</span>}
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Julian Hayes"
                    className={`w-full px-4 py-3 rounded-xl bg-white text-xs sm:text-sm text-[#2B1B14] border focus:outline-none transition-colors ${
                      errors.name ? 'border-rose-400 focus:border-rose-600' : 'border-[#EFE2CF] focus:border-[#C08A4E]'
                    }`}
                  />
                </div>

                {/* Email & Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#5A3B2E] flex justify-between">
                      <span>Email Address *</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="julian@example.com"
                      className={`w-full px-4 py-3 rounded-xl bg-white text-xs sm:text-sm text-[#2B1B14] border focus:outline-none transition-colors ${
                        errors.email ? 'border-rose-400 focus:border-rose-600' : 'border-[#EFE2CF] focus:border-[#C08A4E]'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-[11px] text-rose-600 flex items-center gap-1 pt-0.5">
                        <AlertCircle className="w-3 h-3" /> {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#5A3B2E]">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className={`w-full px-4 py-3 rounded-xl bg-white text-xs sm:text-sm text-[#2B1B14] border focus:outline-none transition-colors ${
                        errors.phone ? 'border-rose-400 focus:border-rose-600' : 'border-[#EFE2CF] focus:border-[#C08A4E]'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-rose-600 flex items-center gap-1 pt-0.5">
                        <AlertCircle className="w-3 h-3" /> {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#5A3B2E]">
                    Subject
                  </label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#EFE2CF] text-xs sm:text-sm text-[#2B1B14] focus:outline-none focus:border-[#C08A4E]"
                  >
                    <option value="General Inquiries">General Inquiries</option>
                    <option value="Catering & Events">Café Space Booking &amp; Acoustic Evenings</option>
                    <option value="Wholesale Beans">Wholesale Specialty Coffee Beans</option>
                    <option value="Barista Masterclass">Barista Cupping &amp; Pour Masterclasses</option>
                  </select>
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#5A3B2E] flex justify-between">
                    <span>Your Message *</span>
                    {errors.message && (
                      <span className="text-rose-600 font-normal lowercase flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 inline" /> {errors.message}
                      </span>
                    )}
                  </label>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us what's on your mind..."
                    className={`w-full px-4 py-3 rounded-xl bg-white text-xs sm:text-sm text-[#2B1B14] border focus:outline-none transition-colors ${
                      errors.message ? 'border-rose-400 focus:border-rose-600' : 'border-[#EFE2CF] focus:border-[#C08A4E]'
                    }`}
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 rounded-full bg-[#2B1B14] hover:bg-[#C08A4E] text-[#FBF4E9] text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-md active:scale-98"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </button>
                </div>

              </form>
            )}

          </div>

          {/* Right Column: Contact Information & Café Snippet */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-[#2B1B14] text-[#FBF4E9] p-8 rounded-3xl shadow-xl space-y-6">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#C08A4E] block mb-1">
                  Direct Inquiries
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#FBF4E9]">
                  Brew &amp; Bloom Roasters
                </h3>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-[#FBF4E9]/80 font-sans">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#C08A4E] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Flagship Sanctuary &amp; Bar</span>
                    <span>42 Solstice Avenue, Old Town Arts District, San Francisco, CA</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#C08A4E] flex-shrink-0" />
                  <div>
                    <span className="font-bold text-white block">Phone Line</span>
                    <span>+1 (415) 890-2341</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#C08A4E] flex-shrink-0" />
                  <div>
                    <span className="font-bold text-white block">Concierge Email</span>
                    <span>hello@brewandbloom.coffee</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#C08A4E] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Sanctuary Hours</span>
                    <span>Monday – Friday: 7:00 AM – 7:00 PM</span>
                    <span className="block">Saturday – Sunday: 8:00 AM – 8:00 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quote Snippet */}
            <div className="p-6 rounded-3xl bg-[#EFE2CF] border border-[#E0D0BB] text-xs text-[#5A3B2E] space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#5C6B4E]">
                A Note on Hospitality
              </span>
              <p className="italic leading-relaxed font-serif text-sm text-[#2B1B14]">
                "Every customer who steps through our threshold is welcomed not as a transaction, but as a guest into our living room."
              </p>
            </div>

          </div>

        </div>

      </SectionContainer>
    </main>
  );
};
