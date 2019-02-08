import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import md5 from 'md5';
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

export default class Register extends Component {
  state = {
    username: '',
    email: '',
    password: '',
    passwordRepeat: '',
    errors: [],
    loading: false,
    usersRef: firebase.database().ref(`users`)
  };
  handelOnChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };
  handelOnSubmit = event => {
    event.preventDefault();
    if (this.isFormValid()) {
      this.setState({ loading: true, errors: [] });
      firebase
        .auth()
        .createUserAndRetrieveDataWithEmailAndPassword(
          this.state.email,
          this.state.password
        )
        .then(createdUser => {
          console.log(createdUser);
          createdUser.user
            .updateProfile({
              displayName: this.state.username,
              photoURL: `http://gravatar.com/avatar/${md5(
                createdUser.user.email
              )}?d=identicon`
            })
            .then(() => {
              this.saveUser(createdUser).then(() => {
                console.log(`user saved`);
                this.setState({ loading: false });
              });
            })
            .catch(error => {
              this.setState({
                errors: [...this.state.errors, error],
                loading: false
              });
            });
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
  isFormValid = () => {
    let errors = [];
    let error;
    if (this.isFormEmpty()) {
      error = { message: 'Fill all fields' };
      this.setState({ errors: [...errors, error] });
      return false;
    } else if (!this.isPasswordValid()) {
      error = { message: 'invalid Password' };
      this.setState({ errors: [...errors, error] });
      return false;
    } else {
      return true;
    }
  };
  isFormEmpty = () => {
    const { email, username, password, passwordRepeat } = this.state;
    return (
      !email.length ||
      !username.length ||
      !password.length ||
      !passwordRepeat.length
    );
  };
  isPasswordValid = () => {
    const { password, passwordRepeat } = this.state;
    return !(password.length > 6 && password !== passwordRepeat);
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
    const {
      email,
      username,
      password,
      passwordRepeat,
      errors,
      loading
    } = this.state;
    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" color="orange" textAlign="center">
            <Icon name="chat" />
            Chat
          </Header>
          <Form onSubmit={this.handelOnSubmit} size="large">
            <Segment stacked>
              <Form.Input
                fluid
                name="username"
                value={username}
                icon="user"
                iconPosition="left"
                placeholder="username"
                type="text"
                onChange={this.handelOnChange}
                className={this.handelInputError(errors, 'username')}
              />
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
              <Form.Input
                fluid
                name="passwordRepeat"
                value={passwordRepeat}
                icon="repeat"
                iconPosition="left"
                placeholder="Reenter Password"
                type="password"
                onChange={this.handelOnChange}
                className={this.handelInputError(errors, 'password')}
              />
              <Button
                color="orange"
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
            Already as user? <Link to="/login">Login</Link>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}
