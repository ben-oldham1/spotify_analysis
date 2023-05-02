// Importing modules
import React, { useState, useEffect } from "react";
import "./App.css";

import TopArtistsTable from "./components/TopArtistsTable";
import AlertDismissible from "./components/Alert";
import TopArtists from "./components/TopArtists";

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import Stack from 'react-bootstrap/Stack';

import { ReactComponent as Wave1 } from './components/Wave1.svg';

import axios from "axios";

function App() {
  // usestate for setting a javascript
  // object for storing and using data
  const [data, setdata] = useState({
    name: "",
    age: 0,
    date: "",
    programming: "",
  });

  // ========== AUTHENTICATION LOGIC ==========

  const CLIENT_ID = "268fc0cf3a024f2a8b409bbdb8095567";
  const REDIRECT_URI = "http://localhost:3000";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  const SCOPE = "user-top-read";

  const [token, setToken] = useState("")

  useEffect(() => {
    const hash = window.location.hash
    let token = window.sessionStorage.getItem("token")

    if (!token && hash) {
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

      window.location.hash = ""
      window.sessionStorage.setItem("token", token)
    }

    setToken(token)

  }, [])

  // Function to log the user into Spotify
  function login() {
    // Construct the authorisation URL, where users can grant my app access to spotify
    const authUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;

    // Redirect page to the URL above
    window.location.href = authUrl;
  }

  // Removes the authorisation token, thus logging the user out from Spotify
  const logout = () => {
    setToken("")
    window.sessionStorage.removeItem("token")
  }


  // ========== DATA FETCHING LOGIC ==========

  const [apiError, setApiError] = useState(false)
  const [isLoading, setIsLoading] = useState(false);

  const [topArtists, setTopArtists] = useState([])
  const [topSongs, setTopSongs] = useState([])

  // Gets the top artists for a user
  const getTopArtists = async (e) => {
    e.preventDefault()

    // Renders a loading message while we get the data
    setIsLoading(true);

    // Make API call
    const { data } = await axios.get("https://api.spotify.com/v1/me/top/artists", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        limit: "3",
        offset: "0",
        time_range: "short_term"
      },
      timeout: 5000
    }).catch(function (error) {
      // This will render an alert so the user knows there has been an error
      setApiError(true)
      setIsLoading(false);
    })

    // Store the response in TopArtists state
    setTopArtists(data['items'])

    setIsLoading(false);
  }

  // Gets the top tracks for a user
  const getTopSongs = async (e) => {
    e.preventDefault()
    const { data } = await axios.get("https://api.spotify.com/v1/me/top/tracks", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        limit: "5",
        offset: "0",
        time_range: "short_term"
      },
      timeout: 5000
    }).catch(function (error) {
      // This will render an alert so the user knows there has been an error
      setApiError(true)
      setIsLoading(false);
    })

    setTopSongs(data['items'])
  }


  // Using useEffect for single rendering
  useEffect(() => {
    // Using fetch to fetch the api from
    // flask server it will be redirected to proxy
    fetch("/data").then((res) =>
      res.json().then((data) => {
        // Setting a data from api
        setdata({
          name: data.Name,
          age: data.Age,
          date: data.Date,
          programming: data.programming,
        });
      })
    );
  }, []);

  return (
    <div className="App">

      <nav class="navbar navbar-dark bg-dark">
        <div class="container-fluid">
          <a class="navbar-brand">Spotify Analyser</a>

          {!token ?
            <button className="btn btn-secondary" onClick={login}>
              Login to Spotify
            </button>

            : <button className="btn btn-secondary" onClick={logout}>Logout</button>
          }

        </div>
      </nav>


      {!token ?
        <div className="my-5 text-center">
          <h3>Login to Spotify to get started!</h3>
        </div>
        :
        <>

          <Container>

            {apiError ?
              <Row>
                <AlertDismissible headerText="Error" bodyText="An error has occcured while accessing your Spotify data. Try again!" apiError={apiError} setApiError={setApiError} />
              </Row>
              : null
            }

            <div className="py-5">
              <Row className="mb-3">
                <Col>
                  <h1 className="text-center">Your top artists</h1>
                </Col>
              </Row>

              <Row>
                {isLoading ?
                  <div>
                    <Spinner animation="border" role="status" />
                    <p>Getting your data...</p>
                  </div>
                  : null}
                <TopArtists topArtistsJson={topArtists} />
              </Row>

              <form onSubmit={getTopArtists}>
                  <button className="btn btn-primary" type={"submit"}>Get top Artists</button>
              </form>
            </div>

          </Container>

          <Wave1 />

          <div className="bg-dark">
            <Container>

              <div className="py-5">
                <Row className="mb-3">
                  <Col>
                    <h1 className="text-center text-white">Top Genres</h1>
                  </Col>
                </Row>
              </div>

              <Row>
                <form onSubmit={getTopSongs}>
                  <button className="btn btn-secondary" type={"submit"}>Get top songs</button>
                </form>
              </Row>

            </Container>
          </div>

        </>
      }



    </div>
  );
}

export default App;

