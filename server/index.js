require("dotenv").config();
const express = require("express");
const cron = require('node-cron');
const mysql = require("mysql2");
const cors = require("cors");

const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");
const fs = require("fs");



const { initDB } = require("./util/dbHandler");
const db = require('./data/database_connection');



const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const { isAuthenticated,checkUserOwnership, isMember, isAdmin } = require("./middleware/auth");

const storage = multer.diskStorage({
  destination: "../public/avatars/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });



const {insertDefaultAdmin, registerUser, loginUser, getUsers,getSpecificUser,updateUserInfo,getAcademicOptions, getRoles, updateUserMemberStatus, removeFromMembers, getMembers, editMember, getLeader } = require("./routes/user_routes");

app.post('/register', registerUser);
app.post('/login', loginUser);
app.get('/api/users', isAuthenticated, isMember, getUsers);
app.get('/api/roles', getRoles);
app.get('/api/users/:userId/userInfo', getSpecificUser);
app.get('/api/academic-options', getAcademicOptions)
app.put('/api/users/:userId/updateInfo',isAuthenticated,checkUserOwnership, upload.single("profileImage"), updateUserInfo);


app.put('/api/users/:userId',upload.single("image"),  updateUserMemberStatus);

app.post('/api/users/:userId/removeFromMembers', isAuthenticated, isMember, isAdmin, removeFromMembers);

app.get('/api/members', getMembers);
app.get('/api/leaders', getLeader);
app.put('/api/members/:memberId/editMember', isAuthenticated, isMember, isAdmin, upload.single("image"), editMember);


const eventStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(__dirname, 'temp');

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const eventUpload = multer({
  storage: eventStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Len obrázkové súbory sú povolené!'), false);
    }
  }
});

const { getEvents, getSpecificEvent, createEvent, addEventImages, deleteEvent, checkPastEvents } = require("./routes/events_routes");

app.get('/api/events', getEvents);
app.get('/api/events/:eventId', getSpecificEvent);
app.post('/api/events/add_event', isAuthenticated, isMember, isAdmin, eventUpload.fields([
  { name: 'poster', maxCount: 1 },
  { name: 'images', maxCount: 50 }
]), createEvent);
app.post('/api/events/:eventId/add-images', isAuthenticated, isMember, isAdmin, eventUpload.fields([
  {name: 'images', maxCount: 50}
]), addEventImages);
app.post('/api/events/:eventId/deleteEvent',isAuthenticated, isMember, isAdmin, deleteEvent);


const { getAllMovies , syncMoviesFromJellyfin, createMovieDate, getActiveVoting, submitVote, determineWinner, processExpiredVotings, getCurrentScreening, editMovieInfo, getAllGenres,  getActors, updateActors,getDirectors ,updateDirectors, getScreenwriters,updateScreenwriters, getSpecificMovie, getClosestScreening} = require('./routes/movies_routes');
app.get('/api/movies', isAuthenticated, isMember, getAllMovies);
app.get('/api/movies/:movieId/movieInfo', getSpecificMovie);
app.get('/api/movies/active-voting', getActiveVoting);
app.post('/api/movies/sync',isAuthenticated, isMember, syncMoviesFromJellyfin);
app.post('/api/movies/create_screening',isAuthenticated, isMember, isAdmin, createMovieDate);
app.post('/api/movies/vote',isAuthenticated, submitVote);
app.get('/api/movies/today-screening', getCurrentScreening);
app.get('/api/movies/closes-screening', getClosestScreening);
app.put('/api/movies/editMovie/:id', isAuthenticated, isMember, isAdmin, editMovieInfo);
app.get('/api/movies/genres',isAuthenticated, isMember, isAdmin, getAllGenres);
app.get('/api/movies/actors',isAuthenticated, isMember, isAdmin, getActors);
app.post('/api/movies/actors',isAuthenticated, isMember, isAdmin, updateActors);
app.get('/api/movies/directors',isAuthenticated, isMember, isAdmin, getDirectors);
app.post('/api/movies/directors',isAuthenticated, isMember, isAdmin, updateDirectors);
app.get('/api/movies/screenwriters',isAuthenticated, isMember, isAdmin, getScreenwriters);
app.post('/api/movies/screenwriters',isAuthenticated, isMember, isAdmin, updateScreenwriters);


cron.schedule('* 8 * * *', async () => {
  console.log('Running scheduled task: processing expired votings');
  await processExpiredVotings();
})

const {getCinemaConfiguration, getSeatsStatus, updateSeatStatus } = require('./routes/reservation_routes.js');

app.get('/api/cinema/configuration',isAuthenticated, getCinemaConfiguration);
app.get('/api/screenings/:screeningId/seats', getSeatsStatus);
app.post('/api/seats/update', updateSeatStatus);

app.get("/api/data", (req, res) => {
  res.json({ message: "Backend je pripojený k Reactu! 🎉" });
});

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const start = async () => {
  try {
    await initDB();

    try {
      console.log('Kontrola existencie admin účtu...');
      await insertDefaultAdmin();
    } catch (error) {
      console.error('Chyba pri vytváraní admin účtu:', error);
    }

    await checkPastEvents();

    setInterval(checkPastEvents, 86400000);

    app.listen(PORT, async () => {
      console.log(`Server beží na porte ${PORT}`);

      try {
        console.log('Kontrola zmeškaných hlasovaní, ktorých platnosť vypršala pri spustení');
        await processExpiredVotings();
      } catch (err) {
        console.error('Chyba pri spracovaní zmeškaných hlasovaní:', err);
      }
    });
  } catch (error) {
    console.log("Chyba pri pripájaní k DB: ", error);
    return;
  }
};

app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  res.status(500).json({ message: 'Server error' });
});

start();
