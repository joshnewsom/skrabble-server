import { v4 as uuid } from 'uuid'

export class User {
  public id: string = uuid()
  public username: string

  constructor(username: string) {
    this.username = username
  }
}
