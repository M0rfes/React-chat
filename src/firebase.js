import firebase from 'firebase';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';

const config = {
  apiKey: 'AIzaSyA_I3b-Lt1ChjcDDB6ZfSQ8U8DKleglD9A',
  authDomain: 'react-slack-fda32.firebaseapp.com',
  databaseURL: 'https://react-slack-fda32.firebaseio.com',
  projectId: 'react-slack-fda32',
  storageBucket: 'react-slack-fda32.appspot.com',
  messagingSenderId: '573854604546'
};
export default firebase.initializeApp(config);
