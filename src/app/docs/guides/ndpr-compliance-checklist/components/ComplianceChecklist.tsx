'use client';

export default function ComplianceChecklist() {
  return (
    <section id="compliance-checklist" className="mb-8">
      <h2 className="text-2xl font-bold mb-4">NDPA 2023 Compliance Checklist</h2>
      <p className="mb-4">
        Use this comprehensive checklist to assess your organization&apos;s compliance with the NDPA 2023 and identify areas that need attention.
        The checklist is organized by key compliance areas, with specific action items for each area.
      </p>
      
      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-bold mb-3 flex items-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mr-2">1</span>
            Data Governance and Accountability (NDPA Part III)
          </h3>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Appoint a Data Protection Officer (DPO) as required under NDPA Section 31 or designate someone responsible for data protection</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Develop and implement a data protection policy</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Create and maintain records of processing activities</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Conduct regular data protection training for staff</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Implement a data protection by design and by default approach</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Establish a process for conducting Data Protection Impact Assessments (DPIAs)</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-bold mb-3 flex items-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mr-2">2</span>
            Lawful Basis for Processing (NDPA Section 25)
          </h3>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Identify and document the lawful basis for each processing activity per NDPA Section 25</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Implement a consent management system for processing based on consent</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Ensure consent is freely given, specific, informed, and unambiguous</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Maintain records of consent, including when and how it was obtained</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Implement a process for handling consent withdrawal</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-bold mb-3 flex items-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mr-2">3</span>
            Privacy Notices and Transparency (NDPA Section 29)
          </h3>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Develop a clear and comprehensive privacy policy</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Ensure the privacy policy is easily accessible on your website</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Include all required information in the privacy policy (purposes of processing, categories of data, recipients, retention periods, data subject rights, etc.)</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Provide privacy notices at the point of data collection</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Use clear, plain language that is easy for data subjects to understand</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Regularly review and update privacy notices</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-bold mb-3 flex items-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mr-2">4</span>
            Data Subject Rights (NDPA Part IV)
          </h3>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Implement a process for handling data subject access requests</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Establish procedures for rectifying inaccurate personal data</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Develop a process for erasing personal data when requested</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Implement mechanisms for restricting processing when requested</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Enable data portability for personal data provided by the data subject</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Establish a process for handling objections to processing</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Train staff on how to recognize and handle data subject requests</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-bold mb-3 flex items-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mr-2">5</span>
            Data Security (NDPA Section 39)
          </h3>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Implement appropriate technical measures to protect personal data (encryption, access controls, etc.)</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Implement appropriate organizational measures (policies, procedures, training)</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Regularly test, assess, and evaluate the effectiveness of security measures</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Implement a process for regularly backing up personal data</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Establish procedures for restoring personal data in the event of a physical or technical incident</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-bold mb-3 flex items-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mr-2">6</span>
            Breach Notification (NDPA Section 40)
          </h3>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Develop a data breach response plan</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Implement procedures for detecting, reporting, and investigating data breaches</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Establish a process for notifying the NDPC within 72 hours of becoming aware of a breach per NDPA Section 40</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Develop templates for breach notifications to the NDPC and affected data subjects</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Maintain a record of all data breaches, including the facts of the breach, its effects, and remedial actions taken</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Regularly test and update the breach response plan</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-bold mb-3 flex items-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mr-2">7</span>
            Cross-Border Transfers (NDPA Section 41)
          </h3>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Identify all transfers of personal data outside Nigeria</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Assess whether recipient countries provide adequate protection for personal data</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Implement appropriate safeguards for international transfers (standard contractual clauses, binding corporate rules, etc.)</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Obtain NDPC approval for cross-border transfers where required under NDPA Section 41</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Maintain records of all international transfers</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-bold mb-3 flex items-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mr-2">8</span>
            Data Protection Impact Assessment (NDPA Section 36)
          </h3>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Develop criteria for determining when a DPIA is required</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Establish a process for conducting DPIAs</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Create templates and guidance for conducting DPIAs</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Ensure DPIAs are conducted before beginning new high-risk processing activities</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Maintain records of all DPIAs conducted</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0 mt-0.5">□</span>
                <span>Implement measures to address risks identified in DPIAs</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md">
        <h4 className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">Compliance is an Ongoing Process</h4>
        <p className="text-yellow-700 dark:text-yellow-300 text-sm">
          Remember that compliance with the NDPA 2023 is not a one-time exercise but an ongoing process. Regularly review and update
          your data protection practices to ensure continued compliance, especially when introducing new processing activities
          or technologies. The NDPR Toolkit provides components and utilities to help you maintain compliance over time.
        </p>
      </div>
    </section>
  );
}
