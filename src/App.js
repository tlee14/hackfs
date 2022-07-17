import './App.css';

import { useEffect, useState } from 'react';
import { create } from 'ipfs-http-client';
import {ethers} from "ethers";
import abi from "./utils/WritePortal.json"


const client = create('https://ipfs.infura.io:5001/api/v0')


function App() {
  const contractAddress = "0x79c1E01A9D9E0019d14Bf1Ef80eFA65A916A2B23"
  const contractABI = abi.abi;
  const [allWrites, setAllWrites] = useState([]);
  const [account, setAccount] = useState(); // state variable to set account.
  const [fileUrl, updateFileUrl] = useState(``)

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setAccount(account);
        getAllWrites();
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }


  const displayCount = async () => {
    const { ethereum } = window;

    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const writePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

    let count = await writePortalContract.getTotalWrites();
    console.log("Retrieved total write count...", count.toNumber());
    alert("Count is: " + count.toString())
  }

  const write = async (a) => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const writePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await writePortalContract.getTotalWrites();
        console.log("Retrieved total write count...", count.toNumber());

        const writeTxn = await writePortalContract.write("placeholder", { gasLimit: 1000000 });
        console.log("Mining...", writeTxn.hash);

        await writeTxn.wait();
        console.log("Mined -- ", writeTxn.hash);

        count = await writePortalContract.getTotalWrites();
        console.log("Retrieved total write count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getAllWrites = async () => {
    const { ethereum } = window;

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const writePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        const writes = await writePortalContract.getAllWrites();

        const writesCleaned = writes.map(write => {
          return {
            address: write.writer,
            timestamp: new Date(write.timestamp * 1000),
            message: write.message,
          };
        });

        setAllWrites(writesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }



  async function onChange(e) {
    const file = e.target.files[0]
    try {
      const added = await client.add(file)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      updateFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }


  useEffect(() => {
    let writePortalContract;

    const onNewWrite = (from, timestamp, message) => {
      console.log("NewWrite", from, timestamp, message);
      setAllWrites(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      writePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      writePortalContract.on("NewWrite", onNewWrite);
    }

    return () => {
      if (writePortalContract) {
        writePortalContract.off("NewWrite", onNewWrite);
      }
    };
  }, []);


  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])


  return (
    <div>
      <p> Welcome! Your account is: <b>{account}</b></p>
      <p> Upload a file to IPFS: </p>
      <input type="file" onChange={onChange} />
        {
          "Your IPFS file is available at: " + fileUrl
        }
      <p>
        <button className="writeButton" onClick={write}>
          Write
        </button>
      </p>
      <p>
        <button className="countButton" onClick={displayCount}>
          Count of total messages written
        </button>
      </p>
      <p>
        {!account && (
          <button className="connectButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </p>
    <p><b>Message written:</b>
      <p>
        {allWrites.map((write, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {write.address}</div>
              <div>Time: {write.timestamp.toString()}</div>
              <div>Message: {write.message}</div>
            </div>)
        })}
      </p>
      </p>
    </div>
  );
}

export default App;
