'use client';

export default function Introduction() {
  return (
    <section id="introduction" className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Introduction</h2>
      <p className="mb-4">
        The Nigeria Data Protection Regulation (NDPR) is Nigeria's principal data protection legislation, issued by the 
        National Information Technology Development Agency (NITDA) in January 2019. The NDPR aims to safeguard the rights 
        of natural persons to data privacy and establishes a framework for ensuring that organizations process personal 
        data in a fair, lawful, and transparent manner.
      </p>
      <p className="mb-4">
        Compliance with the NDPR is not just a legal obligation but also a business imperative. Organizations that fail to 
        comply with the NDPR may face significant penalties, including fines of up to 2% of annual gross revenue or 
        ₦10 million, whichever is greater. Beyond the financial penalties, non-compliance can lead to reputational damage, 
        loss of customer trust, and business disruption.
      </p>
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
        <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-2">Who Must Comply with the NDPR?</h4>
        <p className="text-blue-700 dark:text-blue-300 text-sm mb-2">
          The NDPR applies to:
        </p>
        <ul className="list-disc pl-6 text-blue-700 dark:text-blue-300 text-sm">
          <li>All organizations that process the personal data of Nigerian residents</li>
          <li>Organizations that process personal data in Nigeria, regardless of the nationality of the data subjects</li>
          <li>Public and private sector organizations of all sizes</li>
          <li>Organizations based outside Nigeria that process the personal data of Nigerian residents</li>
        </ul>
      </div>
    </section>
  );
}
