import { supabase } from "@/libs/supabase";
import { User } from '@supabase/supabase-js';
import { create } from "zustand";


type State ={
    user: User | null
}

type Action = {
    setUser: (User: User | null) => void
}

export const userAuthStore = create<State & Action>((set) => ({
    user: null,
    setUser: (user: User | null) => set({ user })
}))

// Initialize and sync with Supabase session
supabase.auth.getUser().then(({ data: { user } }) => {
    userAuthStore.getState().setUser(user);
});

// Listen for auth changes (login/logout automatically update store)
supabase.auth.onAuthStateChange((_event, session) => {
    userAuthStore.getState().setUser(session?.user ?? null);
});
