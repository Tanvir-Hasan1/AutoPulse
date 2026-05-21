import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const initialState = {
  // Auth
  accessToken: null,
  refreshToken: null,

  // User info
  userId: null,
  name: null,
  email: null,
  avatar: null,
  createdAt: null,
  updatedAt: null,

  // Bikes
  bikes: [],
  selectedBikeId: null,
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // ─── Auth Actions ──────────────────────────────────────────

      /** Call after successful login */
      login: (user, accessToken, refreshToken) => {
        const bikes = user.bikes || [];
        set({
          accessToken,
          refreshToken,
          userId: user._id || user.userId || user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar || null,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          bikes,
          selectedBikeId:
            bikes.length > 0 ? bikes[0]._id || bikes[0].id : null,
        });
      },

      /** Call after successful signup — same shape as login */
      signup: (user, accessToken, refreshToken) => {
        set({
          accessToken,
          refreshToken,
          userId: user._id || user.userId || user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar || null,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          bikes: [],
          selectedBikeId: null,
        });
      },

      /** Clear everything on logout */
      logout: () => set({ ...initialState }),

      // ─── Token Actions ─────────────────────────────────────────

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      // ─── User Actions ──────────────────────────────────────────

      /** Partial update of user fields */
      updateUser: (fields) => {
        if (typeof fields === "function") {
          // Functional update — receives prev state
          set((prev) => {
            const next = fields(prev);
            return next;
          });
          return;
        }
        set((prev) => {
          const bikes = fields.bikes || prev.bikes || [];
          return {
            userId:
              fields.userId ||
              fields._id ||
              fields.id ||
              prev.userId,
            name: fields.name || prev.name,
            email: fields.email || prev.email,
            avatar: fields.avatar !== undefined ? fields.avatar : prev.avatar,
            createdAt: fields.createdAt || prev.createdAt,
            updatedAt: fields.updatedAt || prev.updatedAt,
            bikes,
            selectedBikeId:
              fields.selectedBikeId ||
              (bikes.length > 0
                ? bikes[0]._id || bikes[0].id
                : null) ||
              prev.selectedBikeId,
          };
        });
      },

      // ─── Bike Actions ──────────────────────────────────────────

      selectBike: (bikeId) => set({ selectedBikeId: bikeId }),

      setBikes: (bikes) =>
        set((prev) => ({
          bikes,
          selectedBikeId:
            prev.selectedBikeId &&
            bikes.some(
              (b) => (b._id || b.id) === prev.selectedBikeId
            )
              ? prev.selectedBikeId
              : bikes.length > 0
              ? bikes[0]._id || bikes[0].id
              : null,
        })),

      /** Append a newly registered bike */
      addBike: (bike) =>
        set((prev) => {
          const bikes = [...prev.bikes, bike];
          return {
            bikes,
            selectedBikeId: prev.selectedBikeId || bike._id || bike.id,
          };
        }),

      // ─── Computed helpers ──────────────────────────────────────

      getSelectedBike: () => {
        const { bikes, selectedBikeId } = get();
        return (
          bikes.find(
            (b) => (b._id || b.id) === selectedBikeId
          ) || bikes[0] || null
        );
      },

      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: "autopulse-auth",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
