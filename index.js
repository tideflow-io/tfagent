#!/usr/bin/env node
'use strict'
const program = require('commander')
const url = require('url')
const pkg = require('./package.json')
  
program
  .version(pkg.version, '-v, --version')
  .option('-c, --concurrency [concurrency]', 'Max number of jobs the agent should process concurrently', (v) => {
    const concurrency = parseInt(v)
    if (!concurrency) { throw new Error('Concurrency parameter must be a valid integer') }
    return parseInt(concurrency)
  })
  .option('-t, --token [token]', 'Authentication token', v => {
    return v || process.env.TIDEFLOW_AGENT_TOKEN
  })
  .option('-u, --url [url]', 'Tideflow url')
  .option('--noupdate', 'Opt-out of update version check')

program.on('--help', () => {
  console.log('')
  console.log('Examples:')
  console.log('')
  console.log('  $ tideflow-agent -u http://mytideflow.example.com -t agent-auth-token')
  console.log('  $ tideflow-agent -c 16 -t agent-auth-token')
  console.log('  $ tideflow-agent --help')
  console.log('  $ tideflow-agent -h')

  console.log('')
  console.log('Environment variables:')
  console.log('')
  console.log(' - TIDEFLOW_AGENT_URL')
  console.log(`   Current value: ${process.env.TIDEFLOW_AGENT_URL || 'not set'}`)
  console.log('   Specify the URL to connect to the Tideflow\'s platform.')
  console.log('   Optional. Defaults to localhost:3000 if no -u parameter set')
  console.log('   Example: http://subdomain.example.com:3000')
  console.log('')

  console.log(' - TIDEFLOW_AGENT_TOKEN')
  console.log(`   Current value: ${process.env.TIDEFLOW_AGENT_TOKEN || 'not set'}`)
  console.log('   Specify authentication token.')
  console.log('   Optional. Having the authentication token stored as an environment')
  console.log('   variable allows users to run the agent without passing the -t parameter.')
  console.log('   Example: d2a04f78-ff8a-4eb4-a12c-57fb7abf03a7')
  console.log('')
})
 
program.parse(process.argv)

// DEFAULT CONFIGURATION PARAMETERS

if (!program.token) {
  program.token = process.env.TIDEFLOW_AGENT_TOKEN
}
program.url = program.url || process.env.TIDEFLOW_AGENT_URL || 'http://localhost:3000'

// UPDATE CHECK

if (!program.noupdate) {
  require('update-notifier')({
    pkg,
    updateCheckInterval: 1000 * 60 * 60 * 24 * 2 // 2 days
  }).notify({defer: false})
}

// VALIDATE PARAMETERS

const parse = url.parse(program.url)
if (!parse.hostname) {
  console.error('None or wrong url set.')
  process.exit(1)
}

if (!program.token || program.token.trim() === '') {
  console.error('No authentication token set.')
  process.exit(1)
}

// RUN AGENT

require('./agent').exec(program)
