import React from 'react';

const RefundPolicy: React.FC = () => (
  <div className="max-w-3xl mx-auto py-12 px-4 text-gray-200">
    <h1 className="text-3xl font-bold mb-6 text-cyan-400">Refund Policy</h1>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
      <p>
        This Refund Policy ("Policy") outlines the terms and conditions regarding payments made through the DEVS Society Portal ("Website"). 
        By making a payment on our platform, you acknowledge and agree to the terms stated below.
      </p>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">2. No Refund Policy</h2>
      <p>
        All payments made on the DEVS Society Portal are final and non-refundable. We do not offer refunds under any circumstances, including but not limited to:
      </p>
      <ul className="list-disc list-inside ml-4">
        <li>Event cancellations by the participant</li>
        <li>No-shows or failure to attend the event</li>
        <li>Scheduling conflicts or personal reasons</li>
        <li>Duplicate payments (except in verified technical errors)</li>
      </ul>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">3. Exceptional Cases</h2>
      <p>
        In the rare case of a verified technical error (e.g., duplicate payment), you may contact us within 3 days of the transaction.
        Any such cases will be reviewed at our sole discretion. Refunds, if granted, will be processed in accordance with Razorpay’s policies.
      </p>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">4. Acknowledgement</h2>
      <p>
        By proceeding with a payment on our Website, you confirm that you have read, understood, and agree to this No Refund Policy.
      </p>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">5. Changes to this Policy</h2>
      <p>
        We reserve the right to update or modify this Policy at any time. Updates will be posted on this page and are effective immediately upon posting.
      </p>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">6. Governing Law</h2>
      <p>
        This Policy is governed by the laws of India. Any disputes shall be subject to the jurisdiction of the courts in Chennai, India.
      </p>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">7. Contact</h2>
      <p>
        For any queries or concerns regarding this Policy, please contact us at <a href="mailto:contact@devs-society.com" className="text-cyan-400 underline">contact@devs-society.com</a>.
      </p>
    </section>
  </div>
);

export default RefundPolicy;
