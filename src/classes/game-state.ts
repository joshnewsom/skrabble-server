import { LetterSack } from './letter-sack'
import { Player } from './player'
import { User } from './user'

export class GameState {
  public boardLayout: string = buildBlankBoardLayout()
  public currentPlayerId?: string
  public currentPlayer?: Player
  public gameId: string = Math.floor(Math.random() * 100000).toString(16)
  public host: User
  public inProgress: boolean = false
  public letterSack: LetterSack = new LetterSack()
  public players: Player[] = [ ]


  constructor(user: User) {
    this.host = user
    this.players.push(new Player(user))
  }
}

function buildBlankBoardLayout() {
  let layout = ''
  for (let i = 1; i < 225; i++) {
    layout += ','
  }
  return layout
}