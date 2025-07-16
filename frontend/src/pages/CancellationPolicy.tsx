import React from 'react';

const CancellationPolicy: React.FC = () => (
  <div className="max-w-3xl mx-auto py-12 px-4 text-gray-200">
    <h1 className="text-3xl font-bold mb-6 text-cyan-400">Cancellation Policy</h1>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
      <p>
        This Cancellation Policy ("Policy") outlines the terms and conditions regarding cancellations of event registrations and payments made through the DEVS Society Portal ("Website"). 
        By registering for any event, you acknowledge and agree to the following terms.
      </p>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">2. No Cancellations Allowed</h2>
      <p>
        All registrations made through the Website are final and non-cancellable. We do not accept or process any cancellation requests initiated by users under any circumstances, including but not limited to:
      </p>
      <ul className="list-disc list-inside ml-4">
        <li>Change of mind or schedule</li>
        <li>Personal emergencies or conflicts</li>
        <li>Duplicate bookings</li>
      </ul>
      <p className="mt-2">
        Please ensure you review all event details before completing your registration and payment.
      </p>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">3. Organizer Cancellations</h2>
      <p>
        In the unlikely event that an organizer cancels an event, the DEVS Society reserves the right to decide whether any form of compensation, such as rescheduling or re-registration, will be provided. 
        No automatic refunds or cancellations will be initiated unless explicitly communicated by us.
      </p>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">4. Acknowledgement</h2>
      <p>
        By proceeding with an event registration, you acknowledge that you have read, understood, and agreed to this no-cancellation policy.
      </p>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">5. Changes to this Policy</h2>
      <p>
        We reserve the right to modify or update this Policy at any time. Changes will be effective immediately upon posting on this page. Continued use of the Website constitutes your acceptance of the revised Policy.
      </p>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">6. Governing Law</h2>
      <p>
        This Policy is governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Chennai, India.
      </p>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">7. Contact</h2>
      <p>
        For any questions or concerns regarding this Policy, please contact us at <a href="mailto:contact@devs-society.com" className="text-cyan-400 underline">contact@devs-society.com</a>.
      </p>
    </section>
  </div>
);

export default CancellationPolicy;
