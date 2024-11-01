const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

const endpoints = {
  auth: {
    signup: `${API_BASE_URL}/auth/signup`,
    login: `${API_BASE_URL}/auth/signin`,
    verify: `${API_BASE_URL}/auth/verify`,
  }
};

export default endpoints;