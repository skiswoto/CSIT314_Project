import { create } from 'zustand'


type Category = 'medical' | 'transport' | 'household' | 'groceries' | 'emotional'

type State = {
    currentStep: number
    description: string
    category?: Category
}

type Action = {
    nextStep: () => void
    previousStep: () => void
    resetSteps: () => void
    setStep: (index: number) => void
    setDescription: (text: string) => void
    setCategory: (category: Category) => void
}

export const useCreateListingStore = create<State & Action>((set) => ({
    currentStep: 0,
    description: '',
    category: undefined,
    nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
    previousStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) })),
    resetSteps: () => set(() => ({ currentStep: 0 })),
    setStep: (index: number) => set(() => ({ currentStep: Math.max(index, 0) })),
    setDescription: (text) => set(() => ({ description: text })),
    setCategory: (category) => set(() => ({ category }))
}))

