"use client";

import { NDPRSubjectRights } from "@tantainnovative/ndpr-toolkit/presets";
import type { DSRFormSubmission } from "@tantainnovative/ndpr-toolkit";

export default function DSRPage() {
  const handleSubmit = (submission: DSRFormSubmission) => {
    console.log("DSR request submitted:", submission);
    alert(
      `Your ${submission.requestType} request has been submitted. Reference: ${submission.id}`
    );
  };

  return (
    <div>
      <h1>Data Subject Rights</h1>
      <p>
        Under the NDPA 2023, you have the right to access, correct, delete, and
        port your personal data. Use the form below to submit a request.
      </p>

      <NDPRSubjectRights onSubmit={handleSubmit} />
    </div>
  );
}
