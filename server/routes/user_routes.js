const { createAdmin,createUser } = require('../util/dbHandler');
const bcrypt = require("bcryptjs");
const db = require('../data/database_connection');
const jwt = require("jsonwebtoken");

const insertDefaultAdmin = async () => {
  try {
    const adminEmail = "gama.uniza@gmail.com";
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD;

    const [existingAdmin] = await db.query(`SELECT * FROM users WHERE email = ?`, [adminEmail]);

    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await createAdmin(adminEmail, hashedPassword);
      console.log("Predvolený admin účet bol vytvorený");
    }
  } catch (error) {
    console.error("Chyba pri vytváraní predvoleného admin účtu:", error);
  }
}

const registerUser = async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  try {
    if (!email.endsWith("uniza.sk")) {
      return res.status(400).json({ message: "Povolená je iba registrácia cez študentský mail UNIZA!" });
    }

    const [result] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (result.length > 0) {
      return res.status(400).json({ message: "E-mail už existuje" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Heslá sa musia zhodovať!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await createUser(email, hashedPassword);

    res.status(201).json({ message: 'Registrácia úspešná!' });
  } catch (error) {
    console.error("Chyba pri registrácii:", error);
    res.status(500).json({ message: "Interná chyba servera" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [result] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (result.length === 0) {
      return res.status(401).json({ message: "Email neexistuje" });
    }

    const user = result[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Nesprávne heslo" });
    }

    const [memberResult] = await db.query(
      "SELECT isAdmin FROM members WHERE userId = ?",
      [user.userId]
    );

    const token = jwt.sign({ userId: user.userId, email: user.email }, "tajnyKluc", { expiresIn: "2h" });

    const isMember = result.length > 0 ? !!result[0].isMember : false;
    const isAdmin = memberResult.length > 0 ? !!memberResult[0].isAdmin : false;

    res.status(200).json({ message: "Prihlásenie úspešné!", token, isAdmin, isMember, userId: user.userId, });
  } catch {
    console.error("Chyba pri prihlasovaní:", error);
    res.status(500).json({ message: "Interná chyba servera" });
  }
};

const getUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
        SELECT * FROM users WHERE users.email != "gama.uniza@gmail.com" AND users.isMember = 0
      `);

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No users found'
      });
    }

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error in getUsers:', error);

  }
};

const getSpecificUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [users] = await db.query(
      `SELECT 
        u.userId, u.email, u.name, u.surname, u.isMember, u.imageLocation,
        ci.contact_id, ci.instagram, ci.facebook, ci.phone, ci.address, ci.date_of_birth,
        c.city_id, c.city, c.postal_code,
        ai.academic_id, ai.grade,
        sp.program_id, sp.name AS program_name,
        f.faculty_id, f.code AS faculty_code, f.name AS faculty_name,
        d.degree_id, d.code AS degree_code, d.name AS degree_name
      FROM bakalarskapraca.users u
      LEFT JOIN bakalarskapraca.contact_info ci ON u.userId = ci.user_id
      LEFT JOIN bakalarskapraca.city c ON ci.city_id = c.city_id
      LEFT JOIN bakalarskapraca.academic_info ai ON ai.user_id = u.userId
      LEFT JOIN bakalarskapraca.study_programs sp ON sp.program_id = ai.program_id
      LEFT JOIN bakalarskapraca.faculties f ON f.faculty_id = sp.faculty_id
      LEFT JOIN bakalarskapraca.degrees d ON d.degree_id = sp.degree_id
      WHERE u.userId = ?`,
      [userId]
    );

    console.log("Totot je user: ",users);

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log("User found:", users);
    
    res.status(200).json({
      success: true,
      data: users  
    });
  } catch (error) {
    console.error('Error in getSpecificUser:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const updateUserInfo = async (req, res) => {
  try {
    console.log("Update request received for user:", req.params.userId);
    console.log("Update data:", req.body);
    const { userId } = req.params;
    const {
      name, surname, phone, address, city, postal_code,
      date_of_birth, faculty, degree, grade, study_program, instagram, facebook
    } = req.body;

    let profileImage = null;
    if (req.file) {
      profileImage = `/avatars/${req.file.filename}`;
      console.log("Received file:", profileImage);
      
      try {
        const [currentUser] = await db.query('SELECT imageLocation FROM bakalarskapraca.users WHERE userId = ?', [userId]);
        if (currentUser.length > 0 && currentUser[0].imageLocation) {
          const oldImagePath = path.join(__dirname, '../public/avatars', currentUser[0].imageLocation.replace('/avatars/', ''));
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            console.log("Deleted old profile image:", oldImagePath);
          }
        }
      } catch (error) {
        console.error("Error while trying to delete old image:", error);
      }
    }
    
    console.log("-----------------------------------", profileImage);
    
    await db.query('START TRANSACTION');
    
    try {
      await db.query(
        `UPDATE bakalarskapraca.users
         SET name = ?, surname = ?, imageLocation = COALESCE(?, imageLocation)
         WHERE userId = ?`,
        [name || null, surname || null, profileImage, userId]
      );
      
      let cityId = null;
      if (city && postal_code) {
        const [existingCity] = await db.query(
          `SELECT city_id FROM bakalarskapraca.city 
           WHERE city = ? AND postal_code = ?`,
          [city, postal_code]
        );
        
        if (existingCity.length > 0) {
          cityId = existingCity[0].city_id;
        } else {
          const [newCityResult] = await db.query(
            `INSERT INTO bakalarskapraca.city (city, postal_code) 
             VALUES (?, ?)`,
            [city, postal_code]
          );
          cityId = newCityResult.insertId;
        }
      }
      
      const [contactExists] = await db.query(
        `SELECT 1 FROM bakalarskapraca.contact_info WHERE user_id = ?`,
        [userId]
      );
      
      if (contactExists.length > 0) {
        await db.query(
          `UPDATE bakalarskapraca.contact_info
           SET instagram = ?, facebook = ?, phone = ?, address = ?, 
               city_id = ?, date_of_birth = ?
           WHERE user_id = ?`,
          [instagram || null, facebook || null, phone || null, address || null, 
           cityId, date_of_birth || null, userId]
        );
      } else {
        await db.query(
          `INSERT INTO bakalarskapraca.contact_info
           (user_id, instagram, facebook, phone, address, city_id, date_of_birth)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [userId, instagram || null, facebook || null, phone || null, address || null,
           cityId, date_of_birth || null]
        );
      }
      
      if (faculty && degree && study_program) {
        const [facultyResult] = await db.query(
          `SELECT faculty_id FROM bakalarskapraca.faculties WHERE code = ?`,
          [faculty]
        );
        
        const [degreeResult] = await db.query(
          `SELECT degree_id FROM bakalarskapraca.degrees WHERE code = ?`,
          [degree]
        );
        
        if (facultyResult.length > 0 && degreeResult.length > 0) {
          const facultyId = facultyResult[0].faculty_id;
          const degreeId = degreeResult[0].degree_id;
          
          const [programResult] = await db.query(
            `SELECT program_id FROM bakalarskapraca.study_programs 
             WHERE faculty_id = ? AND degree_id = ? AND name = ?`,
            [facultyId, degreeId, study_program]
          );
          
          if (programResult.length > 0) {
            const programId = programResult[0].program_id;
            
            const [academicExists] = await db.query(
              `SELECT 1 FROM bakalarskapraca.academic_info WHERE user_id = ?`,
              [userId]
            );
            
            if (academicExists.length > 0) {
              await db.query(
                `UPDATE bakalarskapraca.academic_info
                 SET program_id = ?, grade = ?
                 WHERE user_id = ?`,
                [programId, grade || null, userId]
              );
            } else {
              await db.query(
                `INSERT INTO bakalarskapraca.academic_info
                 (user_id, program_id, grade)
                 VALUES (?, ?, ?)`,
                [userId, programId, grade || null]
              );
            }
          }
        }
      }
      
      await db.query("COMMIT");
      
      res.status(200).json({ 
        success: true, 
        message: "User information updated successfully" 
      });
      
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating user", 
      error: error.message 
    });
  }
};

