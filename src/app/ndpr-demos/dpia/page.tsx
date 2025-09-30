'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { DPIAQuestionnaire } from '@/index';
import type { DPIAQuestion, DPIAResult } from '@/types';

export default function DPIADemoPage() {
  const [activeTab, setActiveTab] = useState('form');
  const [isClient, setIsClient] = useState(false);
  // Removed unused state variables
  const [assessmentData, setAssessmentData] = useState<Record<string, unknown>>({});
  const [assessmentResult, setAssessmentResult] = useState<DPIAResult | null>(null);
  
  // Define DPIA questions
  const dpiaQuestions: DPIAQuestion[] = [
    {
      id: 'purpose',
      text: 'What is the purpose of the data processing?',
      guidance: 'Describe why you are collecting and processing personal data',
      type: 'text',
      required: true
    },
    {
      id: 'dataTypes',
      text: 'What types of personal data will be processed?',
      guidance: 'Select all types of personal data that will be processed',
      type: 'checkbox',
      options: [
        { value: 'basic', label: 'Basic personal information (name, contact details)' },
        { value: 'identification', label: 'Identification numbers (ID, passport)' },
        { value: 'financial', label: 'Financial information (bank details, payment info)' },
        { value: 'location', label: 'Location data' },
        { value: 'health', label: 'Health data' },
        { value: 'biometric', label: 'Biometric data' },
        { value: 'children', label: 'Data relating to children' }
      ],
      required: true
    },
    {
      id: 'dataVolume',
      text: 'What is the volume of data being processed?',
      guidance: 'Estimate the number of data subjects affected',
      type: 'radio',
      options: [
        { value: 'small', label: 'Small (less than 1,000 individuals)' },
        { value: 'medium', label: 'Medium (1,000 to 10,000 individuals)' },
        { value: 'large', label: 'Large (10,000 to 100,000 individuals)' },
        { value: 'veryLarge', label: 'Very large (more than 100,000 individuals)' }
      ],
      required: true
    },
    {
      id: 'legalBasis',
      text: 'What is the legal basis for processing?',
      guidance: 'Select the legal basis under which you are processing data',
      type: 'select',
      options: [
        { value: 'consent', label: 'Consent of the data subject' },
        { value: 'contract', label: 'Performance of a contract' },
        { value: 'legalObligation', label: 'Compliance with a legal obligation' },
        { value: 'vitalInterests', label: 'Protection of vital interests' },
        { value: 'publicInterest', label: 'Performance of a task in the public interest' },
        { value: 'legitimateInterests', label: 'Legitimate interests' }
      ],
      required: true
    },
    {
      id: 'dataRetention',
      text: 'How long will the data be retained?',
      guidance: 'Specify the retention period for the personal data',
      type: 'text',
      required: true
    },
    {
      id: 'securityMeasures',
      text: 'What security measures are in place to protect the data?',
      guidance: 'Describe the technical and organizational measures to ensure data security',
      type: 'textarea',
      required: true
    },
    {
      id: 'dataTransfers',
      text: 'Will data be transferred outside Nigeria?',
      guidance: 'Indicate if data will be transferred to countries outside Nigeria',
      type: 'radio',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ],
      required: true
    },
    {
      id: 'riskAssessment',
      text: 'Have you conducted a risk assessment?',
      guidance: 'Indicate if you have assessed the risks to data subjects',
      type: 'radio',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'inProgress', label: 'In progress' }
      ],
      required: true
    }
  ];

  // This effect runs only on the client side after hydration
  useEffect(() => {
    setIsClient(true);
    
    // Sample data for demonstration
    const sampleData = {
      purpose: 'Customer data processing for service delivery',
      dataTypes: ['basic', 'financial'],
      dataVolume: 'medium',
      legalBasis: 'contract',
      dataRetention: '3 years after service termination',
      securityMeasures: 'Encryption, access controls, regular security audits',
      dataTransfers: 'no',
      riskAssessment: 'yes'
    };
    
    setAssessmentData(sampleData);
    
    // Generate a mock assessment result
    const mockResult: DPIAResult = {
      id: 'dpia-' + Date.now(),
      title: 'DPIA for Demo Project',
      processingDescription: sampleData.purpose || 'Data processing activity',
      startedAt: Date.now() - 86400000, // 1 day ago
      completedAt: Date.now(),
      assessor: {
        name: 'Demo User',
        role: 'Data Protection Officer',
        email: 'dpo@example.com'
      },
      answers: sampleData,
      risks: [
        {
          id: 'risk-1',
          description: 'Unauthorized access to personal data',
          likelihood: 3,
          impact: 4,
          score: 12,
          level: 'high',
          mitigationMeasures: [
            'Implement strong access controls',
            'Regular security audits',
            'Encryption of sensitive data'
          ],
          mitigated: true,
          residualScore: 6,
          relatedQuestionIds: ['securityMeasures']
        },
        {
          id: 'risk-2',
          description: 'Data retention beyond necessary period',
          likelihood: 2,
          impact: 3,
          score: 6,
          level: 'medium',
          mitigationMeasures: [
            'Implement automated data deletion',
            'Regular data retention audits'
          ],
          mitigated: false,
          relatedQuestionIds: ['dataRetention']
        }
      ],
      overallRiskLevel: 'medium',
      canProceed: true,
      conclusion: 'The processing can proceed with the implementation of the recommended mitigation measures.',
      recommendations: [
        'Document all security measures implemented',
        'Conduct regular reviews of the DPIA',
        'Ensure all staff are trained on data protection'
      ],
      reviewDate: Date.now() + 31536000000, // 1 year from now
      version: '1.0'
    };
    
    setAssessmentResult(mockResult);
  }, [isClient]);

  const handleAssessmentComplete = (assessment: Record<string, unknown>) => {
    setAssessmentData(assessment);
    setActiveTab('assessment');
    
    // In a real application, you would analyze the data and generate a real assessment result
    console.log('Assessment data submitted:', assessment);
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
      
      <h1 className="text-3xl font-bold mb-8">Data Protection Impact Assessment Demo</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="form">DPIA Form</TabsTrigger>
          <TabsTrigger value="assessment">DPIA Assessment</TabsTrigger>
          <TabsTrigger value="report">DPIA Report</TabsTrigger>
        </TabsList>
        
        <TabsContent value="form" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>DPIA Form</CardTitle>
              <CardDescription>
                This form helps you conduct a Data Protection Impact Assessment for high-risk processing activities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DPIAQuestionnaire
                questions={dpiaQuestions}
                onSubmit={(answers: any, projectName: any) => {
                  console.log('DPIA Assessment completed:', { answers, projectName });
                  handleAssessmentComplete(answers);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="assessment" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>DPIA Assessment</CardTitle>
              <CardDescription>
                This component displays the assessment results and risk analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assessmentResult ? (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4">DPIA Assessment Results</h2>
                    <p className="mb-6">Review the risk assessment and recommended actions for your data processing activity.</p>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">Risk Assessment</h3>
                      <div className="border rounded-md p-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-medium">Overall Risk Level:</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            assessmentResult.overallRiskLevel === 'low' ? 'bg-green-100 text-green-800' :
                            assessmentResult.overallRiskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            assessmentResult.overallRiskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {assessmentResult.overallRiskLevel.charAt(0).toUpperCase() + assessmentResult.overallRiskLevel.slice(1)}
                          </span>
                        </div>
                        
                        <h4 className="font-medium mb-2">Identified Risks:</h4>
                        <ul className="space-y-4">
                          {assessmentResult.risks.map(risk => (
                            <li key={risk.id} className="border-b pb-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{risk.description}</p>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Risk Level: <span className={`font-medium ${
                                      risk.level === 'low' ? 'text-green-600' :
                                      risk.level === 'medium' ? 'text-yellow-600' :
                                      risk.level === 'high' ? 'text-orange-600' :
                                      'text-red-600'
                                    }`}>
                                      {risk.level.charAt(0).toUpperCase() + risk.level.slice(1)}
                                    </span>
                                  </p>
                                </div>
                                <div className="text-center px-3 py-1 bg-gray-100 rounded-md">
                                  <div className="text-lg font-bold">{risk.score}</div>
                                  <div className="text-xs">Score</div>
                                </div>
                              </div>
                              {risk.mitigationMeasures && risk.mitigationMeasures.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-sm font-medium">Mitigation Measures:</p>
                                  <ul className="list-disc pl-5 text-sm">
                                    {risk.mitigationMeasures.map((measure, idx) => (
                                      <li key={idx}>{measure}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {assessmentResult.recommendations?.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p>No assessment data available. Please complete the DPIA form first.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="report" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>DPIA Report</CardTitle>
              <CardDescription>
                This component generates a comprehensive DPIA report for documentation and compliance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assessmentResult && assessmentData ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold mb-6">Data Protection Impact Assessment Report</h2>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Organization Information</h3>
                    <div className="border rounded-md p-4">
                      <p><strong>Organization:</strong> Demo Company Ltd.</p>
                      <p><strong>Address:</strong> 123 Business Street, Lagos, Nigeria</p>
                      <p><strong>Contact Email:</strong> privacy@democompany.com</p>
                      <p><strong>Contact Phone:</strong> +234 123 456 7890</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">DPIA Information</h3>
                    <div className="border rounded-md p-4">
                      <p><strong>Title:</strong> {assessmentResult.title}</p>
                      <p><strong>Processing Description:</strong> {assessmentResult.processingDescription}</p>
                      <p><strong>Started:</strong> {new Date(assessmentResult.startedAt).toLocaleDateString()}</p>
                      <p><strong>Completed:</strong> {assessmentResult.completedAt ? new Date(assessmentResult.completedAt).toLocaleDateString() : 'Not completed'}</p>
                      <p><strong>Assessor:</strong> {assessmentResult.assessor.name} ({assessmentResult.assessor.role})</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Risk Assessment</h3>
                    <div className="border rounded-md p-4">
                      <p className="mb-2">
                        <strong>Overall Risk Level: </strong>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          assessmentResult.overallRiskLevel === 'low' ? 'bg-green-100 text-green-800' :
                          assessmentResult.overallRiskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          assessmentResult.overallRiskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {assessmentResult.overallRiskLevel.charAt(0).toUpperCase() + assessmentResult.overallRiskLevel.slice(1)}
                        </span>
                      </p>
                      
                      <p className="mb-2"><strong>Can Processing Proceed:</strong> {assessmentResult.canProceed ? 'Yes' : 'No'}</p>
                      
                      <p className="mb-2"><strong>Conclusion:</strong></p>
                      <p className="mb-4 pl-4 border-l-4 border-gray-300">{assessmentResult.conclusion}</p>
                      
                      <p className="font-medium mb-2">Identified Risks:</p>
                      <ul className="space-y-4">
                        {assessmentResult.risks.map(risk => (
                          <li key={risk.id} className="border-b pb-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{risk.description}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                  Risk Level: <span className={`font-medium ${
                                    risk.level === 'low' ? 'text-green-600' :
                                    risk.level === 'medium' ? 'text-yellow-600' :
                                    risk.level === 'high' ? 'text-orange-600' :
                                    'text-red-600'
                                  }`}>
                                    {risk.level.charAt(0).toUpperCase() + risk.level.slice(1)}
                                  </span>
                                </p>
                              </div>
                              <div className="text-center px-3 py-1 bg-gray-100 rounded-md">
                                <div className="text-lg font-bold">{risk.score}</div>
                                <div className="text-xs">Score</div>
                              </div>
                            </div>
                            {risk.mitigationMeasures && risk.mitigationMeasures.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm font-medium">Mitigation Measures:</p>
                                <ul className="list-disc pl-5 text-sm">
                                  {risk.mitigationMeasures.map((measure, idx) => (
                                    <li key={idx}>{measure}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
                    <div className="border rounded-md p-4">
                      <ul className="list-disc pl-5 space-y-1">
                        {assessmentResult.recommendations?.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-4">
                    <button 
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => window.print()}
                    >
                      Print Report
                    </button>
                    <button 
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(assessmentResult, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `dpia-report-${new Date().toISOString().split('T')[0]}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                    >
                      Download Report
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p>No assessment data available. Please complete the DPIA form and assessment first.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-10 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Implementation Notes</h2>
        <p className="mb-4">
          This demo showcases the DPIA components from the NDPR Toolkit:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><code>DPIAForm</code>: For collecting information about data processing activities</li>
          <li><code>DPIAAssessment</code>: For analyzing risks and providing recommendations</li>
          <li><code>DPIAReport</code>: For generating comprehensive DPIA reports</li>
        </ul>
        <p className="mt-4">
          For detailed documentation, see the{' '}
          <Link href="/docs/components/dpia" className="text-blue-600 hover:underline">
            DPIA documentation
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
