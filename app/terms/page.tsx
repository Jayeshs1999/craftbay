import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions — Banavoo.In",
  description: "Read the Terms and Conditions for using Banavoo.in as a buyer or seller.",
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

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#78716c] mb-8">
        <Link href="/" className="hover:text-[#059669] transition-colors">Home</Link>
        <span>/</span>
        <span className="text-[#1c1917] font-medium">Terms &amp; Conditions</span>
      </div>

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-[#0f172a] mb-2">Terms &amp; Conditions</h1>
        <p className="text-xs text-[#78716c]">Last updated: {LAST_UPDATED}</p>
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 leading-relaxed">
          Please read these terms carefully before using Banavoo.in. By accessing or using this platform, you agree to be bound by these terms.
        </div>
      </div>

      <Section id="general" title="1. About Banavoo.In">
        <p>
          Banavoo.in (&quot;the Platform&quot;, &quot;we&quot;, &quot;us&quot;) is an online marketplace that enables independent sellers (&quot;Sellers&quot;) to open free digital shops and list handmade or creative products for sale to buyers (&quot;Buyers&quot;). The Platform is operated by the Banavoo.in team.
        </p>
        <p>
          By registering, listing products, or making a purchase on Banavoo.in, you agree to these Terms &amp; Conditions in full. If you disagree with any part, please do not use the Platform.
        </p>
      </Section>

      <Section id="eligibility" title="2. Eligibility">
        <p>You must be at least 18 years of age to create an account. By using the Platform, you represent that you meet this requirement.</p>
        <p>You are responsible for maintaining the confidentiality of your account credentials. Notify us immediately at <a href="mailto:hello@banavoo.in" className="text-[#059669] underline">hello@banavoo.in</a> if you suspect unauthorized access.</p>
      </Section>

      <Section id="sellers" title="3. Seller Terms">
        <p><strong className="text-[#0f172a]">3.1 Free shop, zero commission.</strong> Opening a shop and listing products on Banavoo.in is free. We currently charge no commission on sales. This may change in the future; sellers will be given at least 30 days&apos; advance notice of any commission changes.</p>

        <p><strong className="text-[#0f172a]">3.2 What you can sell.</strong> Sellers may only list products that are handmade, handcrafted, or independently created. Mass-manufactured or resold goods are not permitted. Banavoo.in reserves the right to remove listings that violate this policy.</p>

        <p><strong className="text-[#0f172a]">3.3 Accurate listings.</strong> Product descriptions, images, pricing, and stock levels must be accurate and up to date. Misleading listings may result in account suspension.</p>

        <p><strong className="text-[#0f172a]">3.4 Delivery responsibility.</strong> Sellers are solely responsible for fulfilling orders — packing, shipping, and delivery. Sellers configure their own delivery charges through the shop settings. Banavoo.in does not arrange or guarantee delivery.</p>

        <p><strong className="text-[#0f172a]">3.5 Order handling.</strong> Sellers must acknowledge and begin processing orders within 48 hours. Persistent failure to fulfil orders may result in account suspension.</p>

        <p><strong className="text-[#0f172a]">3.6 GSTN not required.</strong> Sellers are not required to hold a GSTN registration to sell on Banavoo.in. However, sellers are solely responsible for any tax obligations that apply to their income under applicable Indian law.</p>

        <p><strong className="text-[#0f172a]">3.7 Prohibited conduct.</strong> Sellers may not list counterfeit goods, prohibited substances, weapons, adult content, or any item illegal under Indian law. Violations will result in immediate account termination.</p>
      </Section>

      <Section id="buyers" title="4. Buyer Terms">
        <p><strong className="text-[#0f172a]">4.1 Direct transaction.</strong> Purchases on Banavoo.in are transactions directly between Buyer and Seller. Banavoo.in facilitates the connection but is not a party to the sale contract.</p>

        <p><strong className="text-[#0f172a]">4.2 Cash on Delivery.</strong> When selecting COD, the Buyer agrees to pay the stated amount (including any COD handling charge set by the Seller) upon delivery or pickup. Refusing delivery without a valid reason may result in the Buyer being responsible for return shipping costs.</p>

        <p><strong className="text-[#0f172a]">4.3 Returns &amp; refunds.</strong> Returns are accepted within 7 days for items that are damaged, significantly different from their description, or not delivered. Buyers must contact the Seller directly to initiate a return. Banavoo.in may mediate disputes at its discretion.</p>

        <p><strong className="text-[#0f172a]">4.4 Reviews.</strong> Buyers may submit one review per purchased product. Reviews must be honest and based on genuine experience. Fraudulent or defamatory reviews will be removed.</p>
      </Section>

      <Section id="platform" title="5. Platform Rules (All Users)">
        <p>You agree not to:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Use the Platform for any unlawful purpose.</li>
          <li>Attempt to reverse-engineer, scrape, or disrupt the Platform.</li>
          <li>Create multiple accounts to circumvent suspensions.</li>
          <li>Engage in price manipulation, fake orders, or review fraud.</li>
          <li>Harass, threaten, or abuse other users.</li>
        </ul>
        <p>Banavoo.in reserves the right to suspend or permanently ban any account that violates these rules, with or without prior notice.</p>
      </Section>

      <Section id="ip" title="6. Intellectual Property">
        <p>
          Sellers retain ownership of all content they upload (product photos, descriptions, shop branding). By uploading content to Banavoo.in, Sellers grant Banavoo.in a non-exclusive, royalty-free licence to display, reproduce, and promote that content on the Platform and in marketing materials.
        </p>
        <p>
          The Banavoo.in name, logo, and design are the property of Banavoo.in and may not be used without written permission.
        </p>
      </Section>

      <Section id="liability" title="7. Limitation of Liability">
        <p>
          Banavoo.in is a marketplace platform. We do not manufacture, inspect, or warrant any product listed by Sellers. To the maximum extent permitted by applicable law, Banavoo.in shall not be liable for:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>The quality, safety, or legality of any listed product.</li>
          <li>Delivery delays or failures by Sellers.</li>
          <li>Any direct, indirect, or consequential loss arising from transactions between Buyers and Sellers.</li>
        </ul>
        <p>Our total liability to any user for any claim shall not exceed the amount paid by that user in the transaction giving rise to the claim.</p>
      </Section>

      <Section id="privacy" title="8. Privacy">
        <p>
          Your use of the Platform is also governed by our <Link href="/privacy" className="text-[#059669] underline hover:text-[#047857]">Privacy Policy</Link>, which is incorporated into these Terms by reference.
        </p>
      </Section>

      <Section id="changes" title="9. Changes to These Terms">
        <p>
          We may update these Terms from time to time. Significant changes will be communicated via email or a notice on the Platform. Continued use of the Platform after changes constitutes acceptance.
        </p>
      </Section>

      <Section id="contact" title="10. Contact Us">
        <p>
          For questions about these Terms, reach us at:{" "}
          <a href="mailto:jayeshsevatkar55@gmail.com" className="text-[#059669] underline hover:text-[#047857]">hello@banavoo.in</a>
        </p>
      </Section>

      {/* Footer nav */}
      <div className="border-t border-[#e2e8f0] pt-6 flex flex-wrap gap-4 text-xs text-[#78716c]">
        <Link href="/privacy" className="hover:text-[#059669] transition-colors">Privacy Policy</Link>
        <Link href="/about"   className="hover:text-[#059669] transition-colors">About Us</Link>
        <Link href="/"        className="hover:text-[#059669] transition-colors">Home</Link>
      </div>
    </div>
  );
}
