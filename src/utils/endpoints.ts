const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

const endpoints = {
  auth: {
    signup: `${API_BASE_URL}/auth/signup`,
    login: `${API_BASE_URL}/auth/login`,
  }
};

export default endpoints;