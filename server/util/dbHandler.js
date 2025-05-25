const db = require("../data/database_connection");

const createUser = async (email, password) => {
  const query = `INSERT INTO users(email, password) VALUES (?, ?)`;
  const [result] = await db.query(query, [email, password]);
  return result;
};

const createAdmin = async (email, password) => {
  try {
    const query = `INSERT INTO users(email, password) VALUES (?,?)`;
    await db.query(query, [email, password]);
    const [userIdResult] = await db.query(`SELECT userId FROM users WHERE email = ?`, [email]);
    const userId = userIdResult[0].userId;
    await db.query(
      `INSERT INTO members(userId, roleId, isAdmin, isLeader) VALUES (?,?,?,?)`,
      [userId, 4, 1, 0]
    );
    await db.query(`UPDATE users SET isMember = ? WHERE email = ?`, [1, email]);
    console.log(`Admin účet vytvorený pre ${email} s userId: ${userId}`);
  } catch (error) {
    console.error("Chyba pri vytváraní admin účtu:", error);
    throw error;
  }
};

const initDB = async () => {
  try {
    let tables = [
      `CREATE TABLE IF NOT EXISTS users (
        userId INTEGER PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(100) NOT NULL,
        name VARCHAR(30),
        surname VARCHAR(60),
        password VARCHAR(255) NOT NULL,
        isMember boolean DEFAULT 0,
        imageLocation varchar(255)
      )`,
      
      `CREATE TABLE IF NOT EXISTS city (
        city_id INT AUTO_INCREMENT PRIMARY KEY,
        city VARCHAR(255) NOT NULL,
        postal_code VARCHAR(20) NOT NULL
      )`,
      
      `CREATE TABLE IF NOT EXISTS contact_info (
        contact_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        instagram VARCHAR(255),
        facebook VARCHAR(255),
        phone VARCHAR(20),
        address VARCHAR(255),
        city_id INT,
        date_of_birth DATE,
        FOREIGN KEY (user_id) REFERENCES users(userId) ON DELETE CASCADE,
        FOREIGN KEY (city_id) REFERENCES city(city_id) ON DELETE CASCADE,
        UNIQUE (user_id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS faculties (
        faculty_id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(10) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL
      )`,
      
      `CREATE TABLE IF NOT EXISTS degrees (
        degree_id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(5) NOT NULL UNIQUE,
        name VARCHAR(50) NOT NULL
      )`,
      
      `CREATE TABLE IF NOT EXISTS study_programs (
        program_id INT AUTO_INCREMENT PRIMARY KEY,
        faculty_id INT NOT NULL,
        degree_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        FOREIGN KEY (faculty_id) REFERENCES faculties(faculty_id),
        FOREIGN KEY (degree_id) REFERENCES degrees(degree_id),
        UNIQUE (faculty_id, degree_id, name)
      )`,
      
      `CREATE TABLE IF NOT EXISTS academic_info (
        academic_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        program_id INT,
        grade INT,
        FOREIGN KEY (user_id) REFERENCES users(userId) ON DELETE CASCADE,
        FOREIGN KEY (program_id) REFERENCES study_programs(program_id),
        UNIQUE (user_id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS roles (
        roleId integer auto_increment primary key,
        role varchar(30) UNIQUE
      )`,
      
      `CREATE TABLE IF NOT EXISTS members (
        memberId integer auto_increment primary key,
        userId integer not null,
        roleId integer,
        isAdmin boolean not null,
        isLeader boolean not null,
        foreign key (userId) references users(userId),
        foreign key (roleId) references roles(roleId)
      )`,
      
      `CREATE TABLE IF NOT EXISTS events(
        id INT auto_increment primary key,
        title VARCHAR(255) not null,
        event_date DATE not null,
        event_time TIME not null,
        place VARCHAR(255) not null,
        description TEXT not null,
        poster VARCHAR(255) not null,
        is_past BOOLEAN default false
      )`,
      
      `CREATE TABLE IF NOT EXISTS event_images(
        id INT auto_increment primary key,
        event_id INT NOT NULL,
        image_path VARCHAR(255) not null,
        foreign key (event_id) references events(id) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS movies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        jellyfin_id VARCHAR(255) UNIQUE,
        title VARCHAR(255) NOT NULL,
        year INT,
        summary TEXT,
        poster_url VARCHAR(1024),
        duration_seconds INT,
        rating FLOAT,
        last_updated DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        video_url VARCHAR(255),
        edited_title varchar(255),
        background_url VARCHAR(1024)
      )`,
      
      `CREATE TABLE IF NOT EXISTS actors (
        actor_id INT PRIMARY KEY AUTO_INCREMENT,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100)
      )`,
      
      `CREATE TABLE IF NOT EXISTS directors (
        director_id INT PRIMARY KEY AUTO_INCREMENT,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100)
      )`,
      
      `CREATE TABLE IF NOT EXISTS screenwriters (
        screenwriter_id INT PRIMARY KEY AUTO_INCREMENT,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100)
      )`,
      
      `CREATE TABLE IF NOT EXISTS genres (
        genre_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL UNIQUE
      )`,
      
      `CREATE TABLE IF NOT EXISTS movie_actor (
        movie_id INT,
        actor_id INT,
        PRIMARY KEY (movie_id, actor_id),
        FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
        FOREIGN KEY (actor_id) REFERENCES actors(actor_id) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS movie_director (
        movie_id INT,
        director_id INT,
        PRIMARY KEY (movie_id, director_id),
        FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
        FOREIGN KEY (director_id) REFERENCES directors(director_id) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS movie_screenwriter (
        movie_id INT,
        screenwriter_id INT,
        PRIMARY KEY (movie_id, screenwriter_id),
        FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
        FOREIGN KEY (screenwriter_id) REFERENCES screenwriters(screenwriter_id) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS movie_genre (
        movie_id INT,
        genre_id INT,
        PRIMARY KEY (movie_id, genre_id),
        FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
        FOREIGN KEY (genre_id) REFERENCES genres(genre_id) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS movie_date (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date_of_screaning DATE NOT NULL UNIQUE,
        type ENUM('hlasovanie', 'pevny_film', 'ukončené') NOT NULL,
        solid_movie_id INT NULL,
        winner_movie_id INT DEFAULT NULL,
        FOREIGN KEY (solid_movie_id) REFERENCES movies(id),
        FOREIGN KEY (winner_movie_id) REFERENCES movies(id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS movies_vote (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date_id INT NOT NULL,
        movie_id INT NOT NULL,
        number_of_votes INT DEFAULT 0,
        FOREIGN KEY (date_id) REFERENCES movie_date(id) ON DELETE CASCADE,
        FOREIGN KEY (movie_id) REFERENCES movies(id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS user_votes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        date_id INT NOT NULL,
        movie_id INT NOT NULL,
        voted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (date_id) REFERENCES movie_date(id) ON DELETE CASCADE,
        FOREIGN KEY (movie_id) REFERENCES movies(id),
        UNIQUE KEY (user_id, date_id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS cinema_rows (
        row_id INT PRIMARY KEY,
        seats_count INT NOT NULL
      )`,
      
      `CREATE TABLE IF NOT EXISTS reservations (
        reservation_id INT AUTO_INCREMENT PRIMARY KEY,
        screening_id INT NOT NULL,
        row_id INT NOT NULL,
        seat_number INT NOT NULL,
        user_id INT NOT NULL,
        status ENUM('available', 'clicked', 'reserved') DEFAULT 'available',
        FOREIGN KEY (screening_id) REFERENCES movie_date(id) ON DELETE CASCADE,
        FOREIGN KEY (row_id) REFERENCES cinema_rows(row_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(userId) ON DELETE CASCADE,
        UNIQUE(screening_id, row_id, seat_number)
      )`
    ];

    for (const query of tables) {
      await db.query(query);
    }

    const insertQueries = [
      `INSERT IGNORE INTO genres (name) VALUES
        ('Akčný'), ('Komédia'), ('Dráma'), ('Sci-Fi'), ('Horor'), ('Romantický'),
        ('Thriller'), ('Animovaný'), ('Dokumentárny'), ('Fantasy'), ('Dobrodružný'),
        ('Kriminálny'), ('Vojnový'), ('Western'), ('Historický'), ('Rodinný'),
        ('Hudobný'), ('Mysteriózny'), ('Biografický'), ('Športový')`,
        
      `INSERT IGNORE INTO cinema_rows (row_id, seats_count) VALUES
        (1, 18), (2, 21), (3, 20), (4, 21), (5, 20), (6, 21), (7, 20), (8, 21), (9, 20)`,
        
      `INSERT IGNORE INTO roles (role) VALUES
        ('Technik'), ('Grafik'), ('Verejné obstarávanie'), ('Vedúci')`,
        
      `INSERT IGNORE INTO faculties (code, name) VALUES
        ('FPEDAS', 'Fakulta prevádzky a ekonomiky dopravy a spojov'),
        ('SjF', 'Strojnícka fakulta'),
        ('FEIT', 'Fakulta elektrotechniky a informačných technológií'),
        ('SvF', 'Stavebná fakulta'),
        ('FBI', 'Fakulta bezpečnostného inžinierstva'),
        ('FRI', 'Fakulta riadenia a informatiky'),
        ('FHV', 'Fakulta humanitných vied')`,
        
      `INSERT IGNORE INTO degrees (code, name) VALUES
        ('Bc.', 'Bakalár'), ('Ing.', 'Inžinier'), ('PhD.', 'Doktor filozofie')`
    ];

    for (const query of insertQueries) {
      await db.query(query);
    }

    console.log('Databáza a tabuľky sú pripravené!');
  } catch (error) {
    console.error('Chyba pri inicializácii databázy:', error);
    throw error;
  }
};

module.exports = {
  createUser,
  createAdmin,
  initDB
}