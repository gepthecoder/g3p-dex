/** Connect to Moralis server */
const serverUrl = "https://8inywvl84jj3.usemoralis.com:2053/server";
const appId = "gRPRv2h84tVbuY12ounbiq0AtWUAXQPIiHu50jtX";
Moralis.start({ serverUrl, appId });

/** Add from here down */
async function login() {
  let user = Moralis.User.current();
  if (!user) {
   try {
      user = await Moralis.authenticate({ signingMessage: "Hello World!" })
      console.log(user)
      console.log(user.get('ethAddress'))
   } catch(error) {
     console.log(error)
   }
  }
}

async function logOut() {
  await Moralis.User.logOut();
  console.log("logged out");
}


/* SELECT TOKEN MODAL */

const token_modal = document.getElementById("token_modal");

function openSelectTokenModal(){
    token_modal.style.display = "block";
}

function closeSelectTokenModal(){
    token_modal.style.display = "none";
}


document.getElementById("from_token_select").onclick = openSelectTokenModal;
document.getElementById("modal_close").onclick = closeSelectTokenModal;

document.getElementById("btn-login").onclick = login;
document.getElementById("btn-logout").onclick = logOut;
