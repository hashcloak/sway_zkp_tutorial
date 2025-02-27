# Tutorial: Use Sway with ZK proofs

For this tutorial, we will generate a zero-knowledge proof using circom, and verify this proof in a Sway contract, on-chain. There are 3 supported proving systems; Groth16, Plonk and Fflonk. 

## (1) Create a Sway project

Create a new [forc project](https://docs.fuel.network/docs/sway/introduction/forc_project/#a-forc-project):
```bash=
forc new sway-zkp-example
```

Delete the `main.sw` in `src`. The verifier contract will be copied here. 

Create a `package.json`:

```bash=
cat > package.json <<EOL
{
  "name": "sway-zkp-example",
  "module": "index.ts",
  "type": "module",
  "devDependencies": {
    "@types/bun": "latest"
  },
  "peerDependencies": {
    "typescript": "^5.0.0"
  },
  "dependencies": {
    "fuels": "^0.99.0"
  }
}
EOL
```
And install the dependencies:
```bash=
bun install
```

## (2) Install circom

To generate a zero-knowledge proof, we will create a circuit with [Circom](https://docs.circom.io/).

First, install circom following [the installation steps](https://docs.circom.io/getting-started/installation/). 

## (3) Write the circuit

For this example we will use the circuit from the Circom [tutorial](https://docs.circom.io/getting-started/writing-circuits/), which proves knowledge of 2 factors of a public input. Create a file in a new folder:
```bash=
mkdir -p circom && touch circom/circuit.circom && cd circom
```
Add the following code:
```circom=
pragma circom 2.0.0;

/*This circuit template checks that c is the multiplication of a and b.*/  

template Multiplier2 () {  

   // Declaration of signals.  
   signal input a;  
   signal input b;  
   signal output c;  

   // Constraints.  
   c <== a * b;  
}

component main = Multiplier2();
```

## (4) Add input file

Create a file with input values:
```bash=
echo '{"a": "3", "b": "11"}' > input.json
```

## (5) Install snarkjs

Install the Sway-compatible fork of snarkjs in a separate folder:

```bash=
git clone https://github.com/hashcloak/snarkjs/tree/sway-zkp-verifiers
npm run build
```

## (6) Generate verification key & zk proof

Back to our `sway-zkp-example` project, in the `circom` folder: follow [these steps](https://github.com/iden3/snarkjs/tree/master?tab=readme-ov-file#guide) from the original snarkjs repo to generate a verification key and a proof, until step 23.  

Note that step 15-21 are only needed for Groth16, as explained in the guide. Also the steps for creating a circuit and input file can be omitted, since we've already added them. 

## (7) Generate the Sway verifier

Finally, we can generate the Sway contract in the following way, from the `snarkjs` fork project folder:

```bash=
cd snarkjs
node cli.js zkey export swayverifier <path_to>/circuit_final.zkey <output_folder>
```

This generates a `lib.sw` and `main.sw` to verify a proof for your circuit. What the exact verifier code is, depends on the proving system you choose (Groth16, Plonk or Fflonk). 

Copy `lib.sw` and `main.sw` into the `src` of your `forc` project.

Build the contract:
```bash=
cd sway-zkp-example
forc build
```

## (8) Deploy and verify proof with Typescript

Create a new `fuels.config.ts` file:
```bash=
cd sway-zkp-example
bun fuels init --contracts src/* --output ./fuels-out
```

Generate type definitions and factory class from the Sway constract ABI:
```bash=
bun fuels typegen -i ./out/debug/*-abi.json -o ./fuels-out
```

Create an `index.ts` where you deploy the contract and call the verifier function with the data from `proof.json` and `input.json`. The following example code was created by using a [Python script](scripts/generate_sway.py) to convert the values to valid Typescript code. 

```typescript
import {bn, Provider, Wallet} from "fuels";
import { SwayZkpExampleFactory } from "./fuels-out";

const main = async () => {
  const PROVIDER_URL = "http://127.0.0.1:4000/v1/graphql";
  const PRIVATE_KEY = "0xde97d8624a438121b86a1956544bd72ed68cd69f2c99555b08b1e8c51ffd511c";

  const provider = new Provider(PROVIDER_URL);
  const wallet = Wallet.fromPrivateKey(PRIVATE_KEY, provider);

  const factory = new SwayZkpExampleFactory(wallet);
  const { contract } = await (await factory.deploy()).waitForResult();

  // Construct Proof object
  const proof = {
    proof_A: {
      x: bn("0x12c3cd0f11c9b934d977b1003d3fb8104668e7470ed696df8a39e24376ae8165", "hex"),
      y: bn("0x274981cb79590f9d99388c6d3c826c09dfaadfde680c80d3cff82c6abd6baedb", "hex")
    },
    proof_B: {
      x: bn("0x1204b8a0f4ea28c688182f7d63f2a4c5551f690db5ff568d57893f5e3df837c2", "hex"),
      y: bn("0x2ff31ba6fcf8eae165a43c34ff5e75b900731cbe2a64bde76dae2cde93e2304b", "hex")
    },
    proof_C: {
      x: bn("0x08878cd99520b967e632c0c0673bbcdb4563ec539b92986c22c95f3576cbb7c9", "hex"),
      y: bn("0x075945f899f308411bf42b1c633b2de244853c7abfb4ac77162fce1c0801de98", "hex")
    },
    proof_Z: {
      x: bn("0x06fe399400102e20b845a5ee2f742a5bcfa62a52a6011c3cd4a01d195a66d775", "hex"),
      y: bn("0x1e380b3ec7bbffd930eaa2021861159db94d4fa809ccefc7791e5311c8141c8e", "hex")
    },
    proof_T1: {
      x: bn("0x0ecdf61d2e843502206fa21bbbc576840c2b0e5d29e536f3525f5f20c1b9053a", "hex"),
      y: bn("0x051fb7ad2720be2ff38ecd78e777a62933afb6ad11c1aa46eefb95f5aaf976c4", "hex")
    },
    proof_T2: {
      x: bn("0x22cb35ffe3b91ac8e46a0f7e175331b2e207de06f81fc026725b0f61ade6b562", "hex"),
      y: bn("0x115143a9e7d68fdc6ad8bee1d6b2f6304cd742ba16dda5d4ebff2117df00681d", "hex")
    },
    proof_T3: {
      x: bn("0x2cadb1a8225027a7a383ca9a09a2bf0e1c854f60a9c05454a292abecc2d1245c", "hex"),
      y: bn("0x14f3c8936aca8c53311500df3dcb17a7dd05477b0d9f4b31390b5cc47a270158", "hex")
    },
    proof_Wxi: {
      x: bn("0x162c82f57ac8638da82f552f33ef832234d1fad1087704aa6d624d2d8d92c72e", "hex"),
      y: bn("0x2df37d8d040bd42c6ddf8b65b0b072a6443d2bd3a6394386f5e41e8ef211fe1d", "hex")
    },
    proof_Wxiw: {
      x: bn("0x1d6dbcf9383b0e95c87d01e2edd72fc570bb62a9601ab6dd1a8f2d7a42269158", "hex"),
      y: bn("0x1de5b4e3f6cecf9251c425cddfb8222c290cd8e039adab8cdc9fe5433020f5f8", "hex")
    },
    eval_a: bn("0x0b2c3627d350016d7a39347fc6d5abebfc6bc99918334b839616e398fea0d864", "hex"),
    eval_b: bn("0x2c1749db395adc2eca5fc2c3448a057e2b9a24f2503665a7f7af7c3dfe0c118b", "hex"),
    eval_c: bn("0x045ee44a614dca07534e8290cfddcdd60b3fd99e96d4d534cc3e6df297275b41", "hex"),
    eval_s1: bn("0x098dc4e934c0b9c0f8173631def06d873c0b7dd5746df900c251dd953860dcd7", "hex"),
    eval_s2: bn("0x010ad58e674c3369948e1e607fa207f75aba069558fc9c1384df7e4870d0a744", "hex"),
    eval_zw: bn("0x2228ecd0cf41c4439af138aa0d04e9ba990da8aac5cfa70857261ff1c01944c1", "hex")
  };

  const pubInput = [
      bn("0x0000000000000000000000000000000000000000000000000000000000000021", "hex")
  ];

  const { waitForResult } = await contract.functions.verify(proof, pubInput).call();
  const { value } = await waitForResult();
  console.log("result is:", value);
};

main();
```

Run the local chain and then run:
```bash=
bun run index.ts
# result is: true
```