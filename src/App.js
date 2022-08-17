import { app } from "./Compos/Firebase";
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  HStack,
  Container,
  VStack,
  Input,
  Button,
} from "@chakra-ui/react";
import Message from "./Compos/Message";
import {
  onAuthStateChanged,
  signOut,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  getFirestore,
  addDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
const auth = getAuth(app);

const db = getFirestore(app);

const logoutHandler = () => signOut(auth);

const loginHandler = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider);
};

function App() {
  
  const [user, setuser] = useState(false);
  const [msg, setmsg] = useState("");
  const [masgs, setmasgs] = useState([]);
  const divForScroll = useRef(null);

  const submitHandler = async (e) => {
    e.preventDefault();
    setmsg(" ");
    try {
      await addDoc(collection(db, "msgs"), {
        text: msg,
        uid: user.uid,
        uri: user.photoURL,
        createdAt: serverTimestamp()
      });
     
      divForScroll.current.scrollIntoView({ behaviour: "smooth" });
    } catch (err) {
      alert(err);
    }
  };
  useEffect(() => { 
    const q =query(collection(db,"msgs"),orderBy("createdAt","asc"))
    const unsub = onAuthStateChanged(auth, (data) => {
      setuser(data);
    });
const unsubmsg=onSnapshot(q,(snap)=>{
  setmasgs(snap.docs.map((item)=>{
    const id=item.id;
    return{id, ...item.data()}
  
  }))
})

    return () => {
      unsub();
      unsubmsg();
    };
  }, []);

  return (
    <>
      <Box bg={"red.100"}>
        {user ? (
          <Container h={"100vh"} bg={"white"}>
            <VStack padding={"4"} h="full">
              <Button onClick={logoutHandler} w={"full"} colorScheme={"red"}>
                logout
              </Button>

              <VStack
                css={{ "&::-webkit-scrollbar": { display: "none" } }}
                overflowY="auto"
                h={"full"}
                w={"full"}
              >
                {masgs.map((item) => (
                  <Message
                  text={item.text}
                    key={item.id}
                    user={item.uid === user.uid ? "me" : "other"}
                    uri={item.uri}
                  />
                ))}
                <div ref={divForScroll}></div>
              </VStack>

              <form
                onSubmit={submitHandler}
                
                style={{ width: "100%" }}
              >
                <HStack>
                  <Input value={msg}   onChange={(e) => setmsg(e.target.value)} placeholder="Enter message" />
                  <Button colorScheme={"blue"} type="submit">
                    Send
                  </Button>
                </HStack>
              </form>
            </VStack>
          </Container>
        ) : (
          <VStack justifyContent={"center"} bg={"white"} h={"100vh"}>
            <Button onClick={loginHandler} colorScheme={"yellow"}>
Sign In with Google
            </Button>
          </VStack>
        )}
      </Box>
    </>
  );
}

export default App;
