import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client  
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract form fields
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const position = formData.get('position') as string;
    const department = formData.get('department') as string;
    const expectedSalary = formData.get('expectedSalary') as string;
    const city = formData.get('city') as string;
    const state = formData.get('state') as string;
    const country = formData.get('country') as string;
    const experienceYears = formData.get('experienceYears') as string;
    const noticePeriod = formData.get('noticePeriod') as string;
    const education = formData.get('education') as string;
    const university = formData.get('university') as string;
    const graduationYear = formData.get('graduationYear') as string;
    const specialization = formData.get('specialization') as string;
    const skills = formData.get('skills') as string;
    const languages = formData.get('languages') as string;
    const coverLetter = formData.get('coverLetter') as string;
    const whyJoin = formData.get('whyJoin') as string;
    const availability = formData.get('availability') as string;
    const relocate = formData.get('relocate') as string;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !position || !department ||
        !expectedSalary || !city || !state || !country || !experienceYears ||
        !noticePeriod || !education || !university || !graduationYear || 
        !specialization || !skills || !languages || !coverLetter || 
        !whyJoin || !availability || !relocate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Handle file uploads
    const resumeFile = formData.get('resumeFile') as File | null;
    const portfolioFile = formData.get('portfolioFile') as File | null;

    let resumeUrl = null;
    let portfolioUrl = null;

    // Upload resume if provided
    if (resumeFile) {
      const resumeFileName = `resumes/${Date.now()}-${resumeFile.name}`;
      const { data: resumeData, error: resumeError } = await supabase.storage
        .from('job-applications')
        .upload(resumeFileName, resumeFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (resumeError) {
        console.error('Resume upload error:', resumeError);
      } else {
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('job-applications')
          .getPublicUrl(resumeFileName);
        resumeUrl = publicUrl;
      }
    }

    // Upload portfolio if provided
    if (portfolioFile) {
      const portfolioFileName = `portfolios/${Date.now()}-${portfolioFile.name}`;
      const { data: portfolioData, error: portfolioError } = await supabase.storage
        .from('job-applications')
        .upload(portfolioFileName, portfolioFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (portfolioError) {
        console.error('Portfolio upload error:', portfolioError);
      } else {
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('job-applications')
          .getPublicUrl(portfolioFileName);
        portfolioUrl = publicUrl;
      }
    }

    // Insert application into database
    const { data, error } = await supabase
      .from('job_applications')
      .insert([
        {
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone,
          linkedin: formData.get('linkedin') as string || null,
          portfolio: formData.get('portfolio') as string || null,
          address: formData.get('address') as string || null,
          city: city,
          state: state,
          zip_code: formData.get('zipCode') as string || null,
          country: country,
          position: position,
          department: department,
          experience_years: experienceYears,
          current_company: formData.get('currentCompany') as string || null,
          current_position: formData.get('currentPosition') as string || null,
          current_salary: formData.get('currentSalary') as string || null,
          expected_salary: expectedSalary,
          notice_period: noticePeriod,
          education: education,
          university: university,
          graduation_year: parseInt(graduationYear),
          specialization: specialization,
          skills: skills,
          certifications: formData.get('certifications') as string || null,
          languages: languages,
          cover_letter: coverLetter,
          why_join: whyJoin,
          resume_url: resumeUrl,
          portfolio_url: portfolioUrl,
          availability: availability,
          relocate: relocate,
          referral: formData.get('referral') as string || null,
          status: 'pending',
          stage: 'application_received'
        }
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to submit job application' },
        { status: 500 }
      );
    }

    // Send email notification (optional - you can implement this later)
    // await sendApplicationNotification(email, firstName, position);

    return NextResponse.json(
      { 
        message: 'Application submitted successfully',
        data: data 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Job application submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
