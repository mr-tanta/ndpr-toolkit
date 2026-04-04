'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';


export default function NDPRDemosPage() {
  const demos = [
    {
      title: 'Data Subject Rights',
      description: 'Demos for DSR request forms, dashboard, and tracking components per NDPA requirements',
      href: '/ndpr-demos/dsr'
    },
    {
      title: 'Consent Management',
      description: 'Demos for consent banner, manager, and storage components aligned with NDPA provisions',
      href: '/ndpr-demos/consent'
    },
    {
      title: 'DPIA Tools',
      description: 'Demos for Data Protection Impact Assessment components under NDPA guidelines',
      href: '/ndpr-demos/dpia'
    },
    {
      title: 'Breach Management',
      description: 'Demos for data breach notification and management components as required by NDPA',
      href: '/ndpr-demos/breach'
    },
    {
      title: 'Privacy Policy',
      description: 'Demos for privacy policy generation and management compliant with NDPA',
      href: '/ndpr-demos/policy'
    },
    {
      title: 'Lawful Basis Tracker',
      description: 'Track and document lawful basis for processing activities per NDPA Section 25',
      href: '/ndpr-demos/lawful-basis'
    },
    {
      title: 'Cross-Border Transfers',
      description: 'Assess and manage international data transfers per NDPA Sections 41-45',
      href: '/ndpr-demos/cross-border'
    },
    {
      title: 'ROPA',
      description: 'Maintain Record of Processing Activities for NDPC compliance',
      href: '/ndpr-demos/ropa'
    }
  ];

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">NDPA Toolkit Demos</h1>
      <p className="text-lg mb-6">
        These demos showcase the components and functionality of the NDPA Toolkit package,
        built for compliance with the Nigeria Data Protection Act (NDPA) and NDPC regulations.
        Each demo demonstrates how to use the toolkit in a real-world application.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {demos.map((demo, index) => (
          <Link key={index} href={demo.href} className="no-underline">
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{demo.title}</CardTitle>
                <CardDescription>{demo.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-blue-600">View Demo →</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      <div className="mt-10 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Documentation</h2>
        <p>
          For detailed documentation on how to use the NDPA Toolkit, please visit the{' '}
          <Link href="/docs" className="text-blue-600 hover:underline">
            documentation pages
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
