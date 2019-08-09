import Config from '../helpers/config';
import { TOKEN_KEY } from '../helpers/constants';
import { ResponseViewModel } from '../models/response-view-model';
import axios from 'axios';
import StorageService from '../database/storage-service';

interface AxiosErrorResponse {
    status: number;
}
interface AxiosError {
    response: AxiosErrorResponse;
}
export class HttpBaseService {
    public static init(unAuthorizedCallback: () => void) {
        axios.defaults.baseURL = Config.api.baseURL;
        axios.defaults.headers = {
            'content-type': 'application/json',
        };
        axios.interceptors.request.use(
            config => {
                const token = StorageService.get<string>(TOKEN_KEY);
                if (token) {
                    config.headers = {
                        ...config.headers,
                        Authorization: `jwt ${token}`,
                    };
                }
                console.log('request headers', config.headers);
                return config;
            },
            (error: any) => {
                return Promise.reject(error);
            },
        );
        axios.interceptors.response.use(
            response => {
                return response;
            },
            (error: AxiosError) => {
                console.log('error in getting response', error);
                if (error.response && error.response.status === 401) {
                    console.log('unauthorized');
                    if (unAuthorizedCallback) {
                        // StorageService.removeKey(TOKEN_KEY);
                        unAuthorizedCallback();
                        Promise.reject(error);
                        return;
                    }
                }
                return Promise.reject(error);
            },
        );
    }

    public static async get<T>(url: string): Promise<ResponseViewModel<T>> {
        try {
            let response = await axios.get<ResponseViewModel<T>>(url);
            return response.data;
        } catch (e) {
            throw e;
        }
    }

    public static async post<Req, Res>(url: string, body: Req) {
        let response = await axios.post<ResponseViewModel<Res>>(url, JSON.stringify(body));
        return response.data;
    }
}