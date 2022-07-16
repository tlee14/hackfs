import './App.css';

import { useEffect, useState } from 'react';
import { create } from 'ipfs-http-client';
import Web3 from 'web3';

const client = create('https://ipfs.infura.io:5001/api/v0')

function App() {
  const [account, setAccount] = useState(); // state variable to set account.
  const [fileUrl, updateFileUrl] = useState(``)

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
    async function load() {
      const web3 = new Web3(Web3.givenProvider || 'http://localhost:8545');
      const accounts = await web3.eth.requestAccounts();

      setAccount(accounts[0]);
    }

    load();
  }, []);

  return (
    <div>
      <p> Welcome! Your account is: <b>{account}</b></p>
      <p> Upload a file to IPFS: </p>
      <input type="file" onChange={onChange} />
        {
          "Your IPFS file is available at: " + fileUrl
        }

    </div>
  );
}

export default App;
