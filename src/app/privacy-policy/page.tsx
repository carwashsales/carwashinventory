'use client';

import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-primary">
            <Link href="/">Siyara Wasla</Link>
          </h1>
        </div>
      </header>
      <main className="container mx-auto flex-1 py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>Last updated: July 29, 2024</p>

            <h2 className="text-xl font-semibold text-foreground pt-4">Introduction</h2>
            <p>
              Welcome to Siyara Wasla ("we," "our," "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
            </p>

            <h2 className="text-xl font-semibold text-foreground pt-4">Information We Collect</h2>
            <p>We may collect information about you in a variety of ways. The information we may collect via the Application includes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Personal Data:</strong> Personally identifiable information, such as your email address, that you voluntarily give to us when you register with the Application.
              </li>
              <li>
                <strong>Service Data:</strong> All data you generate by using the service, including information about car wash services, staff members, sales, and commissions, is stored and associated with your user account.
              </li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground pt-4">Use of Your Information</h2>
            <p>
              Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Create and manage your account.</li>
              <li>Enable user-to-user communications.</li>
              <li>Generate reports and analyze data for business purposes.</li>
              <li>Provide you with customer support.</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground pt-4">Data Storage</h2>
            <p>
              Your information, including personal and service data, is stored securely on Google Firebase services (Authentication and Firestore). We take reasonable measures to help protect your information from loss, theft, misuse, and unauthorized access.
            </p>

            <h2 className="text-xl font-semibold text-foreground pt-4">Disclosure of Your Information</h2>
            <p>
              We do not share, sell, rent, or trade your information with any third parties for their promotional purposes.
            </p>

            <h2 className="text-xl font-semibold text-foreground pt-4">Your Rights</h2>
            <p>
              You have the right to request access to the data we hold about you. You can also request that we delete your account and all associated data. To make such a request, please contact us.
            </p>

            <h2 className="text-xl font-semibold text-foreground pt-4">Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
            </p>

            <h2 className="text-xl font-semibold text-foreground pt-4">Contact Us</h2>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:banksray206@gmail.com" className="text-primary hover:underline">banksray206@gmail.com</a>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
