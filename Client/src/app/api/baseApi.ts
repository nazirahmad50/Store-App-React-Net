import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { URLSearchParams } from "url";
import { history } from "../..";
import { PaginatedResponse } from "../models/pagination";
import { store } from "../store/configureStore";

axios.defaults.baseURL = process.env.REACT_APP_API_URL;
axios.defaults.withCredentials = true;

axios.interceptors.request.use((config) => {
  const token = store.getState().account.user?.token;
  if (token) config.headers!.Authorization = `Bearer ${token}`;
  return config;
});

axios.interceptors.response.use(
  async (res) => {
    if (process.env.NODE_ENV === "development") await sleep();

    const pagination = res.headers["pagination"];
    if (pagination) {
      res.data = new PaginatedResponse(res.data, JSON.parse(pagination));
      return res;
    }

    return res;
  },
  (error: AxiosError) => {
    const { data, status } = error.response!;
    switch (status) {
      case 400:
        if (data.errors) {
          const modelStateErrors: string[] = [];
          for (const key in data.errors) {
            if (data.errors[key]) {
              modelStateErrors.push(data.errors[key]);
            }
          }
          throw modelStateErrors.flat();
        }
        toast.error(data.title);
        break;
      case 401:
        toast.error(data.title);
        break;
      case 500:
        history.push({
          pathname: "/server-error",
          state: { error: data },
        });
        break;
      default:
        break;
    }
    return Promise.reject(error.response);
  }
);

const sleep = () => new Promise((resolve) => setTimeout(resolve, 500));

const reponseBody = (response: AxiosResponse) => response.data;

const requests = {
  get: (url: string, params?: URLSearchParams) =>
    axios.get(url, { params }).then(reponseBody),
  post: (url: string, body: {}) => axios.post(url, body).then(reponseBody),
  put: (url: string, body: {}) => axios.put(url, body).then(reponseBody),
  delete: (url: string) => axios.delete(url).then(reponseBody),
};

const Catalog = {
  list: (params: URLSearchParams) => requests.get("products", params),
  details: (id: number) => requests.get(`products/${id}`),
  fetchFilters: () => requests.get("products/filters"),
};

const TestErrors = {
  get400Error: () => requests.get("error/bad-request"),
  get401Error: () => requests.get("error/unauthorised"),
  get404Error: () => requests.get("error/not-found"),
  get500Error: () => requests.get("error/server-error"),
  getValidationError: () => requests.get("error/validation-error"),
};

const Basket = {
  get: () => requests.get("basket"),
  addItem: (productId: number, quantity = 1) =>
    requests.post(`basket?productId=${productId}&quantity=${quantity}`, {}),
  removeItem: (productId: number, quantity = 1) =>
    requests.delete(`basket?productId=${productId}&quantity=${quantity}`),
};

const Account = {
  login: (values: any) => requests.post("account/login", values),
  Register: (values: any) => requests.post("account/register", values),
  currentUser: () => requests.get("account/currentUser"),
  fetchAddress: () => requests.get("account/savedAddress"),
};

const Orders = {
  list: () => requests.get("orders"),
  fetch: (id: number) => requests.get(`orders/${id}`),
  create: (values: any) => requests.post("orders", values),
};

const Payments = {
  createPaymentIntent: () => requests.post("payment", {}),
};

const baseApi = {
  Catalog,
  TestErrors,
  Basket,
  Account,
  Orders,
  Payments,
};

export default baseApi;
