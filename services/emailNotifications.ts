import { supabase } from '../libs/supabase'

export interface ListingEmailData {
  listingId: string
  category: string
  description: string
  address: string
  startTime: string
  duration: string
  emailType: 'accepted' | 'completed'
  recipientEmail?: string
}

export const sendListingStatusEmail = async (listingData: ListingEmailData) => {
  try {
    console.log('📧 Sending status email notification...', listingData.emailType)
    
    const { data, error } = await supabase.functions.invoke('send-listing-email', {
      body: listingData
    })
    
    if (error) {
      console.error('❌ Email error:', error)
      throw error
    }
    
    console.log('✅ Email sent:', data)
    return data
    
  } catch (error) {
    console.error('❌ Failed to send email:', error)
    throw error
  }
}

// Legacy function for backward compatibility
export const sendListingAcceptedEmail = async (
  listingData: Omit<ListingEmailData, 'emailType' | 'recipientEmail'>
) => {
  return sendListingStatusEmail({
    ...listingData,
    emailType: 'accepted',
    recipientEmail: 'monasterypin@gmail.com'
  })
}