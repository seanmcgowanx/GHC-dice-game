import React, { useState, useEffect } from "react"
import Die from "./components/Die"
import Leaderboard from "./components/Leaderboard"  
import {nanoid} from "nanoid"
import Confetti from 'react-confetti';
import { initializeApp } from "firebase/app";
import { getAuth, 
        signOut, 
        onAuthStateChanged,
        GoogleAuthProvider,
        signInWithPopup } from "firebase/auth";
import { getFirestore, 
        collection, 
        addDoc,
        serverTimestamp, 
        onSnapshot,
        query, 
        orderBy } from "firebase/firestore"; 


export default function App() {

    /*-- Firebase Configuration --*/

        const firebaseConfig = {
            apiKey: "AIzaSyCzZrU2G89ddtI_HFbbHrgMqti1wpmU-no",
            authDomain: "tenzies-leaderboard.firebaseapp.com",
            databaseURL: "https://tenzies-leaderboard-default-rtdb.firebaseio.com",
            projectId: "tenzies-leaderboard",
            storageBucket: "tenzies-leaderboard.appspot.com",
            messagingSenderId: "410898550924",
            appId: "1:410898550924:web:2443b76f9654af65f92ba9"
        };
      
        // Initialize Firebase
        
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const provider = new GoogleAuthProvider();     
        const db = getFirestore(app); 

    /*-- Define State Varibles --*/

    const [dice, setDice] = useState(allNewDice())
    const [tenzies, setTenzies] = useState(false)
    const [count, setCount] = useState(1)
    const [time, setTime] = useState(0)
    const [score, setScore] = useState(null)
    const [play, setPlay] = useState(false)
    const [leaderboard, setLeaderboard] = useState(false)
    const [signedIn, setSignedIn] = useState(false)
    const [userName, setUserName] = useState("");
    const [highScores, setHighScores] = useState([]);

    /*-- Define UI Elements --*/

    const scoresEl = document.querySelector(".scores-element")

    /*-- React Hooks --*/

        // Check for user authentication
        useEffect(() => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setSignedIn(true);
                setUserName(user.displayName.split(" ")[0]);
            } else {
                setSignedIn(false);
            }
            });
        
            // Clean up the listener when the component unmounts
            return () => unsubscribe();
        }, []);

        // Check for Tenzies on every new roll
        useEffect(() => {
            checkForTenzies();
        }, [dice])
        
        // Fetch high scores from Firestore
        useEffect(() => {
            const q = query(collection(db, "scores"), orderBy("body", "desc"));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const allScores = [];
                querySnapshot.forEach((doc) => {
                    const scoreData = doc.data();
                    allScores.push(scoreData);
                });
                // Filter to only keep the highest score per username
                const highestScores = allScores.reduce((acc, current) => {
                    const existing = acc.find(score => score.username === current.username);
                    if (!existing) {
                        acc.push(current); // If this user's score hasn't been added yet, add it
                    } else if (existing.body < current.body) {
                        // If current score is higher than what's already stored, replace it
                        const existingIndex = acc.indexOf(existing);
                        acc[existingIndex] = current;
                    }
                    return acc;
                }, []);

                setHighScores(highestScores);
            });
            return () => unsubscribe();
        }, [db]); // Include db in the dependency array to re-subscribe if the db instance changes

        // Update time every 100 milliseconds until game is won
        useEffect(() => {
            const timer = setInterval(() => {
                if (play && !tenzies) {
                    setTime(prevTime => prevTime + 1); 
                }
            }, 100);
        
            return () => clearInterval(timer);
        }, [play, tenzies]);

        // Calculate score when game is won
        useEffect(() => {
            const calcScore = Math.floor(1000000 * (1 / (time * count)))
            if (tenzies) {
                setScore(calcScore)
                const highScore = parseInt(localStorage.getItem("highScore"), 10) || 0;
                if (calcScore > highScore) {
                    localStorage.setItem("highScore", calcScore.toString());
                    addScoreToDB(calcScore, auth.currentUser);
                }
            }
        }, [tenzies, time, count]);

    /*-- Functions - Firebase - Authentication --*/

        // Handle sign in/out
        function handleSignIn() {
            if (signedIn) {
                signOut(auth).then(() => {
                    setSignedIn(false);
                }).catch((error) => {
                    console.error(error);
                });
            } else {
                authSignInWithGoogle();
            }
        }
        
        // Sign in with Google
        function authSignInWithGoogle() {
            signInWithPopup(auth, provider)
            .then((result) => {
            }).catch((error) => {
                console.error(error.code, error.message);
            });
        }

    /* = Functions - Firebase - Cloud Firestore = */

        // Add score to Firestore
        async function addScoreToDB(score, user) {
            try {
                const docRef = await addDoc(collection(db, "scores"), {
                    body: score,
                    uid: user.uid,
                    username: user.displayName, // Assuming displayName holds the username
                    createdAt: serverTimestamp(),
                });
                console.log("Document written with ID: ", docRef.id);
            } catch (error) {
                console.error(error.message);
            }
        }

    /* == Functions - UI Functions == */

        // Display firebase date in a readable format
        function displayDate(firebaseDate) {
            if (!firebaseDate) {
                return "Date not available"
            }
            
            const date = firebaseDate.toDate()
            
            const day = date.getDate()
            const year = date.getFullYear()
            
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            const month = monthNames[date.getMonth()]

            return `${month} ${day}, ${year}`
        }

        // Generate new set of dice
        function allNewDice() {
            const newDice = []
            for (let i = 0; i < 10; i++) {
                newDice.push({
                    value: Math.ceil(Math.random() * 6), 
                    isHeld: false,
                    id: nanoid()
                })
            }
            return newDice
        }
        
        // Update state on new dice roll
        function rollDice() {
            setDice(prevDice => 
                prevDice.map(die => 
                die.isHeld? die : {...die, value: Math.ceil(Math.random() * 6)}
                )
            )
            setCount(prevCount => prevCount + 1)
        }
        
        // Update state when dice are held/unheld
        function holdDice(id) {
            setDice(prevDice => 
            prevDice.map(die => 
                die.id === id ? {...die, isHeld: !die.isHeld} : die
            )
            )
        }

        // Check if Tenzies is achieved
        function checkForTenzies() {
        const heldDice = dice.filter(die => die.isHeld)
        if (heldDice.length === 10) {
            if (heldDice.every(die => die.value === dice[0].value)) {
                setTenzies(true);
            }
        }
        }
        
        // Update state when resetting the game
        function resetDice() {
            setDice(allNewDice());
            setTenzies(false);
            setCount(1);
            setTime(0);
            setScore(0);
            setPlay(false);
        }

        // Map dice array to Die components
        const diceElements = dice.map(die => 
            (
            <Die 
            key={die.id} 
            value={die.value} 
            isHeld={die.isHeld}
            holdDice={() => holdDice(die.id)}
            />
            ))

        // Start game
        const startGame = () => {
            resetDice();
            setPlay(true);
        } 
        
        // View leaderboard
        const viewLeaderboard = (e) => {
            setLeaderboard(true);
            setPlay(false);
            e.target.classList.add("highlight");
            document.querySelector('.play').classList.remove("highlight");
        }

        // View play
        const viewPlay = (e) => {
            !leaderboard ? resetDice() : setLeaderboard(false);
            e.target.classList.add("highlight");
            document.querySelector('.leaderboard').classList.remove("highlight");
        }

    /*-- Return JSX for rendering --*/
    return (
        <main>
            <nav>
                {signedIn && userName && <p className="user-greeting">Hello, {userName}!</p>}
                {!play && !leaderboard && <button className="start-btn" onClick={startGame}>Start Game</button>}
                {play && <div className="stats">
                    <div className="stat">{Math.floor(time / 10)}.{time % 10}s</div>
                    <div className="stat"><b>Rolls:</b> {count}</div>
                    {tenzies && <div className="stat"><b>Score:</b> {score}</div>}
                    <div className="high-score stat"><b>High Score:</b> {parseInt(localStorage.getItem("highScore"), 10) || 0}</div>    
                </div>}
                <div className="control">
                    <p className="play highlight" onClick={(e) => viewPlay(e)}>Play</p>
                    <p className="leaderboard" onClick={(e) => viewLeaderboard(e)}>Leaderboard</p>
                </div>
                <button className="sign-in-btn" style={signedIn ? {opacity: "50%"} : {}} onClick={handleSignIn}>{signedIn ? "SIGN OUT" : "SIGN IN"}</button>
            </nav>
            <div className="game">
                {leaderboard && <Leaderboard highScores={highScores} displayDate={displayDate}/>}
                {tenzies && play && <Confetti />}
                {!play && !leaderboard && <h1 className="title">Tenzies</h1>}
                {!play && !leaderboard && <p className="instructions">Roll until all dice are the same. 
                Click each die to freeze it at its current value between rolls.</p>}
                {play && <div className="dice-container">
                    {diceElements}
                </div>}
                {play && <button className="roll-btn" onClick={tenzies ? resetDice : rollDice}>{tenzies ? "New Game" : "Roll"}</button> }
            </div>
        </main>
    )
}

