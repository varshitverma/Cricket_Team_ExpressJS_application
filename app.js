const express = require("express");
const app = express();
app.use(express.json());

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running....");
    });
  } catch (e) {
    console(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//GET ALL Players API-1

//CONVERTING THE OUTPUT TO OBJECT
const convertDbObject = (objectItem) => {
  return {
    playerId: objectItem.player_id,
    playerName: objectItem.player_name,
    jerseyNumber: objectItem.jersey_number,
    role: objectItem.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT * 
    FROM 
      cricket_team`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(playersArray.map((eachPlayer) => convertDbObject(eachPlayer)));
});

//POST Player Into DB  API-2
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const addPlayerQuery = `
      INSERT INTO
      cricket_team(player_name,jersey_number,role)
      VALUES ('${playerName}', ${jerseyNumber}, '${role}')`;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//GET Player By ID API-3
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayersQuery = `
    SELECT * 
    FROM 
      cricket_team
    WHERE player_id = ${playerId}`;
  let player = await db.get(getPlayersQuery);
  response.send(convertDbObject(player));
});

//PUT Player Update Details API-4
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;

  const updatePlayerQuery = `
    UPDATE cricket_team
    SET 
    player_name='${playerName}',
    jersey_number=${jerseyNumber},
    role='${role}'
    WHERE 
    player_id=${playerId}`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//DELETE Player API-5
app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM 
        cricket_team
    WHERE player_id=${playerId}`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
