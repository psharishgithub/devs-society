import React from 'react';

const PrivacyPolicy: React.FC = () => (
  <div className="max-w-3xl mx-auto py-12 px-4 text-gray-200">
    <h1 className="text-3xl font-bold mb-6 text-cyan-400">Privacy Policy</h1>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
      <p>This Privacy Policy ("Policy") describes how we collect, use, process, and protect your information when you use the DEVS Society Portal ("Website", "we", "our"). By using the Website, you consent to the collection and use of your information as described in this Policy.</p>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
      <p>We collect both personal and non-personal information:</p>
      <ul className="list-disc list-inside ml-4">
        <li>Personal Information: Name, email, phone number, department, registration details.</li>
        <li>Payment Information: Transaction ID, payment method (via Razorpay). No card or UPI details are stored by us.</li>
        <li>Usage Data: IP address, browser type, device information, and page interactions.</li>
      </ul>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">3. Use of Information</h2>
      <p>We use the information to:</p>
      <ul className="list-disc list-inside ml-4">
        <li>Process registrations and payments securely</li>
        <li>Send notifications, updates, and event-related communication</li>
        <li>Maintain security and prevent fraud</li>
        <li>Improve our platform and analyze usage trends</li>
      </ul>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">4. Sharing of Information</h2>
      <p>We do not sell your personal data. We may share your data only with:</p>
      <ul className="list-disc list-inside ml-4">
        <li>Payment gateway Razorpay for processing payments</li>
        <li>Internal team members or event organizers for logistics</li>
        <li>Government or legal authorities when required under law</li>
      </ul>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">5. Data Security</h2>
      <p>We implement strong security measures to protect your data:</p>
      <ul className="list-disc list-inside ml-4">
        <li>SSL encryption for secure communication</li>
        <li>Data processed through PCI-DSS-compliant Razorpay</li>
        <li>Access to personal data is restricted to authorized personnel only</li>
      </ul>
      <p>Despite our efforts, no digital transmission method is 100% secure.</p>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">6. Data Retention</h2>
      <p>We retain your personal data only as long as necessary to fulfill the purposes described in this Policy, or as required by law.</p>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">7. Your Rights</h2>
      <p>You have the right to:</p>
      <ul className="list-disc list-inside ml-4">
        <li>Request access to your personal data</li>
        <li>Request correction or deletion of your data</li>
        <li>Withdraw consent at any time</li>
      </ul>
      <p>You may exercise these rights by emailing us at <a href="mailto:contact@devs-society.com" className="text-cyan-400 underline">contact@devs-society.com</a>.</p>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">8. Changes to this Policy</h2>
      <p>We may update this Policy periodically. Updates will be posted on this page and are effective immediately upon posting. Continued use of the Website signifies your acceptance of the revised Policy.</p>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">9. Governing Law</h2>
      <p>This Policy is governed by the laws of India. Any disputes will be resolved in the courts located in Chennai, India.</p>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">10. Contact</h2>
      <p>If you have any questions or concerns about this Policy, please contact us at <a href="mailto:contact@devs-society.com" className="text-cyan-400 underline">contact@devs-society.com</a>.</p>
    </section>
  </div>
);

export default PrivacyPolicy;
