import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import firebase from '../../firebase';
import {
  Grid,
  Form,
  Segment,
  Button,
  Header,
  Message,
  Icon
} from 'semantic-ui-react';

export default class Login extends Component {
  state = {
    email: '',
    password: '',
    errors: [],
    loading: false,
    usersRef: firebase.database().ref(`users`)
  };
  handelOnChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };
  handelOnSubmit = event => {
    event.preventDefault();
    if (!this.isFormEmpty()) {
      this.setState({ loading: true, errors: [] });
      firebase
        .auth()
        .signInAndRetrieveDataWithEmailAndPassword(
          this.state.email,
          this.state.password
        )
        .then(sUser => {
          console.log(sUser);
          this.setState({ loading: false });
        })
        .catch(error => {
          console.log(error);
          this.setState({
            errors: [...this.state.errors, error],
            loading: false
          });
        });
    }
  };
  isFormEmpty = () => {
    const { email, password } = this.state;
    return !email.length || !password.length;
  };
  displayErrors = errors =>
    errors.map((error, i) => <p key={i}>{error.message}</p>);

  handelInputError = (errors, inputName) => {
    errors.some(error =>
      error.message.toLowerCase().includes(inputName) ? 'error' : ''
    );
  };
  saveUser = createdUser => {
    return this.state.usersRef.child(createdUser.user.uid).set({
      name: createdUser.user.displayName,
      avatar: createdUser.user.photoURL
    });
  };
  render() {
    const { email, password, errors, loading } = this.state;
    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" color="violet" textAlign="center">
            <Icon name="chat" />
            Chat
          </Header>
          <Form onSubmit={this.handelOnSubmit} size="large">
            <Segment stacked>
              <Form.Input
                fluid
                name="email"
                value={email}
                icon="mail"
                iconPosition="left"
                placeholder="Email"
                type="email"
                onChange={this.handelOnChange}
                className={this.handelInputError(errors, 'email')}
              />
              <Form.Input
                fluid
                name="password"
                value={password}
                icon="lock"
                iconPosition="left"
                placeholder="Password"
                type="password"
                onChange={this.handelOnChange}
                className={this.handelInputError(errors, 'password')}
              />
              <Button
                color="violet"
                size="large"
                className={loading ? 'loading' : ''}
                disabled={loading || this.isFormEmpty()}
              >
                Submit
              </Button>
            </Segment>
          </Form>
          {errors.length > 0 && (
            <Message error>
              <h3>Error</h3>
              {this.displayErrors(errors)}
            </Message>
          )}
          <Message>
            Not a user? <Link to="/register">register</Link>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}
