import { Dispatch, Store } from 'redux';
import { ADD_LEAD, FETCH_LEAD, LOAD_LEAD_START, LOAD_LEAD_SUCCESS, LOAD_LEAD_FAIL, OTP_SENT } from './action-types';
import { LeadService } from '../../services/lead-service';
import { LeadRequest } from '../../models/request';
import config from '../../helpers/config';
import { APIConstants } from '../../helpers/api-constants';

// The action creators
export const createLeadAction = lead => {
    return {
        type: ADD_LEAD,
        payload: lead,
    };
};

export const fetchLeadsAction = leads => {
    return {
        type: FETCH_LEAD,
        payload: leads,
    };
};

export const leadStartAction = () => {
    return {
        type: LOAD_LEAD_START,
    };
};

export const leadSuccessAction = () => {
    return {
        type: LOAD_LEAD_SUCCESS,
    };
};

export const leadFailureAction = error => {
    return {
        type: LOAD_LEAD_FAIL,
        payload: error,
    };
};

// GET method to fetch all captured leads
export const fetchAllLeadsApi = (pageNumber: number): ((dispatch: Dispatch, getState: any) => Promise<void>) => {
    console.log('action lead is... =>', pageNumber);
    return async (dispatch: Dispatch, getState) => {
        console.log('getState :', getState());
        try {
            if (pageNumber === 1) {
                dispatch(leadStartAction());
            }
            const response = await LeadService.fetchLeads(pageNumber);
            if (response && response.data) {
                dispatch(fetchLeadsAction(response.data));
            } else {
                dispatch(leadFailureAction(response.errors));
            }
        } catch (error) {
            console.log(error);
        }
    };
};

// POST method to create Lead
export const createLeadApi = (leadRequest: LeadRequest): ((dispatch: Dispatch) => Promise<void>) => {
    return async (dispatch: Dispatch) => {
        try {
            dispatch(leadStartAction());
            let response = await LeadService.createLead(leadRequest);
            if (response && response.data) {
                dispatch(createLeadAction(response.data));
            } else {
                dispatch(leadFailureAction(response.errors));
            }
        } catch (error) {
            // Error
            console.log(error);
        }
    };
};
