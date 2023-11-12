import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { store } from '../store';
import { getToken, login } from '../store/slices/auth-slice';
import toast from 'react-hot-toast';

type ErrorResponse = {
  message: string;
  status: number;
  info?: object;
};

axios.defaults.withCredentials = true;
const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

type RefreshingPromise = { access_token: string } | { error: Error };
type isRefreshingType = Promise<RefreshingPromise> | boolean;
let isRefreshing: isRefreshingType = false;

// REQUEST INTERCEPTORS
async function reqInterceptor(config: InternalAxiosRequestConfig) {
  const token = getToken(store.getState()) || localStorage.getItem('access_token');

  if (token) config.headers['X-Auth-Token'] = token;

  return config;
}

function reqErrInterceptor(error: AxiosError) {
  console.error(error);
  return Promise.reject(error);
}

// RESPONSE INTERCEPTORS
function resInterceptor(response: any) {
  return response;
}

async function resErrInterceptor(error: AxiosError<ErrorResponse>) {
  if (error.response?.status === 401) {
    const originalRequest = error.config as AxiosRequestConfig;

    if (isRefreshing) {
      const res = await isRefreshing;

      if (typeof res === 'object' && 'access_token' in res) {
        return axios({
          ...originalRequest,
          headers: {
            ...originalRequest.headers,
            'X-Auth-Token': res.access_token,
          },
        });
      }

      return Promise.reject(error);
    }

    isRefreshing = refreshAccessToken().then((res) => {
      if ('error' in res) {
        store.dispatch({ type: 'logout' });
        httpClient.defaults.headers.common['X-Auth-Token'] = '';
        toast.error('Your session has expired. Please login again.');

        return res;
      }

      store.dispatch(login(res.access_token));

      if (!originalRequest.headers) originalRequest.headers = {};
      originalRequest.headers['X-Auth-Token'] = res.access_token;

      return res;
    });

    await isRefreshing;
    isRefreshing = false;

    return axios(originalRequest);
  } else {
    const message = error.response?.data?.message || error.message;
    toast.error(message);
  }
  return Promise.reject(error);
}

// refresher
const refreshAccessToken = async (): Promise<RefreshingPromise> => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/user/refresh`, null, {
      withCredentials: true,
    });

    const { access_token } = response.data;

    return { access_token };
  } catch (error: any) {
    return { error };
  }
};

httpClient.interceptors.request.use(reqInterceptor, reqErrInterceptor);
httpClient.interceptors.response.use(resInterceptor, resErrInterceptor);

export default httpClient;
export { refreshAccessToken };
