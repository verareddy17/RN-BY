import * as React from 'react'
import {
  Container,
  Header,
  Title,
  Content,
  Text,
  Button,
  Icon,
  Left,
  Body,
  Right,
  List,
  ListItem,
} from 'native-base'

import { NavigationScreenProp } from 'react-navigation'
import { NetworkContext } from '../../provider/network-provider'

export interface Props {
  navigation: NavigationScreenProp<any>
  list: any
}
export interface State {}
class Login extends React.Component<Props, State> {
  static contextType = NetworkContext

  render() {
    return (
      <Container>
        <Header>
          <Left>
            <Button>
              <Text>Header</Text>
            </Button>
          </Left>
          <Body>
            <Title>Login </Title>
            <Text>
              You are now {this.context.isConnected ? 'online' : 'offline'}
            </Text>
          </Body>
          <Right />
        </Header>
        <Content>
          <Text>Login Content</Text>
          <Button onPress={() => this.props.navigation.navigate('Dashboard')} />
        </Content>
      </Container>
    )
  }
}

export default Login
