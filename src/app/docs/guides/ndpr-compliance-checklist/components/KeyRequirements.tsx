'use client';

export default function KeyRequirements() {
  return (
    <section id="key-requirements" className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Key NDPA 2023 Requirements</h2>
      <p className="mb-4">
        The NDPA 2023 establishes several key requirements that organizations must meet to ensure compliance.
        Understanding these requirements is the first step toward developing a comprehensive compliance program.
      </p>
      
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <h3 className="text-xl font-bold mb-2">Lawful Processing</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Organizations must process personal data lawfully, fairly, and transparently. This means having a valid legal 
            basis for processing, such as consent, contract, legal obligation, vital interests, public interest, or 
            legitimate interests.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <h3 className="text-xl font-bold mb-2">Consent</h3>
          <p className="text-gray-600 dark:text-gray-300">
            When relying on consent as the legal basis for processing, organizations must ensure that consent is freely given, 
            specific, informed, and unambiguous. Consent must be obtained through a clear affirmative action and must be as 
            easy to withdraw as it is to give.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <h3 className="text-xl font-bold mb-2">Data Subject Rights</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Organizations must respect and facilitate the rights of data subjects, including the right of access, right to 
            rectification, right to erasure, right to restrict processing, right to data portability, and right to object 
            to processing.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <h3 className="text-xl font-bold mb-2">Data Protection Impact Assessment</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Organizations must conduct Data Protection Impact Assessments (DPIAs) for processing activities that are likely 
            to result in a high risk to the rights and freedoms of individuals, particularly when using new technologies.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <h3 className="text-xl font-bold mb-2">Data Protection Officer</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Organizations that process large volumes of personal data must appoint a Data Protection Officer (DPO) to oversee 
            data protection strategy and implementation. The DPO must have expert knowledge of data protection law and practices.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <h3 className="text-xl font-bold mb-2">Breach Notification</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Organizations must report data breaches to the NDPC within 72 hours of becoming aware of the breach and must notify 
            affected data subjects without undue delay. Organizations must also maintain a record of all data breaches.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <h3 className="text-xl font-bold mb-2">Privacy Policy</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Organizations must maintain a clear and accessible privacy policy that informs data subjects about how their 
            personal data is collected, processed, stored, and protected. The policy must be written in clear, plain language.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <h3 className="text-xl font-bold mb-2">International Transfers</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Organizations must ensure that personal data is not transferred to a country outside Nigeria unless that country 
            ensures an adequate level of protection for the rights and freedoms of data subjects in relation to the processing 
            of personal data.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <h3 className="text-xl font-bold mb-2">Data Security</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Organizations must implement appropriate technical and organizational measures to ensure a level of security 
            appropriate to the risk, including encryption, pseudonymization, and regular testing of security measures.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <h3 className="text-xl font-bold mb-2">Record Keeping</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Organizations must maintain records of processing activities, including the purposes of processing, categories 
            of data subjects and personal data, recipients of personal data, and time limits for erasure.
          </p>
        </div>
      </div>
    </section>
  );
}
