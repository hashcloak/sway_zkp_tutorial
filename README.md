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

Create an `index.ts` where you deploy the contract and call the verifier function with the data from `proof.json` and `input.json`. The example [index.ts](index.ts) will generate proof data based on the `protocol` field in `proof.json`.


Run the local chain and then run:
```bash=
bun run index.ts
# result is: true
```