'use client';

export default function Introduction() {
  return (
    <section id="introduction" className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Introduction</h2>
      <p className="mb-4">
        The Nigeria Data Protection Act (NDPA) 2023 is Nigeria&apos;s principal data protection legislation, signed into law
        in June 2023. The NDPA establishes the Nigeria Data Protection Commission (NDPC) as the regulatory body and
        aims to safeguard the rights of natural persons to data privacy, providing a framework for ensuring that
        organizations process personal data in a fair, lawful, and transparent manner.
      </p>
      <p className="mb-4">
        Compliance with the NDPA 2023 is not just a legal obligation but also a business imperative. Organizations that fail to
        comply with the NDPA may face significant penalties, including fines of up to 2% of annual gross revenue or
        ₦10 million, whichever is greater. Beyond the financial penalties, non-compliance can lead to reputational damage,
        loss of customer trust, and business disruption.
      </p>
      <div className="bg-primary/10 p-4 rounded-xl border border-border">
        <h4 className="text-primary font-medium mb-2">Who Must Comply with the NDPA 2023?</h4>
        <p className="text-muted-foreground text-sm mb-2">
          The NDPA 2023 applies to:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground text-sm">
          <li>All organizations that process the personal data of Nigerian residents</li>
          <li>Organizations that process personal data in Nigeria, regardless of the nationality of the data subjects</li>
          <li>Public and private sector organizations of all sizes</li>
          <li>Organizations based outside Nigeria that process the personal data of Nigerian residents</li>
        </ul>
      </div>
    </section>
  );
}
