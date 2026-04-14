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
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary mr-2 text-sm font-bold">1</span>
            Data Governance and Accountability (NDPA Part III)
          </h3>
          <div className="bg-card border border-border rounded-xl p-6">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Appoint a Data Protection Officer (DPO) as required under the NDPA or designate someone responsible for data protection</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Develop and implement a data protection policy</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Create and maintain records of processing activities</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Conduct regular data protection training for staff</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Implement a data protection by design and by default approach</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Establish a process for conducting Data Protection Impact Assessments (DPIAs)</span>
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3 flex items-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary mr-2 text-sm font-bold">2</span>
            Lawful Basis for Processing (NDPA Section 25)
          </h3>
          <div className="bg-card border border-border rounded-xl p-6">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Identify and document the lawful basis for each processing activity per NDPA Section 25</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Implement a consent management system for processing based on consent</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Ensure consent is freely given, specific, informed, and unambiguous</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Maintain records of consent, including when and how it was obtained</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Implement a process for handling consent withdrawal</span>
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3 flex items-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary mr-2 text-sm font-bold">3</span>
            Privacy Notices and Transparency (NDPA Section 29)
          </h3>
          <div className="bg-card border border-border rounded-xl p-6">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Develop a clear and comprehensive privacy policy</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Ensure the privacy policy is easily accessible on your website</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Include all required information in the privacy policy (purposes of processing, categories of data, recipients, retention periods, data subject rights, etc.)</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Provide privacy notices at the point of data collection</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Use clear, plain language that is easy for data subjects to understand</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Regularly review and update privacy notices</span>
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3 flex items-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary mr-2 text-sm font-bold">4</span>
            Data Subject Rights (NDPA Part IV)
          </h3>
          <div className="bg-card border border-border rounded-xl p-6">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Implement a process for handling data subject access requests</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Establish procedures for rectifying inaccurate personal data</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Develop a process for erasing personal data when requested</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Implement mechanisms for restricting processing when requested</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Enable data portability for personal data provided by the data subject</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Establish a process for handling objections to processing</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Train staff on how to recognize and handle data subject requests</span>
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3 flex items-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary mr-2 text-sm font-bold">5</span>
            Data Security (NDPA Section 37)
          </h3>
          <div className="bg-card border border-border rounded-xl p-6">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Implement appropriate technical measures to protect personal data (encryption, access controls, etc.)</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Implement appropriate organizational measures (policies, procedures, training)</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Regularly test, assess, and evaluate the effectiveness of security measures</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Implement a process for regularly backing up personal data</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Establish procedures for restoring personal data in the event of a physical or technical incident</span>
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3 flex items-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary mr-2 text-sm font-bold">6</span>
            Breach Notification (NDPA Section 40)
          </h3>
          <div className="bg-card border border-border rounded-xl p-6">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Develop a data breach response plan</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Implement procedures for detecting, reporting, and investigating data breaches</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Establish a process for notifying the NDPC within 72 hours of becoming aware of a breach per NDPA Section 40</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Develop templates for breach notifications to the NDPC and affected data subjects</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Maintain a record of all data breaches, including the facts of the breach, its effects, and remedial actions taken</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Regularly test and update the breach response plan</span>
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3 flex items-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary mr-2 text-sm font-bold">7</span>
            Cross-Border Transfers (NDPA Section 41)
          </h3>
          <div className="bg-card border border-border rounded-xl p-6">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Identify all transfers of personal data outside Nigeria</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Assess whether recipient countries provide adequate protection for personal data</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Implement appropriate safeguards for international transfers (standard contractual clauses, binding corporate rules, etc.)</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Obtain NDPC approval for cross-border transfers where required under NDPA Section 41</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Maintain records of all international transfers</span>
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3 flex items-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary mr-2 text-sm font-bold">8</span>
            Data Protection Impact Assessment (NDPA Section 38)
          </h3>
          <div className="bg-card border border-border rounded-xl p-6">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Develop criteria for determining when a DPIA is required</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Establish a process for conducting DPIAs</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Create templates and guidance for conducting DPIAs</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Ensure DPIAs are conducted before beginning new high-risk processing activities</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Maintain records of all DPIAs conducted</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-border mr-2 flex-shrink-0 mt-0.5 text-muted-foreground text-xs">□</span>
                <span className="text-foreground">Implement measures to address risks identified in DPIAs</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-yellow-500/10 p-4 rounded-xl border border-border">
        <h4 className="text-yellow-600 dark:text-yellow-400 font-medium mb-2">Compliance is an Ongoing Process</h4>
        <p className="text-muted-foreground text-sm">
          Remember that compliance with the NDPA 2023 is not a one-time exercise but an ongoing process. Regularly review and update
          your data protection practices to ensure continued compliance, especially when introducing new processing activities
          or technologies. The NDPR Toolkit provides components and utilities to help you maintain compliance over time.
        </p>
      </div>
    </section>
  );
}
