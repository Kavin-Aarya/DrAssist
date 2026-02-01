import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Login from './login';
import Navbar from './navbar';
import MenuLayout from './MenuLayout';
import Dashboard from './Dashboard';
import VoiceCapture from './VoiceCapture';
import Settings from './Settings';
import Templates from './Templates';
import History from './History';
import { CheckIcon } from '@heroicons/react/20/solid'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline'


function HeroSection() {
  const navigate = useNavigate();
  const features = [
    {
      name: 'Instant Voice-to-Document Conversion.',
      description: 'Transform spoken input into polished, professional medical prescriptions through a seamless end-to-end workflow.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="absolute left-1 top-1 size-5 text-[#3f8b8c]">
          <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clipRule="evenodd" />
          <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
        </svg>
      ),
    },
    {
      name: 'Precision Voice Capture.',
      description: 'Advanced audio intake technology ensures every word is recorded clearly and accurately — reducing errors and rework.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="absolute left-1 top-1 size-5 text-[#3f8b8c]">
          <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
          <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
        </svg>
      ),
    },
    {
      name: 'Secure & Structured Output.',
      description: 'Industry-grade security combined with custom templates delivers consistent, compliant, and professional results every time.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="absolute left-1 top-1 size-5 text-[#3f8b8c]">
          <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
        </svg>
      ),
    }
  ];
  const tiers = [
    {
      name: 'Essential',
      id: 'tier-essential',
      href: '#',
      priceMonthly: '$49',
      description: 'Perfect for solo practitioners streamlining their daily documentation.',
      features: [
        'Unlimited voice-to-text',
        'Basic clinical entity mapping',
        'Standard SOAP note templates',
        'Secure cloud storage',
        'Email support (24h response)',
      ],
      mostPopular: false,
    },
    {
      name: 'Professional',
      id: 'tier-professional',
      href: '#',
      priceMonthly: '$99',
      description: 'Advanced features for growing clinics requiring high-precision data.',
      features: [
        'Everything in Essential',
        'Advanced medical coding support',
        'Customizable documentation templates',
        'EHR integration assistance',
        'Priority 24/7 support',
        'Multi-device synchronization',
      ],
      mostPopular: true,
    },
    {
      name: 'Institutional',
      id: 'tier-institutional',
      href: '#',
      priceMonthly: 'Custom',
      description: 'Enterprise-grade security and scale for large hospital networks.',
      features: [
        'Unlimited departmental seats',
        'Full API & On-premise options',
        'Dedicated success manager',
        'Custom security audits & compliance',
        'Advanced population health analytics',
        'White-label documentation portals',
      ],
      mostPopular: false,
    },
  ];
  const stats = [
    {
      id: "stat1",
      value: "12,000+",
      description: "Medical professionals onboarded"
    },
    {
      id: "stat2",
      value: "2.5 hrs",
      description: "Average time saved per shift"
    },
    {
      id: "stat3",
      value: "99.9%",
      description: "System availability & uptime"
    },
    {
      id: "stat4",
      value: "1.2M+",
      description: "Clinical notes securely generated"
    },
  ];
  const faqs = [
    {
      question: "How accurate is the medical transcription?",
      answer:
        "Our system is optimized for clinical terminology and various accents, ensuring high-precision documentation that captures complex medical terms accurately.",
    },
    {
      question: "Is patient data secure and encrypted?",
      answer:
        "Yes, all data is processed with end-to-end encryption. We prioritize security and privacy to ensure that sensitive information remains protected at all times.",
    },
    {
      question: "Does it support multiple speakers during a consultation?",
      answer:
        "Yes, the system is designed to distinguish between clinician and patient voices to provide a clear, structured transcript of the encounter.",
    },
    {
      question: "Does the system recognize complex medical terminology?",
      answer:
        "Yes. The engine is specifically trained on extensive clinical datasets, allowing it to accurately capture and transcribe complex pharmacological terms, anatomical references, and specialized medical jargon across various specialties.",
    },
    {
      question: "How does this improve the patient-doctor encounter?",
      answer:
        "By automating the documentation process, clinicians can maintain direct eye contact and engage more deeply with patients. The system works in the background to ensure every clinical detail is captured without the distraction of manual data entry.",
    },
    {
      question: "Is the documentation process compliant with healthcare standards?",
      answer:
        "Security is our cornerstone. We utilize industry-standard encryption protocols and secure data handling practices to ensure that all generated clinical notes meet the rigorous privacy and confidentiality requirements of modern healthcare environments.",
    },
  ];
  const navigation = {
      main: [
        { name: 'About', href: '#' },
        { name: 'Blog', href: '#' },
        { name: 'Jobs', href: '#' },
        { name: 'Press', href: '#' },
        { name: 'Accessibility', href: '#' },
        { name: 'Partners', href: '#' },
      ],
      social: [
        {
          name: 'Facebook',
          href: '#',
          icon: (props) => (
            <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
              <path
                fillRule="evenodd"
                d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                clipRule="evenodd"
              />
            </svg>
          ),
        },
        {
          name: 'X',
          href: '#',
          icon: (props) => (
            <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
              <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31398 4.16971H7.70053L12.1742 10.5689L12.8708 11.5654L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
            </svg>
          ),
        },
        {
          name: 'Instagram',
          href: '#',
          icon: (props) => (
            <svg fill="currentColor" viewBox="-2 -2 28 28" {...props}> {/* Changed viewBox to shrink icon slightly */}
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.282.975.95 1.245 2.217 1.307 3.583.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.332 2.633-1.282 3.608-.95.975-2.217 1.245-3.583 1.307-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.332-3.608-1.282-.975-.95-1.245-2.217-1.307-3.583C2.012 15.584 2 15.204 2 12s.012-3.584.07-4.85c.062-1.366.332-2.633 1.282-3.608.95-.975 2.217-1.245 3.583-1.307 1.266-.058 1.646-.07 4.85-.07M12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.072 7.052.014 8.333 0 8.741 0 12s.014 3.667.072 4.947c.2 4.353 2.62 6.777 6.98 6.977 1.28.057 1.688.072 4.948.072s3.668-.015 4.948-.072c4.351-.2 6.777-2.62 6.977-6.977.058-1.28.072-1.688.072-4.947s-.015-3.668-.072-4.947C23.728 2.62 21.306.2 16.946.072 15.667.014 15.259 0 12 0z" />
              <path d="M12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8z" />
              <path d="M18.406 4.155a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z" />
            </svg>
          ),
        },
      ],
    }


  return (
    <div className="relative w-full bg-[#040d0d] isolate">
      <Navbar />
      
      {/* 1. Ensure this is the first visible block and has no top margin */}
      <div className="relative h-screen w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: "url('assets/hospital.jpg')" }}
        >
          {/* Overlay - lowered z-index to stay behind text */}
          <div className="absolute inset-0 bg-black/65"></div>
        </div>

        {/* 2. Content centered using Flex instead of absolute top-1/2 */}
        <div className="relative z-20 flex h-full flex-col items-center justify-center px-4">
          <div className="w-11/12 md:w-3/5 text-center">
            <h1 className="text-3xl pb-4 md:text-6xl text-white font-bold leading-tight">
              Use Voice Activation to Generate Prescriptions, <br/>
              <span className="text-[#3f8b8c]">No Writing Required.</span>
            </h1>
            <p className="mt-10 text-white font-semibold md:text-2xl">
              Speak the medication order to instantly create and finalize the prescription sheet.
            </p>
          </div>
        </div>
      </div>

    
      
      

    {/*stats*/}
    <div id="stats_section" className="bg-[#040d0d] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <h2 className="text-base/7 font-semibold text-[#3f8b8c]">Our Track Record</h2>
        <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl">Trusted by thousands of doctors worldwide</p>
        <p className="mt-6 text-lg/8 text-white">
        Transforming unstructured clinical dialogue into precision-mapped medical documentation for enhanced provider productivity. 
        Trusted by thousands of healthcare professionals to streamline patient encounters through automated data extraction and 
        seamless digital record generation.
        </p>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 m-10 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div 
            key={stat.id} 
            className="relative overflow-hidden rounded-2xl bg-white/5 p-8 backdrop-blur-xl ring-1 ring-white/10 shadow-2xl transition-all duration-300 hover:bg-white/10"
          >
            {/* Decorative subtle glow for each stat */}
            <div className="absolute -right-4 -top-4 h-12 w-12 bg-[#3f8b8c] opacity-20 blur-2xl" />
            
            <dt className="text-sm font-semibold leading-6 text-gray-400">
              {stat.description}
            </dt>
            <dd className="mt-2 text-3xl font-bold tracking-tight text-white">
              {stat.value}
            </dd>
          </div>
        ))}
            </div>
          
        </div>
        
        </div>

        {/*Logo Clouds*/}
        <div className="bg-[#040d0d] py-24 sm:py-32 mt-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="text-center text-lg/8 font-semibold text-white">
              Trusted by the world's most popular hospitals
            </h2>
            <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
              <img
                alt="Transistor"
                src="https://tailwindcss.com/plus-assets/img/logos/158x48/transistor-logo-white.svg"
                width={158}
                height={48}
                className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
              />
              <img
                alt="Reform"
                src="https://tailwindcss.com/plus-assets/img/logos/158x48/reform-logo-white.svg"
                width={158}
                height={48}
                className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
              />
              <img
                alt="Tuple"
                src="https://tailwindcss.com/plus-assets/img/logos/158x48/tuple-logo-white.svg"
                width={158}
                height={48}
                className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
              />
              <img
                alt="SavvyCal"
                src="https://tailwindcss.com/plus-assets/img/logos/158x48/savvycal-logo-white.svg"
                width={158}
                height={48}
                className="col-span-2 max-h-12 w-full object-contain sm:col-start-2 lg:col-span-1"
              />
              <img
                alt="Statamic"
                src="https://tailwindcss.com/plus-assets/img/logos/158x48/statamic-logo-white.svg"
                width={158}
                height={48}
                className="col-span-2 col-start-2 max-h-12 w-full object-contain sm:col-start-auto lg:col-span-1"
              />
            </div>
          </div>
        </div>

        {/*Feature section*/}
        <div id="feature_section" className="relative isolate overflow-hidden bg-[#040d0d] py-24 sm:py-32">
        <div className="mx-auto max-w-8xl px-10 lg:pl-32">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-7 gap-y-15 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            <div className="lg:pt-4 lg:pr-8">
              <div className="lg:max-w-lg">
                <h2 className="text-base/7 font-semibold text-[#3f8b8c]">Voice Intelligence</h2>
                <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl">A Smarter Workflow</p>
                <p className="mt-6 text-lg/8 text-white">
                  Our system delivers a seamless, end-to-end workflow that transforms audio input into a finalized, professional output. 
                  From initial voice capture to document completion, every stage is designed for accuracy, efficiency, and security.
                </p>
                <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-gray-400 lg:max-w-none">
                  {features.map((feature) => (
                    <div key={feature.name} className="relative pl-9">
                      <dt className="inline font-semibold text-white">
                        {feature.icon}
                        {feature.name}
                      </dt>{' '}
                      <dd className="inline">{feature.description}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* --- PHOTO CONTAINER WITH GLOW --- */}
            <div className="relative flex items-center justify-center">
              {/* The Glow Element */}
              <div 
                className="absolute h-[80%] w-[100%] rounded-full bg-[#518b8b] opacity-100 blur-[100px] -z-10"
                aria-hidden="true"
              />
              
              <img
                alt="Product screenshot"
                src="assets/ui.png"
                width={2432}
                height={1442}
                className="w-3xl max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-228 md:-ml-4 lg:ml-40 mt-10"
              />
            </div>
          </div>
        </div>
      </div>
  

        {/*Pricing*/}
        <div id="pricing_section" className="mx-auto max-w-7xl px-24 lg:px-8 mt-32">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-[#3f8b8c]">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Pricing that grows with you
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-300">
          Choose an affordable plan packed with the best features for clinical workflows.
        </p>
        
        {/* Pricing Tiers */}
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative flex flex-col justify-between rounded-3xl bg-white/5 p-8 ring-1 ring-white/10 xl:p-10 ${
                tier.mostPopular ? 'lg:z-10 lg:scale-105 bg-white/10 ring-[#3f8b8c]' : ''
              }`}
            >
              {tier.mostPopular && (
                <p className="absolute top-0 -translate-y-1/2 rounded-full bg-[#3f8b8c] px-3 py-0.5 text-sm font-semibold leading-5 text-white">
                  Most popular
                </p>
              )}
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3 id={tier.id} className="text-lg font-semibold leading-8 text-white">
                    {tier.name}
                  </h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-300">{tier.description}</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-white">{tier.priceMonthly}</span>
                  <span className="text-sm font-semibold leading-6 text-gray-300">/month</span>
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-300">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <CheckIcon className="h-6 w-5 flex-none text-[#3f8b8c]" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href={tier.href}
                className={`mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  tier.mostPopular
                    ? 'bg-[#3f8b8c] text-white shadow-sm hover:bg-[#2d6a6b]'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Buy plan
              </a>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mt-24 sm:mt-32 lg:mt-40">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <figure className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-6 ring-1 ring-white/10 sm:p-8 transition-all duration-300 hover:bg-white/10">
              <blockquote className="text-lg font-semibold leading-8 text-white">
                <p>“DrAssist has completely transformed how I handle patient prescriptions. Accuracy is incredible.”</p>
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-x-4">
                <div className="text-sm leading-6">
                  <div className="font-semibold text-white">Dr. Sarah Jenkins</div>
                  <div className="text-gray-400">Chief of Medicine at Genesis Medical</div>
                </div>
              </figcaption>
            </figure>
            <figure className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-6 ring-1 ring-white/10 sm:p-8 transition-all duration-300 hover:bg-white/10">
              <blockquote className="text-lg font-semibold leading-8 text-white">
                <p>“Automating our clinical entity extraction with DrAssist saved us roughly 10 hours of paperwork per week.”</p>
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-x-4">
                <div className="text-sm leading-6">
                  <div className="font-semibold text-white">Dr. Joseph Rodriguez</div>
                  <div className="text-gray-400">Doctor at Pulse Health</div>
                </div>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </div>

    {/*Frequently asked questions*/}
    <div id="faq_section" className="bg-[#040d0d]">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl text-center mb-28">
            Frequently asked questions
          </h2>
        <div className="mx-auto max-w-4xl divide-y divide-white/10">
          
          <dl className="mt-10 space-y-6 divide-y divide-white/10">
            {faqs.map((faq) => (
              <Disclosure key={faq.question} as="div" className="pt-6">
                {({ open }) => (
                  <>
                    <dt>
                      <DisclosureButton className="group flex w-full items-start justify-between text-left text-white">
                        <span className="text-base font-semibold leading-7 pb-7">{faq.question}</span>
                        <span className="ml-6 flex h-7 items-center">
                          {open ? (
                            <MinusIcon className="h-6 w-6 text-[#3f8b8c]" aria-hidden="true" />
                          ) : (
                            <PlusIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                          )}
                        </span>
                      </DisclosureButton>
                    </dt>
                    <DisclosurePanel as="dd" className="mt-2 pr-12">
                      <p className="text-base leading-7 text-gray-300 pb-7">{faq.answer}</p>
                    </DisclosurePanel>
                  </>
                )}
              </Disclosure>
            ))}
          </dl>
        </div>
      </div>
    </div>


    {/*Footer*/}
    <footer className="bg-[#040d0d]">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
        {/* Navigation Links */}
        <nav className="-mb-6 flex flex-wrap justify-center gap-x-12 gap-y-3 text-sm/6" aria-label="Footer">
          {navigation.main.map((item) => (
            <a key={item.name} href={item.href} className="text-gray-400 hover:text-[#3f8b8c] transition-colors">
              {item.name}
            </a>
          ))}
        </nav>
        
        {/* Social Media Icons */}
        <div className="mt-16 flex justify-center gap-x-10">
          {navigation.social.map((item) => (
            <a key={item.name} href={item.href} className="text-gray-400 hover:text-[#3f8b8c] transition-colors">
              <span className="sr-only">{item.name}</span>
              <item.icon className="h-6 w-6" aria-hidden="true" />
            </a>
          ))}
        </div>
        
        {/* Copyright Notice */}
        <p className="mt-10 text-center text-sm/6 text-gray-500">
          &copy; {new Date().getFullYear()} DrAssist Inc. All rights reserved.
        </p>
      </div>
    </footer>

    
    </div>
  );
}

export default function App() {
  // Global state to hold the AI result
  const [aiData, setAiData] = useState(null);

  return (
      <Router>
        <Routes>
          <Route path="/" element={<HeroSection />} /> 
          <Route path="/login" element={<Login />} />

          <Route element={<MenuLayout/>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/voicecapture" element={<VoiceCapture setAiData={setAiData} aiData={aiData} />} />
            <Route path="/templates" element={<Templates aiData={aiData} />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings/>} />
          </Route>
        </Routes>
      </Router>
    );
}