#!/usr/bin/env node

require('../dist/index.js')
  .main()
  .catch((err) => {
    console.log(err)
  })
