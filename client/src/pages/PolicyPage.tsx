import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

const policies: Record<string, { title: string; content: string }> = {
  terms: {
    title: "Terms of Service",
    content: `
# Terms of Service

**Last Updated:** March 31, 2026

## 1. Acceptance of Terms

By accessing and using AI Viral Creation ("Service"), you accept and agree to be bound by the terms and provision of this agreement.

## 2. Use License

Permission is granted to temporarily download one copy of the materials (information or software) on AI Viral Creation for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:

- Modifying or copying the materials
- Using the materials for any commercial purpose or for any public display
- Attempting to decompile or reverse engineer any software contained on the Service
- Removing any copyright or other proprietary notations from the materials
- Transferring the materials to another person or "mirroring" the materials on any other server

## 3. Disclaimer

The materials on AI Viral Creation are provided on an 'as is' basis. AI Viral Creation makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.

## 4. Limitations

In no event shall AI Viral Creation or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on AI Viral Creation.

## 5. Accuracy of Materials

The materials appearing on AI Viral Creation could include technical, typographical, or photographic errors. AI Viral Creation does not warrant that any of the materials on its Service are accurate, complete, or current.

## 6. Links

AI Viral Creation has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by AI Viral Creation of the site. Use of any such linked website is at the user's own risk.

## 7. Modifications

AI Viral Creation may revise these terms of service for its Service at any time without notice. By using this Service, you are agreeing to be bound by the then current version of these terms of service.

## 8. Governing Law

These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction where AI Viral Creation is located, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
    `,
  },
  privacy: {
    title: "Privacy Policy",
    content: `
# Privacy Policy

**Last Updated:** March 31, 2026

## 1. Introduction

AI Viral Creation ("we" or "us" or "our") operates the AI Viral Creation website (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.

## 2. Information Collection and Use

We collect several different types of information for various purposes to provide and improve our Service to you.

### Types of Data Collected:

**Personal Data:**
- Email address
- First name and last name
- Birth date (for age verification)
- Phone number
- Cookies and usage data

**Usage Data:**
- Browser type and version
- IP address
- Pages visited
- Time and date of visit
- Time spent on pages

## 3. Use of Data

AI Viral Creation uses the collected data for various purposes:

- To provide and maintain our Service
- To notify you about changes to our Service
- To allow you to participate in interactive features of our Service
- To provide customer support
- To gather analysis or valuable information so that we can improve our Service
- To monitor the usage of our Service
- To detect, prevent and address technical issues

## 4. Security of Data

The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.

## 5. Changes to This Privacy Policy

We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy.

## 6. Contact Us

If you have any questions about this Privacy Policy, please contact us at privacy@aiviralcreation.com.
    `,
  },
  refund: {
    title: "Refund Policy",
    content: `
# Refund Policy

**Last Updated:** March 31, 2026

## 1. Overview

At AI Viral Creation, we want you to be completely satisfied with your purchase. This refund policy outlines the terms under which refunds are provided.

## 2. Refund Eligibility

**Refunds are available for:**
- Unused credits purchased within 7 days
- Duplicate charges
- Service failures resulting in non-delivery

**Refunds are NOT available for:**
- Used credits (any generation completed)
- Credits that have expired
- Purchases made more than 7 days ago
- Affiliate commissions

## 3. Refund Process

To request a refund:

1. Contact our support team at support@aiviralcreation.com
2. Provide your account email and order details
3. Explain the reason for the refund request
4. Our team will review and respond within 5 business days

## 4. Refund Timeline

Approved refunds will be processed within 5-10 business days. The refund will be credited back to your original payment method.

## 5. Credit Expiration

Credits expire based on your subscription plan:
- Starter: 7 days
- Pro: 30 days
- Enterprise: 90 days

Expired credits cannot be refunded.

## 6. Disputes

If you have a dispute about a charge, please contact us immediately. We will investigate and resolve the issue fairly.

## 7. Changes to Policy

We reserve the right to modify this refund policy at any time. Changes will be effective immediately upon posting to the website.
    `,
  },
  cookie: {
    title: "Cookie Policy",
    content: `
# Cookie Policy

**Last Updated:** March 31, 2026

## 1. What Are Cookies?

Cookies are small pieces of data stored on your device when you visit a website. They help websites remember information about you and improve your browsing experience.

## 2. Types of Cookies We Use

**Essential Cookies:**
- Session authentication
- Security tokens
- User preferences

**Analytics Cookies:**
- Google Analytics
- Usage patterns
- Performance metrics

**Marketing Cookies:**
- Advertising preferences
- Conversion tracking
- Remarketing

## 3. How We Use Cookies

We use cookies to:
- Remember your login information
- Understand how you use our Service
- Improve our Service
- Personalize your experience
- Measure advertising effectiveness

## 4. Third-Party Cookies

We allow third-party service providers to set cookies on our Service for:
- Analytics (Google Analytics)
- Payment processing (Razorpay)
- Advertising (Google Ads)

## 5. Your Cookie Choices

Most browsers allow you to refuse cookies or alert you when cookies are being sent. You can:
- Disable cookies in your browser settings
- Delete existing cookies
- Use private/incognito browsing mode

**Note:** Disabling cookies may affect your ability to use certain features of our Service.

## 6. Cookie Retention

Cookies are retained for varying periods:
- Session cookies: Deleted when you close your browser
- Persistent cookies: Retained for up to 2 years
- Analytics cookies: Retained for up to 26 months

## 7. Contact Us

If you have questions about our cookie policy, contact us at privacy@aiviralcreation.com.
    `,
  },
  affiliate: {
    title: "Affiliate Program Terms",
    content: `
# Affiliate Program Terms

**Last Updated:** March 31, 2026

## 1. Program Overview

The AI Viral Creation Affiliate Program allows you to earn commissions by referring customers to our Service.

## 2. Commission Structure

- **Commission Rate:** 30% of the purchase value
- **No Commission Caps:** Earn unlimited commissions
- **Payment Terms:** Monthly via bank transfer or cryptocurrency

## 3. Eligibility

To participate in the Affiliate Program, you must:
- Be at least 18 years old
- Have a valid email address
- Comply with all program terms
- Not engage in misleading marketing

## 4. Prohibited Activities

You may NOT:
- Use paid search advertising with our brand name
- Claim false endorsements
- Engage in spamming or unsolicited marketing
- Violate any laws or regulations
- Use misleading or deceptive practices

## 5. Commission Calculation

Commissions are calculated as:
- 30% of the total purchase amount
- Excluding taxes and refunds
- Only for new customers referred by your unique link

## 6. Payment Processing

- Commissions are paid monthly
- Minimum payout threshold: $50
- Payments processed within 15 days of month-end
- Bank transfer or crypto payment options available

## 7. Termination

We reserve the right to terminate the affiliate relationship if:
- You violate these terms
- You engage in fraudulent activity
- Your account has no referrals for 90 days
- You request termination

## 8. Liability

AI Viral Creation is not liable for:
- Lost or delayed payments
- Third-party payment processor issues
- Currency conversion losses
- Chargebacks or refunds

## 9. Changes to Terms

We may modify these terms at any time with 30 days notice. Continued participation constitutes acceptance of changes.
    `,
  },
};

