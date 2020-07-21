import { Request, Response } from 'express'

import { GameState } from 'classes/game-state'
import { LetterSack } from 'classes/letter-sack'
import { Player } from 'classes/player'


import { io } from '../sockets'


interface DrawForTurnsResult {
  players: {
    [userId: string]: string;
  };
  winner?: Player;
}

interface ServerState {
  games: { [gameId: string]: GameState }
}

// TODO: replace this with something more robust -- Redis maybe?
const serverState: ServerState = {
  games: { }
}

const gameSpace = io.of('/game')
  // .use((socket, next) => {
  //   console.log('middleware function')
  //   next()
  // })
  .on('connection', socket => {
    console.log('connected to /game namespace')
    const gameId = socket.handshake.query.g
    console.log('gameId:', gameId);

    socket.join(gameId, () => {
      console.log('joined room:', gameId)
      console.log('serverState:', serverState);
    })

    socket.on('submit move', (game: GameState) => {
      console.log('submitted move:', game);

      serverState.games[game.gameId] = game

      console.log('serverState:', serverState);

      socket.to(gameId).emit('new game state', game)
    })
  })


function drawLetters(req: Request, res: Response) {
  try {

    const { gameId } = req.params
    const { n } = req.query

    const game = serverState.games[gameId]

    if (game) {
      const letters = game.letterSack.draw(Number(n))
      res.status(200).send({ letters })
    } else {
      res.status(404).send({ message: `no game found with id: ${gameId}` })
    }

  } catch (e) {
    res.status(500).send({ message: 'error trying to draw letters:' + e.message })
  }
}


function getGame(req: Request, res: Response) {
  try {

    const { gameId } = req.params

    const game = serverState.games[gameId]

    if (game) {
      res.status(200).send({ game })
    } else {
      res.status(404).send({ message: `no game found with id: ${gameId}` })
    }


  } catch (e) {
    res.status(500).send({ message: 'error trying to get game state: ' + e.message })
  }
}


function joinGame(req: Request, res: Response) {
  try {

    const { gameId } = req.params
    const { user } = req.body

    const game = serverState.games[gameId]

    if (game) {
      if (game.players.length < 4) {
        game.players.push(new Player(user))

        gameSpace.to(gameId).emit('player joined', game)

        res.status(200).send()
      } else {
        res.status(400).send({ message: 'game is already full' })
      }
    } else {
      res.status(404).send({ message: `no game found with id: ${gameId}` })
    }

  } catch(e) {
    res.status(500).send({ message: 'error trying to join game: ' + e.message })
  }
}


function newGame(req: Request, res: Response) {
  try {

    const { host } = req.body
    const game = new GameState(host)

    serverState.games[game.gameId] = game

    res.status(200).send({ game })

  } catch (e) {
    res.status(500).send({ message: 'error trying to start a new game: ' + e.message })
  }
}


function queryGames(req: Request, res: Response) {
  try {

    const { uid } = req.query
    const games: GameState[] = [ ]

    if (uid) {
      for (let gameId in serverState.games) {
        if (serverState.games.hasOwnProperty(gameId)) {
          // TODO: annotate this correctly
          if (serverState.games[gameId].players.some(p => (<any>p).user.id === uid)) {
            games.push(serverState.games[gameId])
          }
        }
      }
    }

    res.status(200).send({ games })

  } catch (e) {
    res.status(500).send({ message: 'error trying to query games: ' + e.message })
  }
}


function startGame(req: Request, res: Response) {
  try {

    const { gameId } = req.params

    const game = serverState.games[gameId]

    game.inProgress = true

    const drawForTurnsResult = drawForTurns(game.players, game.letterSack)

    game.currentPlayer = drawForTurnsResult.winner

    for (let i = 0; i < game.players.length; i++) {
      const result = game.letterSack.draw(7)
      game.players[i].hand = result
      if (game.players[i] === drawForTurnsResult.winner) {
        game.players[i].isCurrentPlayer = true
      }
    }


    gameSpace.to(gameId).emit('start game', drawForTurnsResult, game)

    res.status(200).send()


  } catch (e) {
    res.status(500).send({ message: 'error trying to start game: ' + e.message })
  }
}


function drawForTurns(players: Player[], letterSack: LetterSack): DrawForTurnsResult {
  const result: DrawForTurnsResult = { players: { } }

  players.forEach(p => {
    const letter = letterSack.draw()[0]
    console.log(`${p.user.username} drew ${letter}`)

    result.players[p.user.id] = letter
  });

  let closestToA = 'Z'

  for (let i = 0; i < players.length; i++) {
    const letter = result.players[players[i].user.id]
    if (letter < closestToA) {
      closestToA = letter
    }
  }

  let winners = players.filter(p => result.players[p.user.id] === closestToA)
  console.log('winners:', winners);

  if (winners.length > 1) {

    // put tiles back!
    players.forEach(p => {
      letterSack.letters.push(result.players[p.user.id])
    })

    return drawForTurns(players, letterSack)
  } else {
    const winner = winners[0]
    console.log('winner:', winner.user.username)
    result.winner = winner

    // put tiles back!
    players.forEach(p => {
      letterSack.letters.push(result.players[p.user.id])
    })

    letterSack.shuffle()

    return result
  }
}


export {
  drawLetters,
  getGame,
  joinGame,
  newGame,
  queryGames,
  startGame
}