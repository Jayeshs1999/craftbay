import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Banavoo.In",
  description: "Understand how Banavoo.in collects, uses, and protects your personal information.",
};

const LAST_UPDATED = "September 28, 2026";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-10 scroll-mt-24">
      <h2 className="text-lg font-extrabold text-[#0f172a] mb-3 pb-2 border-b border-[#e2e8f0]">{title}</h2>
      <div className="space-y-3 text-sm text-[#57534e] leading-relaxed">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-bold text-[#0f172a] mb-2">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function H4({ children }: { children: React.ReactNode }) {
  return <h4 className="text-sm font-semibold text-[#1c1917] mt-3 mb-1">{children}</h4>;
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
          This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You. We use Your Personal Data to provide and improve the Service.
        </div>
      </div>

      {/* 1. Interpretation and Definitions */}
      <Section id="interpretation" title="1. Interpretation and Definitions">
        <SubSection title="Interpretation">
          <p>
            The words whose initial letters are capitalized have meanings defined under the following conditions.
            The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
          </p>
        </SubSection>

        <SubSection title="Definitions">
          <p>For the purposes of this Privacy Policy:</p>
          <ul className="list-disc list-inside space-y-2 ml-2 mt-2">
            <li><strong className="text-[#0f172a]">Account</strong> means a unique account created for You to access Our Service or parts of Our Service.</li>
            <li><strong className="text-[#0f172a]">Affiliate</strong> means an entity that controls, is controlled by, or is under common control with a party, where &quot;control&quot; means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</li>
            <li><strong className="text-[#0f172a]">Application</strong> refers to Banavoo, the software program provided by the Company.</li>
            <li><strong className="text-[#0f172a]">Company</strong> (referred to as either &quot;the Company&quot;, &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot; in this Privacy Policy) refers to Banavoo.in.</li>
            <li><strong className="text-[#0f172a]">Cookies</strong> are small files placed on Your computer, mobile device or any other device by a website, containing the details of Your browsing history on that website, among its many uses.</li>
            <li><strong className="text-[#0f172a]">Country/State</strong> refers to: Maharashtra, India.</li>
            <li><strong className="text-[#0f172a]">Device</strong> means any device that can access the Service, such as a computer, a cell phone or a digital tablet.</li>
            <li>
              <strong className="text-[#0f172a]">Personal Data</strong> (or &quot;Personal Information&quot;) is any information that relates to an identified or identifiable individual.
              We use &quot;Personal Data&quot; and &quot;Personal Information&quot; interchangeably unless a law uses a specific term.
            </li>
            <li><strong className="text-[#0f172a]">Service</strong> refers to the Application or the Website or both.</li>
            <li><strong className="text-[#0f172a]">Service Provider</strong> means any natural or legal person who processes the data on behalf of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.</li>
            <li><strong className="text-[#0f172a]">Usage Data</strong> refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).</li>
            <li><strong className="text-[#0f172a]">User</strong> means any individual who accesses or uses the Service.</li>
            <li>
              <strong className="text-[#0f172a]">Website</strong> refers to Banavoo.in, accessible from{" "}
              <a href="https://www.banavoo.in" rel="external nofollow noopener" target="_blank" className="text-[#059669] underline hover:text-[#047857]">https://www.banavoo.in</a>.
            </li>
            <li><strong className="text-[#0f172a]">You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</li>
          </ul>
        </SubSection>
      </Section>

      {/* 2. Collecting and Using Your Personal Information */}
      <Section id="collecting" title="2. Collecting and Using Your Personal Information">
        <SubSection title="Types of Data Collected">
          <H4>Personal Data</H4>
          <p>
            While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used
            to contact or identify You. Personally identifiable information may include, but is not limited to:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
            <li>Email address</li>
            <li>First name and last name</li>
            <li>Phone number</li>
            <li>Address, State, Province, ZIP/Postal code, City</li>
          </ul>

          <H4>Usage Data</H4>
          <p>Usage Data is collected automatically when using the Service.</p>
          <p>
            Usage Data may include information such as Your Device&apos;s Internet Protocol address (e.g. IP address), browser type,
            browser version, the pages of Our Service that You visit, the time and date of Your visit, the time spent on those pages,
            unique device identifiers and other diagnostic data.
          </p>
          <p>
            When You access the Service by or through a mobile device, We may collect certain information automatically, including,
            but not limited to, the type of mobile device You use, Your mobile device&apos;s unique ID, the IP address of Your mobile
            device, Your mobile operating system, the type of mobile Internet browser You use, unique device identifiers and other
            diagnostic data.
          </p>
          <p>
            We may also collect information that Your browser sends whenever You visit Our Service or when You access the Service
            by or through a mobile device.
          </p>

          <H4>Tracking Technologies and Cookies</H4>
          <p>We use tracking technologies (such as cookies) to track the activity and to improve Our Service. The technologies We use may include:</p>
          <ul className="list-disc list-inside space-y-2 ml-2 mt-1">
            <li>
              <strong className="text-[#0f172a]">Cookies or Browser Cookies.</strong> A cookie is a small file placed on Your Device.
              You can instruct Your browser to refuse all Cookies or to indicate when a Cookie is being sent. However, if You do not
              accept Cookies, You may not be able to use some parts of Our Service.
            </li>
            <li>
              <strong className="text-[#0f172a]">Web Beacons.</strong> Certain sections of Our Service may contain small electronic
              files known as web beacons (also referred to as clear gifs, pixel tags, and single-pixel gifs) that permit the Company,
              for example, to count users who have visited those pages and for other related website statistics (for example, recording
              the popularity of a certain section and verifying system and server integrity).
            </li>
          </ul>
          <p>
            Cookies can be &quot;Persistent&quot; or &quot;Session&quot; Cookies. Persistent Cookies remain on Your personal computer or mobile
            device when You go offline, while Session Cookies are deleted as soon as You close Your web browser.
          </p>
          <p>
            Where required by law, We use non-essential cookies only with Your consent. You can withdraw or change Your consent at
            any time using Our cookie preferences tool (if available) or through Your browser/device settings. Withdrawing consent
            does not affect the lawfulness of processing based on consent before its withdrawal.
          </p>
          <p>We use both Session and Persistent Cookies for the purposes set out below:</p>
          <div className="ml-2 space-y-3 mt-2">
            <div className="border border-[#e2e8f0] rounded-lg p-3 bg-[#f8fafc]">
              <p className="font-semibold text-[#0f172a]">Necessary / Essential Cookies</p>
              <p className="text-xs text-[#78716c]">Type: Session Cookies &nbsp;·&nbsp; Administered by: Us</p>
              <p className="mt-1">Purpose: These Cookies are essential to provide You with services available through the Website and to enable You to use some of its features. They help to authenticate users and prevent fraudulent use of user accounts.</p>
            </div>
            <div className="border border-[#e2e8f0] rounded-lg p-3 bg-[#f8fafc]">
              <p className="font-semibold text-[#0f172a]">Cookies Policy / Notice Acceptance Cookies</p>
              <p className="text-xs text-[#78716c]">Type: Persistent Cookies &nbsp;·&nbsp; Administered by: Us</p>
              <p className="mt-1">Purpose: These Cookies identify whether users have accepted the use of cookies on the Website and record the consent choices You have made, so that We can honor those choices on future visits.</p>
            </div>
            <div className="border border-[#e2e8f0] rounded-lg p-3 bg-[#f8fafc]">
              <p className="font-semibold text-[#0f172a]">Functionality Cookies</p>
              <p className="text-xs text-[#78716c]">Type: Persistent Cookies &nbsp;·&nbsp; Administered by: Us</p>
              <p className="mt-1">Purpose: These Cookies allow Us to remember choices You make when You use the Website, such as remembering Your Account login details or language preference, to provide You with a more personal experience.</p>
            </div>
          </div>
        </SubSection>
      </Section>

      {/* 3. Use of Your Personal Data */}
      <Section id="use-of-data" title="3. Use of Your Personal Data">
        <p>The Company may use Personal Data for the following purposes:</p>
        <ul className="list-disc list-inside space-y-2 ml-2 mt-2">
          <li><strong className="text-[#0f172a]">To provide and maintain Our Service</strong>, including to monitor the usage of Our Service.</li>
          <li><strong className="text-[#0f172a]">To manage Your Account:</strong> to manage Your registration as a user of the Service.</li>
          <li><strong className="text-[#0f172a]">For the performance of a contract:</strong> the development, compliance and undertaking of the purchase contract for products or services You have purchased through the Service.</li>
          <li><strong className="text-[#0f172a]">To contact You:</strong> by email, telephone calls, SMS, or other equivalent forms of electronic communication regarding updates or informative communications related to the functionalities, products or contracted services.</li>
          <li><strong className="text-[#0f172a]">To provide You</strong> with news, special offers, and general information about other goods, services and events which We offer. We send such marketing communications only where permitted by applicable law and only with Your consent where prior consent is required. You may opt out at any time.</li>
          <li><strong className="text-[#0f172a]">To manage Your requests:</strong> To attend and manage Your requests to Us.</li>
          <li><strong className="text-[#0f172a]">For business transfers:</strong> We may use Your Personal Data to evaluate or conduct a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of some or all of Our assets.</li>
          <li><strong className="text-[#0f172a]">For other purposes</strong>: such as data analysis, identifying usage trends, determining the effectiveness of Our promotional campaigns, and evaluating and improving Our Service.</li>
        </ul>

        <p className="mt-3">We may share Your Personal Data in the following situations:</p>
        <ul className="list-disc list-inside space-y-1.5 ml-2 mt-2">
          <li><strong className="text-[#0f172a]">With Service Providers:</strong> We may share Your Personal Data with Service Providers to monitor and analyze the use of Our Service, and to contact You. These include Cloudinary (image hosting), MongoDB Atlas (database hosting), and Google (authentication via Google Sign-In).</li>
          <li><strong className="text-[#0f172a]">For business transfers:</strong> in connection with, or during negotiations of, any merger, sale of Company assets, financing, or acquisition.</li>
          <li><strong className="text-[#0f172a]">With Affiliates:</strong> We will require those affiliates to honor this Privacy Policy.</li>
          <li><strong className="text-[#0f172a]">With other users:</strong> When You share Personal Data in public areas of the Service, such information may be viewed by all users and may be publicly distributed outside the Service.</li>
          <li><strong className="text-[#0f172a]">With Your consent</strong>: We may disclose Your Personal Data for any other purpose with Your consent.</li>
        </ul>
      </Section>

      {/* 4. Text Messages Privacy Notice */}
      <Section id="sms" title="4. Text Messages Privacy Notice">
        <p>
          You have the option to receive text (SMS) messages from Us. If You opt in, We will collect and store Your phone number,
          the date and method of Your consent, and message delivery and read information.
        </p>
        <p>
          <strong className="text-[#0f172a]">No mobile information will be shared with or sold to third parties or affiliates for marketing or promotional purposes.</strong>{" "}
          The phone numbers and consent records We collect for texting are never shared with anyone for any purpose, except the
          Service Providers that technically have to handle them to deliver the texts.
        </p>
        <p>Consent to receive text messages is not a condition of any purchase or use of Our Service. If You consent to receive SMS from Us, You agree to receive messages related to:</p>
        <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
          <li>Customer care and support</li>
          <li>Account notifications, such as activity, status, or renewal reminders</li>
          <li>Delivery notifications and updates on the status of a delivery</li>
          <li>Authentication messages, such as one-time passwords (OTP) and passcodes</li>
          <li>Security alerts, such as suspicious login attempts or unusual account activity</li>
          <li>Marketing and promotional offers, discounts, and other promotional content</li>
        </ul>
        <p className="text-xs text-[#78716c] mt-2">
          Reply STOP to opt-out. Reply HELP for support. Message &amp; data rates may apply. Messaging frequency may vary.
          Carriers are not liable for delayed or undelivered messages.
        </p>
      </Section>

      {/* 5. Retention of Your Personal Data */}
      <Section id="retention" title="5. Retention of Your Personal Data">
        <p>
          The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy.
          We will retain and use Your Personal Data to the extent necessary to comply with Our legal obligations, resolve disputes,
          and enforce Our legal agreements and policies.
        </p>
        <p>
          Where possible, We apply shorter retention periods and/or reduce identifiability by deleting, aggregating, or anonymizing data.
          Unless otherwise stated, the retention periods below are maximum periods (&quot;up to&quot;) and We may delete or anonymize data
          sooner when it is no longer needed.
        </p>
        <div className="ml-2 space-y-3 mt-2">
          <div>
            <p className="font-semibold text-[#0f172a]">Account Information</p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
              <li>User Accounts: retained for the duration of Your Account relationship plus up to 24 months after account closure.</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-[#0f172a]">Customer Support Data</p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
              <li>Support tickets and correspondence: up to 24 months from the date of ticket closure.</li>
              <li>Chat transcripts: up to 24 months for quality assurance and staff training purposes.</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-[#0f172a]">Usage Data</p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
              <li>Website analytics data (cookies, IP addresses, device identifiers): up to 24 months from the date of collection.</li>
              <li>Application usage statistics: up to 24 months to understand feature adoption and service improvements.</li>
              <li>Server logs (IP addresses, access times): up to 24 months for security monitoring and troubleshooting.</li>
            </ul>
          </div>
        </div>
        <p className="mt-2">We may retain Personal Data beyond the periods stated above for:</p>
        <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
          <li><strong className="text-[#0f172a]">Legal obligation:</strong> required by law to retain specific data (e.g., financial records for tax authorities).</li>
          <li><strong className="text-[#0f172a]">Legal claims:</strong> Data is necessary to establish, exercise, or defend legal claims.</li>
          <li><strong className="text-[#0f172a]">Your explicit request:</strong> You ask Us to retain specific information.</li>
          <li><strong className="text-[#0f172a]">Technical limitations:</strong> Data exists in backup systems scheduled for routine deletion.</li>
        </ul>
        <p className="mt-2">When retention periods expire, We securely delete or anonymize Personal Data through:</p>
        <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
          <li><strong className="text-[#0f172a]">Deletion:</strong> Personal Data is removed from Our systems and no longer actively processed.</li>
          <li><strong className="text-[#0f172a]">Backup retention:</strong> Residual copies may remain in encrypted backups for a limited period and are not restored except where necessary for security, disaster recovery, or legal compliance.</li>
          <li><strong className="text-[#0f172a]">Anonymization:</strong> In some cases, We convert Personal Data into anonymous statistical data that cannot be linked back to You.</li>
        </ul>
      </Section>

      {/* 6. Transfer of Your Personal Data */}
      <Section id="transfer" title="6. Transfer of Your Personal Data">
        <p>
          Your information, including Personal Data, is processed at the Company&apos;s operating offices and in any other places where the
          parties involved in the processing are located. This means that this information may be transferred to — and maintained on —
          computers located outside of Your state, province, country or other governmental jurisdiction where the data protection laws
          may differ from those of Your jurisdiction.
        </p>
        <p>
          Where required by applicable law, We will ensure that international transfers of Your Personal Data are subject to appropriate
          safeguards. The Company will take all steps reasonably necessary to ensure that Your data is treated securely and in accordance
          with this Privacy Policy and no transfer of Your Personal Data will take place to an organization or a country unless there
          are adequate controls in place.
        </p>
      </Section>

      {/* 7. Delete Your Personal Data */}
      <Section id="delete" title="7. Delete Your Personal Data">
        <p>You have the right to delete or request that We assist in deleting the Personal Data that We have collected about You.</p>
        <p>
          You can permanently delete Your account and all associated personal data at any time by visiting Our{" "}
          <a href="/delete-account" className="text-[#059669] underline hover:text-[#047857] font-medium">
            Account Deletion page
          </a>
          . This will remove Your profile, addresses, wishlist, and shop data (if applicable).
        </p>
        <p>
          You may also contact Us at{" "}
          <a href="mailto:jayeshsevatkar55@gmail.com" className="text-[#059669] underline hover:text-[#047857]">
            jayeshsevatkar55@gmail.com
          </a>{" "}
          to request access to, correct, or delete any Personal Data that You have provided to Us.
        </p>
        <p>Please note, however, that We may need to retain certain information when We have a legal obligation or lawful basis to do so.</p>
      </Section>

      {/* 8. Disclosure of Your Personal Data */}
      <Section id="disclosure" title="8. Disclosure of Your Personal Data">
        <SubSection title="Business Transactions">
          <p>
            If the Company is involved in a merger, acquisition or asset sale, Your Personal Data may be transferred. We will provide
            notice before Your Personal Data is transferred and becomes subject to a different Privacy Policy.
          </p>
        </SubSection>
        <SubSection title="Law Enforcement">
          <p>
            Under certain circumstances, the Company may disclose Your Personal Data if required to do so by law or in response to
            valid requests by public authorities (e.g. a court or a government agency).
          </p>
        </SubSection>
        <SubSection title="Other Legal Requirements">
          <p>The Company may disclose Your Personal Data in the good-faith belief that such action is necessary to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
            <li>Comply with a legal obligation</li>
            <li>Protect and defend the rights or property of the Company</li>
            <li>Prevent or investigate possible wrongdoing in connection with the Service</li>
            <li>Protect the personal safety of Users of the Service or the public</li>
            <li>Protect against legal liability</li>
          </ul>
        </SubSection>
      </Section>

      {/* 9. Security */}
      <Section id="security" title="9. Security of Your Personal Data">
        <p>
          The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or
          method of electronic storage, is 100% secure. While We strive to use commercially reasonable means to protect Your Personal
          Data, We cannot guarantee its absolute security.
        </p>
      </Section>

      {/* 10. Children's Privacy */}
      <Section id="children" title="10. Children's and Minors' Privacy">
        <p>The Service is not directed to, and We do not knowingly collect Personal Information from, anyone under the age of 18.</p>
        <p>
          If You are a parent or guardian and You believe Your child has provided Us with Personal Information, please contact Us.
          If We become aware that We have collected Personal Information from anyone under the age of 18, We will take steps to remove
          that information from Our servers as soon as reasonably possible.
        </p>
      </Section>

      {/* 11. Links to Other Websites */}
      <Section id="links" title="11. Links to Other Websites">
        <p>
          Our Service may contain links to other websites that are not operated by Us. If You click on a third-party link, You will
          be directed to that third party&apos;s site. We strongly advise You to review the Privacy Policy of every site You visit.
        </p>
        <p>
          We have no control over and assume no responsibility for the content, privacy policies or practices of any third-party
          sites or services.
        </p>
      </Section>

      {/* 12. Changes to this Privacy Policy */}
      <Section id="changes" title="12. Changes to this Privacy Policy">
        <p>
          We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy
          on this page.
        </p>
        <p>
          We will let You know via email and/or a prominent notice on Our Service, prior to the change becoming effective and update
          the &quot;Last updated&quot; date at the top of this Privacy Policy.
        </p>
        <p>
          You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective
          when they are posted on this page.
        </p>
      </Section>

      {/* 13. Contact Us */}
      <Section id="contact" title="13. Contact Us">
        <p>If You have any questions about this Privacy Policy, You can contact Us:</p>
        <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
          <li>
            By email:{" "}
            <a href="mailto:jayeshsevatkar55@gmail.com" className="text-[#059669] underline hover:text-[#047857]">
              jayeshsevatkar55@gmail.com
            </a>
          </li>
        </ul>
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
