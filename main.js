/* ~~~~~~~~~~~~~~LOGIN / LOGOUT~~~~~~~~~~~~~~ */

/** Connect to Moralis server */
const serverUrl = "https://8inywvl84jj3.usemoralis.com:2053/server";
const appId = "gRPRv2h84tVbuY12ounbiq0AtWUAXQPIiHu50jtX";

let tokens;
let currentTrade = {};
let currentSelectSide;

async function init() {
    Moralis.start({ serverUrl, appId });

    await Moralis.initPlugins();
    await Moralis.enableWeb3();
    await listAvailableTokens();
}

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

/* ~~~~~~~~~~~~~~SELECT TOKEN MODAL~~~~~~~~~~~~~~ */


async function listAvailableTokens() {
    /* Get supported tokens */
    const result = await Moralis.Plugins.oneInch.getSupportedTokens({
        chain: 'eth', // The blockchain you want to use (eth/bsc/polygon)
    });
    console.log(result);

    tokens = result.tokens;

    let parent = document.getElementById("token_list");
    for (const address in tokens) {
      let token = tokens[address];
      //build html and append it to token list
      let div = document.createElement("div");
      // emmbed address into element
      div.setAttribute("data-address", address);
      div.className = "token_row";
      let html = `
          <img class="token_list_img" src="${token.logoURI}">
          <span class="token_list_text">${token.symbol}</span>
          `;
      div.innerHTML = html;
      div.onclick = () => {
        selectToken(address);
      };
      parent.appendChild(div);
    }
}

function selectToken(address) {
    closeSelectTokenModal();
    console.log(address);

    currentTrade[currentSelectSide] = tokens[address];
    console.log(currentTrade);

    renderInterface()
}

function renderInterface() {
    if (currentTrade.from) {
        document.getElementById("from_token_image").src = currentTrade.from.logoURI;
        document.getElementById("from_token_text").innerHTML = currentTrade.from.symbol;
    }

    if (currentTrade.to) {
        document.getElementById("to_token_image").src = currentTrade.to.logoURI;
        document.getElementById("to_token_text").innerHTML = currentTrade.to.symbol;
    }
}

const token_modal = document.getElementById("token_modal");

function openSelectTokenModal(side){
    currentSelectSide = side;
    token_modal.style.display = "block";
}

function closeSelectTokenModal(){
    token_modal.style.display = "none";
}


init();

document.getElementById("from_token_select").onclick = (() => { openSelectTokenModal("from")});
document.getElementById("to_token_select").onclick = (() => { openSelectTokenModal("to")});

document.getElementById("modal_close").onclick = closeSelectTokenModal;

document.getElementById("btn-login").onclick = login;
