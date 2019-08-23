import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { combineReducers } from 'redux';
import leadReducer from '../reducers/lead-reducer';
import userReducer from '../reducers/user-reducer';
import campaignReducer from '../reducers/campaign-reducer';
import locationReducer from '../reducers/location-reducer';

const rootReducer = combineReducers({
    leadReducer: leadReducer,
    userReducer: userReducer,
    campaignReducer: campaignReducer,
    locationReducer: locationReducer
});
const store = createStore(rootReducer, applyMiddleware(thunk));
console.log('locationReducer reducers in store', store.getState().locationReducer)
export default store;
export type AppState = ReturnType<typeof rootReducer>;
