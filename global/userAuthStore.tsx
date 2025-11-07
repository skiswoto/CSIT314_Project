// import { supabase } from "@/libs/supabase";
// import { User } from '@supabase/supabase-js';
// import { create } from "zustand";


// type State ={
//     user: User | null
//     role: 'csr_pin' | 'pin' | 'platform_manager' | 'user_admin'
// }

// type Action = {
//     setUser: (User: User | null) => void
//     setRole: (role: State['role']) => void
// }

// export const userAuthStore = create<State & Action>((set) => ({
//     user: null,
//     role: 'pin',
//     setUser: (user: User | null) => set({ user }),
//     setRole: (role) => set({ role})
// }))

// // Initialize and sync with Supabase session
// supabase.auth.getUser().then(({ data: { user } }) => {
//     userAuthStore.getState().setUser(user);
// });

// // Listen for auth changes (login/logout automatically update store)
// supabase.auth.onAuthStateChange((_event, session) => {
//     userAuthStore.getState().setUser(session?.user ?? null);
// });

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
    role: 'pin',
    setUser: (user: User | null) => set({ user }),
}))

// Initialize and sync with Supabase session
supabase.auth.getUser().then(({ data: { user } }) => {
    userAuthStore.getState().setUser(user);
});

// Listen for auth changes (login/logout automatically update store)
supabase.auth.onAuthStateChange((_event, session) => {
    userAuthStore.getState().setUser(session?.user ?? null);
});
