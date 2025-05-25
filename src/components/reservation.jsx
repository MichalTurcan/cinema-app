import { useState, useEffect } from "react";
import "../style/reservation.css";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Reservation() {
  const [screeningId, setScreeningId] = useState(null);

  const [rowsConfig, setRowsConfig] = useState([]);
  
  const [seatsStatus, setSeatsStatus] = useState({});
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [userReservation, setUserReservation] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    const fetchTodayScreening = async () => {
      try {
        const response = await axios.get('/api/movies/today-screening');
        
        if (response.data.hasScreeningToday && response.data.winnerDetermined) {
          setScreeningId(response.data.screening.id);
          setLoading(false);
        } else {
          setError("Pre dnešok nie je naplánované žiadne predstavenie alebo výsledky hlasovania ešte nie sú známe.");
          setLoading(false);
        }
      } catch (err) {
        console.error("Chyba pri získavaní dnešného predstavenia:", err);
        setError("Nepodarilo sa načítať informácie o dnešnom predstavení.");
        setLoading(false);
      }
    };
    
    fetchTodayScreening();
  }, []);
  
  useEffect(() => {
    if (!screeningId || !user) return;
    
    const fetchCinemaConfiguration = async () => {
      try {
        setLoading(true);
        
        const configResponse = await axios.get('/api/cinema/configuration',{
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        
        if (!configResponse.data.success) {
          throw new Error(configResponse.data.error || 'Nepodarilo sa načítať konfiguráciu kina');
        }
        
        setRowsConfig(configResponse.data.rows);
        
        const seatsResponse = await axios.get(`/api/screenings/${screeningId}/seats`,{
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        
        if (!seatsResponse.data.success) {
          throw new Error(seatsResponse.data.error || 'Nepodarilo sa načítať stav sedadiel');
        }
        
        const seatsMap = {};
        seatsResponse.data.seats.forEach(seat => {
          const key = `${seat.row_id}-${seat.seat_number}`;
          seatsMap[key] = seat;
          
          if (seat.status === 'reserved' && seat.user_id === user.userId) {
            setUserReservation({ rowId: seat.row_id, seatNumber: seat.seat_number });
          }
        });
        
        setSeatsStatus(seatsMap);
        setLoading(false);
        
      } catch (err) {
        console.error("Chyba pri načítaní dát:", err);
        setError(err.message || "Nastala chyba pri načítaní dát. Prosím, skúste to znova neskôr.");
        setLoading(false);
      }
    };
    
    fetchCinemaConfiguration();
  }, [screeningId, user]);
  
  const handleSeatClick = async (rowId, seatNumber) => {
    if (!user) {
      setError("Pre rezerváciu je potrebné sa prihlásiť.");
      return;
    }
    
    if (userReservation && !(userReservation.rowId === rowId && userReservation.seatNumber === seatNumber)) {
      setError("Už máte vytvorenú rezerváciu. Môžete ju zrušiť a vybrať iné miesto.");
      return;
    }
    
    const seatKey = `${rowId}-${seatNumber}`;
    const seat = seatsStatus[seatKey];
    
    if (seat && seat.status === 'reserved' && seat.user_id !== user.userId) {
      return;
    }
    
    if (userReservation && userReservation.rowId === rowId && userReservation.seatNumber === seatNumber) {
      return; 
    }
    
    try {
      if (selectedSeat && selectedSeat.rowId === rowId && selectedSeat.seatNumber === seatNumber) {

        console.log(user.userId);
        await axios.post('/api/seats/update', {
          screeningId,
          rowId,
          seatNumber,
          userId: user.userId,
          status: 'available'
        });
        
        const updatedSeatsStatus = { ...seatsStatus };
        if (updatedSeatsStatus[seatKey]) {
          updatedSeatsStatus[seatKey].status = 'available';
        }
        
        setSeatsStatus(updatedSeatsStatus);
        setSelectedSeat(null);
      } else {
        if (selectedSeat) {
          const oldSeatKey = `${selectedSeat.rowId}-${selectedSeat.seatNumber}`;
          
          await axios.post('/api/seats/update', {
            screeningId,
            rowId: selectedSeat.rowId,
            seatNumber: selectedSeat.seatNumber,
            userId: user.userId,
            status: 'available'
          }, {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
          });
          
          const updatedSeatsStatus = { ...seatsStatus };
          if (updatedSeatsStatus[oldSeatKey]) {
            updatedSeatsStatus[oldSeatKey].status = 'available';
          }
          
          setSeatsStatus(updatedSeatsStatus);
        }
        
        await axios.post('/api/seats/update', {
          screeningId,
          rowId,
          seatNumber,
          userId: user.userId,
          status: 'clicked'
        }, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        
        const updatedSeatsStatus = { ...seatsStatus };
        if (!updatedSeatsStatus[seatKey]) {
          updatedSeatsStatus[seatKey] = {
            row_id: rowId,
            seat_number: seatNumber,
            user_id: user.userId
          };
        }
        updatedSeatsStatus[seatKey].status = 'clicked';
        
        setSeatsStatus(updatedSeatsStatus);
        setSelectedSeat({ rowId, seatNumber });
      }
    } catch (err) {
      console.error("Chyba pri aktualizácii stavu sedadla:", err);
      setError(err.response?.data?.error || "Nastala chyba pri aktualizácii stavu sedadla.");
    }
  };
  
  const handleCancelSelection = async () => {
    if (!selectedSeat) return;
    
    try {
      const seatKey = `${selectedSeat.rowId}-${selectedSeat.seatNumber}`;
      
      await axios.post('/api/seats/update', {
        screeningId,
        rowId: selectedSeat.rowId,
        seatNumber: selectedSeat.seatNumber,
        userId: user.userId,
        status: 'available'
      });
      
      const updatedSeatsStatus = { ...seatsStatus };
      if (updatedSeatsStatus[seatKey]) {
        updatedSeatsStatus[seatKey].status = 'available';
      }
      
      setSeatsStatus(updatedSeatsStatus);
      setSelectedSeat(null);
      
    } catch (err) {
      console.error("Chyba pri rušení výberu sedadla:", err);
      setError(err.response?.data?.error || "Nastala chyba pri rušení výberu sedadla.");
    }
  };
  
  const handleConfirmReservation = async () => {
    if (!selectedSeat) return;
    
    if (userReservation) {
      setError("Už máte vytvorenú rezerváciu. Môžete ju zrušiť a vybrať iné miesto.");
      return;
    }
    
    try {
      const seatKey = `${selectedSeat.rowId}-${selectedSeat.seatNumber}`;
      
      await axios.post('/api/seats/update', {
        screeningId,
        rowId: selectedSeat.rowId,
        seatNumber: selectedSeat.seatNumber,
        userId: user.userId,
        status: 'reserved'
      }, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      
      const updatedSeatsStatus = { ...seatsStatus };
      if (updatedSeatsStatus[seatKey]) {
        updatedSeatsStatus[seatKey].status = 'reserved';
        updatedSeatsStatus[seatKey].user_id = user.userId;
      }
      
      setSeatsStatus(updatedSeatsStatus);
      setUserReservation({ rowId: selectedSeat.rowId, seatNumber: selectedSeat.seatNumber });
      setSelectedSeat(null);
      setSuccess('Vaša rezervácia bola úspešne vytvorená!');
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error("Chyba pri potvrdzovaní rezervácie:", err);
      setError(err.response?.data?.error || "Nastala chyba pri vytváraní rezervácie.");
    }
  };
  
  const handleCancelReservation = async () => {
    if (!userReservation) return;
    
    try {
      const seatKey = `${userReservation.rowId}-${userReservation.seatNumber}`;
      
      await axios.post('/api/seats/update', {
        screeningId,
        rowId: userReservation.rowId,
        seatNumber: userReservation.seatNumber,
        userId: user.userId,
        status: 'available'
      }, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      
      const updatedSeatsStatus = { ...seatsStatus };
      if (updatedSeatsStatus[seatKey]) {
        updatedSeatsStatus[seatKey].status = 'available';
        updatedSeatsStatus[seatKey].user_id = null;
      }
      
      setSeatsStatus(updatedSeatsStatus);
      setUserReservation(null);
      setSuccess('Vaša rezervácia bola úspešne zrušená!');
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error("Chyba pri rušení rezervácie:", err);
      setError(err.response?.data?.error || "Nastala chyba pri rušení rezervácie.");
    }
  };
  
  if (loading) {
    return <div className="text-center mt-5">Načítavanie...</div>;
  }
  
  if (error) {
    return (
      <div className="alert alert-danger mt-5" role="alert">
        {error}
        <button 
          className="btn btn-outline-danger ms-3"
          onClick={() => setError(null)}
        >
          Skúsiť znova
        </button>
      </div>
    );
  }
  
  const getSeatStatus = (rowId, seatNumber) => {
    const seatKey = `${rowId}-${seatNumber}`;
    if (seatsStatus[seatKey]) {
      return seatsStatus[seatKey].status;
    }
    return 'available'; 
  };
  
  const getSeatButtonClass = (rowId, seatNumber) => {
    const status = getSeatStatus(rowId, seatNumber);
    const seatKey = `${rowId}-${seatNumber}`;
    const seat = seatsStatus[seatKey];
    
    let classes = "btn seat";
    
    if (status === 'reserved' && seat && seat.user_id === user?.userId) {
      return classes + " btn-info"; 
    }
    
    if (status === 'reserved') {
      return classes + " btn-secondary"; 
    }
    
    if (status === 'clicked' && selectedSeat && 
        selectedSeat.rowId === rowId && 
        selectedSeat.seatNumber === seatNumber) {
      return classes + " btn-warning"; 
    }
    
    return classes + " btn-success"; 
  };
  
  const isSeatDisabled = (rowId, seatNumber) => {
    const status = getSeatStatus(rowId, seatNumber);
    const seatKey = `${rowId}-${seatNumber}`;
    const seat = seatsStatus[seatKey];
    
    if (userReservation && !(userReservation.rowId === rowId && userReservation.seatNumber === seatNumber)) {
      return true;
    }
    
    return (status === 'reserved' && seat && seat.user_id !== user?.userId);
  };
  
  return (
    <div className="reservation-container text-center">
      <h3 className="bg-dark text-white py-2 rounded">PLÁTNO</h3>
      
      {success && (
        <div className="alert alert-success mt-3" role="alert">
          {success}
        </div>
      )}
      
      {userReservation ? (
        <div className="mt-3">
          <p>
            Vaša rezervácia: <strong>Rad {userReservation.rowId}, Sedadlo {userReservation.seatNumber}</strong>
            <button 
              className="btn btn-sm btn-danger ms-3" 
              onClick={handleCancelReservation}
            >
              Zrušiť rezerváciu
            </button>
          </p>
        </div>
      ) : selectedSeat ? (
        <p className="mt-3">
          Vybrané miesto: <strong>Rad {selectedSeat.rowId}, Sedadlo {selectedSeat.seatNumber}</strong>
        </p>
      ) : (
        <p className="mt-3">Klikni na miesto pre rezerváciu</p>
      )}
      
      <div className="all-seats mt-4 mb-4">
        {rowsConfig.map((row) => (
          <div key={`row-${row.row_id}`} className="rows">
            {Array.from({ length: row.seats_count }, (_, index) => {
              const seatNumber = index + 1;
              
              return (
                <button
                  key={`seat-${row.row_id}-${seatNumber}`}
                  className={getSeatButtonClass(row.row_id, seatNumber)}
                  onClick={() => handleSeatClick(row.row_id, seatNumber)}
                  disabled={isSeatDisabled(row.row_id, seatNumber)}
                >
                  {seatNumber}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      
      {!userReservation && (
        <div className="mt-3">
          <button 
            className="btn btn-res cancel" 
            onClick={handleCancelSelection}
            disabled={!selectedSeat}
          >
            Zrušiť výber
          </button>
          <button 
            className="btn btn-res submit" 
            disabled={!selectedSeat}
            onClick={handleConfirmReservation}
          >
            Potvrdiť rezerváciu
          </button>
        </div>
      )}
      
      <div className="mt-4">
        <div className="d-flex justify-content-center gap-3">
          <div>
            <span className="btn btn-success btn-sm">&nbsp;</span>
            <span className="ms-1">Voľné</span>
          </div>
          <div>
            <span className="btn btn-warning btn-sm">&nbsp;</span>
            <span className="ms-1">Vybrané</span>
          </div>
          <div>
            <span className="btn btn-secondary btn-sm">&nbsp;</span>
            <span className="ms-1">Obsadené</span>
          </div>
          <div>
            <span className="btn btn-info btn-sm">&nbsp;</span>
            <span className="ms-1">Vaše rezervácie</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reservation;