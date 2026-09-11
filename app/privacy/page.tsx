import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Banavoo.In",
  description: "Understand how Banavoo.in collects, uses, and protects your personal information.",
};

const LAST_UPDATED = "June 2025";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-10 scroll-mt-24">
      <h2 className="text-lg font-extrabold text-[#0f172a] mb-3 pb-2 border-b border-[#e2e8f0]">{title}</h2>
      <div className="space-y-3 text-sm text-[#57534e] leading-relaxed">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#78716c] mb-8">
        <Link href="/" className="hover:text-[#059669] transition-colors">Home</Link>
        <span>/</span>
        <span className="text-[#1c1917] font-medium">Privacy Policy</span>
      </div>

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-[#0f172a] mb-2">Privacy Policy</h1>
        <p className="text-xs text-[#78716c]">Last updated: {LAST_UPDATED}</p>
        <div className="mt-4 bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl px-4 py-3 text-xs text-[#065f46] leading-relaxed">
          We respect your privacy. This policy explains what data we collect, why we collect it, and how we protect it. We do not sell your personal data.
        </div>
      </div>

      <Section id="data-collected" title="1. Information We Collect">
        <p><strong className="text-[#0f172a]">Account data:</strong> When you register, we collect your name, email address, and optionally your phone number and profile photo.</p>
        <p><strong className="text-[#0f172a]">Seller profile data:</strong> If you open a shop, we collect your shop name, description, city, state, and delivery configuration.</p>
        <p><strong className="text-[#0f172a]">Order &amp; transaction data:</strong> We collect order details, shipping addresses, and delivery status records to fulfil and track purchases.</p>
        <p><strong className="text-[#0f172a]">Product content:</strong> Product names, descriptions, images, pricing, and inventory data uploaded by Sellers.</p>
        <p><strong className="text-[#0f172a]">Reviews:</strong> Text and star ratings submitted by Buyers against purchased products.</p>
        <p><strong className="text-[#0f172a]">Usage data:</strong> Standard web server logs — IP address, browser type, pages visited, referring URL. This data is used solely for security and performance monitoring.</p>
      </Section>

      <Section id="how-used" title="2. How We Use Your Information">
        <ul className="list-disc list-inside space-y-1.5 ml-2">
          <li>To create and manage your account.</li>
          <li>To process and fulfil orders between Buyers and Sellers.</li>
          <li>To send transactional emails: order confirmations, status updates, and account notifications.</li>
          <li>To display seller shops and products publicly on the Platform.</li>
          <li>To detect and prevent fraudulent or prohibited activity.</li>
          <li>To improve the Platform based on aggregated, anonymised usage patterns.</li>
        </ul>
        <p>We do <strong className="text-[#0f172a]">not</strong> use your data for behavioural advertising or sell it to third parties.</p>
      </Section>

      <Section id="sharing" title="3. Information Sharing">
        <p><strong className="text-[#0f172a]">Buyer → Seller:</strong> When a Buyer places an order, their name, phone number, and shipping address are shared with the Seller solely to fulfil that order.</p>
        <p><strong className="text-[#0f172a]">Seller → Buyer:</strong> A Seller&apos;s shop name, city, and state are displayed publicly on the Platform.</p>
        <p><strong className="text-[#0f172a]">Service providers:</strong> We use the following third-party services which may process your data:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong className="text-[#0f172a]">Cloudinary</strong> — image hosting for product photos.</li>
          <li><strong className="text-[#0f172a]">MongoDB Atlas</strong> — database hosting.</li>
          <li><strong className="text-[#0f172a]">Google OAuth</strong> — optional sign-in via Google.</li>
        </ul>
        <p>All service providers are contractually required to process data only as instructed and in compliance with applicable law.</p>
        <p>We will disclose data if required by a valid legal order from an Indian court or government authority.</p>
      </Section>

      <Section id="cookies" title="4. Cookies &amp; Local Storage">
        <p>We use a single authentication cookie (JWT) to keep you logged in. No third-party tracking cookies are used.</p>
        <p>Your shopping cart is stored in your browser&apos;s localStorage. It is not sent to our servers unless you proceed to checkout.</p>
      </Section>

      <Section id="retention" title="5. Data Retention">
        <p>Account data is retained for as long as your account is active. If you delete your account, your personal data will be removed within 30 days, except for order records which we retain for 3 years for legal and dispute-resolution purposes.</p>
      </Section>

      <Section id="security" title="6. Security">
        <p>We implement industry-standard security practices: passwords are hashed using bcrypt, data is transmitted over HTTPS, and database access is restricted to authorised personnel only.</p>
        <p>No system is completely secure. If you suspect a security breach affecting your account, contact us immediately at <a href="mailto:jayeshsevatkar55@gmail.com" className="text-[#059669] underline">hello@banavoo.in</a>.</p>
      </Section>

      <Section id="rights" title="7. Your Rights">
        <p>You have the right to:</p>
        <ul className="list-disc list-inside space-y-1.5 ml-2">
          <li><strong className="text-[#0f172a]">Access</strong> — request a copy of personal data we hold about you.</li>
          <li><strong className="text-[#0f172a]">Correction</strong> — update inaccurate data through your account settings.</li>
          <li><strong className="text-[#0f172a]">Deletion</strong> — request deletion of your account and associated personal data.</li>
          <li><strong className="text-[#0f172a]">Portability</strong> — request an export of your data in a machine-readable format.</li>
        </ul>
        <p>To exercise any of these rights, email us at <a href="mailto:jayeshsevatkar55@gmail.com" className="text-[#059669] underline">hello@banavoo.in</a> from your registered email address.</p>
      </Section>

      <Section id="children" title="8. Children">
        <p>Banavoo.in is not directed at children under 18. We do not knowingly collect personal information from minors. If you believe a minor has registered, please contact us and we will promptly remove the account.</p>
      </Section>

      <Section id="changes" title="9. Changes to This Policy">
        <p>We may update this Privacy Policy from time to time. We will notify registered users by email for material changes. Continued use of the Platform after the effective date constitutes acceptance of the updated policy.</p>
      </Section>

      <Section id="contact" title="10. Contact">
        <p>
          Privacy questions or data requests:{" "}
          <a href="mailto:jayeshsevatkar55@gmail.com" className="text-[#059669] underline hover:text-[#047857]">hello@banavoo.in</a>
        </p>
      </Section>

      {/* Footer nav */}
      <div className="border-t border-[#e2e8f0] pt-6 flex flex-wrap gap-4 text-xs text-[#78716c]">
        <Link href="/terms" className="hover:text-[#059669] transition-colors">Terms &amp; Conditions</Link>
        <Link href="/about" className="hover:text-[#059669] transition-colors">About Us</Link>
        <Link href="/"      className="hover:text-[#059669] transition-colors">Home</Link>
      </div>
    </div>
  );
}
