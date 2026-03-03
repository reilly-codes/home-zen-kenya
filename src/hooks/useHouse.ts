import { useState, useEffect } from "react";
import { houseService, House, SaveHouseDTO } from "@/services/house.service";

export const useHouses = (propertyId: string | null) => {
  const [houses, setHouses] = useState<House[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) {
      setHouses([]);
      return;
    }

    const fetchHouses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await houseService.getAllByProperty(propertyId);
        setHouses(data);
      } catch (err) {
        setError("Could not load units.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHouses();
  }, [propertyId]); 

  const addHouse = (newHouse: House) => {
    setHouses(prev => [...prev, newHouse]);
  };

  const updateHouse = (updatedHouse: House) => {
    setHouses(prev => prev.map(h => h.id === updatedHouse.id ? updatedHouse : h));
  };

  return { houses, isLoading, error, addHouse, updateHouse };
};