export default function PolicyPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const policyType = params.type as string;
  const policy = policies[policyType];

  if (!policy) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-gray-400">Policy not found</p>
            <Button
              onClick={() => setLocation("/")}
              className="mt-4 bg-purple-600 hover:bg-purple-700"
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Button
          onClick={() => setLocation("/")}
          variant="ghost"
          className="text-gray-400 hover:text-white mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-3xl">{policy.title}</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="prose prose-invert max-w-none">
              {policy.content.split("\n").map((line, idx) => {
                if (line.startsWith("# ")) {
                  return (
                    <h1 key={idx} className="text-2xl font-bold text-white mt-6 mb-4">
                      {line.replace("# ", "")}
                    </h1>
                  );
                }
                if (line.startsWith("## ")) {
                  return (
                    <h2 key={idx} className="text-xl font-bold text-white mt-6 mb-3">
                      {line.replace("## ", "")}
                    </h2>
                  );
                }
                if (line.startsWith("### ")) {
                  return (
                    <h3 key={idx} className="text-lg font-semibold text-white mt-4 mb-2">
                      {line.replace("### ", "")}
                    </h3>
                  );
                }
                if (line.startsWith("- ")) {
                  return (
                    <li key={idx} className="text-gray-300 ml-4 mb-2">
                      {line.replace("- ", "")}
                    </li>
                  );
                }
                if (line.startsWith("**") && line.endsWith("**")) {
                  return (
                    <p key={idx} className="text-gray-300 font-semibold my-2">
                      {line.replace(/\*\*/g, "")}
                    </p>
                  );
                }
                if (line.trim()) {
                  return (
                    <p key={idx} className="text-gray-300 mb-3 leading-relaxed">
                      {line}
                    </p>
                  );
                }
                return null;
              })}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Last updated: March 31, 2026</p>
        </div>
      </div>
    </div>
  );
}
