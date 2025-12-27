"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Shield, ArrowLeft, Film, Lock, Eye, FileText, Users, Database, Mail, Calendar } from "lucide-react"

export default function PrivacyPolicyPage() {
  const lastUpdated = "December 23, 2024"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      {/* Header/Navigation */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
                <Film className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  CineMarathi
                </h1>
                <p className="text-xs text-slate-500">Privacy & Security</p>
              </div>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="space-y-6 sm:space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <Shield className="text-white" size={36} />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-slate-600 mt-3 text-base sm:text-lg max-w-2xl mx-auto">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <Calendar size={16} />
              <span>Last updated: {lastUpdated}</span>
            </div>
          </div>

          {/* Introduction */}
          <Card className="p-5 sm:p-6 lg:p-8 bg-white border-0 shadow-xl">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <FileText size={24} className="text-purple-600" />
                Introduction
              </h2>
              <p className="text-slate-700 leading-relaxed">
                Welcome to CineMarathi. We are committed to protecting your privacy and ensuring the security of your personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
              <p className="text-slate-700 leading-relaxed">
                By using CineMarathi, you agree to the collection and use of information in accordance with this policy. 
                If you do not agree with our policies and practices, please do not use our services.
              </p>
            </div>
          </Card>

          {/* Information We Collect */}
          <Card className="p-5 sm:p-6 lg:p-8 bg-white border-0 shadow-xl">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Database size={24} className="text-purple-600" />
                Information We Collect
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Personal Information</h3>
                  <p className="text-slate-700 leading-relaxed mb-2">
                    We collect information that you provide directly to us, including:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                    <li>Name, email address, and contact information</li>
                    <li>Date of birth and gender</li>
                    <li>Location and address</li>
                    <li>Profile pictures and portfolio information</li>
                    <li>Payment and billing information (processed securely through third-party providers)</li>
                    <li>User preferences and settings</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Usage Information</h3>
                  <p className="text-slate-700 leading-relaxed mb-2">
                    We automatically collect certain information when you use our platform:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                    <li>Device information (type, model, operating system)</li>
                    <li>IP address and location data</li>
                    <li>Browser type and version</li>
                    <li>Pages visited and time spent on pages</li>
                    <li>Search queries and interactions</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Content Information</h3>
                  <p className="text-slate-700 leading-relaxed mb-2">
                    We collect content you create and share on our platform:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                    <li>Profile information and bio</li>
                    <li>Portfolio items and media uploads</li>
                    <li>Applications and casting call submissions</li>
                    <li>Messages and communications</li>
                    <li>Ratings and reviews</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* How We Use Your Information */}
          <Card className="p-5 sm:p-6 lg:p-8 bg-white border-0 shadow-xl">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Eye size={24} className="text-purple-600" />
                How We Use Your Information
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We use the information we collect for various purposes, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li><strong>Service Provision:</strong> To provide, maintain, and improve our services</li>
                <li><strong>Account Management:</strong> To create and manage your account, process transactions, and send notifications</li>
                <li><strong>Communication:</strong> To respond to your inquiries, send updates, and provide customer support</li>
                <li><strong>Matching:</strong> To connect actors, technicians, and production houses</li>
                <li><strong>Personalization:</strong> To personalize your experience and show relevant content</li>
                <li><strong>Analytics:</strong> To analyze usage patterns and improve our platform</li>
                <li><strong>Security:</strong> To detect, prevent, and address fraud, security issues, and technical problems</li>
                <li><strong>Legal Compliance:</strong> To comply with legal obligations and enforce our terms</li>
              </ul>
            </div>
          </Card>

          {/* Information Sharing */}
          <Card className="p-5 sm:p-6 lg:p-8 bg-white border-0 shadow-xl">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Users size={24} className="text-purple-600" />
                Information Sharing and Disclosure
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li><strong>Public Profile:</strong> Your profile information may be visible to other users on the platform</li>
                <li><strong>Service Providers:</strong> With third-party service providers who perform services on our behalf</li>
                <li><strong>Business Transfers:</strong> In connection with any merger, sale, or acquisition</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
              </ul>
            </div>
          </Card>

          {/* Data Security */}
          <Card className="p-5 sm:p-6 lg:p-8 bg-white border-0 shadow-xl">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Lock size={24} className="text-purple-600" />
                Data Security
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We implement appropriate technical and organizational measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security assessments and updates</li>
                <li>Limited access to personal information on a need-to-know basis</li>
                <li>Secure payment processing through trusted third-party providers</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                However, no method of transmission over the internet or electronic storage is 100% secure. 
                While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
              </p>
            </div>
          </Card>

          {/* Your Rights */}
          <Card className="p-5 sm:p-6 lg:p-8 bg-white border-0 shadow-xl">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Shield size={24} className="text-purple-600" />
                Your Rights and Choices
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Objection:</strong> Object to processing of your personal information</li>
                <li><strong>Withdrawal:</strong> Withdraw consent where processing is based on consent</li>
                <li><strong>Account Settings:</strong> Update your account information and privacy settings at any time</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
              </p>
            </div>
          </Card>

          {/* Cookies */}
          <Card className="p-5 sm:p-6 lg:p-8 bg-white border-0 shadow-xl">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <FileText size={24} className="text-purple-600" />
                Cookies and Tracking Technologies
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to track activity on our platform and store certain information. 
                Cookies are files with a small amount of data that may include an anonymous unique identifier.
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                Types of cookies we use:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li><strong>Essential Cookies:</strong> Required for the platform to function properly</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform</li>
                <li><strong>Preference Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. 
                However, if you do not accept cookies, you may not be able to use some portions of our platform.
              </p>
            </div>
          </Card>

          {/* Third-Party Services */}
          <Card className="p-5 sm:p-6 lg:p-8 bg-white border-0 shadow-xl">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Users size={24} className="text-purple-600" />
                Third-Party Services
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Our platform may contain links to third-party websites or services that are not owned or controlled by us. 
                We are not responsible for the privacy practices of these third parties.
              </p>
              <p className="text-slate-700 leading-relaxed">
                We use third-party services for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>Payment processing</li>
                <li>Analytics and performance monitoring</li>
                <li>Cloud storage and hosting</li>
                <li>Email and notification services</li>
                <li>Social media integration</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                We encourage you to review the privacy policies of any third-party services you access through our platform.
              </p>
            </div>
          </Card>

          {/* Children's Privacy */}
          <Card className="p-5 sm:p-6 lg:p-8 bg-white border-0 shadow-xl">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Shield size={24} className="text-purple-600" />
                Children's Privacy
              </h2>
              <p className="text-slate-700 leading-relaxed">
                Our platform is not intended for children under the age of 18. We do not knowingly collect personal information 
                from children under 18. If you are a parent or guardian and believe your child has provided us with personal 
                information, please contact us immediately. If we become aware that we have collected personal information from 
                a child under 18, we will take steps to delete such information from our servers.
              </p>
            </div>
          </Card>

          {/* Changes to Policy */}
          <Card className="p-5 sm:p-6 lg:p-8 bg-white border-0 shadow-xl">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <FileText size={24} className="text-purple-600" />
                Changes to This Privacy Policy
              </h2>
              <p className="text-slate-700 leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
                Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy 
                Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </p>
            </div>
          </Card>

          {/* Contact Us */}
          <Card className="p-5 sm:p-6 lg:p-8 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 shadow-xl">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Mail size={24} className="text-purple-600" />
                Contact Us
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="space-y-2 text-slate-700">
                <p><strong>Email:</strong> privacy@cinemarathi.com</p>
                <p><strong>Support:</strong> support@cinemarathi.com</p>
                <p className="mt-4">
                  For account deletion requests, please visit our{" "}
                  <Link href="/delete-account" className="text-purple-600 hover:text-purple-700 font-semibold underline">
                    Delete Account
                  </Link>{" "}
                  page.
                </p>
              </div>
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center pt-6 space-y-4">
            <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
              <Link href="/delete-account" className="hover:text-slate-700 transition-colors">
                Delete Account
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-slate-700 transition-colors">
                Terms of Service
              </Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-slate-700 transition-colors">
                Contact Us
              </Link>
            </div>
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} CineMarathi. All rights reserved.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

