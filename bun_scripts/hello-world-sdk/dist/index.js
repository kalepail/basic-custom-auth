import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}
export const Errors = {
    1: { message: "TooFewSignatures" }
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initalizing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAAAAAAAAAAAFaGVsbG8AAAAAAAABAAAAAAAAAAJ0bwAAAAAAEAAAAAEAAAPqAAAAEA==",
            "AAAABAAAAAAAAAAAAAAABkVycm9ycwAAAAAAAQAAAAAAAAAQVG9vRmV3U2lnbmF0dXJlcwAAAAE=",
            "AAAAAgAAAAAAAAAAAAAACVNpZ25lcktleQAAAAAAAAEAAAABAAAAAAAAAAdFZDI1NTE5AAAAAAEAAAPuAAAAIA==",
            "AAAAAgAAAAAAAAAAAAAACVNpZ25hdHVyZQAAAAAAAAEAAAABAAAAAAAAAAdFZDI1NTE5AAAAAAEAAAPuAAAAQA==",
            "AAAAAQAAAAAAAAAAAAAAClNpZ25hdHVyZXMAAAAAAAEAAAAAAAAAATAAAAAAAAPsAAAH0AAAAAlTaWduZXJLZXkAAAAAAAfQAAAACVNpZ25hdHVyZQAAAA==",
            "AAAAAAAAAAAAAAAMX19jaGVja19hdXRoAAAAAwAAAAAAAAARc2lnbmF0dXJlX3BheWxvYWQAAAAAAAPuAAAAIAAAAAAAAAAKc2lnbmF0dXJlcwAAAAAH0AAAAApTaWduYXR1cmVzAAAAAAAAAAAADl9hdXRoX2NvbnRleHRzAAAAAAPqAAAH0AAAAAdDb250ZXh0AAAAAAEAAAPpAAAD7QAAAAAAAAfQAAAABkVycm9ycwAA"]), options);
        this.options = options;
    }
    fromJSON = {
        hello: (this.txFromJSON)
    };
}
