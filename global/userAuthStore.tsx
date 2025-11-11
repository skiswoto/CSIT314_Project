import { supabase } from "@/libs/supabase";
import { User } from '@supabase/supabase-js';
import { create } from "zustand";


type State ={
    user: User | null
}

type Action = {
    setUser: (User: User | null) => void
    clearUser: () => void
}

export const userAuthStore = create<State & Action>((set) => ({
    user: null,
    role: 'pin',
    setUser: (user: User | null) => set({ user }),
    clearUser: () => set({ user: null})
}))

const renewSessionIfExpired = async() => {
    {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        if (data?.session) {
            await supabase.auth.setSession({
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token
            })
        }
    }
}

// Initialize and sync with Supabase session
supabase.auth.getUser().then(({ data: { user } }) => {
    userAuthStore.getState().setUser(user);
});

// Listen for auth changes (login/logout automatically update store)
supabase.auth.onAuthStateChange(async(_event, session) => {
    userAuthStore.getState().setUser(session?.user ?? null);

    if (session) {
        await supabase.auth.setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token
        })
    }
});

renewSessionIfExpired()


// // For when your session expired but cookies didnt update :
// supabase.auth.getUser().then(async() => {
//     userAuthStore.getState().clearUser()

//     await supabase.auth.setSession({
//         access_token: "",
//         refresh_token: ""
//     })
// })

