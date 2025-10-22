import { create } from 'zustand'


type State = {
    currentStep: number
}

type Action = {
    nextStep: () => void
    previousStep: () => void
    resetSteps: () => void
    setStep: (index: number) => void
}

export const useCreateListingStore = create<State & Action>((set) => ({
    currentStep: 0,
    nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
    previousStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) })),
    resetSteps: () => set(() => ({ currentStep: 0 })),
    setStep: (index: number) => set(() => ({ currentStep: Math.max(index, 0) })),
}))

