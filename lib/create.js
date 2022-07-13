// create new project with a planter

export function create(cli) {
  cli
    .command('create', { isDefault: true })
    .description('Create a new project using a planter.')
    .argument('<name>', 'planter to plant with')
    .argument('[path]', 'path to plant at')
    .action((name, path, options) => {
      run({
        args: {
          name,
          path, 
        },
        options
      })
    })
}

function run(input) {
  const { name, path } = input.args;
  
  console.log(`  > Planting your project with '${name}'...`)
  console.log('  > beep... boop...')
  if (path) {
    console.log(`  > New project created at '${path}'`)
  } else {
    console.log(`  > New project created in current directory at './project-${name}'`)
  }
}