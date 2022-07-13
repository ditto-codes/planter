// lists your planters

export function list(cli) {
  cli
    .command('list')
    .description('Lists available planters')
    .action((options) => {
      run({
        args: {},
        options
      })
    })
}

function run(input) {
  console.log('  > command:list');
}