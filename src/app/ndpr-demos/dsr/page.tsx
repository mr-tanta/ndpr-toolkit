'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { DSRRequestForm, DSRDashboard, DSRTracker } from '@tantainnovative/ndpr-toolkit';
import type { DSRRequest, DSRStatus, DSRType, DSRRequestType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export default function DSRDemoPage() {
  const [requests, setRequests] = useState<DSRRequest[]>([]);
  const [activeTab, setActiveTab] = useState('request-form');
  const [isClient, setIsClient] = useState(false);
  
  // Define request types
  const requestTypes: DSRRequestType[] = [
    {
      id: 'access',
      name: 'Access Request',
      description: 'Request to access your personal data',
      estimatedCompletionTime: 30,
      requiresAdditionalInfo: false
    },
    {
      id: 'erasure',
      name: 'Erasure Request',
      description: 'Request to delete your personal data',
      estimatedCompletionTime: 45,
      requiresAdditionalInfo: false
    },
    {
      id: 'rectification',
      name: 'Rectification Request',
      description: 'Request to correct your personal data',
      estimatedCompletionTime: 15,
      requiresAdditionalInfo: true
    },
    {
      id: 'restriction',
      name: 'Restriction Request',
      description: 'Request to restrict processing of your personal data',
      estimatedCompletionTime: 20,
      requiresAdditionalInfo: true
    }
  ];

  // This effect runs only on the client side after hydration
  useEffect(() => {
    setIsClient(true);
    
    // Load sample data for demo purposes
    const sampleRequests: DSRRequest[] = [
      {
        id: uuidv4(),
        type: 'access' as DSRType,
        status: 'pending' as DSRStatus,
        createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
        updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
        dueDate: Date.now() + 12 * 24 * 60 * 60 * 1000, // Due in 12 days
        subject: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890'
        },
        description: 'I want to access all my personal data stored in your systems.'
      },
      {
        id: uuidv4(),
        type: 'erasure' as DSRType,
        status: 'in-progress' as DSRStatus,
        createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
        updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
        dueDate: Date.now() + 5 * 24 * 60 * 60 * 1000, // Due in 5 days
        subject: {
          name: 'Jane Smith',
          email: 'jane@example.com'
        },
        description: 'Please delete all my personal data from your systems.'
      },
      {
        id: uuidv4(),
        type: 'rectification' as DSRType,
        status: 'completed' as DSRStatus,
        createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
        updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
        completedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
        dueDate: Date.now() - 2 * 24 * 60 * 60 * 1000, // Due 2 days ago (but completed)
        subject: {
          name: 'Bob Johnson',
          email: 'bob@example.com'
        },
        description: 'My address is incorrect. Please update it to 123 Main St.'
      },
      {
        id: uuidv4(),
        type: 'restriction' as DSRType,
        status: 'pending' as DSRStatus,
        createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
        updatedAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
        dueDate: Date.now() - 5 * 24 * 60 * 60 * 1000, // Due 5 days ago (overdue)
        subject: {
          name: 'Alice Williams',
          email: 'alice@example.com',
          phone: '9876543210'
        },
        description: 'I want to restrict processing of my personal data for marketing purposes.'
      }
    ];
    
    setRequests(sampleRequests);
  }, []);

  interface SubmitData {
    requestType: string;
    dataSubject: {
      fullName: string;
      email: string;
      phone?: string;
    };
    additionalInfo?: {
      description?: string;
    };
  }

  const handleSubmitRequest = (data: Record<string, unknown>) => {
    const req = data as unknown as SubmitData;
    console.log('Received form data:', data);
    
    // Calculate due date based on request type (30 days for access, 15 days for erasure, etc.)
    let dueDays = 30; // Default to 30 days
    if (req.requestType === 'erasure') dueDays = 15;
    if (req.requestType === 'rectification') dueDays = 10;
    if (req.requestType === 'restriction') dueDays = 20;
    
    const newRequest: DSRRequest = {
      id: uuidv4(),
      type: req.requestType as DSRType,
      status: 'pending' as DSRStatus,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      dueDate: Date.now() + (dueDays * 24 * 60 * 60 * 1000), // Set due date based on request type
      subject: {
        name: req.dataSubject.fullName,
        email: req.dataSubject.email,
        phone: req.dataSubject.phone
      },
      description: req.additionalInfo?.description || 'No description provided'
    };

    setRequests((prev) => [newRequest, ...prev]);
    setActiveTab('dashboard');
  };

  const handleUpdateStatus = (requestId: string, status: DSRStatus) => {
    setRequests((prev) =>
      prev.map((request) => {
        if (request.id === requestId) {
          return {
            ...request,
            status,
            updatedAt: Date.now(),
            ...(status === 'completed' ? { completedAt: Date.now() } : {})
          };
        }
        return request;
      })
    );
  };

  const handleSelectRequest = (requestId: string) => {
    // In a real application, you might want to show detailed information
    // about the selected request or perform other actions
    console.log(`Request selected: ${requestId}`);
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
      
      <h1 className="text-3xl font-bold mb-8">Data Subject Rights Demo</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="request-form">DSR Request Form</TabsTrigger>
          <TabsTrigger value="dashboard">DSR Dashboard</TabsTrigger>
          <TabsTrigger value="tracker">DSR Tracker</TabsTrigger>
        </TabsList>
        
        <TabsContent value="request-form" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Subject Request Form</CardTitle>
              <CardDescription>
                This form allows data subjects to submit requests to exercise their rights under NDPR.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DSRRequestForm
                onSubmit={(data: any) => {
                  // Transform the form data to match what the demo expects
                  const transformedData = {
                    requestType: data.requestType,
                    dataSubject: {
                      fullName: data.name,
                      email: data.email,
                      phone: undefined
                    },
                    additionalInfo: {
                      description: data.details
                    }
                  };
                  handleSubmitRequest(transformedData);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="dashboard" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Subject Request Dashboard</CardTitle>
              <CardDescription>
                This dashboard allows administrators to manage and respond to data subject requests.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DSRDashboard
                onSubmit={(data: any) => {
                  console.log('DSR Dashboard data:', data);
                }}
              />
              
              {/* Manual dashboard display */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">DSR Management Dashboard ({requests.length} requests)</h3>
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{request.type.charAt(0).toUpperCase() + request.type.slice(1)} Request</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          request.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">From: {request.subject.name} ({request.subject.email})</p>
                      <p className="text-sm text-gray-600 mb-3">{request.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Created: {new Date(request.createdAt).toLocaleDateString()}
                          {request.status !== 'completed' && (
                            <>, Due: {new Date(request.dueDate).toLocaleDateString()}</>
                          )}
                        </span>
                        <div className="flex gap-2">
                          {request.status !== 'completed' && (
                            <>
                              <button 
                                onClick={() => handleUpdateStatus(request.id, 'in-progress')}
                                className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                Start Processing
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(request.id, 'completed')}
                                className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                Complete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tracker" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Subject Request Tracker</CardTitle>
              <CardDescription>
                This component provides a simplified view for tracking DSR requests.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DSRTracker
                onSubmit={(data: any) => {
                  console.log('DSR Tracker data:', data);
                }}
              />
              
              {/* Manual tracker display */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Request Tracker</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Request Type</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Requester</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Created</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Due Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {requests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">
                            {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {request.subject.name}<br/>
                            <span className="text-xs text-gray-500">{request.subject.email}</span>
                          </td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              request.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                              request.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {new Date(request.dueDate).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-10 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Implementation Notes</h2>
        <p className="mb-4">
          This demo showcases the DSR components from the NDPR Toolkit:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><code>DSRRequestForm</code>: For collecting and validating data subject requests</li>
          <li><code>DSRDashboard</code>: For managing and processing requests</li>
          <li><code>DSRTracker</code>: For tracking request status and metrics</li>
        </ul>
        <p className="mt-4">
          For detailed documentation, see the{' '}
          <Link href="/docs/components/data-subject-rights" className="text-blue-600 hover:underline">
            DSR documentation
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
