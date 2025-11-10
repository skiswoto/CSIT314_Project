// Import serve function from Deno standard library
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

// This function runs whenever someone calls it
serve(async (req: Request) => {
  
  // Handle CORS (Cross-Origin Resource Sharing)
  // This allows your Expo app to call this function from a different domain
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
    // STEP 2: Get the listing data sent from your Expo app
    const { listingId, category, description, address, startTime, duration } = await req.json()
    
    console.log('📧 Sending email for listing:', listingId)
    
    // STEP 3: Call Resend API to send the email
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Get API key from Supabase environment (the secret we set in Step 1)
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',  // Resend's test email (free to use)
        to: ['monasterypin@gmail.com'], // Hardcoded recepient TODO: change to profile.email
        subject: `✅ New Listing Accepted: ${category}`,
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
              <h2 style="color: #2B61A6;">🎉 Listing Accepted!</h2>
              <p>A CSR representative has accepted the following listing:</p>
              
              <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 10px 0;">
                <p><strong>Category:</strong> ${category}</p>
                <p><strong>Description:</strong> ${description}</p>
                <p><strong>Address:</strong> ${address}</p>
                <p><strong>Start Time:</strong> ${startTime}</p>
                <p><strong>Duration:</strong> ${duration} hour(s)</p>
                <p><strong>Listing ID:</strong> ${listingId}</p>
              </div>
            </body>
          </html>
        `
      })
    })

    // STEP 4: Check if Resend API call was successful
    const resendData = await resendResponse.json()
    
    if (!resendResponse.ok) {
      throw new Error(`Resend API error: ${JSON.stringify(resendData)}`)
    }

    console.log('✅ Email sent successfully:', resendData)

    // STEP 5: Return success response to your Expo app
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
    // STEP 6: Handle errors
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