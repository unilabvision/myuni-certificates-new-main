import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getEmailQueue } from '@/app/_services/emailQueue';

// Supabase client - with fallback for missing env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn('Supabase environment variables not found. Database operations will be skipped.');
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface FormFieldValue {
  [key: string]: string | boolean | number | null | undefined;
}

interface FormEmailData {
  applicantName: string;
  applicantEmail: string;
  formTitle: string;
  submissionId: string;
  submissionDate: string;
  formData: FormFieldValue;
}

// Create transporter with better error handling
const createTransporter = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error('Email configuration missing. Please check EMAIL_HOST, EMAIL_USER, and EMAIL_PASSWORD environment variables.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    },
    pool: true,
    maxConnections: 1,
    debug: false,
    logger: false
  });
};

// Internal function to actually send the email (used by queue)
const _sendEmailInternal = async (options: EmailOptions): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    await transporter.verify();

    const mailOptions = {
      from: `"MyUNI" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    await transporter.sendMail(mailOptions);
    
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorCode = error && typeof error === 'object' && 'code' in error ? String(error.code) : 'UNKNOWN';
    const errorCommand = error && typeof error === 'object' && 'command' in error ? String(error.command) : undefined;
    const errorResponse = error && typeof error === 'object' && 'response' in error ? String(error.response) : undefined;
    const errorResponseCode = error && typeof error === 'object' && 'responseCode' in error ? String(error.responseCode) : undefined;
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('❌ Email sending failed:', {
      to: options.to,
      message: errorMessage,
      code: errorCode,
      command: errorCommand,
      response: errorResponse,
      responseCode: errorResponseCode,
      stack: errorStack,
    });
    
    throw new Error(`Email sending failed: ${errorMessage} (Code: ${errorCode})`);
  }
};

// Public function that uses queue system for rate limiting
const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  const emailQueue = getEmailQueue();
  console.log('Email kuyruğa ekleniyor:', options.to);
  return await emailQueue.enqueue(_sendEmailInternal, options);
};

// Generate confirmation email HTML for applicant
const generateConfirmationEmail = (data: FormEmailData): string => {
  return `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Demo Talebi Onayı</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #171717;
          background-color: #f8f9fa;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }
        .header {
          padding: 40px 30px;
          border-bottom: 1px solid #e5e7eb;
        }
        .brand {
          font-size: 20px;
          font-weight: 500;
          color: #171717;
          margin-bottom: 4px;
        }
        .accent-line {
          width: 64px;
          height: 1px;
          background-color: #990000;
          margin-bottom: 16px;
        }
        .header-subtitle {
          font-size: 14px;
          color: #6b7280;
          font-weight: normal;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 16px;
          margin-bottom: 24px;
          color: #171717;
          font-weight: 500;
        }
        .message {
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 32px;
          color: #4b5563;
        }
        .info-card {
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 24px;
          margin: 24px 0;
        }
        .info-card h3 {
          font-size: 16px;
          font-weight: 500;
          color: #171717;
          margin-bottom: 16px;
        }
        .info-row {
          display: flex;
          margin-bottom: 8px;
          font-size: 14px;
          align-items: baseline;
        }
        .info-row:last-child {
          margin-bottom: 0;
        }
        .info-label {
          font-weight: 500;
          color: #6b7280;
          width: 100px;
          flex-shrink: 0;
        }
        .info-value {
          color: #171717;
        }
        .note-section {
          background-color: #fef3f2;
          border-left: 3px solid #990000;
          padding: 20px;
          margin: 24px 0;
        }
        .note-section p {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.6;
          margin: 0;
        }
        .contact-section {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
        }
        .contact-section h3 {
          font-size: 16px;
          font-weight: 500;
          color: #171717;
          margin-bottom: 12px;
        }
        .contact-info {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.5;
        }
        .footer {
          padding: 24px 30px;
          background-color: #f9fafb;
          border-top: 1px solid #e5e7eb;
          text-align: center;
        }
        .footer p {
          font-size: 12px;
          color: #9ca3af;
          margin-bottom: 4px;
        }
        .footer p:last-child {
          margin-bottom: 0;
        }
        @media (max-width: 600px) {
          body {
            padding: 10px;
          }
          .header, .content {
            padding: 24px 20px;
          }
          .info-card {
            padding: 20px;
          }
          .info-row {
            flex-direction: column;
            margin-bottom: 12px;
          }
          .info-label {
            width: auto;
            margin-bottom: 2px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="brand">MyUNI</div>
          <div class="accent-line"></div>
          <div class="header-subtitle">Demo Talebi Onay Bildirimi</div>
        </div>
        
        <div class="content">
          <div class="greeting">
            Sayın ${data.applicantName},
          </div>
          
          <div class="message">
            İlginiz için teşekkür ederiz. <strong>${data.formTitle}</strong> talebiniz tarafımıza ulaşmış olup, 
            değerlendirme sürecine alınmıştır.
          </div>
          
          <div class="info-card">
            <h3>Talep Detayları</h3>
            <div class="info-row">
              <div class="info-label">Talep No:</div>
              <div class="info-value">${data.submissionId}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Tarih:</div>
              <div class="info-value">${data.submissionDate}</div>
            </div>
            <div class="info-row">
              <div class="info-label">E-posta:</div>
              <div class="info-value">${data.applicantEmail}</div>
            </div>
          </div>
          
          <div class="note-section">
            <p>
              Talebiniz ekibimiz tarafından incelenecek ve 24 saat içinde sizinle iletişime geçeceğiz. 
              Sorularınız için aşağıdaki iletişim bilgilerini kullanabilirsiniz.
            </p>
          </div>
          
          <div class="contact-section">
            <h3>İletişim</h3>
            <div class="contact-info">
              <p>info@myunilab.net</p>
              <p>Talep No: ${data.submissionId}</p>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>Bu e-posta otomatik olarak gönderilmiştir.</p>
          <p>© 2025 MyUNI</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate notification email HTML for admin
const generateNotificationEmail = (data: FormEmailData): string => {
  const formDataEntries = Object.entries(data.formData)
    .map(([key, value]) => {
      let displayValue;
      if (typeof value === 'boolean') {
        displayValue = value ? 'Evet' : 'Hayır';
      } else if (value === null || value === undefined || value === '') {
        displayValue = 'Belirtilmemiş';
      } else {
        displayValue = String(value).trim();
        if (displayValue.length > 200) {
          displayValue = displayValue.substring(0, 200) + '...';
        }
      }
      
      const fieldNameMap: { [key: string]: string } = {
        'name': 'Ad Soyad',
        'email': 'E-posta',
        'phone': 'Telefon',
        'company': 'Şirket/Kurum',
        'country': 'Ülke',
        'message': 'Mesaj'
      };
      
      const displayKey = fieldNameMap[key] || key;
      
      return `
        <div class="form-row">
          <div class="form-label">${displayKey}:</div>
          <div class="form-value">${displayValue}</div>
        </div>
      `;
    })
    .join('');

  const formDataSection = formDataEntries ? `
    <div class="form-data">
      ${formDataEntries}
    </div>
  ` : '<p style="color: #6b7280; font-size: 14px; padding: 16px; background-color: #f9fafb; border-radius: 6px; border: 1px solid #e5e7eb;">Form verisi bulunamadı.</p>';

  return `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Yeni Demo Talebi</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #171717;
          background-color: #f8f9fa;
          padding: 20px;
        }
        .container {
          max-width: 700px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }
        .header {
          padding: 32px 30px;
          background-color: #fef2f2;
          border-bottom: 1px solid #fecaca;
        }
        .alert-badge {
          display: inline-block;
          background-color: #dc2626;
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 12px;
        }
        .header h1 {
          font-size: 18px;
          font-weight: 500;
          color: #171717;
          margin-bottom: 8px;
        }
        .header-subtitle {
          font-size: 14px;
          color: #6b7280;
        }
        .content {
          padding: 32px 30px;
        }
        .alert-message {
          background-color: #fff7ed;
          border: 1px solid #fed7aa;
          border-left: 3px solid #ea580c;
          padding: 16px;
          margin-bottom: 24px;
          border-radius: 4px;
        }
        .alert-text {
          font-size: 14px;
          color: #9a3412;
          font-weight: 500;
        }
        .section {
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 24px;
          margin-bottom: 20px;
        }
        .section-title {
          font-size: 16px;
          font-weight: 500;
          color: #171717;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e5e7eb;
        }
        .info-row, .form-row {
          display: flex;
          margin-bottom: 8px;
          font-size: 14px;
          align-items: baseline;
        }
        .info-row:last-child, .form-row:last-child {
          margin-bottom: 0;
        }
        .info-label, .form-label {
          font-weight: 500;
          color: #6b7280;
          width: 120px;
          flex-shrink: 0;
        }
        .info-value, .form-value {
          color: #171717;
          word-break: break-word;
        }
        .action-section {
          background-color: #171717;
          color: #ffffff;
          padding: 24px;
          text-align: center;
          margin-top: 20px;
        }
        .action-section h3 {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 8px;
        }
        .action-section p {
          font-size: 14px;
          opacity: 0.8;
        }
        .footer {
          padding: 20px 30px;
          background-color: #f9fafb;
          border-top: 1px solid #e5e7eb;
          text-align: center;
        }
        .footer p {
          font-size: 12px;
          color: #9ca3af;
        }
        @media (max-width: 600px) {
          body {
            padding: 10px;
          }
          .header, .content {
            padding: 20px;
          }
          .section {
            padding: 20px;
          }
          .info-row, .form-row {
            flex-direction: column;
            margin-bottom: 12px;
          }
          .info-label, .form-label {
            width: auto;
            margin-bottom: 4px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="alert-badge">Yeni</div>
          <h1>Demo Talebi Bildirimi</h1>
          <div class="header-subtitle">MyUNI</div>
        </div>
        
        <div class="content">
          <div class="alert-message">
            <div class="alert-text">
              <strong>${data.formTitle}</strong> için yeni bir demo talebi alınmıştır.
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Talep Bilgileri</div>
            <div class="info-row">
              <div class="info-label">Talep No:</div>
              <div class="info-value">${data.submissionId}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Tarih:</div>
              <div class="info-value">${data.submissionDate}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Başvuran:</div>
              <div class="info-value">${data.applicantName}</div>
            </div>
            <div class="info-row">
              <div class="info-label">E-posta:</div>
              <div class="info-value">${data.applicantEmail}</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Form Verileri</div>
            ${formDataSection}
          </div>
          
          <div class="action-section">
            <h3>Değerlendirme Gerekli</h3>
            <p>Demo talebini incelemek için yönetici paneline giriş yapınız.</p>
          </div>
        </div>
        
        <div class="footer">
          <p>MyUNI - Otomatik Bildirim Sistemi</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Main function to send form submission emails with improved error handling
const sendFormSubmissionEmails = async (data: FormEmailData): Promise<{ success: boolean; errors: string[] }> => {
  const errors: string[] = [];
  let confirmationSent = false;
  let notificationsSent = 0;
  
  try {
    // Send confirmation email to applicant
    try {
      await sendEmail({
        to: data.applicantEmail,
        subject: `Demo Talebiniz Alındı - ${data.formTitle}`,
        html: generateConfirmationEmail(data),
        text: `Sayın ${data.applicantName}, ${data.formTitle} talebiniz tarafımıza ulaşmıştır. Talep No: ${data.submissionId}`,
      });
      
      confirmationSent = true;
    } catch (confirmationError) {
      const errorMessage = confirmationError instanceof Error ? confirmationError.message : 'Unknown error occurred';
      const errorMsg = `Başvuru sahibine onay e-postası gönderilemedi: ${data.applicantEmail} - ${errorMessage}`;
      console.error('❌ Confirmation email failed:', confirmationError);
      errors.push(errorMsg);
    }

    // Send notification emails to admins
    const notificationEmails = process.env.NOTIFICATION_EMAILS?.split(',') || ['info@myunilab.net'];
    
    for (const email of notificationEmails) {
      const cleanEmail = email.trim();
      if (!cleanEmail) continue;
      
      try {
        await sendEmail({
          to: cleanEmail,
          subject: `Yeni Demo Talebi - ${data.formTitle}`,
          html: generateNotificationEmail(data),
          text: `Yeni demo talebi: ${data.applicantName} (${data.applicantEmail}), Form: ${data.formTitle}, No: ${data.submissionId}`,
        });
        
        notificationsSent++;
      } catch (notificationError) {
        const errorMessage = notificationError instanceof Error ? notificationError.message : 'Unknown error occurred';
        const errorMsg = `Admin e-postası gönderilemedi: ${cleanEmail} - ${errorMessage}`;
        console.error(`❌ Notification email failed for ${cleanEmail}:`, notificationError);
        errors.push(errorMsg);
      }
    }

    const success = confirmationSent && notificationsSent > 0;
    
    return {
      success,
      errors,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorMsg = `E-posta gönderme işlemi genel hatası: ${errorMessage}`;
    console.error('💥 Email sending process failed:', {
      message: errorMessage,
      stack: errorStack,
    });
    return {
      success: false,
      errors: [errorMsg, ...errors],
    };
  }
};

export async function POST(request: NextRequest) {
  try {
    console.log('Demo request API called');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { name, email, phone, company, country, message } = body;

    // Validate required fields
    if (!name || !email) {
      console.log('Validation failed: missing required fields');
      return NextResponse.json(
        { error: 'Ad soyad ve e-posta alanları zorunludur.' },
        { status: 400 }
      );
    }

    // Generate submission ID and date
    const submissionId = `DEMO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const submissionDate = new Date().toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Prepare form data
    const formData: FormEmailData = {
      applicantName: name,
      applicantEmail: email,
      formTitle: 'Demo Talep Formu',
      submissionId,
      submissionDate,
      formData: {
        name,
        email,
        phone: phone || '',
        company: company || '',
        country: country || '',
        message: message || ''
      }
    };

    // Save to database (optional - continue even if DB fails)
    let dbSuccess = false;
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
    console.log('Supabase Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set');
    
    if (supabase) {
      try {
        console.log('Attempting to save to database...');
        const { error: dbError } = await supabase
          .from('myuni_contacts')
          .insert({
            submission_id: submissionId,
            name: name,
            email: email,
            phone: phone || null,
            company: company || null,
            country: country || null,
            message: message || null,
            status: 'pending',
            priority: 'medium'
          });

        if (dbError) {
          console.error('Database error:', dbError);
          console.log('Continuing without database save...');
        } else {
          console.log('Successfully saved to database');
          dbSuccess = true;
        }
      } catch (dbException) {
        console.error('Database connection error:', dbException);
        console.log('Continuing without database save...');
      }
    } else {
      console.log('Supabase not configured, skipping database save');
      console.log('Please add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local');
    }

    // Send emails
    const emailResult = await sendFormSubmissionEmails(formData);

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Demo talebiniz başarıyla gönderildi.',
        submissionId,
        dbSaved: dbSuccess
      });
    } else {
      console.error('Email sending failed:', emailResult.errors);
      return NextResponse.json({
        success: false,
        message: 'Demo talebi kaydedildi ancak e-posta gönderilemedi.',
        errors: emailResult.errors,
        submissionId,
        dbSaved: dbSuccess
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Demo request API error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        error: 'Sunucu hatası. Lütfen tekrar deneyin.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
