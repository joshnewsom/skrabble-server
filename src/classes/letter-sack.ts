import { letterCounts } from 'constants/letter-counts';

export class LetterSack {

  public letters: string[];

  constructor() {
    this.letters = [ ];

    for (const letter in letterCounts) {
      if (letterCounts.hasOwnProperty(letter)) {
        for (let i = 0; i < letterCounts[letter]; i++) {
          this.letters.push(letter);
        }
      }
    }

    this.shuffle();
  }

  draw(num: number = 1) {
    if (this.letters.length >= num) {
      return this.letters.splice(0, num);
    } else {
      throw new Error('Not enough letters remaining');
    }
  }

  shuffle() {
    const temp = this.letters.slice();

    this.letters.length = 0;

    while (temp.length) {
      const index = Math.floor(Math.random() * temp.length);
      this.letters.push(temp.splice(index, 1)[0]);
    }
  }

}
