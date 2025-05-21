import {create} from 'zustand';
const useStore = create((set) => ({
  isModalOpen: false,
  selectedBrand: null,
  openModal: (brand) => set({ isModalOpen: true, selectedBrand: brand }),
  closeModal: () => set({ isModalOpen: false, selectedBrand: null }),
}));

export default useStore;
