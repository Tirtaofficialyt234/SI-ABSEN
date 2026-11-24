import api from "./axios";

export const login = async (form) => {
  const response = await api.post("/login", form);
  return response.data;
};

export const logout = async () => {
  const response = await api.post("/logout");
  return response.data;
};