import { ErrorResponse } from './../../models/response/error-response';
import { errorCallResetAction, errorCallAction, serverErrorCallAction } from './error-actions';
import { SMSService } from './../../services/sendSMS-service';
import { OTP_SENT, LOAD_OTP_START, LOAD_OTP_FAIL, LOAD_OTP_INIT, OTP_VALIDATE } from './action-types';
import { OTPRequest } from './../../models/request/otp-request';
import { LeadService } from './../../services/lead-service';
import { Dispatch } from 'redux';
import generateOTP from '../../helpers/otp-creation';
import StorageService from '../../database/storage-service';
import { StorageConstants } from '../../helpers/storage-constants';
import SendSMS from 'react-native-sms';
import config from '../../helpers/config';

export const otpStartAction = () => {
    return {
        type: LOAD_OTP_START,
    };
};

export const otpInitAction = () => {
    return {
        type: LOAD_OTP_INIT,
    };
};

export const otpFailureAction = error => {
    return {
        type: LOAD_OTP_FAIL,
        payload: error,
    };
};

export const otpSuccessAction = successData => {
    return {
        type: OTP_SENT,
        payload: successData,
    };
};

export const otpValidateAction = successData => {
    return {
        type: OTP_VALIDATE,
        payload: successData,
    };
};

export const sendOTP = (phone: string) => async (dispatch: Dispatch, getState: any) => {
    dispatch(errorCallResetAction());
    dispatch(otpStartAction());
    let OTP = await generateOTP();
    console.log('OTP generated - ', OTP);
    console.log('phone', phone);
    let otpRequest = new OTPRequest(phone, OTP);

    try {
        if (getState().connectionStateReducer.isConnected) {
            let response = await LeadService.sendOTP(otpRequest);
            if (response && response.data) {
                dispatch(otpSuccessAction(response.data));
            } else {
                dispatch(serverErrorCallAction(response.errors));
                dispatch(otpFailureAction(response.errors));
            }
        } else {
            return new Promise((resolve, reject) => {
                SendSMS.send(
                    {
                        //Message body
                        body: config.offlineMessageBody + otpRequest.code,
                        //Recipients Number
                        recipients: [otpRequest.phone],
                        //An array of types that would trigger a "completed" response when using android
                        successTypes: ['sent', 'queued'],
                    },
                    (completed, cancelled, error) => {
                        if (completed) {
                            console.log('SMS Sent Completed');
                            dispatch(otpSuccessAction({ success: true }));
                            resolve(true);
                        } else if (cancelled) {
                            console.log('SMS Cancelled');
                            dispatch(otpFailureAction('SMS Sent Cancelled'));
                            reject(reject);
                        } else if (error) {
                            console.log('SMS error');
                            dispatch(otpFailureAction('Some error occured'));
                            reject(reject);
                        }
                    },
                );
            });
        }
    } catch (error) {
        // Error
        console.log(e);
        let errors = Array<ErrorResponse>();
        errors.push(new ErrorResponse('Server', e.message));
        dispatch(serverErrorCallAction(errors));
        dispatch(otpFailureAction('Some error occured'));
    }
};

export const submitOTP = (otp: String) => async (dispatch: Dispatch) => {
    dispatch(otpStartAction());
    let storedOTP = await StorageService.get<string>(StorageConstants.USER_OTP);
    if (otp === storedOTP) {
        dispatch(otpValidateAction(true));
        return;
    }
    dispatch(otpFailureAction('Invalid OTP'));
};

export const otpInit = () => async (dispatch: Dispatch) => {
    dispatch(otpInitAction());
};
