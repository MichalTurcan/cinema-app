const db = require('../data/database_connection');
const fs = require('fs');
const path = require('path');

const getEvents = async (req, res) => {
    try {
        await checkPastEvents();

        const [events] = await db.query(`
          SELECT * FROM events ORDER BY events.event_date ASC, events.event_time ASC
        `);

        if (!events || events.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No events found'
            });
        }

        for (let event of events) {
            const [images] = await db.query(
                'SELECT image_path FROM event_images WHERE event_id = ?',
                [event.id]
            );
            
            event.images = images.map(img => img.image_path);
        }

        console.log("Events with images:", events);

        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        console.error('Error in getEvents:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getSpecificEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        
        const [events] = await db.query(
            'SELECT * FROM events WHERE id = ?',
            [eventId]
        );
        
        if (!events || events.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        
        const [images] = await db.query(
            'SELECT image_path FROM event_images WHERE event_id = ?',
            [eventId]
        );
        
        const eventWithImages = {
            ...events[0],
            images: images.map(img => img.image_path)
        };
        
        console.log("Event with images:", eventWithImages);
        
        res.status(200).json({
            success: true,
            data: eventWithImages
        });
    } catch (error) {
        console.error('Error in getSpecificEvent:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const createEvent = async (req, res) => {
    try {
        const { title, date, time, place, description, isPast } = req.body;

        if (!title || !date || !time || !place || !description) {
            return res.status(400).json({ message: "Všetky polia sú povinné" });
        }

        let posterPath = null;

        if (req.files && req.files.poster && req.files.poster.length > 0) {
            const eventDir = path.join(__dirname, '../../public/events', `${title.replace(/\s+/g, '_')}_${date}`);

            if (!fs.existsSync(eventDir)) {
                fs.mkdirSync(eventDir, { recursive: true });
            }

            const posterFile = req.files.poster[0];
            const posterFilename = Date.now() + path.extname(posterFile.originalname);
            const posterDestination = path.join(eventDir, posterFilename);

            fs.copyFileSync(posterFile.path, posterDestination);
            fs.unlinkSync(posterFile.path);

            posterPath = `/events/${title.replace(/\s+/g, '_')}_${date}/${posterFilename}`;
        } else {
            return res.status(400).json({ message: 'Plagát je povinný' });
        }

        const query = `
        INSERT INTO events (title, event_date, event_time, place, description, poster, is_past) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [title, date, time, place, description, posterPath, isPast === 'true' ? 1 : 0]);

        const eventId = result.insertId;



        res.status(201).json({ message: 'Vytvorenie akcie úspešné!' });
    } catch (error) {
        console.error("Chyba pri vytvárani akcie:", error);
        res.status(500).json({ message: "Interná chyba servera" });
    }

};

const addEventImages = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { existingImages } = req.body;
        
        const [events] = await db.query(
            'SELECT * FROM events WHERE id = ?',
            [eventId]
        );
        
        if (!events || events.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        
        const event = events[0];
        
        const posterPath = event.poster;
        const lastSlashIndex = posterPath.lastIndexOf('/');
        const eventDirPath = posterPath.substring(0, lastSlashIndex);
        
        await db.query('START TRANSACTION');
        
        try {
            if (existingImages) {
                const [currentImages] = await db.query(
                    'SELECT id, image_path FROM event_images WHERE event_id = ?',
                    [eventId]
                );
                
                let keepImages = [];
                if (typeof existingImages === 'string') {
                    keepImages = [existingImages];
                } else if (Array.isArray(existingImages)) {
                    keepImages = existingImages;
                }
                
                for (const img of currentImages) {
                    if (!keepImages.includes(img.image_path)) {
                        await db.query(
                            'DELETE FROM event_images WHERE id = ?',
                            [img.id]
                        );
                    }
                }
            }
            
            if (req.files && req.files.images && req.files.images.length > 0) {
                const eventDir = path.join(__dirname, '../../public', eventDirPath);
                
                if (!fs.existsSync(eventDir)) {
                    fs.mkdirSync(eventDir, { recursive: true });
                }
                
                for (const file of req.files.images) {
                    const imageFilename = Date.now() + '_' + Math.round(Math.random() * 1E6) + path.extname(file.originalname);
                    const imageDestination = path.join(eventDir, imageFilename);
                    
                    fs.copyFileSync(file.path, imageDestination);
                    fs.unlinkSync(file.path);
                    
                    const imagePath = `${eventDirPath}/${imageFilename}`;
                    
                    await db.query(
                        `INSERT INTO event_images (event_id, image_path) VALUES (?, ?)`,
                        [eventId, imagePath]
                    );
                }
            }
            
            await db.query('COMMIT');
            
            res.status(200).json({
                success: true,
                message: 'Images updated successfully'
            });
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Error updating event images:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update images',
            error: error.message
        });
    }
};

const deleteEvent = async (req, res) => {

    try {
        const { eventId } = req.params;

        await db.query("START TRANSACTION");

        const [result] = await db.query(
            `DELETE FROM events 
               WHERE id = ?`,
            [eventId]
        );

        await db.query("COMMIT");

        res.status(200).json({
            success: true,
            message: 'Akcia bola odstránená'
        });

    } catch (error) {
        await db.query("ROLLBACK");

        console.error('Error deleting event:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const checkPastEvents = async () => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const [result] = await db.query(
            `UPDATE events SET is_past = 1 WHERE event_date < ? AND is_past =0`,
            [today]
        );

        console.log(`Udalosti ${result.affectedRows} boli aktualizované na stav minulých udalostí`);
    } catch (error) {
        console.error('Chyba pri aktualizácii minulých udalostí:', error);
    }
}

module.exports = { getEvents, getSpecificEvent, createEvent,addEventImages, deleteEvent, checkPastEvents };