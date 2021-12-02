export const coinFlip = (betNum) => {
  return new Promise((resolve, reject) => {
    const hasWon = Math.random() > 0.5;
    hasWon
      ? setTimeout(() => {
        resolve(betNum * 2);
      }, 2000)
      : reject(new Error("Sorry, You lost...")); // same as -> throw new Error ("You lost ...");

  });
};

coinFlip(10)
  .then(result => {
    console.log(`CONGRATULATIONS! YOU'VE WON ${result}!`);
  })
  .catch(e => {
    console.log(e.message);  // displays the error message if the promise is rejected
                             // in our case: "Sorry, You lost..."
  })
