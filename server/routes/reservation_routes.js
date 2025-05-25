const db = require('../data/database_connection');

const getCinemaConfiguration = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT *
       FROM cinema_rows
       ORDER BY row_id`
    );
    res.json({
      success: true,
      rows: rows
    });
  } catch (error) {
    console.error('Chyba pri získavaní konfigurácie kina: ', error);
    res.status(500).json({
      success: false,
      error: 'Chyba pri získavaní konfigurácie kina'
    });
  }
};

const getSeatsStatus = async (req, res) => {
  try {
    const screeningId = req.params.screeningId;
    
    const [screening] = await db.query(
      `SELECT id
       FROM movie_date
       WHERE id = ?`,
      [screeningId]
    );
    
    if (screening.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Predstavenie nebolo nájdené' 
      });
    }
    
    const [seats] = await db.query(
      `SELECT row_id, seat_number, status, user_id 
       FROM reservations
       WHERE screening_id = ?`,
      [screeningId]
    );
    
    res.json({
      success: true,
      screeningId: screeningId,
      seats: seats
    });
  } catch (error) {
    console.error('Chyba pri získavaní stavu sedadiel:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Chyba servera pri získavaní stavu sedadiel' 
    });
  }
};

const updateSeatStatus = async (req, res) => {
  try {
    const { screeningId, rowId, seatNumber, userId, status } = req.body;
    
    if (!screeningId || !rowId || !seatNumber || !userId || !status) {
      return res.status(400).json({ 
        success: false, 
        error: 'Chýbajú povinné parametre' 
      });
    }
    
    if (!['available', 'clicked', 'reserved'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Neplatný status sedadla' 
      });
    }
    
    const [existingSeat] = await db.query(
      `SELECT reservation_id, status, user_id FROM reservations
       WHERE screening_id = ? AND row_id = ? AND seat_number = ?`,
      [screeningId, rowId, seatNumber]
    );
    
    if (existingSeat.length === 0) {
      const [result] = await db.query(
        `INSERT INTO reservations (screening_id, row_id, seat_number, user_id, status)
         VALUES (?, ?, ?, ?, ?)`,
        [screeningId, rowId, seatNumber, userId, status]
      );
      
      return res.status(201).json({
        success: true,
        message: 'Stav sedadla úspešne vytvorený',
        seatId: result.insertId
      });
    }
    
    const seat = existingSeat[0];
    
    if (seat.status === 'reserved' && seat.user_id !== userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Toto sedadlo je už rezervované iným užívateľom' 
      });
    }
    
    await db.query(
      `UPDATE reservations
       SET status = ?, user_id = ?
       WHERE reservation_id = ?`,
      [status, userId, seat.reservation_id]
    );
    
    res.json({
      success: true,
      message: 'Stav sedadla úspešne aktualizovaný'
    });
  } catch (error) {
    console.error('Chyba pri aktualizácii stavu sedadla:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Chyba servera pri aktualizácii stavu sedadla' 
    });
  }
};

module.exports = { 
  getCinemaConfiguration,
  getSeatsStatus,
  updateSeatStatus
};