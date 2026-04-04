'use client';

import { Card, CardContent } from '@/components/ui/Card';

export default function BestPractices() {
  return (
    <section id="best-practices" className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
      <p className="mb-4">
        Implementing an effective breach notification process requires more than just the right tools. 
        Here are some best practices to ensure your process is robust and compliant with the NDPA 2023:
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-2">Prepare in Advance</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              don&apos;t wait for a breach to occur before developing your response plan. Have templates, 
              procedures, and roles defined in advance so you can respond quickly when a breach happens.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-2">Train Your Team</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Ensure that all staff members know how to identify and report a potential data breach. 
              Conduct regular training sessions and drills to keep the breach response process fresh in everyone&apos;s minds.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-2">Document Everything</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Maintain detailed records of all breaches, including those that don&apos;t require notification. 
              Document the facts of the breach, its effects, and the remedial actions taken. This is a requirement under the NDPA 2023.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-2">Establish Clear Criteria</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Develop clear criteria for determining when a breach requires notification to the NDPC and/or data subjects. 
              This helps ensure consistent decision-making and compliance with the NDPA 2023.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-2">Involve Legal Counsel</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Involve legal counsel in the development of your breach notification process and in the review of 
              notifications before they are sent. This helps ensure that your notifications meet legal requirements.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-2">Regular Testing</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Regularly test your breach notification process through tabletop exercises or simulations. 
              This helps identify and address any weaknesses in your process before a real breach occurs.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-2">Learn from Incidents</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              After each breach, conduct a post-incident review to identify lessons learned and opportunities for improvement. 
              Update your breach notification process based on these insights.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-2">Maintain Contact Information</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Keep up-to-date contact information for the NDPC, your Data Protection Officer, legal counsel, 
              IT security team, and other key stakeholders who need to be involved in the breach response process.
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
        <h3 className="text-red-800 dark:text-red-200 font-bold mb-2">Common Pitfalls to Avoid</h3>
        <ul className="list-disc pl-6 text-red-700 dark:text-red-300 text-sm">
          <li>
            <strong>Delayed Response:</strong> Failing to act quickly once a breach is detected. Remember, the 72-hour clock 
            starts ticking as soon as you become aware of the breach.
          </li>
          <li>
            <strong>Incomplete Notifications:</strong> Omitting required information from breach notifications, such as the 
            nature of the breach, likely consequences, or measures taken.
          </li>
          <li>
            <strong>Inadequate Documentation:</strong> Failing to maintain detailed records of the breach and your response, 
            which are required under the NDPA 2023.
          </li>
          <li>
            <strong>Poor Communication:</strong> Not communicating clearly with affected data subjects about the breach and 
            what they should do to protect themselves.
          </li>
          <li>
            <strong>Neglecting Follow-up:</strong> Failing to follow up on remedial actions or to provide additional information 
            to the NDPC as it becomes available.
          </li>
        </ul>
      </div>
    </section>
  );
}
