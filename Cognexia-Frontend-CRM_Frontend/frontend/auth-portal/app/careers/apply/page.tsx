'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, Send, CheckCircle2, FileText, Briefcase, User } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import toast, { Toaster } from 'react-hot-toast';

export default function JobApplicationPage() {
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    linkedin: '',
    portfolio: '',
    
    // Address
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    
    // Position Details
    position: '',
    department: '',
    experienceYears: '',
    currentCompany: '',
    currentPosition: '',
    currentSalary: '',
    expectedSalary: '',
    noticePeriod: '',
    
    // Education
    education: '',
    university: '',
    graduationYear: '',
    specialization: '',
    
    // Skills & Experience
    skills: '',
    certifications: '',
    languages: '',
    
    // Additional Information
    coverLetter: '',
    whyJoin: '',
    availability: '',
    relocate: 'yes',
    referral: '',
    
    // Resume
    resumeFile: null as File | null,
    portfolioFile: null as File | null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({
        ...formData,
        [e.target.name]: file
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      // Append all text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'resumeFile' && key !== 'portfolioFile') {
          formDataToSend.append(key, formData[key as keyof typeof formData] as string);
        }
      });

      // Append files
      if (formData.resumeFile) {
        formDataToSend.append('resumeFile', formData.resumeFile);
      }
      if (formData.portfolioFile) {
        formDataToSend.append('portfolioFile', formData.portfolioFile);
      }

      const response = await fetch('/api/careers/apply', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        toast.success('Application submitted successfully! We\'ll review it and get back to you soon.');
        // Reset form
        setFormData({
          firstName: '', lastName: '', email: '', phone: '', linkedin: '', portfolio: '',
          address: '', city: '', state: '', zipCode: '', country: 'India',
          position: '', department: '', experienceYears: '', currentCompany: '', currentPosition: '',
          currentSalary: '', expectedSalary: '', noticePeriod: '',
          education: '', university: '', graduationYear: '', specialization: '',
          skills: '', certifications: '', languages: '',
          coverLetter: '', whyJoin: '', availability: '', relocate: 'yes', referral: '',
          resumeFile: null, portfolioFile: null
        });
      } else {
        throw new Error('Failed to submit application');
      }
    } catch (error) {
      toast.error('Failed to submit application. Please try again or email your resume to career@cognexiaai.com');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        
        {/* Header */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Link href="/careers" className="inline-flex items-center text-blue-300 hover:text-blue-200 mb-6 transition">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Careers
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Job Application</h1>
              <p className="text-xl text-blue-100">
                Join our team and help build the future of enterprise AI
              </p>
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-12 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-10">
                
                {/* Personal Information */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold">Personal Information</h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="John"
                      />
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Doe"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="john.doe@email.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="+91-1234567890"
                      />
                    </div>

                    <div>
                      <label htmlFor="linkedin" className="block text-sm font-medium mb-2">
                        LinkedIn Profile
                      </label>
                      <input
                        type="url"
                        id="linkedin"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="https://linkedin.com/in/johndoe"
                      />
                    </div>

                    <div>
                      <label htmlFor="portfolio" className="block text-sm font-medium mb-2">
                        Portfolio/Website
                      </label>
                      <input
                        type="url"
                        id="portfolio"
                        name="portfolio"
                        value={formData.portfolio}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="https://yourportfolio.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h3 className="text-xl font-bold mb-6">Address</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label htmlFor="address" className="block text-sm font-medium mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="123 Main Street"
                      />
                    </div>

                    <div>
                      <label htmlFor="city" className="block text-sm font-medium mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Mumbai"
                      />
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-sm font-medium mb-2">
                        State/Province *
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Maharashtra"
                      />
                    </div>

                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium mb-2">
                        ZIP/Postal Code
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="400701"
                      />
                    </div>

                    <div>
                      <label htmlFor="country" className="block text-sm font-medium mb-2">
                        Country *
                      </label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="India"
                      />
                    </div>
                  </div>
                </div>

                {/* Position Details */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold">Position & Experience</h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="position" className="block text-sm font-medium mb-2">
                        Position Applied For *
                      </label>
                      <select
                        id="position"
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      >
                        <option value="">Select Position</option>
                        <option value="Senior AI Engineer">Senior AI Engineer</option>
                        <option value="Full Stack Developer">Full Stack Developer</option>
                        <option value="Product Manager - Legal AI">Product Manager - Legal AI</option>
                        <option value="Healthcare AI Specialist">Healthcare AI Specialist</option>
                        <option value="UX/UI Designer">UX/UI Designer</option>
                        <option value="DevOps Engineer">DevOps Engineer</option>
                        <option value="Machine Learning Researcher">Machine Learning Researcher</option>
                        <option value="Sales Executive">Sales Executive - Enterprise</option>
                        <option value="Customer Success Manager">Customer Success Manager</option>
                        <option value="Security Engineer">Security Engineer</option>
                        <option value="Video AI Engineer">Video AI Engineer</option>
                        <option value="Data Scientist">Data Scientist</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="department" className="block text-sm font-medium mb-2">
                        Department *
                      </label>
                      <select
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      >
                        <option value="">Select Department</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Product">Product</option>
                        <option value="Design">Design</option>
                        <option value="Research">Research</option>
                        <option value="Sales">Sales</option>
                        <option value="Customer Success">Customer Success</option>
                        <option value="Security">Security</option>
                        <option value="Data">Data</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="experienceYears" className="block text-sm font-medium mb-2">
                        Years of Experience *
                      </label>
                      <select
                        id="experienceYears"
                        name="experienceYears"
                        value={formData.experienceYears}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      >
                        <option value="">Select Experience</option>
                        <option value="0-1">0-1 years</option>
                        <option value="1-3">1-3 years</option>
                        <option value="3-5">3-5 years</option>
                        <option value="5-8">5-8 years</option>
                        <option value="8+">8+ years</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="noticePeriod" className="block text-sm font-medium mb-2">
                        Notice Period *
                      </label>
                      <select
                        id="noticePeriod"
                        name="noticePeriod"
                        value={formData.noticePeriod}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      >
                        <option value="">Select Notice Period</option>
                        <option value="Immediate">Immediate</option>
                        <option value="15 days">15 days</option>
                        <option value="30 days">30 days</option>
                        <option value="60 days">60 days</option>
                        <option value="90 days">90 days</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="currentCompany" className="block text-sm font-medium mb-2">
                        Current Company
                      </label>
                      <input
                        type="text"
                        id="currentCompany"
                        name="currentCompany"
                        value={formData.currentCompany}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Current Company Name"
                      />
                    </div>

                    <div>
                      <label htmlFor="currentPosition" className="block text-sm font-medium mb-2">
                        Current Position
                      </label>
                      <input
                        type="text"
                        id="currentPosition"
                        name="currentPosition"
                        value={formData.currentPosition}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Your Current Role"
                      />
                    </div>

                    <div>
                      <label htmlFor="currentSalary" className="block text-sm font-medium mb-2">
                        Current Salary (Annual in INR)
                      </label>
                      <input
                        type="text"
                        id="currentSalary"
                        name="currentSalary"
                        value={formData.currentSalary}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="e.g., 12,00,000"
                      />
                    </div>

                    <div>
                      <label htmlFor="expectedSalary" className="block text-sm font-medium mb-2">
                        Expected Salary (Annual in INR) *
                      </label>
                      <input
                        type="text"
                        id="expectedSalary"
                        name="expectedSalary"
                        value={formData.expectedSalary}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="e.g., 15,00,000"
                      />
                    </div>
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h3 className="text-xl font-bold mb-6">Education</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="education" className="block text-sm font-medium mb-2">
                        Highest Education *
                      </label>
                      <select
                        id="education"
                        name="education"
                        value={formData.education}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      >
                        <option value="">Select Education</option>
                        <option value="High School">High School</option>
                        <option value="Bachelor's">Bachelor's Degree</option>
                        <option value="Master's">Master's Degree</option>
                        <option value="PhD">PhD</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="university" className="block text-sm font-medium mb-2">
                        University/College *
                      </label>
                      <input
                        type="text"
                        id="university"
                        name="university"
                        value={formData.university}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="University Name"
                      />
                    </div>

                    <div>
                      <label htmlFor="graduationYear" className="block text-sm font-medium mb-2">
                        Graduation Year *
                      </label>
                      <input
                        type="number"
                        id="graduationYear"
                        name="graduationYear"
                        value={formData.graduationYear}
                        onChange={handleChange}
                        required
                        min="1950"
                        max="2030"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="2020"
                      />
                    </div>

                    <div>
                      <label htmlFor="specialization" className="block text-sm font-medium mb-2">
                        Specialization/Major *
                      </label>
                      <input
                        type="text"
                        id="specialization"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Computer Science, Engineering, etc."
                      />
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-xl font-bold mb-6">Skills & Qualifications</h3>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="skills" className="block text-sm font-medium mb-2">
                        Technical Skills * (comma-separated)
                      </label>
                      <textarea
                        id="skills"
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                        required
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                        placeholder="e.g., Python, React, Node.js, TensorFlow, AWS, Docker"
                      />
                    </div>

                    <div>
                      <label htmlFor="certifications" className="block text-sm font-medium mb-2">
                        Certifications (comma-separated)
                      </label>
                      <textarea
                        id="certifications"
                        name="certifications"
                        value={formData.certifications}
                        onChange={handleChange}
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                        placeholder="e.g., AWS Certified, Google Cloud Certified, etc."
                      />
                    </div>

                    <div>
                      <label htmlFor="languages" className="block text-sm font-medium mb-2">
                        Languages Known *
                      </label>
                      <input
                        type="text"
                        id="languages"
                        name="languages"
                        value={formData.languages}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="e.g., English, Hindi, Marathi"
                      />
                    </div>
                  </div>
                </div>

                {/* Cover Letter & Documents */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-500 rounded-xl flex items-center justify-center">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold">Cover Letter & Documents</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="coverLetter" className="block text-sm font-medium mb-2">
                        Cover Letter *
                      </label>
                      <textarea
                        id="coverLetter"
                        name="coverLetter"
                        value={formData.coverLetter}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                        placeholder="Tell us about yourself and why you're interested in this position..."
                      />
                    </div>

                    <div>
                      <label htmlFor="whyJoin" className="block text-sm font-medium mb-2">
                        Why do you want to join CognexiaAI? *
                      </label>
                      <textarea
                        id="whyJoin"
                        name="whyJoin"
                        value={formData.whyJoin}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                        placeholder="What excites you about working at CognexiaAI?"
                      />
                    </div>

                    <div>
                      <label htmlFor="resumeFile" className="block text-sm font-medium mb-2">
                        Upload Resume * (PDF, DOC, DOCX - Max 5MB)
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="flex-1 flex items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition">
                          <div className="text-center">
                            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formData.resumeFile ? formData.resumeFile.name : 'Click to upload resume'}
                            </p>
                          </div>
                          <input
                            type="file"
                            id="resumeFile"
                            name="resumeFile"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx"
                            required
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="portfolioFile" className="block text-sm font-medium mb-2">
                        Upload Portfolio/Work Samples (Optional - PDF, Max 10MB)
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="flex-1 flex items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition">
                          <div className="text-center">
                            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formData.portfolioFile ? formData.portfolioFile.name : 'Click to upload portfolio'}
                            </p>
                          </div>
                          <input
                            type="file"
                            id="portfolioFile"
                            name="portfolioFile"
                            onChange={handleFileChange}
                            accept=".pdf"
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h3 className="text-xl font-bold mb-6">Additional Information</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="availability" className="block text-sm font-medium mb-2">
                        When can you start? *
                      </label>
                      <input
                        type="date"
                        id="availability"
                        name="availability"
                        value={formData.availability}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>

                    <div>
                      <label htmlFor="relocate" className="block text-sm font-medium mb-2">
                        Willing to Relocate? *
                      </label>
                      <select
                        id="relocate"
                        name="relocate"
                        value={formData.relocate}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                        <option value="negotiable">Negotiable</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="referral" className="block text-sm font-medium mb-2">
                        How did you hear about us?
                      </label>
                      <select
                        id="referral"
                        name="referral"
                        value={formData.referral}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      >
                        <option value="">Select an option</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Job Board">Job Board</option>
                        <option value="Company Website">Company Website</option>
                        <option value="Referral">Employee Referral</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 font-semibold"
                  >
                    {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
                    <Send className="ml-2 h-5 w-5" />
                  </Button>
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    By submitting this application, you agree to our terms and conditions
                  </p>
                </div>
              </form>
            </div>

            {/* Help Section */}
            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Need Help?</h3>
                  <p className="text-muted-foreground mb-4">
                    If you're experiencing any issues with the application form or have questions, please contact us directly at{' '}
                    <a href="mailto:career@cognexiaai.com" className="text-blue-600 hover:text-blue-700 font-medium">
                      career@cognexiaai.com
                    </a>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    We review all applications within 5-7 business days. Selected candidates will be contacted for the next steps.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
}
