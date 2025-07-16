import React from 'react';

const Terms: React.FC = () => (
  <div className="max-w-3xl mx-auto py-12 px-4 text-gray-200">
    <h1 className="text-3xl font-bold mb-6 text-cyan-400">Terms and Conditions</h1>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
      <p>These Terms and Conditions ("Terms") govern your use of the DEVS Society Portal ("Website", "we", "us", or "our"). By accessing or using the Website, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use the Website.</p>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">2. Acceptance of Terms</h2>
      <p>By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. These Terms constitute a binding agreement between you and DEVS Society.</p>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">3. Modification of Terms</h2>
      <p>We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on this page. Continued use of the Website constitutes acceptance of the revised Terms. It is your responsibility to review these Terms periodically.</p>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">4. User Responsibilities</h2>
      <p>You agree to use the Website in compliance with all applicable laws and not to misuse the Website or attempt unauthorized access. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.</p>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">5. Payment Terms</h2>
      <p>All payments on this Website are securely processed through Razorpay. By making a payment, you agree to Razorpay's terms and conditions. We do not store any card or banking information on our servers. Payment confirmation will be provided via email upon successful transaction.</p>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">6. Cancellations and Refunds</h2>
      <p>All event registrations and payments are subject to our <a href="/cancellation-policy" className="text-cyan-400 underline">Cancellation Policy</a> and <a href="/refund-policy" className="text-cyan-400 underline">Refund Policy</a>. Refunds, if applicable, will be processed through Razorpay within 7–10 business days. No refunds will be provided for cancellations made after the deadline mentioned in the respective policies.</p>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">7. Data Privacy and Security</h2>
      <p>We are committed to protecting your personal information in accordance with applicable laws. Payment and personal data are handled securely and are encrypted via SSL. Razorpay ensures PCI-DSS compliance and secure transaction protocols.</p>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">8. Limitation of Liability</h2>
      <p>To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data, revenue, or use, resulting from your use of or inability to use the Website or payment services.</p>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">9. Governing Law</h2>
      <p>These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising shall be subject to the jurisdiction of the courts in Chennai, India.</p>
    </section>

    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">10. Contact Us</h2>
      <p>If you have any questions or concerns regarding these Terms or payment-related issues, please contact us at <a href="mailto:contact@devs-society.com" className="text-cyan-400 underline">contact@devs-society.com</a>.</p>
    </section>
  </div>
);

export default Terms;
