import api from "./axios";

export const createSiswa = async (data) => {
    const response = await api.post("/siswa", data);

    return response.data;
};

export const deleteSiswa = async (id) => {
    const response = await api.delete(`/siswa/${id}`);
    return response.data;
};