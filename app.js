const express = require('express')
const app = express()
app.use(express.json())
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const dbpath = path.join(__dirname, 'cricketTeam.db')
let db = null

// Initialize Database and Server
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`Error-Message: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

const playerList = each => {
  return {
    player_id: each.player_id,
    player_name: each.player_name,
    jersey_number: each.jersey_number,
    role: each.role,
  }
}

//get all players
app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
  SELECT * FROM cricket_team ORDER BY player_id
  `
  const playersArray = await db.all(getPlayersQuery)
  response.status(200).send(playersArray.map(i => playerList(i)))
})

//add a new player
app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {player_name, jersey_number, role} = playerDetails
  const addPlayerQuery = `
  INSERT INTO cricket_team(player_name, jersey_number, role)
  VALUES(?, ?, ?);
  `
  await db.run(addPlayerQuery, [player_name, jersey_number, role])
  response.status(200).send('Player Added to Team')
})

//get a player by playerId
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
  SELECT * FROM cricket_team WHERE player_id = ?
  `
  const player = await db.get(getPlayerQuery, [playerId])
  response.status(200).send(playerList(player))
})

//update player details
app.put('/players/:playerId/', async (request, response) => {
  const playerDetails = request.body
  const {player_id} = request.params
  const {player_name, jersey_number, role} = playerDetails
  const updatePlayerQuery = `
  UPDATE cricket_team
  SET player_name = ?, jersey_number = ?, role = ?
  WHERE player_id = ?
  `
  await db.run(updatePlayerQuery, [player_name, jersey_number, role, player_id])
  response.status(200).send('Player Details Updated')
})

//delete a player
app.delete('/players/:playerId/', async (request, response) => {
  const {player_id} = request.params
  const deletePlayerQuery = `
  DELETE FROM cricket_team WHERE player_id = ?
  `
  await db.run(deletePlayerQuery, [player_id])
  response.status(200).send('Player Removed')
})

module.exports = app
# Cricket_Team_NXTWAVE
