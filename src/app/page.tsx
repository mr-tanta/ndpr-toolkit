import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: 'NDPA Toolkit | NDPA 2023 Compliance Made Easy',
  description: 'Open-source toolkit for Nigerian developers to implement NDPA 2023 (Nigeria Data Protection Act) compliant features in web applications with minimal effort.',
  keywords: 'NDPA, NDPA 2023, Nigeria Data Protection Act, NDPC, Compliance, Toolkit, React, Next.js, Open Source',
  openGraph: {
    title: 'NDPA Toolkit | NDPA 2023 Compliance Made Easy',
    description: 'Open-source toolkit for Nigerian developers to implement NDPA 2023 (Nigeria Data Protection Act) compliant features in web applications with minimal effort.',
    url: 'https://ndprtoolkit.com.ng',
    siteName: 'NDPA Toolkit',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NDPA Toolkit by Tanta Innovative',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NDPA Toolkit | NDPA 2023 Compliance Made Easy',
    description: 'Open-source toolkit for Nigerian developers to implement NDPA 2023 (Nigeria Data Protection Act) compliant features in web applications with minimal effort.',
    images: ['/og-image.png'],
  },
};

export default function Home() {
  // Features of the NDPA Toolkit
  const features = [
    {
      title: "Consent Management System",
      description: "User-friendly consent banners and modals with customizable styling, granular consent options, and audit trails.",
      icon: "/icons/consent.svg",
      href: "/ndpr-demos/consent",
      color: "blue",
      iconPath: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    },
    {
      title: "Data Subject Rights Portal",
      description: "Pre-built UI components for handling access, rectification, erasure, portability, and other data subject rights requests.",
      icon: "/icons/rights.svg",
      href: "/ndpr-demos/dsr",
      color: "purple",
      iconPath: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    },
    {
      title: "Privacy Policy Generator",
      description: "Interactive wizard to create NDPA-compliant privacy policies with customizable sections and templates.",
      icon: "/icons/policy.svg",
      href: "/ndpr-demos/policy",
      color: "green",
      iconPath: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    },
    {
      title: "Data Protection Impact Assessment",
      description: "Questionnaire-based tool to help organizations assess data processing risks with mitigation recommendations.",
      icon: "/icons/dpia.svg",
      href: "/ndpr-demos/dpia",
      color: "amber",
      iconPath: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
    },
    {
      title: "Breach Notification Module",
      description: "Templates for mandatory breach notifications with timeline tracking to ensure 72-hour NDPC notification compliance.",
      icon: "/icons/breach.svg",
      href: "/ndpr-demos/breach",
      color: "red",
      iconPath: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    },
    {
      title: "Lawful Basis Tracker",
      description: "Track and document the lawful basis for each data processing activity, ensuring NDPA Article 25 compliance.",
      icon: "/icons/lawful-basis.svg",
      href: "/ndpr-demos/lawful-basis",
      color: "teal",
      iconPath: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
    },
    {
      title: "Cross-Border Transfer Assessment",
      description: "Evaluate and document the adequacy of safeguards for international data transfers under the NDPA framework.",
      icon: "/icons/cross-border.svg",
      href: "/ndpr-demos/cross-border",
      color: "indigo",
      iconPath: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    },
    {
      title: "Records of Processing Activities",
      description: "Maintain a comprehensive register of all data processing activities as required by the NDPA for accountability.",
      icon: "/icons/ropa.svg",
      href: "/ndpr-demos/ropa",
      color: "orange",
      iconPath: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
    }
  ];

  // Benefits of using the toolkit
  const benefits = [
    {
      title: "Rapid Implementation",
      description: "Deploy compliance features in days, not months, with our pre-built components."
    },
    {
      title: "NDPA 2023 Compliant",
      description: "All components are designed to meet the requirements of the Nigeria Data Protection Act 2023, enforced by the NDPC."
    },
    {
      title: "Customizable UI",
      description: "Fully customizable components that can be styled to match your brand's look and feel."
    },
    {
      title: "Developer-Friendly",
      description: "Well-documented API with TypeScript support and examples to help you get started quickly."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge variant="primary" className="mb-4 px-3 py-1 text-sm">
                NDPA 2023 Compliant
              </Badge>
              <h1 className="text-3xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-4xl md:text-5xl lg:text-6xl">
                <span className="block">Nigeria Data Protection Act</span>
                <span className="block mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Compliance Toolkit</span>
              </h1>
              <p className="mt-6 text-base sm:text-lg md:text-xl text-gray-500 dark:text-gray-300 leading-relaxed">
                An open-source toolkit that helps Nigerian developers implement NDPA 2023 compliant features in their web applications with minimal effort.
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Button 
                  variant="default" 
                  size="lg" 
                  asChild
                  className="rounded-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200"
                >
                  <Link href="/ndpr-demos" className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Live Demos
                  </Link>
                </Button>

                <Button 
                  variant="outline" 
                  size="lg" 
                  asChild
                  className="rounded-lg border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  <Link
                    href="/docs"
                    className="flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Documentation
                  </Link>
                </Button>

                <Button 
                  variant="outline" 
                  size="lg" 
                  asChild
                  className="rounded-lg border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  <Link
                    href="https://github.com/tantainnovative/ndpr-toolkit"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" fill="currentColor" />
                    </svg>
                    GitHub
                  </Link>
                </Button>

              </div>
              
              <div className="mt-8 flex items-center justify-center lg:justify-start text-sm text-gray-500 dark:text-gray-400">
                <div className="flex -space-x-2 mr-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">NG</div>
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">NDPA</div>
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">UI</div>
                </div>
                <span>Built for Nigerian businesses with enterprise-ready components</span>
              </div>
              
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="inline-flex items-center bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                  <span className="mr-1 text-blue-600 dark:text-blue-400">v1.0.1</span>
                  <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-full ml-2">React 19 Compatible</span>
                </div>
              </div>
            </div>
            
            <div className="relative hidden lg:block">
              <div className="absolute -top-16 -right-16 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob"></div>
              <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-2000"></div>
              <div className="absolute top-32 right-32 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-4000"></div>
              
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg transform -rotate-6 scale-105 opacity-10"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="mx-auto text-sm font-medium text-gray-500 dark:text-gray-400">NDPA Toolkit Demo</div>
                  </div>
                  <div className="p-6 space-y-6">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-${feature.color}-100 dark:bg-${feature.color}-900/30 flex items-center justify-center text-${feature.color}-600 dark:text-${feature.color}-400`}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.iconPath} />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">{feature.title}</h3>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    
      {/* Features Section */}
      <div className="py-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700" id="demos">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 px-3 py-1 text-sm">
              Enterprise-Ready Components
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white">
              Comprehensive NDPA 2023 Compliance
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg lg:text-xl text-gray-500 dark:text-gray-300">
              Our toolkit provides 8 professional, customizable modules to help Nigerian businesses implement NDPA compliance features with minimal development effort.
            </p>
          </div>

          <div className="mt-10 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
                <Link href={feature.href} className="block h-full">
                  <div className="p-1 bg-gradient-to-r from-blue-500 to-indigo-600">
                    <div className="bg-white dark:bg-gray-800 p-5">
                      <div className={`w-12 h-12 rounded-lg bg-${feature.color}-100 dark:bg-${feature.color}-900/30 flex items-center justify-center text-${feature.color}-600 dark:text-${feature.color}-400 mb-4`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.iconPath} />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-300">
                        {feature.description}
                      </p>
                      <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 font-medium">
                        <span>View Demo</span>
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="primary" className="mb-4 px-3 py-1 text-sm">
              Why Choose Us
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white">
              Benefits of Our Toolkit
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg lg:text-xl text-gray-500 dark:text-gray-300">
              Designed to make compliance easy, efficient, and developer-friendly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 flex items-start border border-gray-200 dark:border-gray-700">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-4">
                  <span className="text-xl font-bold">{index + 1}</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{benefit.title}</h3>
                  <p className="text-gray-500 dark:text-gray-300">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#grid)" />
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 md:py-24 sm:px-6 lg:px-8 relative">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
                <h2 className="text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl">
                  <span className="block">Ready to implement NDPA 2023 compliance?</span>
                  <span className="block text-blue-200">Start using the toolkit today.</span>
                </h2>
                <p className="mt-4 text-lg text-blue-100 max-w-md">
                  Join the growing community of Nigerian businesses using our enterprise-ready toolkit to implement NDPA compliance features in their applications.
                </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                
              
                    <Button
                  variant="secondary"
                  size="lg"
                  asChild
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  <Link
                    href="https://github.com/tantainnovative/ndpr-toolkit"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" fill="currentColor" />
                    </svg>
                    Get Started on GitHub
                </Link>

                </Button>
           
                <Button
                  variant="default"
                  size="lg"
                  asChild
                  className="text-white border-white hover:bg-blue-700"
                >
                <Link href="/docs">

                 
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Documentation
                </Link>
                </Button>
            

              </div>
            </div>
            <div className="mt-12 lg:mt-0 hidden lg:block">
              <div className="pl-4 -mr-48 sm:pl-6 md:-mr-16 lg:px-0 lg:m-0 lg:relative lg:h-full">
                <div className="w-full rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 overflow-hidden transform rotate-3 translate-x-6 bg-white dark:bg-gray-800">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="mx-auto text-sm font-medium text-gray-500 dark:text-gray-400">NDPA Toolkit</div>
                  </div>
                  <div className="relative bg-white dark:bg-gray-800 p-6">
                    <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">NDPA 2023 Compliant</p>
                        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Ready for Production</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold mr-3">NT</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">NDPA Toolkit</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <a href="https://ndprtoolkit.com.ng" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Tanta Innovative</a>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex space-x-6">
              <a href="https://github.com/tantainnovative/ndpr-toolkit" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="/docs" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Documentation</span>
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </a>
              <a href="https://tantainnovatives.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Tanta Innovative Website</span>
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                </svg>
              </a>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8 text-center">
            <p className="text-base text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} <a href="https://tantainnovatives.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Tanta Innovative</a>. All rights reserved.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Developed as an open-source solution for Nigerian tech businesses.
            </p>
            <div className="flex justify-center mt-4 space-x-4">
              <a href="https://tantainnovatives.com/contact-us" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact Us</a>
              <a href="https://tantainnovatives.com/services" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Services</a>
              <a href="https://tantainnovatives.com/about-us" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
