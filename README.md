# Anime Watchalong

**A personal project exploring how to make watching anime with friends**

Anime Watchalong brings episode selection, playback, and live chat into one place. It started as a passion project for my friends and me, and is an ongoing way for me to learn by building something I would actually use.

## The experience

Visitors can search for an anime, choose an episode, and open it in the player. A live chat lets viewers share reactions while they watch. The goal is to keep the experience simple: find what to watch, start an episode, and talk about it together.

## What I built

- An anime search and selection backed by a FastAPI endpoint.
- An embedded episode player based on the selected anime and episode.
- A live chat interface that sends and receives messages through a WebSocket connection.
- A React frontend, with the backend maintained and deployed separately.
- Fully automatic syncing, so you don't have to worry about being behind or ahead of your friends.
## Built with

**Frontend:** React, Vite, Axios 
**Backend:** FastAPI, Python, WebSockets  
**Deployment:** Vercel for the frontend, Render for the backend

## What I’m learning

This project has given me hands-on practice with React state, request validation, WebSocket connections, and deploying a frontend and backend as separate services. I’m building it incrementally and using each feature to understand the full path from interface to server and back.

## Project status

The project is actively in development. Chat currently broadcasts to connected viewers and does not save message history. Usernames are for display and are not authenticated. There are no rooms and everyone is globablly connected with each other with websockets, but your websocket only sees messages and gets you synced with people with the same anime and episode as you.

Also just a notice that as the backend is hosted on render's free server, it goes to sleep if no one has used it in a while, so if inputs don't seem to do anything just be patient and try again in a minute or two.
