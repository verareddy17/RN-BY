import { Formik } from 'formik';
import * as React from 'react';
import { Container, Content, Text, Button, Form, Item, Input, Label, Icon, Spinner, Toast } from 'native-base';
import { ImageBackground, Dimensions, Image, View, StatusBar, TouchableOpacity, Linking, Alert } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import images from '../../assets';
import { NavigationScreenProp } from 'react-navigation';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators, AnyAction } from 'redux';
import { NetworkContext } from '../../provider/network-provider';
import loginStyle from './login-style';
import { authenticate, getTokenForSSO } from '../../redux/actions/user-actions';
import { AppState } from '../../redux/store';
import { loginValidation } from '../../validations/validation-model';
import { captureLocation } from '../../redux/actions/location-action';
import { LocationState } from '../../redux/init/location-initial-state';
import { forgotPassword, initStateForgotPassword } from '../../redux/actions/forgot-password-action';
import BottomSheet from '../../components/bottom-sheet/bottom-sheet';
import RBSheet from 'react-native-raw-bottom-sheet';
import { fetchCampaigns } from '../../redux/actions/campaign-actions';
import { fetchMetaData } from '../../redux/actions/meta-data-actions';
import { AlertError } from '../error/alert-error';
import { ToastError } from '../error/toast-error';
import SpinnerOverlay from 'react-native-loading-spinner-overlay';
import { Utility } from '../utils/utility';
import { CONSTANTS } from '../../helpers/app-constants';
export interface Props {
    navigation: NavigationScreenProp<any>;
    list: any;
    user: any;
    token: string;
    locationState: LocationState;
    forgotPasswordState: any;
    metaData: any;
    campaignState: any;
    errorState: any;
    userState: any;
    error: any;
    requestLoginApi(
        email: string,
        password: string,
        latitude: number,
        longitude: number,
    ): (dispatch: Dispatch<AnyAction>) => Promise<void>;
    captureLocation(): (dispatch: Dispatch<AnyAction>) => Promise<boolean>;
    forgotPassword(email: string): (dispatch: Dispatch<AnyAction>) => Promise<void>;
    resetForgotPassword(): (dispatch: Dispatch<AnyAction>) => Promise<void>;
    fetchMetaData(): (dispatch: Dispatch<AnyAction>) => Promise<void>;
    fetchCampaigns(): (dispatch: Dispatch<AnyAction>) => Promise<void>;
    getTokenForSSO(nonce: string): (dispatch: Dispatch<AnyAction>) => Promise<void>;
}
export interface State {
    showPassword: boolean;
    email: string;
    password: string;
    latitude: number;
    longitude: number;
    input: any;
    showLoadingSpinner: boolean;
}
export interface LoginRequestData {
    email: string;
    password: string;
}

class Login extends React.Component<Props, State> {
    static contextType = NetworkContext;
    static navigationOptions = { header: null };
    constructor(props: Props) {
        super(props);
        this.state = {
            showPassword: true,
            email: '',
            password: '',
            latitude: 0,
            longitude: 0,
            input: {},
            showLoadingSpinner: false,
        };
    }
    focusTheField = (id: string) => {
        this.state.input[id]._root.focus();
    };

    componentDidMount = async () => {
        const selectedCampaign = this.props.campaignState.selectedCampaign;
        // handle SSO redirect
        Linking.getInitialURL()
            .then(url => {
                if (url) {
                    this.handleOpenURL(url);
                }
            })
            .catch(err => {});
        Linking.addEventListener('url', this.handleOpenURL);

        let isLoggedIn = false;
        if (this.context.isConnected && this.props.userState.user.token) {
            isLoggedIn = true;
        }
        if (!this.context.isConnected && this.props.userState.user.isOfflineLoggedIn) {
            isLoggedIn = true;
        }
        isLoggedIn
            ? this.props.navigation.navigate(selectedCampaign === null ? 'Campaigns' : 'App')
            : this.props.navigation.navigate('Auth');
    };

    componentWillUnmount = () => {
        Linking.removeEventListener('url', this.handleOpenURL);
    };

