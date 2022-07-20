// lists your planters

export function list(cli, config) {
  cli
    .command('list')
    .description('Lists available planters')
    .action((options) => {
      run({
        args: {},
        options,
      }, config)
    })
}

function run(input, config) {
  // console.log('  > command:list');

  const { planters } = config;
  const names = Object.keys(planters);
  
  for (const name of names) {
    console.log(`  - ${name}`);
  }
}