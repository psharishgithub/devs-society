// app/contact-us/page.tsx
'use client';
import React from 'react';

const ContactUs: React.FC = () => (
  <div className="max-w-3xl mx-auto py-12 px-4 text-gray-200">
    <h1 className="text-3xl font-bold mb-6 text-cyan-400">Contact Us</h1>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">1. General Inquiries</h2>
      <p>
        For any general questions, feedback, or technical support related to the DEVS Society Portal, please reach out to us at:
        <br />
        <a href="mailto:support@devs-society.com" className="text-cyan-400 underline">contact@devs-society.com</a>
      </p>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">2. Event Related Queries</h2>
      <p>
        If you have any concerns or inquiries about specific events, please include your registration ID and event name when contacting us.
      </p>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">3. Technical Support</h2>
      <p>
        Experiencing a bug or issue with the portal? Our technical team is happy to assist. Reach us via the above email and attach a screenshot if possible.
      </p>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">4. Collaborations & Sponsorships</h2>
      <p>
        Interested in collaborating or sponsoring an event? Write to us at <a href="mailto:contact@devs-society.com" className="text-cyan-400 underline">contact@devs-society.com</a> with your proposal.
      </p>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">5. Office Address</h2>
      <p>
        DEVS Society, <br />
        Kavitha Street, Ur Nagar, Padi <br />
        Chennai 600050, Tamil Nadu, India
      </p>
    </section>
  </div>
);

export default ContactUs;
