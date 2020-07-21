import { User } from './user'

export class Player {
  public hand: string[] = [ ]
  public isCurrentPlayer: boolean = false
  public score: number = 0
  public user: User

  constructor(user: User) {
    this.user = user
  }
}