    // handle gateway callbacks
    handleOpenURL = async url => {
        const { error, nonce } = this.props.navigation.state.params;
        if (nonce) {
            await this.props.getTokenForSSO(nonce);
            try {
                this.setState({ showLoadingSpinner: true });
                await this.props.fetchMetaData();
                await this.props.fetchCampaigns();
                if (this.props.errorState.showAlertError) {
                    AlertError.alertErr(this.props.errorState.error);
                    this.setState({ showLoadingSpinner: false });
                }
                if (this.props.errorState.showToastError) {
                    ToastError.toastErr(this.props.errorState.error);
                    this.setState({ showLoadingSpinner: false });
                }
                if (!this.props.errorState.showAlertError && !this.props.errorState.showToastError) {
                    this.setState({ showLoadingSpinner: false });
                    this.props.navigation.navigate(this.props.userState.user.token ? 'Campaigns' : 'Auth');
                }
                return;
            } catch (error) {
                AlertError.alertErr(error);
            }
        }
        Alert.alert(error);
        return;
    };

    handlePress = () => {
        if (!this.context.isConnected) {
            Utility.showToast('No internet connection', 'warning');
            return;
        }
        this.RBSheetForgotPass.open();
    };

    closeBottomSheet = () => {
        this.RBSheetForgotPass.close();
        this.props.resetForgotPassword();
    };

    onChangeTextBottomSheet = (text: string, fieldName: string) => {
        this.setState({ email: text });
    };

    submitForgotPassword = async () => {
        await this.props.forgotPassword(this.state.email);
    };

    handleSSO = () => {
        Linking.canOpenURL(CONSTANTS.SSO_URL).then(supported => {
            if (supported) {
                Linking.openURL(CONSTANTS.SSO_URL);
            } else {
                Alert.alert('Not able to redirect to Single Sign On url ');
            }
        });
    };

