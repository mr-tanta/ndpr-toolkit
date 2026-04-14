
'use client';

export default function Introduction() {
  return (
    <section id="introduction" className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Introduction</h2>
      <p className="mb-4">
        The Nigeria Data Protection Act (NDPA) 2023 requires organizations to report certain types of data breaches
        to the Nigeria Data Protection Commission (NDPC) within 72 hours of becoming aware of the breach.
        Organizations must also notify affected data subjects without undue delay. This guide will help you implement
        a comprehensive breach notification process using the NDPR Toolkit.
      </p>
      <div className="bg-primary/10 p-4 rounded-xl border border-border">
        <h4 className="text-primary font-medium mb-2">NDPA 2023 Breach Notification Requirements</h4>
        <p className="text-muted-foreground text-sm mb-2">
          Under the NDPA 2023, organizations must:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground text-sm">
          <li>Report breaches to the NDPC within 72 hours of becoming aware of the breach</li>
          <li>Notify affected data subjects without undue delay</li>
          <li>Maintain a record of all data breaches, including the facts of the breach, its effects, and remedial actions taken</li>
          <li>Include specific information in breach notifications, such as the nature of the breach, contact details of the Data Protection Officer, likely consequences of the breach, and measures taken to address the breach</li>
        </ul>
      </div>
    </section>
  );
}
