import { xdr, Keypair, Networks, Operation, TransactionBuilder, hash } from "@stellar/stellar-sdk";
import { Api, assembleTransaction, Server } from "@stellar/stellar-sdk/rpc";

const CONTRACT_ID = 'CBXYCAVTG6ZTZVFTRKNMU7SLZNJ632PEJEHHMMF7Q6664YHTFQXLBJP3'

const rpcUrl = "https://soroban-testnet.stellar.org";
const rpc = new Server(rpcUrl);

const keypair = Keypair.fromSecret('SABZEN64W566LAY4Q7BNDRG7SCSU76SZ53PNFWKUDLE77IFFKJVQ2A2T')
const pubkey = keypair.publicKey();

const source = await rpc.getAccount(pubkey);

const operation = Operation.invokeContractFunction({
    contract: CONTRACT_ID,
    function: 'hello',
    args: [
        xdr.ScVal.scvString('Dev')
    ],
})

let transaction = new TransactionBuilder(source, {
    fee: '100000',
    networkPassphrase: Networks.TESTNET
})
    .addOperation(operation)
    .setTimeout(30)
    .build();

let simulation = await rpc.simulateTransaction(transaction)

if (Api.isSimulationError(simulation)) {
    throw new Error(simulation.error);
}

const { sequence } = await rpc.getLatestLedger()

for (let auth of simulation.result?.auth || []) {
    auth.credentials().address().signatureExpirationLedger(sequence + 60)

    const preimage = xdr.HashIdPreimage.envelopeTypeSorobanAuthorization(
        new xdr.HashIdPreimageSorobanAuthorization({
            networkId: hash(Buffer.from(Networks.TESTNET)),
            nonce: auth.credentials().address().nonce(),
            signatureExpirationLedger: auth.credentials().address().signatureExpirationLedger(),
            invocation: auth.rootInvocation()
        })
    )

    const payload = hash(preimage.toXDR())

    auth.credentials().address().signature(
        xdr.ScVal.scvVec([
            xdr.ScVal.scvMap([
                new xdr.ScMapEntry({
                    key: xdr.ScVal.scvVec([
                        xdr.ScVal.scvSymbol('Ed25519'),
                        xdr.ScVal.scvBytes(keypair.rawPublicKey())
                    ]),
                    val: xdr.ScVal.scvVec([
                        xdr.ScVal.scvSymbol('Ed25519'),
                        xdr.ScVal.scvBytes(keypair.sign(payload))
                    ])
                })
            ])
        ])
    )

    operation.body().invokeHostFunctionOp().auth([auth])
}

simulation = await rpc.simulateTransaction(transaction)

if (Api.isSimulationError(simulation)) {
    throw new Error(simulation.error);
}

transaction = await assembleTransaction(transaction, simulation).build();

transaction.sign(keypair);

const send_res = await rpc.sendTransaction(transaction);

if (send_res.status === 'PENDING') {
    const poll_res = await rpc.pollTransaction(send_res.hash);

    if (poll_res.status === 'SUCCESS') {
        console.log(poll_res.status, poll_res.txHash);
    } else {
        throw new Error(`${poll_res.status} ${poll_res.txHash}`);
    }
} else {
    throw new Error(`${send_res.status} ${send_res.errorResult?.toXDR('base64')}`);
}