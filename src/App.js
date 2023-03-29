import React, { useRef, useState } from 'react';
import './App.css';
import { FcGoogle } from "react-icons/fc";


import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import Snow from "./components/Snow";

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: process.env.REACT_APP_apiKey,
  authDomain: process.env.REACT_APP_authDomain,
  projectId: process.env.REACT_APP_projectId,
  storageBucket: process.env.REACT_APP_storageBucket,
  messagingSenderId: process.env.REACT_APP_messagingSenderId,
  appId: process.env.REACT_APP_appId,
});

const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <Snow />
      <header>
        <h1>Chat Forum💬</h1>
        <span id='out'>
        <GoBack />
        <SignOut />
        </span>
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}> <FcGoogle /> Sign in with Google</button>
      <p id="warning">Do not violate the community guidelines or you will be banned for life!</p>
    </>
  )

}

function GoBack() {
  return (
    (!auth.currentUser && (
      <a href="https://oasis-chatbot-aa165.web.app">
      <button className="out">Go Back</button>
    </a>
  )))
}

function SignOut() {
  return auth.currentUser && (
    <button className="out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(100);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();
    const ls = ["shit", "fat"];
    if (ls.includes(formValue)) {
      alert("You are not allowed to say that!");
      return;
    }
    const { uid, photoURL } = auth.currentUser;
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })


    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input id="placeholder" value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Tell people how you are feeling today" />
      <button type="submit" disabled={!formValue}>✈️</button>
    </form>
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://avatars.dicebear.com/api/identicon/your-custom-seed.svg'} alt="" />
      <p>{text}</p>
    </div>
  </>)
}


export default App;