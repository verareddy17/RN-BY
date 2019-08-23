import { HttpBaseService } from './http-base-service';
import StorageService from '../database/storage-service';
import { AuthenticationRequest } from '../models/request/authentication-request';
import { AuthenticationResponse } from '../models/response/authentication-response';
import { ResponseViewModel } from '../models/response/response-view-model';
import { StorageConstants } from '../helpers/storage-constants';
import { APIConstants } from '../helpers/api-constants';

export class AuthenticationService {
    public static authenticate = async (
        authenticationRequest: AuthenticationRequest,
    ): Promise<ResponseViewModel<AuthenticationResponse>> => {
        const response = await HttpBaseService.post<AuthenticationRequest, AuthenticationResponse>(
            APIConstants.AUTHENTICATION_URL,
            authenticationRequest,
        );
        console.log('Auth Response : ', response);
        if (response && response.data) {
            try {
                await StorageService.store(StorageConstants.TOKEN_KEY, response.data.token);
                await StorageService.store(StorageConstants.USER, response.data);
            } catch (error) {
                console.log('Error in storing asyncstorage', error);
            }
        } else {
            console.log('Failure');
        }
        return response;
    };

    public static authCheck = async (): Promise<boolean> => {
        try {
            const token = await StorageService.get<string>(StorageConstants.TOKEN_KEY);
            return token ? true : false;
        } catch (error) {
            Promise.reject(error);
        }
        return false;
    };
}
