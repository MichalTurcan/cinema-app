const axios = require("axios");

const db = require('../data/database_connection');
const { details } = require("framer-motion/client");

const getAllMovies = async (req, res) => {
  try {
    const [movies] = await db.query(`SELECT * FROM movies ORDER BY TITLE ASC`);

    for (const movie of movies) {
      const [genres] = await db.query(`
        SELECT * FROM genres 
        JOIN movie_genre ON genres.genre_id = movie_genre.genre_id
        WHERE movie_genre.movie_id = ?
        ORDER BY genres.name
      `, [movie.id]);

      const [actors] = await db.query(`
        SELECT * FROM actors 
        JOIN movie_actor ON actors.actor_id = movie_actor.actor_id
        WHERE movie_actor.movie_id = ?
        ORDER BY actors.last_name, actors.first_name
      `, [movie.id]);

      const [directors] = await db.query(`
        SELECT * FROM directors 
        JOIN movie_director ON directors.director_id = movie_director.director_id
        WHERE movie_director.movie_id = ?
        ORDER BY directors.last_name, directors.first_name
      `, [movie.id]);

      const [screenwriters] = await db.query(`
        SELECT * FROM screenwriters 
        JOIN movie_screenwriter ON screenwriters.screenwriter_id = movie_screenwriter.screenwriter_id
        WHERE movie_screenwriter.movie_id = ?
        ORDER BY screenwriters.last_name, screenwriters.first_name
      `, [movie.id]);

      movie.genres = genres;
      movie.actors = actors;
      movie.directors = directors;
      movie.screenwriters = screenwriters;
    }

    res.json(movies);
  } catch (error) {
    console.error('Error fetching movies from database:', error);

    res.status(500).json({
      error: 'Failed to fetch movies from database',
      details: error.message
    });
  }
};