const getAcademicOptions = async (req, res) => {
  try {
    const [faculties] = await db.query(`
      SELECT faculty_id, code, name 
      FROM bakalarskapraca.faculties 
      ORDER BY code
    `);

    const [degrees] = await db.query(`
      SELECT degree_id, code, name 
      FROM bakalarskapraca.degrees 
      ORDER BY code
    `);

    const [programs] = await db.query(`
      SELECT p.program_id, p.name, f.code AS faculty_code, d.code AS degree_code
      FROM bakalarskapraca.study_programs p
      JOIN bakalarskapraca.faculties f ON p.faculty_id = f.faculty_id
      JOIN bakalarskapraca.degrees d ON p.degree_id = d.degree_id
      ORDER BY f.code, d.code, p.name
    `);

    const facultyProgramsMap = {};

    faculties.forEach(faculty => {
      facultyProgramsMap[faculty.code] = {};
      
      degrees.forEach(degree => {
        facultyProgramsMap[faculty.code][degree.code] = [];
      });
    });

    programs.forEach(program => {
      if (facultyProgramsMap[program.faculty_code] && 
          facultyProgramsMap[program.faculty_code][program.degree_code]) {
        facultyProgramsMap[program.faculty_code][program.degree_code].push(program.name);
      }
    });

    res.status(200).json({
      success: true,
      data: {
        faculties,
        degrees,
        facultyProgramsMap
      }
    });
  } catch (error) {
    console.error('Error getting academic options:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching academic options',
      error: error.message
    });
  }
};


