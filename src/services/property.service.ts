import { api } from "./api";

export interface Property {
    name: string;
    address: string;
    id: string;
}

export const propertyService = {
    getAll: async ():Promise<Property[]> => {
        const response = await api.get("/properties/all");
        return response.data;
    },

    getById: async (property_id: string):Promise<Property> => {
        const response = await api.get(`/properties/${property_id}`);
        return response.data;
    },

    create: async (propertyData):Promise<Property> => {
        const response = await api.post("/properties/create", propertyData);
        return response.data;
    },

    update: async (property_id: string, propertyData):Promise<Property> => {
        const response = await api.patch(`/properties/${property_id}`, propertyData);
        return response.data;
    }
};