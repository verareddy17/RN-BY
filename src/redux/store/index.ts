import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { combineReducers } from 'redux';
import leadReducer from '../reducers/leadReducer';
import userReducer from '../reducers/userReducer';
import campaignReducer from '../reducers/campaignReducer';

const rootReducer = combineReducers({
    leads: leadReducer,
    user: userReducer,
    campaigns: campaignReducer,
});
const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk)));
console.log('getstate', store.getState());
export default store;