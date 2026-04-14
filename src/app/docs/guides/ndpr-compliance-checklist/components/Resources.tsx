'use client';

export default function Resources() {
  return (
    <section id="resources" className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Additional Resources</h2>
      <p className="mb-4">
        To help you achieve and maintain NDPA 2023 compliance, here are some additional resources:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-medium text-foreground mb-2">NDPA 2023 Full Text</h3>
          <p className="text-muted-foreground text-sm mb-3">
            The complete text of the Nigeria Data Protection Act 2023.
          </p>
          <a
            href="https://ndpc.gov.ng/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-primary/10 transition-colors"
          >
            View Act
          </a>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-medium text-foreground mb-2">NDPC Implementation Guidelines</h3>
          <p className="text-muted-foreground text-sm mb-3">
            Official guidance from the NDPC on implementing the NDPA 2023.
          </p>
          <a
            href="https://ndpc.gov.ng/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-primary/10 transition-colors"
          >
            View Guidelines
          </a>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-medium text-foreground mb-2">NDPC Website</h3>
          <p className="text-muted-foreground text-sm mb-3">
            The official website of the Nigeria Data Protection Commission.
          </p>
          <a
            href="https://ndpc.gov.ng/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-primary/10 transition-colors"
          >
            Visit Website
          </a>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-medium text-foreground mb-2">Data Protection Templates</h3>
          <p className="text-muted-foreground text-sm mb-3">
            Downloadable templates for key data protection documents.
          </p>
          <a
            href="https://github.com/mr-tanta/ndpr-toolkit"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-primary/10 transition-colors"
          >
            View Templates
          </a>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-3">Compliance Roadmap</h3>
        <p className="mb-3">
          Achieving NDPA 2023 compliance can seem daunting, but breaking it down into manageable steps can make the process more approachable.
          Here&apos;s a suggested roadmap for your compliance journey:
        </p>

        <div className="relative border-l-2 border-primary pl-8 pb-8 space-y-8">
          <div className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">1</span>
            </div>
            <h4 className="text-lg font-bold text-foreground">Assessment</h4>
            <p className="text-muted-foreground mt-2">
              Begin by assessing your current data protection practices against the NDPA 2023 requirements. Use the compliance
              checklist provided above to identify gaps and areas for improvement.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">2</span>
            </div>
            <h4 className="text-lg font-bold text-foreground">Planning</h4>
            <p className="text-muted-foreground mt-2">
              Develop a compliance plan based on your assessment. Prioritize high-risk areas and quick wins.
              Assign responsibilities and set deadlines for implementation.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">3</span>
            </div>
            <h4 className="text-lg font-bold text-foreground">Implementation</h4>
            <p className="text-muted-foreground mt-2">
              Implement the necessary measures to address the gaps identified in your assessment. Use the NDPR Toolkit
              components to implement key compliance features such as consent management, data subject rights handling,
              and breach notification.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">4</span>
            </div>
            <h4 className="text-lg font-bold text-foreground">Documentation</h4>
            <p className="text-muted-foreground mt-2">
              Document your compliance efforts, including policies, procedures, and records of processing activities.
              This documentation is essential for demonstrating compliance to regulators and stakeholders.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">5</span>
            </div>
            <h4 className="text-lg font-bold text-foreground">Training</h4>
            <p className="text-muted-foreground mt-2">
              Train staff on data protection principles, the NDPA 2023 requirements, and your organization&apos;s specific
              policies and procedures. Ensure that everyone understands their role in maintaining compliance.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">6</span>
            </div>
            <h4 className="text-lg font-bold text-foreground">Monitoring and Review</h4>
            <p className="text-muted-foreground mt-2">
              Regularly monitor and review your compliance program to ensure it remains effective. Conduct periodic
              audits, address any new compliance gaps, and update your practices as needed.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-primary/10 p-4 rounded-xl border border-border">
        <h4 className="text-primary font-medium mb-2">Need Additional Help?</h4>
        <p className="text-muted-foreground text-sm">
          If you need additional help with NDPA 2023 compliance, consider consulting with a data protection professional or legal expert
          who specializes in Nigerian data protection law. While the NDPR Toolkit provides valuable tools and guidance,
          professional advice can help ensure that your compliance program addresses your organization&apos;s specific needs and risks.
        </p>
      </div>
    </section>
  );
}
