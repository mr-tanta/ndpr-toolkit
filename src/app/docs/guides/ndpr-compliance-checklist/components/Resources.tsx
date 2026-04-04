'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function Resources() {
  return (
    <section id="resources" className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Additional Resources</h2>
      <p className="mb-4">
        To help you achieve and maintain NDPA 2023 compliance, here are some additional resources:
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">NDPA 2023 Full Text</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
              The complete text of the Nigeria Data Protection Act 2023.
            </p>
            <Button asChild variant="outline" size="sm">
              <a href="https://ndpc.gov.ng/" target="_blank" rel="noopener noreferrer">
                View Act
              </a>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">NDPC Implementation Guidelines</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
              Official guidance from the NDPC on implementing the NDPA 2023.
            </p>
            <Button asChild variant="outline" size="sm">
              <a href="https://ndpc.gov.ng/" target="_blank" rel="noopener noreferrer">
                View Guidelines
              </a>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">NDPC Website</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
              The official website of the Nigeria Data Protection Commission.
            </p>
            <Button asChild variant="outline" size="sm">
              <a href="https://ndpc.gov.ng/" target="_blank" rel="noopener noreferrer">
                Visit Website
              </a>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Data Protection Templates</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
              Downloadable templates for key data protection documents.
            </p>
            <Button asChild variant="outline" size="sm">
              <a href="/templates/data-protection" target="_blank" rel="noopener noreferrer">
                View Templates
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-3">Compliance Roadmap</h3>
        <p className="mb-3">
          Achieving NDPA 2023 compliance can seem daunting, but breaking it down into manageable steps can make the process more approachable. 
          Here&apos;s a suggested roadmap for your compliance journey:
        </p>
        
        <div className="relative border-l-2 border-blue-500 pl-8 pb-8 space-y-8">
          <div className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">1</span>
            </div>
            <h4 className="text-lg font-bold">Assessment</h4>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Begin by assessing your current data protection practices against the NDPA 2023 requirements. Use the compliance 
              checklist provided above to identify gaps and areas for improvement.
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">2</span>
            </div>
            <h4 className="text-lg font-bold">Planning</h4>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Develop a compliance plan based on your assessment. Prioritize high-risk areas and quick wins. 
              Assign responsibilities and set deadlines for implementation.
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">3</span>
            </div>
            <h4 className="text-lg font-bold">Implementation</h4>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Implement the necessary measures to address the gaps identified in your assessment. Use the NDPR Toolkit 
              components to implement key compliance features such as consent management, data subject rights handling, 
              and breach notification.
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">4</span>
            </div>
            <h4 className="text-lg font-bold">Documentation</h4>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Document your compliance efforts, including policies, procedures, and records of processing activities. 
              This documentation is essential for demonstrating compliance to regulators and stakeholders.
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">5</span>
            </div>
            <h4 className="text-lg font-bold">Training</h4>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Train staff on data protection principles, the NDPA 2023 requirements, and your organization&apos;s specific 
              policies and procedures. Ensure that everyone understands their role in maintaining compliance.
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">6</span>
            </div>
            <h4 className="text-lg font-bold">Monitoring and Review</h4>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Regularly monitor and review your compliance program to ensure it remains effective. Conduct periodic 
              audits, address any new compliance gaps, and update your practices as needed.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
        <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-2">Need Additional Help?</h4>
        <p className="text-blue-700 dark:text-blue-300 text-sm">
          If you need additional help with NDPA 2023 compliance, consider consulting with a data protection professional or legal expert
          who specializes in Nigerian data protection law. While the NDPR Toolkit provides valuable tools and guidance,
          professional advice can help ensure that your compliance program addresses your organization&apos;s specific needs and risks.
        </p>
      </div>
    </section>
  );
}
