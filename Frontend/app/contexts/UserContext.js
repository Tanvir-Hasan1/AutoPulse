import { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    userId: null,
    name: null,
    email: null,
    createdAt: null,
    updatedAt: null,
    bikes: [],
    selectedBikeId: null,
  });

  const updateUser = (userData) => {
    if (typeof userData === "function") {
      setUser(userData);
      return;
    }
    setUser((prev) => {
      const bikes = userData.bikes || prev.bikes || [];
      return {
        userId: userData.userId || userData._id || prev.userId,
        name: userData.name || prev.name,
        email: userData.email || prev.email,
        createdAt: userData.createdAt || prev.createdAt,
        updatedAt: userData.updatedAt || prev.updatedAt,
        bikes,
        selectedBikeId:
          userData.selectedBikeId ||
          (bikes.length > 0 ? bikes[0]._id : null) ||
          prev.selectedBikeId,
      };
    });
  };

  const clearUser = () => {
    setUser({
      userId: null,
      email: null,
      createdAt: null,
      updatedAt: null,
      bikes: [],
      selectedBikeId: null,
    });
  };

  const selectBike = (bikeId) => {
    setUser((prev) => ({
      ...prev,
      selectedBikeId: bikeId,
    }));
  };

  return (
    <UserContext.Provider value={{ user, updateUser, clearUser, selectBike }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
