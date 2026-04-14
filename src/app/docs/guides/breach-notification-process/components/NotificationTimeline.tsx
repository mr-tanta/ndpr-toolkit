'use client';

export default function NotificationTimeline() {
  return (
    <section id="notification-timeline" className="mb-8">
      <h2 className="text-2xl font-bold mb-4">72-Hour Notification Timeline</h2>
      <p className="mb-4">
        The 72-hour deadline for notifying the NDPC about a data breach begins from the moment you become aware of the breach.
        This timeline is tight, so having a well-defined process in place is essential. Here&apos;s a recommended timeline for
        handling breaches using the NDPR Toolkit components:
      </p>

      <div className="relative border-l-2 border-primary pl-8 pb-8 space-y-10">
        <div className="relative">
          <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">1</span>
          </div>
          <h3 className="text-xl font-bold">Hour 0-4: Initial Response</h3>
          <p className="text-muted-foreground mt-2">
            As soon as a breach is detected or reported, the initial response should focus on:
          </p>
          <ul className="list-disc pl-6 mt-2 text-muted-foreground">
            <li>Documenting the breach using the BreachReportForm component</li>
            <li>Assembling the breach response team</li>
            <li>Implementing immediate containment measures</li>
            <li>Preserving evidence for investigation</li>
            <li>Notifying key stakeholders within the organization</li>
          </ul>
        </div>

        <div className="relative">
          <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">2</span>
          </div>
          <h3 className="text-xl font-bold">Hour 4-24: Risk Assessment</h3>
          <p className="text-muted-foreground mt-2">
            Once the initial response is underway, conduct a risk assessment to determine the severity of the breach:
          </p>
          <ul className="list-disc pl-6 mt-2 text-muted-foreground">
            <li>Use the BreachRiskAssessment component to evaluate the risk to individuals</li>
            <li>Determine if the breach is notifiable to the NDPC and affected data subjects</li>
            <li>Continue containment and investigation efforts</li>
            <li>Begin preparing notification drafts if required</li>
          </ul>
        </div>

        <div className="relative">
          <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">3</span>
          </div>
          <h3 className="text-xl font-bold">Hour 24-48: Notification Preparation</h3>
          <p className="text-muted-foreground mt-2">
            If the breach requires notification, prepare the necessary documents and communications:
          </p>
          <ul className="list-disc pl-6 mt-2 text-muted-foreground">
            <li>Use the RegulatoryReportGenerator to prepare the NDPC notification</li>
            <li>Draft data subject notifications if required</li>
            <li>Have notifications reviewed by legal and management</li>
            <li>Continue investigation and remediation efforts</li>
          </ul>
        </div>

        <div className="relative">
          <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">4</span>
          </div>
          <h3 className="text-xl font-bold">Hour 48-72: Notification Submission</h3>
          <p className="text-muted-foreground mt-2">
            In the final phase before the deadline, submit notifications and document the process:
          </p>
          <ul className="list-disc pl-6 mt-2 text-muted-foreground">
            <li>Submit the notification to the NDPC</li>
            <li>Begin notifying affected data subjects if required</li>
            <li>Document all notification activities using the BreachNotificationManager</li>
            <li>Continue remediation and post-breach activities</li>
          </ul>
        </div>
      </div>

      <div className="bg-yellow-500/10 p-4 rounded-xl border border-border mt-6">
        <h4 className="text-yellow-600 dark:text-yellow-400 font-medium mb-2">Important Note on the 72-Hour Deadline</h4>
        <p className="text-muted-foreground text-sm">
          The 72-hour deadline applies even if you don&apos;t have all the details about the breach. If you can&apos;t provide
          complete information within 72 hours, you should still make the initial notification with the information
          available and follow up with additional details as they become available. The NDPR Toolkit&apos;s
          RegulatoryReportGenerator component supports both initial and supplementary notifications.
        </p>
      </div>
    </section>
  );
}
