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
    const bikes = userData.bikes || [];
    setUser({
      userId: userData.userId || userData._id,
      name: userData.name,
      email: userData.email,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      bikes,
      selectedBikeId: bikes.length > 0 ? bikes[0]._id : null,
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
