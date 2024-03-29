import { getUserConfig } from '../config.js';

export function test(cli) {
  cli
    .command('test')
    .description('Test some stuff')
    .action(async (options) => {
      await run({
        args: {},
        options
      })
    })
}

async function run(input) {
  // console.log(`  > test: exists: ${await checkUserFolder()}`);
  console.log(`  > test: planters:`, Object.keys((await getUserConfig()).planters));
}