"use client";

import { NDPRSubjectRights } from "@tantainnovative/ndpr-toolkit/presets";
import type { DSRFormSubmission } from "@tantainnovative/ndpr-toolkit";

export default function DSRPage() {
  const handleSubmit = (submission: DSRFormSubmission) => {
    console.log("DSR request submitted:", submission);
    // `DSRFormSubmission` is the form-level payload — it has no server-issued
    // reference yet. Surface the requester's own contact so they know we got it;
    // in a real app, POST to /api/dsr and route to a confirmation page with the
    // server-generated reference (see `examples/dsr-backend-prod`).
    alert(
      `Your ${submission.requestType} request was received. We'll respond to ${submission.dataSubject.email} within 30 days.`
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
