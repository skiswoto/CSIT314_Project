import { supabase } from '../supabase';

export interface ServiceRating {
    id?: string;
    request_id: number;
    pin_user_id: string;
    volunteer_name: string;
    rating: number;
    comment?: string;
    created_at?: string;
}

// Submit a new service rating
export const submitRating = async (ratingData: ServiceRating) => {
    try {
        const { data, error } = await supabase
            .from('service_ratings')
            .insert([
                {
                    request_id: ratingData.request_id,
                    pin_user_id: ratingData.pin_user_id,
                    volunteer_name: ratingData.volunteer_name,
                    rating: ratingData.rating,
                    comment: ratingData.comment || null,
                }
            ])
            .select()
            .single();

        if (error) throw error;

        return { data, error: null };
    } catch (error: any) {
        console.error('Error submitting rating:', error);
        return { data: null, error: error.message };
    } 
};

// Get rating for a specific request
export const getRatingByRequestId = async (requestId: number, userId: string) => {
    try {
        const { data, error } = await supabase
            .from('service_ratings')
            .select('*')
            .eq('request_id', requestId)
            .eq('pin_user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return { data, error: null };
    } catch (error: any) {
        console.error('Error fetching rating:', error);
        return { data: null, error: error.message };
    }
};

// Get all ratings for a volunteer (for CSR Reps to view)
export const getRatingByVolunteer = async (volunteerName: string) => {
    try{
        const { data, error } = await supabase
            .from('service_ratings')
            .select('*')
            .eq('volunteer_name', volunteerName)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return { data, error: null };
    } catch (error: any) {
        console.error('Error fetching volunteer ratings:', error);
        return { data: null, error: error.message };
    }
};

// Get average rating for a volunteer
export const getAverageRating = async (volunteerName: string) => {
    try {
        const { data, error } = await supabase
            .from('service_ratings')
            .select('rating')
            .eq('volunteer_name', volunteerName);

        if (error) throw error;

        if (!data || data.length === 0) {
            return { average: 0, count: 0, error: null };
        }

        const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
        const average = sum / data.length;

        return {
            average: Number(average.toFixed(1)),
            count: data.length,
            error: null
        };
    } catch (error: any) {
        console.error('Error calculating average rating:', error);
        return { average: 0, count: 0, error: error.message };
    }
};
