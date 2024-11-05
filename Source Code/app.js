const web3 = new Web3(window.ethereum);

let contract;
const contractAddress = '0x6A94452D67d706f96AC8c56078b0a0046Fc32939';
const contractABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_propertyId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_offerId",
				"type": "uint256"
			}
		],
		"name": "acceptOffer",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_price",
				"type": "uint256"
			}
		],
		"name": "addProperty",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_propertyId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_offerAmount",
				"type": "uint256"
			}
		],
		"name": "makeOffer",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_propertyId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_offerId",
				"type": "uint256"
			}
		],
		"name": "rejectOffer",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_propertyId",
				"type": "uint256"
			}
		],
		"name": "getOffers",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address payable",
						"name": "buyer",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "amount",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "isAccepted",
						"type": "bool"
					}
				],
				"internalType": "struct RealEstateMarket.Offer[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_propertyId",
				"type": "uint256"
			}
		],
		"name": "getOffersCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getPropertiesCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "offers",
		"outputs": [
			{
				"internalType": "address payable",
				"name": "buyer",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isAccepted",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "properties",
		"outputs": [
			{
				"internalType": "address payable",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isListed",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

async function init() {
    if (window.ethereum) {
        try {
            setupEventListeners();
            await connectWallet();
            await displayProperties();
        } catch (error) {
            console.error("Error during initial wallet connection or property display:", error);
        }
    } else {
        console.log("No Ethereum wallet detected. Please install MetaMask.");
    }
}

window.addEventListener('load', init);

function setupEventListeners() {
    document.getElementById('connectWalletButton').addEventListener('click', connectOrDisconnect);
    document.getElementById('addPropertyForm').addEventListener('submit', submitProperty);
}

async function connectOrDisconnect() {
    if (accounts.length === 0) {
        await connectWallet();
    } else {
        disconnectWallet();
    }
}

async function connectWallet() {
    try {
        accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        contract = new web3.eth.Contract(contractABI, contractAddress);
        console.log('Wallet connected.');
        document.getElementById('connectWalletButton').innerText = 'Disconnect Wallet';
    } catch (error) {
        console.error('Wallet connection error:', error);
    }
}

function disconnectWallet() {
    accounts = [];
    console.log('Wallet connection terminated.');
    document.getElementById('connectWalletButton').innerText = 'Connect Wallet';
}

async function submitProperty(event) {
    event.preventDefault();
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;

    try {
        const response = await contract.methods.addProperty(description, web3.utils.toWei(price, 'ether')).send({ from: accounts[0] });
        console.log('Listing added successfully:', response.transactionHash);
    } catch (error) {
        console.error('Error while adding listing:', error);
    }
}

async function displayProperties() {
    const propertiesElement = document.getElementById('propertiesList');
    propertiesElement.innerHTML = '';

    const propertiesCount = await contract.methods.getPropertiesCount().call();
    for (let i = propertiesCount - BigInt(1); i >= 0; i--) {
        const property = await contract.methods.properties(i).call(); 

        const propertyElement = document.createElement('div');
        propertyElement.className = 'property';
        propertyElement.innerHTML = `
            <p>Listing: ${property.description} | <a href="https://sepolia.etherscan.io/address/${property.owner}" target="_blank">View on Etherscan</a></p>
            <p>Price: ${web3.utils.fromWei(property.price.toString(), 'ether')} ETH</p>
            <input type="number" placeholder="Enter bid (ETH)" id="offerAmount${i}">
            <button onclick="makeOffer(${i})">Place Bid</button>
            <div id="offersList${i}"></div>
        `;
        propertiesElement.appendChild(propertyElement);
    }
}

async function submitProperty(event) {
    event.preventDefault();
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;

    try {
        const response = await contract.methods.addProperty(description, web3.utils.toWei(price, 'ether')).send({ from: accounts[0] });
        console.log('Listing added successfully:', response.transactionHash);
        displayProperties();
    } catch (error) {
        console.error('Error while adding listing:', error);
    }
}


async function makeOffer(propertyId) {
    const offerAmount = document.getElementById(`offerAmount${propertyId}`).value;
    if (!offerAmount) return alert('Please enter an amount.');
    try {
        const response = await contract.methods.makeOffer(propertyId, web3.utils.toWei(offerAmount, 'ether')).send({ from: accounts[0], value: web3.utils.toWei(offerAmount, 'ether') });
        console.log('Bid placed, transaction hash:', response.transactionHash);
        displayOffers(propertyId);
    } catch (error) {
        console.error('Error placing bid:', error);
    }
}

async function displayOffers(propertyId) {
    const offersListElement = document.getElementById(`offersList${propertyId}`);
    offersListElement.innerHTML = '';

    const offers = await contract.methods.getOffers(propertyId).call();
    offers.forEach((offer, index) => {
        const offerElement = document.createElement('div');
        offerElement.innerHTML = `
            &lt;p&gt;Offer: ${web3.utils.fromWei(offer.amount, 'ether')} ETH by ${offer.buyer}&lt;/p&gt;
            &lt;button onclick="acceptOffer(${propertyId}, ${index})"&gt;Accept&lt;/button&gt;
            &lt;button onclick="rejectOffer(${propertyId}, ${index})"&gt;Reject&lt;/button&gt;
        `;
        offersListElement.appendChild(offerElement);
    });
}

async function displayOffers(propertyId) {
    try {
        const offers = await contract.methods.getOffers(propertyId).call();
        const offersListElement = document.getElementById(`offersList${propertyId}`);
        offersListElement.innerHTML = '';

        offers.forEach((offer, index) => {
            const offerElement = document.createElement('div');
            offerElement.innerHTML = `
                <p>Offer by ${offer.buyer}: ${web3.utils.fromWei(offer.amount.toString(), 'ether')} ETH</p>
                <button onclick="acceptOffer(${propertyId}, ${index})">Accept</button>
                <button onclick="rejectOffer(${propertyId}, ${index})">Reject</button>
            `;
            offersListElement.appendChild(offerElement);
        });
    } catch (error) {
        console.error('Error fetching offers:', error);
    }
}
