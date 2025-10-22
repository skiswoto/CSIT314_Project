import { create } from 'zustand'


type Category = 'medical' | 'transport' | 'household' | 'groceries' | 'emotional'

type State = {
    currentStep: number
    description: string
    category?: Category
    date?: Date
    time?: Date
    duration?: Date
}

type Action = {
    nextStep: () => void
    previousStep: () => void
    resetSteps: () => void
    setStep: (index: number) => void
    setDescription: (text: string) => void
    setCategory: (category: Category) => void
    setDate: (date: Date) => void
    setTime: (time: Date) => void
    setDuration: (duration: Date) => void
    cancelProgress: () => void
}

export const useCreateListingStore = create<State & Action>((set) => ({
    currentStep: 0,
    description: '',
    category: undefined,
    date: undefined,
    time: undefined,
    duration: undefined,
    nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
    previousStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) })),
    resetSteps: () => set(() => ({ currentStep: 0 })),
    setStep: (index: number) => set(() => ({ currentStep: Math.max(index, 0) })),
    setDescription: (text) => set(() => ({ description: text })),
    setCategory: (category) => set(() => ({ category })),
    setDate: (date: Date) => set(() => ({ date: date})),
    setTime: (time: Date) => set(() => ({ time: time})),
    setDuration: (duration: Date) => set(() => ({ duration: duration})),
    cancelProgress: () => set((state) => ({
        currentStep: 0,
        description: '',
        category: undefined
    }))
}))

