import { createConfig } from 'fuels';

export default createConfig({
  contracts: [
        'src/lib.sw',
        'src/main.sw',
  ],
  output: './fuels-out',
});

/**
 * Check the docs:
 * https://docs.fuel.network/docs/fuels-ts/fuels-cli/config-file/
 */
