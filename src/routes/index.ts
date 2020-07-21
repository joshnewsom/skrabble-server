import express from 'express'

const router = express.Router()

import {
  drawLetters,
  getGame,
  joinGame,
  newGame,
  queryGames,
  startGame
} from 'controllers/game.server.controller'

router.route('/game')
  .get(queryGames)
  .post(newGame)

router.route('/game/:gameId')
  .get(getGame)

router.route('/game/:gameId/draw')
  .get(drawLetters)

router.route('/game/:gameId/join')
  .post(joinGame)

router.route('/game/:gameId/start')
  .post(startGame)

export default router