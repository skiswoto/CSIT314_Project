import { supabase } from '../libs/supabase'

export interface ListingEmailData {
  listingId: string
  category: string
  description: string
  address: string
  startTime: string
  duration: string
}

export const sendListingAcceptedEmail = async (listingData: ListingEmailData) => {
  try {
    console.log('📧 Sending email notification...')
    
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