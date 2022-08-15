// import { WalletModalProvider, WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import type { NextPage } from 'next';
// import Head from 'next/head';
// import Image from 'next/image';
import styles from '../styles/Home.module.css';

import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    PhantomWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { MintNft } from './MintNft';

const Home: NextPage = () => {

    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Devnet;

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
    // Only the wallets you configure here will be compiled into your application, and only the dependencies
    // of wallets that your users connect to will be loaded.
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
        ],
        []
    );

    return (
      <div className={styles.container}>
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                  <div className={styles.walletButtons}>
                    <WalletMultiButton />
                    <WalletDisconnectButton />
                    <MintNft />
                  </div>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
      </div>
    );

    // return (
    //     <div className={styles.container}>

    //         <main className={styles.main}>
    //             <h1 className={styles.title}>
    //                 Welcome to <a href="https://nextjs.org">Next.js!</a>
    //             </h1>

    //             <WalletModalProvider>
    //             <div className={styles.walletButtons}>
    //                 <WalletMultiButton />
    //                 <WalletDisconnectButton />
    //             </div>
    //             </WalletModalProvider>
    //         </main>
    //     </div>
    // );
};

export default Home;
