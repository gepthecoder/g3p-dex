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

    currentUser = Moralis.User.current();
    if (currentUser) {
        document.getElementById("swap_button").disabled = false;
    }
}

async function login() {
  let user = Moralis.User.current();
  if (!user) {
   try {
      user = await Moralis.authenticate({ signingMessage: "G3P DEX" })
      console.log(user)
      console.log(user.get('ethAddress'))

      document.getElementById("swap_button").disabled = false;
      document.getElementById("btn-login").innerText = "Disconnect";

   } catch(error) {
     console.log(error)
   }
  } else{
      try{
        logOut();
      }catch(error){
          console.log(error)
      }
  }
}

async function logOut() {
  await Moralis.User.logOut();
  document.getElementById("btn-login").innerText = "Connect with Metamask";
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
    getQuote()
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

async function getQuote() {
    if (!currentTrade.from || !currentTrade.to || !document.getElementById("from_amount").value) return;
  
    let amount = Number(document.getElementById("from_amount").value * 10 ** currentTrade.from.decimals);
  
    const quote = await Moralis.Plugins.oneInch.quote({
      chain: "eth", // The blockchain you want to use (eth/bsc/polygon)
      fromTokenAddress: currentTrade.from.address, // The token you want to swap
      toTokenAddress: currentTrade.to.address, // The token you want to receive
      amount: amount,
    });

    console.log(quote);

    document.getElementById("gas_estimate").innerHTML = quote.estimatedGas;
    document.getElementById("to_amount").value = quote.toTokenAmount / 10 ** quote.toToken.decimals;
}

// WE NEED ALLOWANCE FROM THE USER THAT 1INCH CAN TRADE FOR THEM !!
async function trySwap() {
    let address = Moralis.User.current().get("ethAddress");
    let amount = Number(document.getElementById("from_amount").value * 10 ** currentTrade.from.decimals);
    
    if (currentTrade.from.symbol !== "ETH") {
        //CHECK ALLOWANCE
      const allowance = await Moralis.Plugins.oneInch.hasAllowance({
        chain: "eth", // The blockchain you want to use (eth/bsc/polygon)
        fromTokenAddress: currentTrade.from.address, // The token you want to swap
        fromAddress: address, // Your wallet address
        amount: amount,
      });
      console.log(allowance);

      // GET ALLOWANCE
      if (!allowance) {
        await Moralis.Plugins.oneInch.approve({
          chain: "eth", // The blockchain you want to use (eth/bsc/polygon)
          tokenAddress: currentTrade.from.address, // The token you want to swap
          fromAddress: address, // Your wallet address
        });
      }
    }
    // TRADE
    try {
      let receipt = await doSwap(address, amount);
      alert("Swap Complete");
    } catch (error) {
      console.log(error);
    }
}

function doSwap(userAddress, amount) {
    return Moralis.Plugins.oneInch.swap({
      chain: "eth", // The blockchain you want to use (eth/bsc/polygon)
      fromTokenAddress: currentTrade.from.address, // The token you want to swap
      toTokenAddress: currentTrade.to.address, // The token you want to receive
      amount: amount,
      fromAddress: userAddress, // Your wallet address
      slippage: 1,
    });
}


init();

document.getElementById("from_token_select").onclick = (() => { openSelectTokenModal("from")});
document.getElementById("to_token_select").onclick = (() => { openSelectTokenModal("to")});

document.getElementById("modal_close").onclick = closeSelectTokenModal;

document.getElementById("btn-login").onclick = login;
document.getElementById("swap_button").onclick = trySwap;

document.getElementById("from_amount").onblur = getQuote;