    handleSubmit = async (values: LoginRequestData) => {
        await this.props.captureLocation();
        if (this.context.isConnected) {
            this.setState({ showLoadingSpinner: true });
            await this.props.requestLoginApi(
                values.email,
                values.password,
                this.props.locationState.location.latitude,
                this.props.locationState.location.longitude,
            );
            if (this.props.errorState.showAlertError) {
                AlertError.alertErr(this.props.errorState.error);
            }
            if (this.props.errorState.showToastError) {
                ToastError.toastErr(this.props.errorState.error);
            }
            if (this.props.errorState.showAlertError && this.props.errorState.showToastError) {
                this.setState({ showLoadingSpinner: false });
                return;
            }
            await this.props.fetchMetaData();
            await this.props.fetchCampaigns();
            if (this.props.errorState.showAlertError) {
                AlertError.alertErr(this.props.errorState.error);
            }
            if (this.props.errorState.showToastError) {
                ToastError.toastErr(this.props.errorState.error);
            }
            if (!this.props.errorState.showAlertError && !this.props.errorState.showToastError) {
                this.props.navigation.navigate(this.props.userState.user.token ? 'Campaigns' : 'Auth');
            }
            this.setState({ showLoadingSpinner: false });
            return;
        }
        await this.props.requestLoginApi(
            values.email,
            values.password,
            this.props.locationState.location.latitude,
            this.props.locationState.location.longitude,
        );
        this.props.navigation.navigate(this.props.userState.error ? 'Auth' : 'Campaigns');
    };
    render() {
        return (
            <Container>
                <StatusBar backgroundColor="#813588" barStyle="light-content" />
                <ScrollView keyboardShouldPersistTaps="always" contentContainerStyle={{ flexGrow: 1 }}>
                    <ImageBackground source={images.background} style={loginStyle.imageBg}>
                        <Content contentContainerStyle={loginStyle.containerStyle}>
                            <View style={loginStyle.logoContainer}>
                                <Image source={images.logo} />
                            </View>
                            <View>
                                <Formik
                                    initialValues={{ email: '', password: '' }}
                                    onSubmit={values => this.handleSubmit(values)}
                                    validationSchema={loginValidation}
                                >
                                    {({
                                        values,
                                        handleChange,
                                        errors,
                                        setFieldTouched,
                                        touched,
                                        isValid,
                                        handleSubmit,
                                    }) => (
                                            <Form>
                                                <Item floatingLabel style={loginStyle.userName}>
                                                    <Label style={loginStyle.marginLeft}>Email</Label>
                                                    <Input
                                                        keyboardType="email-address"
                                                        onChangeText={handleChange('email')}
                                                        onBlur={() => setFieldTouched('email')}
                                                        style={loginStyle.marginLeft}
                                                        returnKeyType="next"
                                                        blurOnSubmit={false}
                                                        onSubmitEditing={() => this.focusTheField('password')}
                                                        autoCapitalize="none"
                                                    />
                                                </Item>
                                                <Item floatingLabel style={loginStyle.password}>
                                                    <Label style={loginStyle.marginLeft}>
                                                        {this.context.isConnected ? 'Password' : 'Offline PIN'}
                                                    </Label>
                                                    <Input
                                                        secureTextEntry={this.state.showPassword}
                                                        value={values.password}
                                                        onChangeText={handleChange('password')}
                                                        onBlur={() => setFieldTouched('password')}
                                                        style={loginStyle.marginLeft}
                                                        returnKeyType="done"
                                                        getRef={input => {
                                                            this.state.input['password'] = input;
                                                        }}
                                                        onSubmitEditing={() => this.handleSubmit(values)}
                                                    />
                                                    <Icon
                                                        style={loginStyle.paddingTop}
                                                        active
                                                        name={this.state.showPassword ? 'eye-off' : 'eye'}
                                                        onPress={e => {
                                                            e.preventDefault();
                                                            this.setState({ showPassword: !this.state.showPassword });
                                                        }}
                                                    />
                                                </Item>
                                                {errors.password || errors.email || this.props.userState.error ? (
                                                    <View>
                                                        {!this.context.isConnected ? (
                                                            <Text style={loginStyle.error}>No Internet Connection</Text>
                                                        ) : errors.email ? (
                                                            <Text style={loginStyle.error}>{errors.email}</Text>
                                                        ) : errors.password ? (
                                                            <Text style={loginStyle.error}>{errors.password}</Text>
                                                        ) : this.props.userState.error ? (
                                                            this.props.errorState.showAlertError ? (
                                                                <Text style={loginStyle.error}>
                                                                    {this.props.userState.error[0].message}
                                                                </Text>
                                                            ) : (
                                                                    <Text />
                                                                )
                                                        ) : (
                                                                            <Text />
                                                                        )}
                                                    </View>
                                                ) : (
                                                        <View />
                                                    )}

                                                <Button block={true} onPress={handleSubmit} style={loginStyle.submitButton}>
                                                    <Text uppercase={false} style={loginStyle.loginButtonText}>
                                                        Login
                                                </Text>
                                                </Button>
                                                <SpinnerOverlay visible={this.state.showLoadingSpinner} />

                                                <TouchableOpacity
                                                    style={loginStyle.forgotPasswordContainer}
                                                    onPress={this.handlePress}
                                                >
                                                    <Text style={loginStyle.forgotPasswordText}>Forgot Password?</Text>
                                                </TouchableOpacity>
                                            </Form>
                                        )}
                                </Formik>
                                <View>
                                    <Button
                                        block={true}
                                        onPress={() => {
                                            this.handleSSO();
                                        }}
                                        style={loginStyle.submitSSOButton}
                                    >
                                        <Text uppercase={false} style={loginStyle.loginButtonText}>
                                            Login with Google
                                        </Text>
                                    </Button>
                                </View>
                            </View>
                            <RBSheet
                                ref={ref => {
                                    this.RBSheetForgotPass = ref;
                                }}
                                closeOnPressMask={false}
                                duration={10}
                                customStyles={{
                                    container: {
                                        height: 900,
                                        borderTopRightRadius: 20,
                                        borderTopLeftRadius: 20,
                                    },
                                }}
                            >
                                <BottomSheet
                                    keyBoardStyle="email-address"
                                    type="inputType"
                                    actionType="Submit"
                                    currentState={this.props.forgotPasswordState}
                                    onChangeText={this.onChangeTextBottomSheet}
                                    data={['Email Id']}
                                    close={this.closeBottomSheet}
                                    //description="Enter your registered email id"
                                    submit={this.submitForgotPassword}
                                    title="Forgot Password"
                                />
                            </RBSheet>
                        </Content>
                    </ImageBackground>
                </ScrollView>
            </Container>
        );
    }
}
const mapStateToProps = (state: AppState) => ({
    userState: state.userReducer,
    locationState: state.locationReducer,
    forgotPasswordState: state.forgotPasswordReducer,
    campaignState: state.campaignReducer,
    metaData: state.metaDataReducer,
    errorState: state.errorReducer,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    requestLoginApi: bindActionCreators(authenticate, dispatch),
    captureLocation: bindActionCreators(captureLocation, dispatch),
    fetchCampaigns: bindActionCreators(fetchCampaigns, dispatch),
    fetchMetaData: bindActionCreators(fetchMetaData, dispatch),
    forgotPassword: bindActionCreators(forgotPassword, dispatch),
    resetForgotPassword: bindActionCreators(initStateForgotPassword, dispatch),
    getTokenForSSO: bindActionCreators(getTokenForSSO, dispatch),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Login);