const syncMoviesFromJellyfin = async (req, res) => {
  try {
    const JELLYFIN_API_KEY = process.env.JELLYFIN_API_KEY;
    const JELLYFIN_SERVER_URL = process.env.JELLYFIN_SERVER_URL;

    if (!JELLYFIN_API_KEY || !JELLYFIN_SERVER_URL) {
      return res.status(500).json({
        error: 'Chýba konfigurácia Jellyfin',
        details: 'JELLYFIN_API_KEY alebo JELLYFIN_SERVER_URL nie je nastavené'
      });
    }

    console.log('Načítavanie filmov z Jellyfin...');

    const response = await axios.get(`${JELLYFIN_SERVER_URL}/Items`, {
      params: {
        IncludeItemTypes: 'Movie',
        Recursive: true,
        Fields: 'Overview,CommunityRating,ProductionYear,PremiereDate,ImageTags,BackdropImageTags,People',
        api_key: JELLYFIN_API_KEY
      },
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.data.Items) {
      return res.status(404).json({ error: 'V odpovedi Jellyfin sa nenašli žiadne filmy' });
    }

    const movies = response.data.Items.map(movie => {
      const directors = movie.People
        ? movie.People.filter(person => person.Type === 'Director')
          .slice(0, 5) 
          .map(person => ({
            name: person.Name,
            firstName: person.Name.split(' ')[0],
            lastName: person.Name.split(' ').slice(1).join(' ')
          }))
        : [];

      const writers = movie.People
        ? movie.People.filter(person => person.Type === 'Writer')
          .slice(0, 5) 
          .map(person => ({
            name: person.Name,
            firstName: person.Name.split(' ')[0],
            lastName: person.Name.split(' ').slice(1).join(' ')
          }))
        : [];

      const actors = movie.People
        ? movie.People.filter(person => person.Type === 'Actor')
          .slice(0, 10)  
          .map(person => ({
            name: person.Name,
            firstName: person.Name.split(' ')[0],
            lastName: person.Name.split(' ').slice(1).join(' ')
          }))
        : [];

      return {
        jellyfin_id: movie.Id,
        title: movie.Name,
        year: movie.ProductionYear || null,
        summary: movie.Overview || null,
        poster_url: movie.ImageTags && movie.ImageTags.Primary
          ? `${JELLYFIN_SERVER_URL}/Items/${movie.Id}/Images/Primary?api_key=${JELLYFIN_API_KEY}&quality=90&maxWidth=600`
          : null,
        background_url: movie.BackdropImageTags && movie.BackdropImageTags.length > 0
          ? `${JELLYFIN_SERVER_URL}/Items/${movie.Id}/Images/Backdrop?api_key=${JELLYFIN_API_KEY}&quality=90&maxWidth=1920`
          : null,
        duration_seconds: movie.RunTimeTicks ? Math.floor(movie.RunTimeTicks / 10000000) : null,
        rating: movie.CommunityRating || null,
        directors: directors,
        writers: writers,
        actors: actors
      };
    });

    await db.query('START TRANSACTION');

    let moviesAdded = 0;
    let moviesUpdated = 0;

    for (const movie of movies) {
      const [existingMovie] = await db.query(
        'SELECT id FROM bakalarskapraca.movies WHERE jellyfin_id = ?',
        [movie.jellyfin_id]
      );

      let movieId;

      if (existingMovie.length === 0) {
        const [result] = await db.query(`
          INSERT INTO bakalarskapraca.movies (
            jellyfin_id, title, year, summary, poster_url, background_url,
            duration_seconds, rating, last_updated
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          movie.jellyfin_id, movie.title, movie.year, movie.summary,
          movie.poster_url, movie.background_url, movie.duration_seconds, movie.rating
        ]);

        movieId = result.insertId;
        moviesAdded++;
      } else {
        await db.query(`
          UPDATE bakalarskapraca.movies SET
            title = ?,
            year = ?,
            summary = ?,
            poster_url = ?,
            background_url = ?,
            duration_seconds = ?,
            rating = ?,
            last_updated = NOW()
          WHERE jellyfin_id = ?
        `, [
          movie.title, movie.year, movie.summary, movie.poster_url, movie.background_url,
          movie.duration_seconds, movie.rating, movie.jellyfin_id
        ]);

        movieId = existingMovie[0].id;
        moviesUpdated++;
      }

      if (movie.directors && movie.directors.length > 0) {
        await db.query(
          'DELETE FROM bakalarskapraca.movie_director WHERE movie_id = ?',
          [movieId]
        );

        for (const director of movie.directors) {
          const [existingDirector] = await db.query(
            'SELECT director_id FROM bakalarskapraca.directors WHERE first_name = ? AND last_name = ?',
            [director.firstName, director.lastName]
          );

          let directorId;

          if (existingDirector.length === 0) {
            const [result] = await db.query(
              'INSERT INTO bakalarskapraca.directors (first_name, last_name) VALUES (?, ?)',
              [director.firstName, director.lastName]
            );
            directorId = result.insertId;
          } else {
            directorId = existingDirector[0].director_id;
          }

          await db.query(
            'INSERT INTO bakalarskapraca.movie_director (movie_id, director_id) VALUES (?, ?)',
            [movieId, directorId]
          );
        }
      }

      if (movie.writers && movie.writers.length > 0) {
        await db.query(
          'DELETE FROM bakalarskapraca.movie_screenwriter WHERE movie_id = ?',
          [movieId]
        );

        for (const writer of movie.writers) {
          const [existingWriter] = await db.query(
            'SELECT screenwriter_id FROM bakalarskapraca.screenwriters WHERE first_name = ? AND last_name = ?',
            [writer.firstName, writer.lastName]
          );

          let writerId;

          if (existingWriter.length === 0) {
            const [result] = await db.query(
              'INSERT INTO bakalarskapraca.screenwriters (first_name, last_name) VALUES (?, ?)',
              [writer.firstName, writer.lastName]
            );
            writerId = result.insertId;
          } else {
            writerId = existingWriter[0].screenwriter_id;
          }

          await db.query(
            'INSERT INTO bakalarskapraca.movie_screenwriter (movie_id, screenwriter_id) VALUES (?, ?)',
            [movieId, writerId]
          );
        }
      }

      if (movie.actors && movie.actors.length > 0) {
        await db.query(
          'DELETE FROM bakalarskapraca.movie_actor WHERE movie_id = ?',
          [movieId]
        );

        for (const actor of movie.actors) {
          const [existingActor] = await db.query(
            'SELECT actor_id FROM bakalarskapraca.actors WHERE first_name = ? AND last_name = ?',
            [actor.firstName, actor.lastName]
          );

          let actorId;

          if (existingActor.length === 0) {
            const [result] = await db.query(
              'INSERT INTO bakalarskapraca.actors (first_name, last_name) VALUES (?, ?)',
              [actor.firstName, actor.lastName]
            );
            actorId = result.insertId;
          } else {
            actorId = existingActor[0].actor_id;
          }

          await db.query(
            'INSERT INTO bakalarskapraca.movie_actor (movie_id, actor_id) VALUES (?, ?)',
            [movieId, actorId]
          );
        }
      }
    }

    const jellyfinIds = movies.map(movie => movie.jellyfin_id);
    if (jellyfinIds.length > 0) {
      const placeholders = jellyfinIds.map(() => '?').join(',');
      await db.query(`
        DELETE FROM bakalarskapraca.movies WHERE jellyfin_id NOT IN (${placeholders})
      `, jellyfinIds);
    }

    await db.query('COMMIT');

    console.log(`Synchronizácia kompletná: ${moviesAdded} filmov pridaných, ${moviesUpdated} filmov obnovených`);

    res.json({
      success: true,
      message: 'Synchronizácia úspešne kompletná',
      stats: { added: moviesAdded, updated: moviesUpdated }
    });
  } catch (error) {
    if (db) {
      await db.query('ROLLBACK');
    }

    console.error('Chyba pri synchronizácii z Jellyfin:', error);

    res.status(500).json({
      error: 'Nepodarilo sa synchronizovať filmy z Jellyfin',
      details: error.message
    });
  }
};

const createMovieDate = async (req, res) => {
  try {
    const { date_of_screaning, type, solid_movie_id, voting_movies } = req.body;

    const [existingDate] = await db.query(
      'SELECT * FROM movie_date WHERE date_of_screaning = ?',
      [date_of_screaning]
    );

    if (existingDate.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Dátum už existuje',
        details: 'Pre tento dátum už existuje hlasovanie alebo pevný film. Vyberte iný dátum.'
      });
    }

    await db.query('START TRANSACTION');

    const [dateResult] = await db.query(
      'INSERT INTO movie_date (date_of_screaning, type, solid_movie_id, winner_movie_id) VALUES (?,?,?,?)',
      [date_of_screaning, type, type === 'pevny_film' ? solid_movie_id : null, type === 'pevny_film' ? solid_movie_id : null]
    );

    const dateId = dateResult.insertId;

    if (type === 'hlasovanie' && Array.isArray(voting_movies)) {
      for (const movie of voting_movies) {
        await db.query(
          'INSERT INTO movies_vote (date_id, movie_id, number_of_votes) VALUES (?,?,?)',
          [dateId, movie.movie_id, 0]
        );
      }
    }

    await db.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Premietanie sa vytvorilo',
      data: { dateId }
    });
  } catch (error) {
    if (db) {
      await db.query('ROLLBACK');
    }

    console.error('Chyba pri vytváraní premietania: ', error);

    res.status(500).json({
      error: 'Nepodarilo sa vytvoriť premietanie',
      details: error.message
    });
  }
};

const getActiveVoting = async (req, res) => {
  try {

    const [votingDates] = await db.query(`
     SELECT movie_date.id, movie_date.date_of_screaning, movie_date.type
      FROM movie_date
      WHERE movie_date.type = 'hlasovanie'
      AND (
        DATE(movie_date.date_of_screaning) > CURRENT_DATE()
        OR
        (
          DATE(movie_date.date_of_screaning) = CURRENT_DATE() 
          AND TIMESTAMP(CONCAT(CURRENT_DATE(), ' 08:00:00')) > NOW()
        )
      )
      ORDER BY movie_date.date_of_screaning ASC
    `);


    const result = [];

    for (const date of votingDates) {
      const [movies] = await db.query(`
        SELECT movies.id, movies.title, movies.year, movies.poster_url, movies.duration_seconds, movies.rating, movies.video_url, movies.edited_title
        FROM movies 
        JOIN movies_vote ON movies.id = movies_vote.movie_id
        WHERE movies_vote.date_id = ?
      `, [date.id]);

      result.push({
        ...date,
        movies
      });
    }

    res.json(result);

  } catch (error) {
    console.error('Error fetching active voting:', error);
    res.status(500).json({
      error: 'Failed to fetch active voting',
      details: error.message
    });
  }
};

const submitVote = async (req, res) => {
  try {
    const { dateId, movieId, userId } = req.body;

    if (!dateId || !movieId || !userId) {
      return res.status(400).json({
        error: 'Chýbajú povinné polia',
        details: 'dateId, movieId, a userId sú povinné'
      });
    }

    const [existingVote] = await db.query(`
      SELECT id FROM bakalarskapraca.user_votes
      WHERE user_id = ? AND date_id = ?
    `, [userId, dateId]);

    if (existingVote.length > 0) {
      return res.status(400).json({
        error: 'Už ste hlasovali',
        details: 'Za tento dátum ste už hlasovali'
      });
    }

    await db.query('START TRANSACTION');

    await db.query(`
      INSERT INTO bakalarskapraca.user_votes (user_id, date_id, movie_id)
      VALUES (?, ?, ?)
    `, [userId, dateId, movieId]);

    await db.query(`
      UPDATE bakalarskapraca.movies_vote
      SET number_of_votes = number_of_votes + 1
      WHERE date_id = ? AND movie_id = ?
    `, [dateId, movieId]);

    await db.query('COMMIT');

    res.json({
      success: true,
      message: 'Hlas bol úspešne zaznamenaný'
    });

  } catch (error) {
    await db.query('ROLLBACK');

    console.error('Pri odosielaní hlasu sa vyskytla chyba:', error);
    res.status(500).json({
      error: 'Nepodarilo sa zaznamenať hlas',
      details: error.message
    });
  }
};

const determineWinner = async (dateId) => {
  try {
    const [votes] = await db.query(`
      SELECT movie_id, COUNT(*) as vote_count
      FROM user_votes
      WHERE date_id = ?
      GROUP BY movie_id
      ORDER BY vote_count DESC
      `, [dateId]);

    if (votes.length > 0) {
      const winnerId = votes[0].movie_id;

      await db.query(`
          UPDATE movie_date
          SET winner_movie_id = ?
          WHERE id = ?
          `, [winnerId, dateId]);

      console.log(`Winner for date ID ${dateId} set to movie ID ${winnerId} with ${votes[0].vote_count} votes`);
      return winnerId;
    } else {
      console.log(`No votes found for date ID ${dateId}`);
      return null;
    }
  } catch (error) {
    console.error(`Error determining winner for date ID ${dateId}:`, error);
    throw error;
  }
}

const processExpiredVotings = async () => {
  try {
    console.log('Processing expired votings at', new Date());

    const [expiredDates] = await db.query(`
      SELECT id 
      FROM movie_date
      WHERE winner_movie_id IS NULL
      AND type = 'hlasovanie'
      AND (
        DATE(date_of_screaning) < CURRENT_DATE()
        OR
        (DATE(date_of_screaning) = CURRENT_DATE() AND CURRENT_TIME() >= '08:00:00')
      )`);

    console.log(`Found ${expiredDates.length} expired voting dates without winners`);

    for (const date of expiredDates) {
      await determineWinner(date.id);

      await db.query(`
          UPDATE movie_date
          SET type = 'ukončené'
          WHERE id = ?
          `, [date.id]);
    }

    console.log('Finished processing expired votings');
  } catch (error) {
    console.error('Error processing expired votings:', error);
  }
}

const getCurrentScreening = async (req, res) => {
  try {
    const today = new Date();

    const [todayScreening] = await db.query(`
      SELECT movie_date.id, movie_date.date_of_screaning, movie_date.winner_movie_id
      FROM movie_date
      WHERE DATE(movie_date.date_of_screaning) = CURRENT_DATE()
      `);

    if (todayScreening.length === 0) {
      return res.json({
        hasScreeningToday: false
      });
    }

    const screeningInfo = todayScreening[0];

    if (today.getHours() >= 8 && screeningInfo.winner_movie_id) {
      const [winnerMovie] = await db.query(`
          SELECT id, title, year, poster_url, background_url, duration_seconds, video_url
          FROM movies
          WHERE id = ?
          `, [screeningInfo.winner_movie_id]);

      const [winnerMovieActors] = await db.query(`
        SELECT actors.first_name, actors.last_name
        FROM actors
        INNER JOIN movie_actor ON actors.actor_id = movie_actor.actor_id
        WHERE movie_actor.movie_id = ?
        `, [screeningInfo.winner_movie_id]);

      if (winnerMovie.length > 0) {
        return res.json({
          hasScreeningToday: true,
          winnerDetermined: true,
          screening: {
            ...screeningInfo,
            winner: winnerMovie[0],
            actors: winnerMovieActors
          }

        });
      }
    }

    return res.json({
      hasScreeningToday: true,
      winnerDetermined: false,
      screening: screeningInfo
    });
  } catch (error) {
    console.error('Error fetching today screening:', error);
    res.status(500).json({
      error: 'Failed to fetch today screening',
      details: error.message
    });
  }
}

const editMovieInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, year, directors, screenwriters, summary, duration_seconds, rating, video_url, poster_url, background_url, genres, actors } = req.body;


    await db.query('START TRANSACTION');

    const [result] = await db.query(`
      UPDATE movies
      SET edited_title = ?, year = ?, summary = ?, duration_seconds = ?, rating = ?, video_url = ?, poster_url = ?, background_url = ?
      WHERE id = ?
      `, [title, year, summary, duration_seconds, rating, video_url, poster_url, background_url, id]);

    if (result.affectedRows === 0) {
      await db.query('ROLLBACK')
      return res.status(404).json({
        error: 'Film sa nenašiel',
        details: `Film s ID ${id} neexistuje v databáze`
      });
    }

    if (genres && Array.isArray(genres)) {
      await db.query(`DELETE FROM movie_genre WHERE movie_id = ?`, [id]);

      for (const genreId of genres) {
        await db.query('INSERT INTO movie_genre (movie_id, genre_id) VALUES (?,?)', [id, genreId]);
      }
    }

    if (actors && Array.isArray(actors)) {
      await db.query(`DELETE FROM movie_actor WHERE movie_id = ?`, [id]);

      for (const actorId of actors) {
        await db.query('INSERT INTO movie_actor (movie_id, actor_id) VALUES (?,?)', [id, actorId]);
      }
    }

    if (directors && Array.isArray(directors)) {
      await db.query(`DELETE FROM movie_director WHERE movie_id = ?`, [id]);

      for (const directorId of directors) {
        await db.query('INSERT INTO movie_director (movie_id, director_id) VALUES (?,?)', [id, directorId]);
      }
    }

    if (screenwriters && Array.isArray(screenwriters)) {
      await db.query(`DELETE FROM movie_screenwriter WHERE movie_id = ?`, [id]);

      for (const screenwriterId of screenwriters) {
        await db.query('INSERT INTO movie_screenwriter (movie_id, screenwriter_id) VALUES (?,?)', [id, screenwriterId]);
      }
    }

    await db.query('COMMIT');

    const [updatedMovie] = await db.query('SELECT * FROM movies WHERE id = ?', [id]);

    if (updatedMovie.length === 0) {
      return res.status(404).json({
        error: 'Film sa nenašiel',
        details: `Film s ID ${id} neexistuje v databáze`
      });
    }

    const [genres_result] = await db.query(`
      SELECT * FROM genres 
      JOIN movie_genre ON genres.genre_id = movie_genre.genre_id
      WHERE movie_genre.movie_id = ?
      ORDER BY genres.name
      `, [id]);

    const [actors_result] = await db.query(`
        SELECT * FROM actors 
        JOIN movie_actor ON actors.actor_id = movie_actor.actor_id
        WHERE movie_actor.movie_id = ?
        `, [id]);

    const [directors_result] = await db.query(`
          SELECT * FROM directors 
          JOIN movie_director ON directors.director_id = movie_director.director_id
          WHERE movie_director.movie_id = ?
          `, [id]);

    const [screenwriters_result] = await db.query(`
            SELECT * FROM screenwriters 
            JOIN movie_screenwriter ON screenwriters.screenwriter_id = movie_screenwriter.screenwriter_id
            WHERE movie_screenwriter.movie_id = ?
            `, [id]);

    updatedMovie[0].genres = genres_result;
    updatedMovie[0].actors = actors_result;
    updatedMovie[0].directors = directors_result;
    updatedMovie[0].screenwriters = screenwriters_result;

    res.json({
      success: true,
      message: 'Film bol úspešne aktualizovaný',
      data: updatedMovie[0]
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Chyba pri aktualizácii filmu:', error);
    res.status(500).json({
      error: 'Nepodarilo sa aktualizovať film',
      details: error.message
    });
  }
}

const getAllGenres = async (req, res) => {
  try {
    const [result] = await db.query(`SELECT * FROM genres ORDER BY name ASC`);

    res.json(result);
  } catch (error) {
    console.error('Error fetching genres from database:', error);

    res.status(500).json({
      error: 'Failed to fetch genres from database',
      details: error.message
    });
  }
}

const getActors = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM actors
      ORDER BY last_name, first_name
      `);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching actors:', err);
    res.status(500).json({
      success: false,
      error: 'Nepodarilo sa načítať hercov'
    });
  }
}

const updateActors = async (req, res) => {
  const { first_name, last_name = '' } = req.body;

  if (!first_name) {
    return res.status(400).json({
      success: false,
      error: 'Meno je povinné pole'
    });
  }

  try {
    const [existingActors] = await db.query(`
      SELECT actor_id FROM actors
      WHERE first_name = ? AND last_name = ? 
      `, [first_name, last_name]);

    if (existingActors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Herec s týmto menom už existuje'
      });
    }

    const [result] = await db.query(`
        INSERT INTO actors (first_name, last_name)
        VALUES (?, ?)
        `, [first_name, last_name]);

    const newActorId = result.insertId;

    const [newActor] = await db.query(`
          SELECT * FROM actors
          WHERE actor_id = ?
          `, [newActorId]);

    res.status(201).json({
      success: true,
      data: newActor[0],
      message: "Herec bol úspešne pridaný"
    });
  } catch (error) {
    console.error('Error adding actor:', err);
    res.status(500).json({
      success: false,
      error: 'Nepodarilo sa pridať herca'
    });
  }
}

const getDirectors = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM directors
      ORDER BY last_name, first_name
      `);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching directors:', err);
    res.status(500).json({
      success: false,
      error: 'Nepodarilo sa načítať režisérov'
    });
  }
}

const updateDirectors = async (req, res) => {
  const { first_name, last_name = '' } = req.body;

  if (!first_name) {
    return res.status(400).json({
      success: false,
      error: 'Meno je povinné pole'
    });
  }

  try {
    const [existingDirectors] = await db.query(`
      SELECT director_id FROM directors
      WHERE first_name = ? AND last_name = ? 
      `, [first_name, last_name]);

    if (existingDirectors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Režisér s týmto menom už existuje'
      });
    }

    const [result] = await db.query(`
        INSERT INTO directors (first_name, last_name)
        VALUES (?, ?)
        `, [first_name, last_name]);

    const newDirectorId = result.insertId;

    const [newDirector] = await db.query(`
          SELECT * FROM directors
          WHERE director_id = ?
          `, [newDirectorId]);

    res.status(201).json({
      success: true,
      data: newDirector[0],
      message: "Režisér bol úspešne pridaný"
    });
  } catch (error) {
    console.error('Error adding director:', err);
    res.status(500).json({
      success: false,
      error: 'Nepodarilo sa pridať režiséra'
    });
  }
}

const getScreenwriters = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM screenwriters
      ORDER BY last_name, first_name
      `);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching screenwriters:', err);
    res.status(500).json({
      success: false,
      error: 'Nepodarilo sa načítať scenáristov'
    });
  }
}

