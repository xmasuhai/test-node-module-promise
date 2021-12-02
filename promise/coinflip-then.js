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

export const betAgain = (result) => {
  console.log(`CONGRATULATIONS! YOU'VE WON ${result}!`);
  console.log(`LET'S BET AGAIN!`);
  return coinFlip(result);
};

export const handleRejection = (e) => {
  console.log(e.message);
};

coinFlip(10)
  .then(betAgain)
  .then(betAgain)
  .then(betAgain)
  .then(result => {
    console.log(`OMG, WE DID THIS! TIME TO TAKE ${result} HOME!`);
  })
  .catch(handleRejection);