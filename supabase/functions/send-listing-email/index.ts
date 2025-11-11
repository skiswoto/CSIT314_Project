// Import serve function from Deno standard library
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

// This function runs whenever someone calls it
serve(async (req: Request) => {
  
  // Handle CORS (Cross-Origin Resource Sharing)
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    // Get the listing data and email type
    const { 
      listingId, 
      category, 
      description, 
      address, 
      startTime, 
      duration,
      emailType, // 'accepted', 'completed', or 'edited'
      recipientEmail,
      changes // Array of changes for 'edited' type
    } = await req.json()
    
    console.log('📧 Sending email for listing:', listingId, 'Type:', emailType)
    
    // Determine email subject and content based on type
    let subject = '';
    let htmlContent = '';
    
    if (emailType === 'accepted') {
      subject = `✅ Listing Accepted: ${category}`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #2B61A6;">🎉 Your Listing Has Been Accepted!</h2>
            <p>Great news! A CSR representative has accepted your service request.</p>
            
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 10px 0;">
              <p><strong>Category:</strong> ${category}</p>
              <p><strong>Description:</strong> ${description}</p>
              <p><strong>Address:</strong> ${address}</p>
              <p><strong>Start Time:</strong> ${startTime}</p>
              <p><strong>Duration:</strong> ${duration} hour(s)</p>
              <p><strong>Listing ID:</strong> ${listingId}</p>
            </div>
            
            <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">
              Your service will be marked as completed automatically in 15 seconds.
              You will receive another email when the service is completed.
            </p>
          </body>
        </html>
      `;
    } else if (emailType === 'completed') {
      subject = `✨ Service Completed: ${category}`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #16A34A;">✨ Your Service Has Been Completed!</h2>
            <p>Your service request has been successfully completed.</p>
            
            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #16A34A;">
              <p><strong>Category:</strong> ${category}</p>
              <p><strong>Description:</strong> ${description}</p>
              <p><strong>Address:</strong> ${address}</p>
              <p><strong>Start Time:</strong> ${startTime}</p>
              <p><strong>Duration:</strong> ${duration} hour(s)</p>
              <p><strong>Listing ID:</strong> ${listingId}</p>
            </div>
            
            <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0; border: 2px solid #FBBF24;">
              <h3 style="color: #92400E; margin-top: 0;">⭐ Rate Your Experience</h3>
              <p style="color: #92400E; margin-bottom: 0;">
                We'd love to hear about your experience! Please take a moment to rate the service you received.
              </p>
            </div>
            
            <p style="color: #6B7280; font-size: 14px;">
              Thank you for using our service!
            </p>
          </body>
        </html>
      `;
    } else if (emailType === 'edited') {
      subject = `📝 Listing Updated: ${category}`;
      
      // Build changes HTML
      let changesHtml = '';
      if (changes && Array.isArray(changes) && changes.length > 0) {
        changesHtml = changes.map(change => `
          <div style="background: #FEF3C7; padding: 12px; border-radius: 6px; margin: 8px 0;">
            <p style="margin: 0; color: #92400E;"><strong>${change.field}:</strong></p>
            <p style="margin: 4px 0 0 0; color: #92400E;">
              <span style="text-decoration: line-through; opacity: 0.7;">${change.oldValue}</span>
              →
              <span style="font-weight: bold;">${change.newValue}</span>
            </p>
          </div>
        `).join('');
      } else {
        changesHtml = '<p style="color: #6B7280;">Details have been updated.</p>';
      }
      
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #2563EB;">📝 Your Listing Has Been Updated</h2>
            <p>The following changes have been made to your service request:</p>
            
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 10px 0;">
              <h3 style="color: #111827; margin-top: 0;">Changes Made:</h3>
              ${changesHtml}
            </div>
            
            <div style="background: #EEF2FF; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563EB;">
              <h3 style="color: #1E40AF; margin-top: 0;">Updated Listing Details:</h3>
              <p><strong>Category:</strong> ${category}</p>
              <p><strong>Description:</strong> ${description}</p>
              <p><strong>Address:</strong> ${address}</p>
              <p><strong>Start Time:</strong> ${startTime}</p>
              <p><strong>Duration:</strong> ${duration}</p>
              <p><strong>Listing ID:</strong> ${listingId}</p>
            </div>
            
            <p style="color: #6B7280; font-size: 14px;">
              Your listing is still active and awaiting CSR assignment.
            </p>
          </body>
        </html>
      `;
    } else {
      throw new Error('Invalid email type. Must be "accepted", "completed", or "edited"');
    }
    
    // Call Resend API to send the email
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: [recipientEmail || 'monasterypin@gmail.com'], // Use provided email or fallback
        subject: subject,
        html: htmlContent
      })
    })

    // Check if Resend API call was successful
    const resendData = await resendResponse.json()
    
    if (!resendResponse.ok) {
      throw new Error(`Resend API error: ${JSON.stringify(resendData)}`)
    }

    console.log('✅ Email sent successfully:', resendData)

    // Return success response
    return new Response(
      JSON.stringify({ success: true, emailId: resendData.id }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        status: 200
      }
    )

  } catch (error) {
    // Handle errors
    console.error('❌ Error sending email:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to send email notification'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  }
})