const getRoles = async (req, res) => {
  try {
    const [roles] = await db.query(`
        SELECT role FROM roles
      `);

    res.status(200).json({
      success: true,
      count: roles.length,
      data: roles
    });
  } catch (error) {
    console.error('Error in getRoles:', error);

  }
};

const updateUserMemberStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, roleId, isAdmin, isLeader } = req.body;
    const filePath = req.file ? `/avatars/${req.file.filename}` : null

    const [roleData] = await db.query(`SELECT roleId FROM roles WHERE role = ?`, [roleId]);

    if (roleData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role name'
      });
    }

    const roleIdNumber = roleData[0].roleId;

    await db.query("START TRANSACTION");

    const [result] = await db.query(
      `UPDATE users 
             SET isMember = 1, name = ?, imageLocation = ?
             WHERE userId = ?`,
      [name, filePath, userId]
    );

    const [memberExists] = await db.query(`SELECT * FROM members WHERE userId = ?`, [userId]);

    if (memberExists.length === 0) {
      await db.query(
        `INSERT INTO members (userId, roleId, isAdmin, isLeader) 
                 VALUES (?, ?, ?, ?)`,
        [userId, roleIdNumber, isAdmin, isLeader]
      );
      console.log("User added to members table.");
    } else {
      console.log("User already exists in members table.");
    }

    await db.query("COMMIT");

    res.status(200).json({
      success: true,
      message: 'User details updated successfully'
    });

  } catch (error) {
    await db.query("ROLLBACK");

    console.error('Error updating user details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const removeFromMembers = async (req, res) => {
  try {
    const { userId } = req.params;

    await db.query("START TRANSACTION");

    const [result] = await db.query(
      `UPDATE users 
             SET isMember = 0
             WHERE userId = ?`,
      [userId]
    );

    const [memberExists] = await db.query(`SELECT * FROM members WHERE userId = ?`, [userId]);

    if (memberExists.length !== 0) {
      await db.query(
        `DELETE FROM members WHERE userId = ?`,
        [userId]
      );
      console.log("User removed from members table.");
    } else {
      console.log("User is not in members table.");
    }

    await db.query("COMMIT");

    res.status(200).json({
      success: true,
      message: 'User details updated successfully'
    });

  } catch (error) {
    await db.query("ROLLBACK");

    console.error('Error updating user details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getMembers = async (req, res) => {
  try {
    const [members] = await db.query(`
      SELECT 
        m.memberId, 
        u.userId, 
        u.email, 
        u.name, 
        u.surname,
        u.imageLocation, 
        f.code AS faculty_code, 
        ci.instagram, 
        ci.facebook, 
        r.role, 
        m.isAdmin, 
        m.isLeader
      FROM bakalarskapraca.members m
      INNER JOIN bakalarskapraca.users u ON u.userId = m.userId
      INNER JOIN bakalarskapraca.roles r ON r.roleId = m.roleId
      LEFT JOIN bakalarskapraca.contact_info ci ON u.userId = ci.user_id
      LEFT JOIN bakalarskapraca.academic_info ai ON ai.user_id = u.userId
      LEFT JOIN bakalarskapraca.study_programs sp ON sp.program_id = ai.program_id
      LEFT JOIN bakalarskapraca.faculties f ON f.faculty_id = sp.faculty_id
      WHERE u.email != "gama.uniza@gmail.com"
    `);

    if (!members || members.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No members found'
      });
    }

    res.status(200).json({
      success: true,
      count: members.length,
      data: members
    });
  } catch (error) {
    console.error('Error in getMembers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching members',
      error: error.message
    });
  }
};

const editMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { name, roleId, isAdmin, isLeader, existingImagePath } = req.body;

    let filePath = existingImagePath;

    if (req.file) {
      filePath = `/avatars/${req.file.filename}`;
    }

    const [roleData] = await db.query(`SELECT roleId FROM roles WHERE role = ?`, [roleId]);

    const [userResults] = await db.query(`SELECT userId FROM members WHERE memberId = ?`, [memberId]);
    const userId = userResults[0]?.userId;



    if (roleData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role name'
      });
    }

    const roleIdNumber = roleData[0].roleId;

    await db.query("START TRANSACTION");

    const [result] = await db.query(
      `UPDATE members 
             SET roleId = ?, isAdmin = ?, isLeader = ? 
             WHERE memberId = ?`,
      [roleIdNumber, isAdmin, isLeader, memberId]
    );

    await db.query(`UPDATE users 
             SET name = ?, imageLocation = ?
             WHERE userId = ?`,
      [name, filePath, userId]);

    await db.query("COMMIT");

    res.status(200).json({
      success: true,
      message: 'Member details updated successfully'
    });

  } catch (error) {
    await db.query("ROLLBACK");

    console.error('Error updating user details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getLeader = async (req, res) => {
  try {
    let { roleIds } = req.query;


    if (!roleIds) {
      return res.status(400).json({ success: false, message: "roleIds parameter is required" });
    }

    
    roleIds = roleIds.split(",").map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
   

    if (roleIds.length === 0) {
        return res.status(400).json({ success: false, message: "Invalid roleIds format" });
    }

    
    const placeholders = roleIds.map(() => "?").join(", ");

    console.log("Placeholders: ", roleIds);

    const query = `
        SELECT users.name, roles.role, contact_info.instagram, contact_info.facebook, users.email, roles.roleId, users.imageLocation
        FROM users
        INNER JOIN members ON members.userId = users.userId
        INNER JOIN roles ON roles.roleId = members.roleId
        LEFT JOIN contact_info ON contact_info.user_id = users.userId
        WHERE members.isLeader = 1 AND roles.roleId IN (${placeholders})`;

       
    const [leaders] = await db.query(query, roleIds);

    console.log(leaders)

    res.status(200).json({
      success: true,
      count: leaders.length,
      data: leaders
    });
  } catch (error) {
    console.error("Error in getLeaders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



module.exports = { insertDefaultAdmin ,registerUser, loginUser, getUsers,getSpecificUser,updateUserInfo,getAcademicOptions, getRoles, updateUserMemberStatus, removeFromMembers, getMembers, editMember, getLeader };


