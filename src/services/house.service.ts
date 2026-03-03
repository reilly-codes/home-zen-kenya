import { api } from "./api";

export interface House {
    id: string;
    number: string;
    deposit: number;
    rent: number;
    description: string;
    status?: string;
    property_id: string;
}

export interface SaveHouseDTO {
  number: string;
  rent: number;
  deposit: number;
  description: string;
}

export const houseService = {
  getAllByProperty: async (propertyId: string): Promise<House[]> => {
    const response = await api.get(`/properties/${propertyId}/houses/all`);
    return response.data;
  },

  create: async (propertyId: string, data: SaveHouseDTO): Promise<House> => {
    const response = await api.post(`/properties/${propertyId}/houses/create`, data);
    return response.data;
  },

  update: async (propertyId: string, houseId: string, data: SaveHouseDTO): Promise<House> => {
    const response = await api.patch(`/properties/${propertyId}/houses/${houseId}`, data);
    return response.data;
  },
};