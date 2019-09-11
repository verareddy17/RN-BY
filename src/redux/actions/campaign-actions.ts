import { ErrorResponse } from './../../models/response/error-response';
import { serverErrorCallAction, errorCallAction, errorCallResetAction } from './error-actions';
import { Dispatch } from 'redux';
import {
    FETCH_CAMPAIGN,
    LOAD_CAMPAIGN_START,
    LOAD_CAMPAIGN_SUCCESS,
    LOAD_CAMPAIGN_FAIL,
    CAMPAIGN_SELECTED,
} from './action-types';
import StorageService from '../../database/storage-service';
import { CampaignService } from '../../services/campaign-service';
import { StorageConstants } from '../../helpers/storage-constants';

export const fetchCampaignsAction = campaigns => {
    return {
        type: FETCH_CAMPAIGN,
        payload: campaigns,
    };
};

export const campaignStartAction = () => {
    return {
        type: LOAD_CAMPAIGN_START,
    };
};

export const campaignSuccessAction = () => {
    return {
        type: LOAD_CAMPAIGN_SUCCESS,
    };
};

export const campaignFailureAction = error => {
    return {
        type: LOAD_CAMPAIGN_FAIL,
        payload: error,
    };
};

export const selectedCampaignActions = campaignSelectedId => {
    return {
        type: CAMPAIGN_SELECTED,
    };
};

export const fetchCampaigns = (): ((dispatch: Dispatch) => Promise<void>) => {
    return async (dispatch: Dispatch) => {
        dispatch(campaignStartAction());

        try {
            const response = await CampaignService.fetchCampaigns(1);
            if (response && response.data) {
                dispatch(fetchCampaignsAction(response.data.data));
            } else {
                dispatch(errorCallAction(response.errors));
                dispatch(campaignFailureAction(response.errors));
            }
        } catch (e) {
            console.log('error:', e.message);
            let errors = Array<ErrorResponse>();
            errors.push(new ErrorResponse('Server', e.message))
            dispatch(serverErrorCallAction(errors));
            dispatch(campaignFailureAction(e.message));
        }

    };
};

export const selectedCampaign = (selectedCampaign: any) => async (dispatch: Dispatch) => {
    console.log('inside campaign action', selectedCampaign);
    dispatch(errorCallResetAction());
    dispatch(campaignStartAction());
    try {
        await StorageService.store(StorageConstants.SELECTED_CAMPAIGN, selectedCampaign);
        dispatch(campaignSuccessAction());
    } catch (e) {
        console.log(e);
        let errors = Array<ErrorResponse>();
        errors.push(new ErrorResponse('Server', e.message))
        dispatch(serverErrorCallAction(errors));
        dispatch(campaignFailureAction(e));
    }
};
