'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BreachReportForm, BreachRiskAssessment, BreachNotificationManager, RegulatoryReportGenerator } from '@/index';
import type { BreachReport, RiskAssessment } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

export default function BreachDemoPage() {
  const [activeTab, setActiveTab] = useState('notification');
  const [isClient, setIsClient] = useState(false);
  const [breaches, setBreaches] = useState<BreachReport[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  // Define interface based on documentation for regulatory notifications
interface RegulatoryNotification {
  id: string;
  breachId: string;
  sentAt: number;
  method: 'email' | 'portal' | 'letter' | 'other';
  referenceNumber?: string;
  content: string;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
}

  const [regulatoryNotifications, setRegulatoryNotifications] = useState<RegulatoryNotification[]>([]);
  const [selectedBreach, setSelectedBreach] = useState<BreachReport | null>(null);
  
  // This effect runs only on the client side after hydration
  useEffect(() => {
    setIsClient(true);
    
    // Load sample data for demo purposes
    const sampleBreaches: BreachReport[] = [
      {
        id: uuidv4(),
        title: 'Customer Database Unauthorized Access',
        description: 'Unauthorized access to customer database detected through suspicious login patterns',
        category: 'unauthorized_access',
        discoveredAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
        reportedAt: Date.now() - 4 * 24 * 60 * 60 * 1000, // 4 days ago
        reporter: {
          name: 'John Smith',
          email: 'john@example.com',
          department: 'IT Security'
        },
        affectedSystems: ['customer_database', 'user_accounts'],
        dataTypes: ['name', 'email', 'phone', 'address'],
        estimatedAffectedSubjects: 1200,
        status: 'ongoing',
        initialActions: 'Access blocked, passwords reset, system isolated for investigation'
      },
      {
        id: uuidv4(),
        title: 'Employee Email Phishing Incident',
        description: 'Several employees clicked on phishing links potentially exposing credentials',
        category: 'phishing',
        discoveredAt: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
        reportedAt: Date.now() - 9 * 24 * 60 * 60 * 1000, // 9 days ago
        reporter: {
          name: 'Jane Doe',
          email: 'jane@example.com',
          department: 'HR'
        },
        affectedSystems: ['email_system', 'employee_accounts'],
        dataTypes: ['email credentials'],
        estimatedAffectedSubjects: 0, // No confirmed data exposure
        status: 'resolved',
        initialActions: 'Password resets, email scanning, blocking of malicious domains'
      },
      {
        id: uuidv4(),
        title: 'Lost Company Laptop',
        description: 'Employee reported company laptop lost during business travel',
        category: 'device_loss',
        discoveredAt: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
        reportedAt: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
        reporter: {
          name: 'Robert Johnson',
          email: 'robert@example.com',
          department: 'Sales'
        },
        affectedSystems: ['laptop_device', 'company_data'],
        dataTypes: ['name', 'email', 'project data'],
        estimatedAffectedSubjects: 50,
        status: 'resolved',
        initialActions: 'Remote wipe initiated, account passwords changed'
      }
    ];
    
    setBreaches(sampleBreaches);
  }, []);

  const handleSubmitBreach = (data: { 
    title: string; 
    description: string; 
    category?: string;
    reporter?: { 
      name?: string; 
      email?: string; 
      department?: string; 
    };
    affectedSystems?: string[];
    dataTypes?: string[];
    estimatedAffectedSubjects?: number;
    initialActions?: string;
  }) => {
    const newBreach: BreachReport = {
      id: uuidv4(),
      title: data.title,
      description: data.description,
      category: data.category || 'other',
      discoveredAt: Date.now(),
      reportedAt: Date.now(),
      reporter: {
        name: data.reporter?.name || 'Anonymous',
        email: data.reporter?.email || 'anonymous@example.com',
        department: data.reporter?.department || 'Unknown'
      },
      affectedSystems: data.affectedSystems || [],
      dataTypes: data.dataTypes || [],
      estimatedAffectedSubjects: data.estimatedAffectedSubjects || 0,
      status: 'ongoing',
      initialActions: data.initialActions || ''
    };

    setBreaches((prev) => [newBreach, ...prev]);
    setActiveTab('register');
  };

  const handleUpdateBreach = (breachId: string, updates: Partial<BreachReport>) => {
    setBreaches((prev) =>
      prev.map((breach) => {
        if (breach.id === breachId) {
          return {
            ...breach,
            ...updates
          };
        }
        return breach;
      })
    );
  };

  const handleSelectBreach = (breachId: string) => {
    const breach = breaches.find((b) => b.id === breachId);
    setSelectedBreach(breach || null);
    setActiveTab('assessment');
  };

  // Add a function to handle regulatory notifications
  const handleGenerateReport = (breachId: string) => {
    if (!selectedBreach) return;
    
    // Create a sample regulatory notification based on the breach
    const newNotification: RegulatoryNotification = {
      id: uuidv4(),
      breachId: breachId,
      sentAt: Date.now(),
      method: 'email',
      content: `Notification regarding breach: ${selectedBreach.title}`,
      referenceNumber: `REF-${Date.now().toString().substring(0, 8)}`
    };
    
    // Add to notifications list
    setRegulatoryNotifications(prev => [...prev, newNotification]);
    
    // Update breach status
    handleUpdateBreach(breachId, { status: 'contained' }); // Using a valid status from the BreachReport type
  };

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href="/ndpr-demos" className="text-blue-600 hover:underline">
          ← Back to NDPR Demos
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-8">Breach Management Demo</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="notification">Breach Notification</TabsTrigger>
          <TabsTrigger value="register">Breach Register</TabsTrigger>
          <TabsTrigger value="assessment">Breach Assessment</TabsTrigger>
        </TabsList>
        
        <TabsContent value="notification" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Breach Notification Form</CardTitle>
              <CardDescription>
                This form is used to report and document data breaches within your organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BreachReportForm
                onSubmit={(data: any) => {
                  // Transform the form data to match the expected format
                  const transformedData = {
                    title: data.title,
                    description: data.description,
                    category: 'other', // Default category
                    reporter: {
                      name: 'Demo User',
                      email: 'user@example.com',
                      department: 'IT'
                    },
                    affectedSystems: [],
                    dataTypes: data.dataCategories,
                    estimatedAffectedSubjects: data.affectedDataSubjects,
                    initialActions: data.mitigationSteps.join('; ')
                  };
                  handleSubmitBreach(transformedData);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="register" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Breach Register</CardTitle>
              <CardDescription>
                This component maintains a register of all data breaches and their current status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BreachNotificationManager
                onSubmit={(data: any) => {
                  console.log('Breach notification data:', data);
                }}
              />
              
              {/* Display breaches manually */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Breach Register ({breaches.length} total)</h3>
                <div className="space-y-4">
                  {breaches.map((breach) => (
                    <div key={breach.id} className="border rounded-lg p-4">
                      <h4 className="font-medium">{breach.title}</h4>
                      <p className="text-gray-600 text-sm">{breach.description}</p>
                      <div className="mt-2 flex justify-between items-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          breach.status === 'ongoing' ? 'bg-red-100 text-red-800' :
                          breach.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {breach.status}
                        </span>
                        <button 
                          onClick={() => handleSelectBreach(breach.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="assessment" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Breach Assessment</CardTitle>
              <CardDescription>
                This component helps assess the severity and impact of a data breach.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedBreach ? (
                <div className="space-y-8">
                  <BreachRiskAssessment
                    onSubmit={(data: any) => {
                      console.log('Risk assessment data:', data);
                      // Simulate creating an assessment
                      const newAssessment: RiskAssessment = {
                        id: uuidv4(),
                        breachId: selectedBreach.id,
                        riskLevel: 'medium',
                        assessment: 'Moderate risk assessment completed',
                        mitigationMeasures: ['Implement additional security measures', 'Monitor affected systems'],
                        assessedAt: Date.now(),
                        assessor: 'Demo User'
                      };
                      setRiskAssessments(prev => [...prev, newAssessment]);
                    }}
                  />
                  
                  {/* Add Regulatory Report Generator component */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-medium mb-4">Generate Regulatory Report</h3>
                    <RegulatoryReportGenerator
                      onSubmit={(data: any) => {
                        console.log('Regulatory report data:', data);
                        handleGenerateReport(selectedBreach.id);
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p>No breach selected. Please select a breach from the Breach Register.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-10 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Implementation Notes</h2>
        <p className="mb-4">
          This demo showcases the breach management components from the NDPR Toolkit:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><code>BreachReportForm</code>: For reporting and documenting data breaches</li>
          <li><code>BreachRegister</code>: For maintaining a record of all data breaches</li>
          <li><code>BreachAssessment</code>: For assessing the severity and impact of breaches</li>
        </ul>
        <p className="mt-4">
          For detailed documentation, see the{' '}
          <Link href="/docs/components/breach-management" className="text-blue-600 hover:underline">
            Breach Management documentation
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