const updateScreenwriters = async (req, res) => {
  const { first_name, last_name = '' } = req.body;

  if (!first_name) {
    return res.status(400).json({
      success: false,
      error: 'Meno je povinné pole'
    });
  }

  try {
    const [existingScreenwriters] = await db.query(`
      SELECT screenwriter_id FROM screenwriters
      WHERE first_name = ? AND last_name = ? 
      `, [first_name, last_name]);

    if (existingScreenwriters.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Scenárista s týmto menom už existuje'
      });
    }

    const [result] = await db.query(`
        INSERT INTO screenwriters (first_name, last_name)
        VALUES (?, ?)
        `, [first_name, last_name]);

    const newScreenwriterId = result.insertId;

    const [newScreenwriter] = await db.query(`
          SELECT * FROM directors
          WHERE screenwriter_id = ?
          `, [newScreenwriterId]);

    res.status(201).json({
      success: true,
      data: newScreenwriter[0],
      message: "Scenárista bol úspešne pridaný"
    });
  } catch (error) {
    console.error('Error adding screenwriter:', err);
    res.status(500).json({
      success: false,
      error: 'Nepodarilo sa pridať scenáristu'
    });
  }
}

const getSpecificMovie = async (req, res) => {
  try {
    const { movieId } = req.params;

    const [movieResult] = await db.query(
      'SELECT * FROM movies WHERE id = ?',
      [movieId]
    );

    if (!movieResult || movieResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    const [movieGenres] = await db.query(`
        SELECT genres.name FROM genres 
        INNER JOIN movie_genre ON genres.genre_id = movie_genre.genre_id
        WHERE movie_genre.movie_id = ?
        `, [movieId]
    );

    const [movieActors] = await db.query(`
        SELECT actors.first_name, actors.last_name FROM actors 
        INNER JOIN movie_actor ON actors.actor_id = movie_actor.actor_id
        WHERE movie_actor.movie_id = ?
        `, [movieId]
    );

  const [movieDirectors] = await db.query(`
      SELECT directors.first_name, directors.last_name FROM directors 
      INNER JOIN movie_director ON directors.director_id = movie_director.director_id
      WHERE movie_director.movie_id = ?
      `, [movieId]
  );

  const [movieScreenwriters] = await db.query(`
    SELECT screenwriters.first_name, screenwriters.last_name FROM screenwriters 
    INNER JOIN movie_screenwriter ON screenwriters.screenwriter_id = movie_screenwriter.screenwriter_id
    WHERE movie_screenwriter.movie_id = ?
    `, [movieId]
);


    res.status(200).json({
      success: true,
      data: movieResult,
      genres: movieGenres,
      actors: movieActors,
      directors: movieDirectors,
      screenwriters: movieScreenwriters
    });
  } catch (error) {
    console.error('Error in getSpecificMovie:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getClosestScreening = async (req, res) => {
  try {
    const [result] = await db.query(`
      SELECT * FROM movie_date
      INNER JOIN movies_vote ON movie_date.id = movies_vote.date_id
      INNER JOIN movies ON movies_vote.movie_id = movies.id
      WHERE movie_date.date_of_screaning > current_date()
      ORDER BY movie_date.date_of_screaning
      LIMIT 3;
      `);

    // Successful response
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in getClosestScreening:', error);

  }
};


module.exports = { getAllMovies, syncMoviesFromJellyfin, createMovieDate, getActiveVoting, submitVote, determineWinner, processExpiredVotings, getCurrentScreening, editMovieInfo, getAllGenres, getActors, updateActors, getDirectors, updateDirectors, getScreenwriters, updateScreenwriters, getSpecificMovie, getClosestScreening };